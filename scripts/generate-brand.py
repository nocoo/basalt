from hashlib import sha256
from pathlib import Path
from base64 import b64encode
import json

from PIL import Image, ImageDraw, ImageFont, ImageOps, __version__ as pillow_version


root = Path(__file__).resolve().parents[1]
source = json.loads((root / "assets/brand/source.json").read_text())
for name, record in source["masters"].items():
    if sha256((root / name).read_bytes()).hexdigest() != record["sha256"]:
        raise ValueError(f"Selected master changed: {name}")

foreground = Image.open(root / "logo.png").convert("RGBA")
square = Image.open(root / "assets/brand/icon.png").convert("RGBA")
rounded = Image.open(root / "assets/brand/icon-rounded.png").convert("RGBA")
background = Image.open(root / "assets/brand/background.png").convert("RGBA")
public = root / "public"
public.mkdir(exist_ok=True)
outputs = []


def save(image, name, role, **options):
    destination = public / name
    image.save(destination, **options)
    decoded = Image.open(destination)
    record = {
        "path": f"public/{name}",
        "role": role,
        "sha256": sha256(destination.read_bytes()).hexdigest(),
        "width": decoded.width,
        "height": decoded.height,
    }
    if decoded.format == "ICO":
        record["entries"] = []
        for size in sorted(decoded.ico.sizes()):
            entry = decoded.ico.getimage(size).convert("RGBA")
            record["entries"].append({
                "width": entry.width,
                "height": entry.height,
                "alphaExtrema": list(entry.getchannel("A").getextrema()),
            })
    outputs.append(record)


for size in [24, 32, 48, 64, 80, 128, 256]:
    save(foreground.resize((size, size), Image.Resampling.LANCZOS),
         f"logo-{size}.png", "transparent application mark")
save(foreground.resize((32, 32), Image.Resampling.LANCZOS),
     "favicon.png", "transparent browser mark")
save(foreground, "favicon.ico", "transparent browser mark",
     format="ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)])
save(square.resize((180, 180), Image.Resampling.LANCZOS).convert("RGB"),
     "apple-touch-icon.png", "opaque square platform presentation")
social = ImageOps.fit(background, (1200, 630), Image.Resampling.LANCZOS)
social.alpha_composite(rounded.resize((520, 520), Image.Resampling.LANCZOS), (640, 55))
draw = ImageDraw.Draw(social)
font_candidates = [
    "/System/Library/Fonts/Geneva.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
font_path = next((candidate for candidate in font_candidates if Path(candidate).exists()), None)
if font_path is None:
    raise FileNotFoundError("No sans-serif TTF available for the social card")
title_font = ImageFont.truetype(font_path, 72)
tag_font = ImageFont.truetype(font_path, 30)
body_font = ImageFont.truetype(font_path, 22)
ink = (42, 38, 32, 255)
muted = (168, 152, 126, 255)
draw.text((72, 168), "basalt.", font=title_font, fill=ink)
draw.text((72, 268), "Dense, dark, durable.", font=tag_font, fill=ink)
draw.text((72, 322), "A matte design system", font=body_font, fill=ink)
draw.text((72, 356), "for information-rich software.", font=body_font, fill=ink)
draw.text((72, 500), "basaltui.com", font=body_font, fill=muted)
save(social.convert("RGB"), "opengraph-image.png", "wordmark and corner tower on the pale engineering field")

package_mark = root / "packages/basalt/src/assets/brand-mark.ts"
package_mark.parent.mkdir(parents=True, exist_ok=True)
package_png = public / "logo-128.png"
package_mark.write_text(
    'export const basaltMarkPng =\n\t"data:image/png;base64,'
    + b64encode(package_png.read_bytes()).decode("ascii")
    + '";\n'
)
outputs.append({
    "path": str(package_mark.relative_to(root)),
    "role": "embedded transparent package mark; no host asset URL required",
    "sha256": sha256(package_mark.read_bytes()).hexdigest(),
    "pngSha256": sha256(package_png.read_bytes()).hexdigest(),
    "width": 128,
    "height": 128,
})

report = {
    "generator": "scripts/generate-brand.py",
    "pillow": pillow_version,
    "study": source["study"],
    "finishing": source["finishing"],
    "icoSizes": [16, 24, 32, 48, 64],
    "files": outputs,
}
(root / "assets/brand/derivatives.json").write_text(json.dumps(report, indent="\t") + "\n")
print(f"Generated {len(outputs)} brand assets from the checked {source['study']} masters.")
