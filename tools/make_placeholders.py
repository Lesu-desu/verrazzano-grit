"""
Creates placeholder photos for missing portfolio images and generates MEDIA_LIST.txt.

Run from the project root:
    python tools/make_placeholders.py

Requires Pillow:
    pip install pillow

Existing files are never overwritten. Missing video files are reported but are
not generated; only missing image files receive placeholders.
"""

from __future__ import annotations

import importlib
import os
import sys
from pathlib import Path
from typing import Any

# This script is expected to live in <project-root>/tools/.
SCRIPT_PATH = Path(__file__).resolve()
ROOT = SCRIPT_PATH.parent.parent
OUTPUT_DIR = ROOT / "static" / "portfolio"


def load_projects_module():
    """
    Load the project's projects module even when the project root is not the
    current working directory.

    Supported layouts:
      <root>/projects.py
      <root>/projects/__init__.py
      <root>/app/projects.py
      <root>/app/projects/__init__.py
    """
    candidates = [
        ROOT,
        ROOT / "app",
    ]

    for candidate in candidates:
        if candidate.is_dir() and str(candidate) not in sys.path:
            sys.path.insert(0, str(candidate))

    # Try the normal import first. This is the usual layout.
    try:
        return importlib.import_module("projects")
    except ModuleNotFoundError as first_error:
        # Check common alternate locations and make their parent importable.
        for module_file in (
            ROOT / "projects.py",
            ROOT / "projects" / "__init__.py",
            ROOT / "app" / "projects.py",
            ROOT / "app" / "projects" / "__init__.py",
        ):
            if module_file.is_file():
                parent = str(module_file.parent.parent if module_file.name == "__init__.py"
                             else module_file.parent)
                if parent not in sys.path:
                    sys.path.insert(0, parent)
                try:
                    return importlib.import_module("projects")
                except ModuleNotFoundError:
                    continue

        raise ModuleNotFoundError(
            "Could not import the portfolio projects module. Expected one of:\n"
            f"  - {ROOT / 'projects.py'}\n"
            f"  - {ROOT / 'projects' / '__init__.py'}\n"
            f"  - {ROOT / 'app' / 'projects.py'}\n"
            f"  - {ROOT / 'app' / 'projects' / '__init__.py'}\n"
            "Make sure the file is named projects.py (or is a projects package) "
            "and is in one of those locations."
        ) from first_error


try:
    from PIL import Image, ImageDraw, ImageFont
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Pillow is required. Install it with: pip install pillow"
    ) from exc

P = load_projects_module()

# Prefer the directory configured by projects.py, but retain the expected
# static/portfolio location as a safe fallback.
MEDIA_DIR = getattr(P, "MEDIA_DIR", "portfolio")
OUTPUT_DIR = ROOT / "static" / str(MEDIA_DIR)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]

TONES = ["#3b342b", "#40382e", "#352f27", "#453c31", "#38322a"]


def get_font(size: int):
    for font_path in FONT_CANDIDATES:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except OSError:
                pass
    return ImageFont.load_default()


def make_placeholder(path: Path, filename: str, title: str, kind: str,
                     width: int = 1600, height: int = 1000, tone: int = 0) -> None:
    """Create a placeholder image without replacing an existing file."""
    if path.exists():
        return

    path.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (width, height), TONES[tone % len(TONES)])
    draw = ImageDraw.Draw(image)

    draw.rectangle(
        [40, 40, width - 40, height - 40],
        outline="#8a7a5f",
        width=3,
    )
    draw.line(
        [40, 40, width - 40, height - 40],
        fill="#4d4436",
        width=2,
    )
    draw.line(
        [width - 40, 40, 40, height - 40],
        fill="#4d4436",
        width=2,
    )

    draw.text(
        (width // 2, height // 2 - 40),
        filename,
        fill="#f2ede3",
        font=get_font(56),
        anchor="mm",
    )
    draw.text(
        (width // 2, height // 2 + 25),
        title,
        fill="#d4c8b5",
        font=get_font(26),
        anchor="mm",
    )
    draw.text(
        (width // 2, height // 2 + 65),
        kind,
        fill="#8a7a5f",
        font=get_font(26),
        anchor="mm",
    )

    # These placeholders are deliberately saved as JPEG data. The project
    # media names should therefore use a .jpg or .jpeg extension.
    suffix = path.suffix.lower()
    if suffix not in {".jpg", ".jpeg"}:
        raise ValueError(
            f"Cannot create a JPEG placeholder for '{path.name}': "
            "the filename must end in .jpg or .jpeg. Rename the media entry "
            "in projects.py or provide the real media file."
        )

    image.save(path, format="JPEG", quality=85)


def safe_media_path(filename: str) -> Path:
    """Resolve a media filename and prevent paths escaping the media folder."""
    path = (OUTPUT_DIR / filename).resolve()
    output_root = OUTPUT_DIR.resolve()

    if path != output_root and output_root not in path.parents:
        raise ValueError(f"Unsafe media path in projects.py: {filename!r}")

    return path


def main() -> None:
    print(f"Checking portfolio media in: {OUTPUT_DIR}")

    if not hasattr(P, "get_projects"):
        raise AttributeError("projects.py must define get_projects().")

    all_projects = P.get_projects()
    raw_projects = getattr(P, "PROJECTS", None)

    if raw_projects is None:
        raise AttributeError("projects.py must define PROJECTS.")

    lines = [
        "VERRAZZANO & GRIT — PORTFOLIO MEDIA DIRECTORY",
        "=" * 50,
        "",
    ]

    tone_index = 0
    created = 0
    existing = 0
    missing_videos = 0

    # Page-wide media.
    lines.append("PAGE-WIDE MEDIA:")
    page_media = [
        ("Hero background", getattr(P, "HERO_IMAGE", None)),
        ("CTA background", getattr(P, "CTA_IMAGE", None)),
    ]

    for label, filename in page_media:
        if not filename:
            lines.append(f"  [NOT CONFIGURED] {label}")
            continue

        path = safe_media_path(filename)
        if path.exists():
            existing += 1
            status = "[EXISTS]"
        else:
            make_placeholder(path, Path(filename).name, label,
                             "Page-wide media", tone=tone_index)
            tone_index += 1
            created += 1
            status = "[CREATED PLACEHOLDER]"

        lines.append(f"  {filename:<24} {status:<24} {label}")

    # Walkthrough poster.
    walkthrough = getattr(P, "WALKTHROUGH", {}) or {}
    poster = walkthrough.get("poster")

    lines.append("")
    lines.append("WALKTHROUGH MEDIA:")

    if poster:
        path = safe_media_path(poster)
        if path.exists():
            existing += 1
            status = "[EXISTS]"
        else:
            make_placeholder(path, Path(poster).name, "Walkthrough Poster",
                             "Preview still", tone=tone_index)
            tone_index += 1
            created += 1
            status = "[CREATED PLACEHOLDER]"

        lines.append(f"  {poster:<24} {status:<24} Walkthrough poster")
    else:
        lines.append("  [NOT CONFIGURED] Walkthrough poster")

    lines.append("")
    lines.append("PROJECT MEDIA:")

    # Match the display projects to their original media definitions.
    originals_by_name = {
        item.get("name"): item
        for item in raw_projects
        if isinstance(item, dict) and item.get("name")
    }

    for project in all_projects:
        name = project.get("name", "Unnamed project")
        category = project.get("category", "")
        location = project.get("location", "")

        lines.append(f"-- {name} ({category} · {location}) --")

        original = originals_by_name.get(name, project)

        for image_name in original.get("images", []) or []:
            path = safe_media_path(image_name)

            if path.exists():
                existing += 1
                status = "[EXISTS]"
            else:
                make_placeholder(
                    path,
                    Path(image_name).name,
                    name,
                    category or "Project photo",
                    tone=tone_index,
                )
                tone_index += 1
                created += 1
                status = "[CREATED PLACEHOLDER]"

            lines.append(f"  {image_name:<24} {status:<24} Photo")

        for video_name in original.get("videos", []) or []:
            path = safe_media_path(video_name)

            if path.exists():
                existing += 1
                status = "[EXISTS]"
            else:
                missing_videos += 1
                status = "[MISSING VIDEO FILE]"

            lines.append(f"  {video_name:<24} {status:<24} Video")

        lines.append("")

    manifest_path = OUTPUT_DIR / "MEDIA_LIST.txt"
    manifest_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(
        f"\nSummary: {existing} files already present, "
        f"{created} placeholders generated, "
        f"{missing_videos} video files missing."
    )
    print(f"Media manifest saved to: {manifest_path}")


if __name__ == "__main__":
    main()
