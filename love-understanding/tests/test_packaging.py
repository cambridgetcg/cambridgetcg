"""Packaging regressions use only isolated synthetic files, never the live site."""
from contextlib import contextmanager
from hashlib import sha256
from pathlib import Path
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

PACKAGER = Path(__file__).resolve().parents[1] / "scripts/package.py"


@contextmanager
def fixture():
    with tempfile.TemporaryDirectory(prefix="love-packaging-test-") as temporary:
        base = Path(temporary)
        root = base / "artifact"
        (root / "scripts").mkdir(parents=True)
        (root / "site").mkdir()
        (root / "vendor").mkdir()
        (root / "scripts/package.py").write_bytes(PACKAGER.read_bytes())
        for name, content in {
            "README.md": "public source readme\n",
            "LICENSE": "public licence\n",
            "site/index.html": "<!doctype html><title>Synthetic fixture</title>\n",
            "site/README.md": "old public readme\n",
            "site/LICENSE": "old public licence\n",
            "site/source.zip": "old archive sentinel\n",
            "site/release.json": "old receipt sentinel\n",
        }.items():
            (root / name).write_text(content)
        outside = base / "outside"
        outside.mkdir()
        (outside / "private.txt").write_text("SYNTHETIC PRIVATE SENTINEL: do not copy or overwrite\n")
        (outside / "README.md").write_text("outside readme must stay unchanged\n")
        (outside / "LICENSE").write_text("outside licence must stay unchanged\n")
        yield root, outside


def snapshot(root):
    result = {}
    for path in sorted(root.rglob("*")):
        name = path.relative_to(root).as_posix()
        if path.is_symlink():
            result[name] = ("link", os.readlink(path))
        elif path.is_file():
            result[name] = ("file", path.read_bytes())
        else:
            result[name] = ("directory", None)
    return result


def package(root):
    return subprocess.run(
        [sys.executable, "-B", "scripts/package.py"], cwd=root,
        capture_output=True, text=True, timeout=10,
    )


class PackagingTests(unittest.TestCase):
    def test_symlinks_are_rejected_before_any_mutation(self):
        cases = ["README.md", "LICENSE", "site", "site/README.md", "site/LICENSE",
                 "site/source.zip", "site/release.json", "vendor/link", "vendor/dangling"]
        for name in cases:
            with self.subTest(path=name), fixture() as (root, outside):
                path = root / name
                if path.is_dir():
                    shutil.rmtree(path)  # Only the directory allocated by this fixture.
                elif path.exists():
                    path.unlink()
                target = outside if name == "site" else outside / "private.txt"
                if name == "vendor/dangling":
                    target = outside / "not-created"
                path.symlink_to(target, target_is_directory=name == "site")
                before = snapshot(root.parent)
                result = package(root)
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertIn("Symlinks", result.stderr)
                self.assertEqual(snapshot(root.parent), before, "Rejected input caused a write")

    def test_hidden_input_is_rejected_before_any_mutation(self):
        with fixture() as (root, _):
            (root / "site/.private").write_text("synthetic hidden input")
            before = snapshot(root.parent)
            result = package(root)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(snapshot(root.parent), before)

    def test_missing_required_source_does_not_partially_copy(self):
        with fixture() as (root, _):
            (root / "LICENSE").unlink()
            before = snapshot(root.parent)
            result = package(root)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(snapshot(root.parent), before)

    def test_output_hardlinks_cannot_overwrite_external_bytes(self):
        for name in ["README.md", "LICENSE", "source.zip", "release.json"]:
            with self.subTest(path=name), fixture() as (root, outside):
                target = outside / "private.txt"
                destination = root / "site" / name
                destination.unlink()
                os.link(target, destination)
                original = target.read_bytes()
                result = package(root)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(target.read_bytes(), original)
                self.assertNotEqual(target.stat().st_ino, destination.stat().st_ino)

    def test_valid_output_is_complete_and_reproducible(self):
        with fixture() as (root, outside):
            original_outside = snapshot(outside)
            result = package(root)
            self.assertEqual(result.returncode, 0, result.stderr)
            archive = (root / "site/source.zip").read_bytes()
            receipt = (root / "site/release.json").read_bytes()
            with zipfile.ZipFile(io.BytesIO(archive)) as bundle:
                names = bundle.namelist()
                self.assertEqual(names, sorted(names))
                self.assertNotIn("site/source.zip", names)
                self.assertNotIn("site/release.json", names)
                self.assertEqual(bundle.read("site/README.md"), (root / "README.md").read_bytes())
                self.assertEqual(bundle.read("site/LICENSE"), (root / "LICENSE").read_bytes())
            for name, record in json.loads(receipt)["files"].items():
                data = (root / "site" / name).read_bytes()
                self.assertEqual(len(data), record["bytes"])
                self.assertEqual(sha256(data).hexdigest(), record["sha256"])
            self.assertFalse(any(path.name.startswith(".package-") for path in (root / "site").iterdir()))
            result = package(root)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual((root / "site/source.zip").read_bytes(), archive)
            self.assertEqual((root / "site/release.json").read_bytes(), receipt)
            self.assertEqual(snapshot(outside), original_outside)


if __name__ == "__main__":
    unittest.main()
