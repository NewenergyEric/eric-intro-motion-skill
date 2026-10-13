"""Build portable skill and example archives without npm dependencies or local paths."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

def add_tree(archive, folder, prefix):
    for file in sorted(folder.rglob("*")):
        if file.is_file() and file.suffix != '.log' and '.partial.' not in file.name and not any(part in {"node_modules", "__pycache__", "output", ".bundle", ".cache", ".work"} for part in file.relative_to(folder).parts):
            archive.write(file, str(Path(prefix) / file.relative_to(folder)).replace("\\", "/"))

VERSION = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
skills = DIST / f"eric-intro-motion-skill-v{VERSION}.zip"
with ZipFile(skills, "w", ZIP_DEFLATED) as archive:
    for name in ("eric-intro-motion-skill", "social-motion", "motion-story"):
        add_tree(archive, ROOT / "skills" / name, name)
        archive.write(ROOT / "LICENSE", f"{name}/LICENSE")
        archive.write(ROOT / "THIRD_PARTY_NOTICES.md", f"{name}/THIRD_PARTY_NOTICES.md")

examples = DIST / f"eric-intro-motion-skill-examples-v{VERSION}.zip"
with ZipFile(examples, "w", ZIP_DEFLATED) as archive:
    add_tree(archive, ROOT / "examples", "examples")
    add_tree(archive, ROOT / "skills", "skills")
    add_tree(archive, ROOT / "scripts", "scripts")
    add_tree(archive, ROOT / "tests", "tests")
    for name in ("LICENSE", "THIRD_PARTY_NOTICES.md", "README.md", "README.zh-CN.md", "package.json"):
        archive.write(ROOT / name, name)

checksums = []
for file in (skills, examples):
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    checksums.append(f"{digest}  {file.name}")
    print(f"{file.name}: {file.stat().st_size:,} bytes")
(DIST / "SHA256SUMS.txt").write_text("\n".join(checksums) + "\n", encoding="utf-8")
