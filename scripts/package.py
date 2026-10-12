"""Build portable skill and example archives without npm dependencies or local paths."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

def add_tree(archive, folder, prefix):
    for file in sorted(folder.rglob("*")):
        if file.is_file() and not any(part in {"node_modules", "__pycache__", "output"} for part in file.relative_to(folder).parts):
            archive.write(file, str(Path(prefix) / file.relative_to(folder)).replace("\\", "/"))

skills = DIST / "motion-story-skills-v0.1.0.zip"
with ZipFile(skills, "w", ZIP_DEFLATED) as archive:
    for name in ("motion-story", "social-motion"):
        add_tree(archive, ROOT / "skills" / name, name)
        archive.write(ROOT / "LICENSE", f"{name}/LICENSE")
        archive.write(ROOT / "THIRD_PARTY_NOTICES.md", f"{name}/THIRD_PARTY_NOTICES.md")

examples = DIST / "motion-story-examples-v0.1.0.zip"
with ZipFile(examples, "w", ZIP_DEFLATED) as archive:
    add_tree(archive, ROOT / "examples", "examples")
    for name in ("LICENSE", "THIRD_PARTY_NOTICES.md", "README.md", "README.zh-CN.md"):
        archive.write(ROOT / name, name)

checksums = []
for file in (skills, examples):
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    checksums.append(f"{digest}  {file.name}")
    print(f"{file.name}: {file.stat().st_size:,} bytes")
(DIST / "SHA256SUMS.txt").write_text("\n".join(checksums) + "\n", encoding="utf-8")
