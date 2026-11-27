"""Renders icons/*.svg to the PNG sizes the manifest and iOS need. Run: node tools/make-icons.js && python3 tools/make-icons.py"""
import pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent / 'icons'
jobs = [('icon.svg', 'icon-192.png', 192), ('icon.svg', 'icon-512.png', 512), ('icon.svg', 'apple-touch-icon.png', 180), ('icon-maskable.svg', 'icon-maskable-512.png', 512)]
with sync_playwright() as p:
    b = p.chromium.launch()
    for src, out, size in jobs:
        pg = b.new_page(viewport={'width': size, 'height': size})
        svg = (root / src).read_text()
        pg.set_content(f'<html><body style="margin:0">{svg.replace("width=\"512\" height=\"512\"", f"width=\"{size}\" height=\"{size}\"")}</body></html>')
        pg.screenshot(path=str(root / out), omit_background=False)
        pg.close()
    b.close()
print('png ok')
