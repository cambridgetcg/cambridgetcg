"""Package only this public artifact, in a worktree without concurrent writers."""
from pathlib import Path
from hashlib import sha256
import io
import json
import os
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
ALLOWED_ROOTS = {"site", "scripts", "tests", "vendor"}
ALLOWED_FILES = {"package.json", "README.md", "LICENSE"}
EXCLUDED = {"site/source.zip", "site/release.json"}

# Reject every existing link and invalid selected path before reads or writes.
selected = []
for path in sorted(ROOT.rglob("*")):
    rel = path.relative_to(ROOT)
    if path.is_symlink():
        raise ValueError("Symlinks are not allowed in the release")
    if rel.parts[0] not in ALLOWED_ROOTS and rel.as_posix() not in ALLOWED_FILES:
        continue
    if any(part.startswith(".") or part in {"node_modules", "__pycache__"} for part in rel.parts):
        raise ValueError("Unexpected hidden or generated path: " + str(rel))
    if path.is_dir():
        continue
    if not path.is_file():
        raise ValueError("Only regular source files are allowed: " + str(rel))
    if rel.as_posix() not in EXCLUDED:
        selected.append((rel.as_posix(), path))
if not SITE.is_dir():
    raise ValueError("A regular site directory is required")
files = {name: path.read_bytes() for name, path in selected}
if not {"README.md", "LICENSE"}.issubset(files):
    raise ValueError("README.md and LICENSE must be regular source files")
for name in ("README.md", "LICENSE"):
    files["site/" + name] = files[name]

# Prepare the full download and receipt before touching publication outputs.
buffer = io.BytesIO()
with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for name, content in sorted(files.items()):
        info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, content)
public = {name.removeprefix("site/"): data for name, data in files.items() if name.startswith("site/")}
public["source.zip"] = buffer.getvalue()
receipt = {
    "format": "love-understanding.static-release/1",
    "scope": "only the listed static files; not repository history or local state",
    "hashes_are": "byte-integrity references, not signatures, identity, truth or independent review",
    "files": {name: {"bytes": len(data), "sha256": sha256(data).hexdigest()} for name, data in sorted(public.items())},
}
outputs = {name: public[name] for name in ("README.md", "LICENSE", "source.zip")}
outputs["release.json"] = (json.dumps(receipt, indent=2) + "\n").encode()

# Replace directory entries, never truncate through an existing output hardlink.
# Replacements are per-file, not a group transaction or a concurrent-writer lock.
for name, content in outputs.items():
    fd, temporary = tempfile.mkstemp(prefix=".package-", dir=SITE)
    temporary = Path(temporary)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(content)
            os.fchmod(stream.fileno(), 0o644)
        os.replace(temporary, SITE / name)
    finally:
        temporary.unlink(missing_ok=True)
print(f"Packaged {len(files)} allowlisted source files; {len(public)} public file digests.")
