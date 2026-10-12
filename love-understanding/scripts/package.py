"""Package only this public artifact, never its private parent or local state."""
from pathlib import Path
from hashlib import sha256
import json
import zipfile
ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
SITE.joinpath("README.md").write_bytes(ROOT.joinpath("README.md").read_bytes())
SITE.joinpath("LICENSE").write_bytes(ROOT.joinpath("LICENSE").read_bytes())
allowed_roots = {"site", "scripts", "tests", "vendor"}
allowed_files = {"package.json", "README.md", "LICENSE"}
excluded = {"site/source.zip", "site/release.json"}
files = []
for path in sorted(ROOT.rglob("*")):
    rel = path.relative_to(ROOT)
    if path.is_symlink():
        raise ValueError("Symlinks are not allowed in the release")
    if not path.is_file() or rel.as_posix() in excluded:
        continue
    if rel.parts[0] not in allowed_roots and rel.as_posix() not in allowed_files:
        continue
    if any(part.startswith(".") or part in {"node_modules", "__pycache__"} for part in rel.parts):
        raise ValueError("Unexpected hidden or generated path: " + str(rel))
    files.append((rel.as_posix(), path.read_bytes()))
with zipfile.ZipFile(SITE / "source.zip", "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for name, content in files:
        info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, content)
public = {}
for path in sorted(SITE.rglob("*")):
    if path.is_file() and path.name != "release.json":
        data = path.read_bytes()
        public[path.relative_to(SITE).as_posix()] = {"bytes": len(data), "sha256": sha256(data).hexdigest()}
receipt = {"format": "love-understanding.static-release/1", "scope": "only the listed static files; not repository history or local state", "hashes_are": "byte-integrity references, not signatures, identity, truth or independent review", "files": public}
(SITE / "release.json").write_text(json.dumps(receipt, indent=2) + "\n")
print(f"Packaged {len(files)} allowlisted source files; {len(public)} public file digests.")
