"""Generate reviewable English and Spanish captions for recipe videos offline.

The script downloads media and speech models only when run without
``--manifest-only``. All media, models, progress, and generated catalogs stay
under the ignored ``.subtitle-work`` directory until reviewed and copied into
the app's caption catalogs.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
WORK_ROOT = ROOT / ".subtitle-work"
DEPENDENCY_ROOT = WORK_ROOT / "python-packages"
MODEL_ROOT = WORK_ROOT / "model-cache"
MEDIA_ROOT = WORK_ROOT / "media"
GENERATED_ROOT = WORK_ROOT / "generated"
RECIPE_PATH = ROOT / "data" / "recipes.json"
MEDIA_ID_PATTERN = re.compile(
    r"[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}",
    re.IGNORECASE,
)
NUMBER_PATTERN = re.compile(r"(?<![\w])\d+(?:[.,]\d+)?(?![\w])")

# Use the same isolated Argos directories as the recipe translation authoring tool.
TOOL_ROOT = ROOT / ".translation-tools"
sys.path.insert(0, str(DEPENDENCY_ROOT))
os.environ["XDG_CONFIG_HOME"] = str(TOOL_ROOT / "config")
os.environ["XDG_DATA_HOME"] = str(TOOL_ROOT / "data")
os.environ["XDG_CACHE_HOME"] = str(TOOL_ROOT / "cache")
os.environ["HF_HOME"] = str(MODEL_ROOT / "huggingface")


def media_id_for(video: dict) -> str | None:
    for value in (video.get("url"), video.get("thumbnailUrl")):
        if isinstance(value, str):
            match = MEDIA_ID_PATTERN.search(value)
            if match:
                return match.group(0).lower()
    return None


def playable_url(video: dict, media_id: str) -> str | None:
    url = video.get("url")
    if not isinstance(url, str):
        return None
    if re.search(r"\.(?:mp4|m4v|mov|webm)(?:$|[?#])", url, re.IGNORECASE):
        return url
    if "delish.com" in (urlparse(url).hostname or "").lower():
        return (
            "https://mos-streaming.hearst.io/"
            f"{media_id}/video_9x16_1080p_h264_hd.mp4"
        )
    return None


def build_manifest() -> tuple[list[dict], list[dict]]:
    recipes = json.loads(RECIPE_PATH.read_text(encoding="utf-8"))
    items: dict[str, dict] = {}
    unsupported: list[dict] = []

    for recipe in recipes:
        for video in recipe.get("videos") or []:
            media_id = media_id_for(video)
            source_url = playable_url(video, media_id) if media_id else None
            if not media_id or not source_url:
                unsupported.append({
                    "recipe_id": str(recipe.get("id", "")),
                    "recipe_title": recipe.get("name", ""),
                    "video_url": video.get("url"),
                    "reason": "missing_media_id_or_supported_video_url",
                })
                continue

            item = items.setdefault(media_id, {
                "media_id": media_id,
                "url": source_url,
                "recipe_ids": [],
                "titles": [],
            })
            recipe_id = str(recipe.get("id", ""))
            if recipe_id and recipe_id not in item["recipe_ids"]:
                item["recipe_ids"].append(recipe_id)
            title = video.get("title") or recipe.get("name")
            if title and title not in item["titles"]:
                item["titles"].append(title)

    return sorted(items.values(), key=lambda item: item["media_id"]), unsupported


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(path.suffix + ".tmp")
    temporary_path.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    temporary_path.replace(path)


def load_json(path: Path, default: object) -> object:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def download_video(url: str, destination: Path) -> None:
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise ValueError("Only HTTPS video URLs are supported")

    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = destination.with_suffix(destination.suffix + ".part")
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; RecipeCaptionBuilder/1.0)"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        with temporary_path.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
    temporary_path.replace(destination)


def decode_audio(video_path: Path):
    try:
        import av
        import numpy as np
    except ImportError as error:
        raise RuntimeError(
            "Install the authoring dependencies from "
            "scripts/video-caption-requirements.txt first."
        ) from error

    audio_chunks = []
    with av.open(str(video_path)) as container:
        audio_stream = next(iter(container.streams.audio), None)
        if audio_stream is None:
            raise ValueError("video has no audio stream")
        resampler = av.AudioResampler(format="s16", layout="mono", rate=16000)
        for frame in container.decode(audio_stream):
            for output_frame in resampler.resample(frame):
                audio_chunks.append(output_frame.to_ndarray().reshape(-1))
        for output_frame in resampler.resample(None):
            audio_chunks.append(output_frame.to_ndarray().reshape(-1))

    if not audio_chunks:
        raise ValueError("video audio stream is empty")
    return np.concatenate(audio_chunks).astype(np.float32) / 32768.0


def build_argos_translator():
    try:
        import argostranslate.translate
    except ImportError as error:
        raise RuntimeError(
            "Argos Translate is not installed. Follow the local setup notes in "
            "scripts/generate-spanish-translations.py first."
        ) from error

    translator = argostranslate.translate.get_translation_from_codes("en", "es")
    if translator is None:
        raise RuntimeError(
            "The local English-to-Spanish Argos model is missing. Run "
            "scripts/generate-spanish-translations.py once to install it."
        )
    return translator


def translate_caption(text: str, translator) -> str:
    markers = []

    def protect_number(match: re.Match) -> str:
        marker = f"ZXQCAPNUM{len(markers)}QXZ"
        markers.append((marker, match.group(0)))
        return marker

    protected_text = NUMBER_PATTERN.sub(protect_number, text)
    translated = translator.translate(protected_text)
    for marker, number in markers:
        if marker not in translated:
            raise ValueError("Spanish translation did not preserve a caption number")
        translated = translated.replace(marker, number)
    return translated


def process_item(item: dict, model, translator) -> tuple[list[dict], list[dict]]:
    media_id = item["media_id"]
    video_path = MEDIA_ROOT / f"{media_id}.mp4"
    if not video_path.exists():
        download_video(item["url"], video_path)

    audio = decode_audio(video_path)
    segments, _info = model.transcribe(
        audio,
        language="en",
        task="transcribe",
        vad_filter=True,
        word_timestamps=False,
    )

    english_cues = []
    spanish_cues = []
    for segment in segments:
        text = segment.text.strip()
        if not text:
            continue
        start = round(float(segment.start), 3)
        end = round(float(segment.end), 3)
        english_cues.append({"start": start, "end": end, "text": text})
        spanish_cues.append({
            "start": start,
            "end": end,
            "text": translate_caption(text, translator),
        })

    if not english_cues:
        raise ValueError("no speech detected")
    return english_cues, spanish_cues


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest-only", action="store_true", help="write the media manifest without downloading anything")
    parser.add_argument("--limit", type=int, help="process only the first N unprocessed media IDs")
    parser.add_argument("--media-id", action="append", default=[], help="process a specific media ID; may be repeated")
    parser.add_argument("--model", default="small", help="faster-whisper model name or local path (default: small)")
    parser.add_argument("--device", default="cpu", choices=("cpu", "cuda"), help="transcription device (default: cpu)")
    parser.add_argument("--compute-type", default="int8", help="faster-whisper compute type (default: int8)")
    return parser.parse_args()


def package_version(package_name: str) -> str:
    try:
        return version(package_name)
    except PackageNotFoundError:
        return "unknown"


def main() -> int:
    args = parse_args()
    manifest, unsupported = build_manifest()
    WORK_ROOT.mkdir(parents=True, exist_ok=True)
    write_json(WORK_ROOT / "manifest.json", manifest)
    write_json(WORK_ROOT / "unsupported.json", unsupported)
    print(f"Manifest: {len(manifest)} unique media IDs; {len(unsupported)} unsupported entries")

    if args.manifest_only:
        return 0

    requested_ids = set(args.media_id)
    selected = [
        item for item in manifest
        if not requested_ids or item["media_id"] in requested_ids
    ]
    report_path = WORK_ROOT / "report.json"
    report = load_json(report_path, {})
    english_path = GENERATED_ROOT / "videoCaptions.en.json"
    spanish_path = GENERATED_ROOT / "videoCaptions.es.json"
    english_catalog = load_json(english_path, {})
    spanish_catalog = load_json(spanish_path, {})
    completed_now = 0

    selected = [item for item in selected if report.get(item["media_id"], {}).get("status") != "needs_review"]
    if args.limit is not None:
        selected = selected[:max(args.limit, 0)]

    if not selected:
        print("No unprocessed media IDs match the selection.")
        return 0

    try:
        from faster_whisper import WhisperModel
    except ImportError as error:
        raise RuntimeError(
            "Install the authoring dependencies from "
            "scripts/video-caption-requirements.txt first."
        ) from error

    translator = build_argos_translator()
    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)

    for item in selected:
        media_id = item["media_id"]
        try:
            english_cues, spanish_cues = process_item(item, model, translator)
            english_catalog[media_id] = english_cues
            spanish_catalog[media_id] = spanish_cues
            report[media_id] = {
                "status": "needs_review",
                "url": item["url"],
                "recipe_ids": item["recipe_ids"],
                "titles": item["titles"],
                "cue_count": len(english_cues),
                "model": args.model,
                "tool_versions": {
                    "faster_whisper": package_version("faster-whisper"),
                    "argostranslate": package_version("argostranslate"),
                    "av": package_version("av"),
                },
                "generated_at_unix": int(time.time()),
            }
            completed_now += 1
        except Exception as error:
            report[media_id] = {
                "status": "failed",
                "url": item["url"],
                "recipe_ids": item["recipe_ids"],
                "titles": item["titles"],
                "reason": str(error),
            }
            print(f"Failed {media_id}: {error}", file=sys.stderr)

        write_json(english_path, english_catalog)
        write_json(spanish_path, spanish_catalog)
        write_json(report_path, report)
        print(f"Processed {media_id}: {report[media_id]['status']}", flush=True)

    print(f"Generated {completed_now} media captions; all generated entries need review.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit("Interrupted; completed media IDs remain saved for resume.")
