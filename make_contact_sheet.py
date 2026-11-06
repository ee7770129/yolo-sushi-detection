# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：產生預覽拼圖（進入點）
功能說明：
    把資料夾內的圖片縮小、標上編號，拼成多張拼圖，方便人工快速瀏覽與挑圖。
    只產生預覽，不修改原始圖片。

用法：
    python make_contact_sheet.py                 # 預設讀 dataset_config.yaml 的 download_dir
    python make_contact_sheet.py data/to_label   # 指定資料夾

建立日期：2026-11-05
版本號：v0.1.0
"""

import argparse
import os

import yaml
from PIL import Image, ImageDraw

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))


def load_config():
    with open(os.path.join(PROJECT_ROOT, "configs", "dataset_config.yaml"), "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def build_sheet(paths, columns, cell):
    """把多張圖拼成一張，左上角標檔名編號。"""
    rows = (len(paths) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell, rows * cell), "white")
    draw = ImageDraw.Draw(sheet)
    for i, path in enumerate(paths):
        image = Image.open(path).convert("RGB")
        image.thumbnail((cell - 4, cell - 4))
        x, y = (i % columns) * cell, (i // columns) * cell
        sheet.paste(image, (x + 2, y + 2))
        label = os.path.splitext(os.path.basename(path))[0].split("_")[-1]
        draw.rectangle([x + 2, y + 2, x + 50, y + 24], fill="black")
        draw.text((x + 6, y + 6), label, fill="yellow")
    return sheet


def main():
    cfg = load_config()
    parser = argparse.ArgumentParser(description="產生預覽拼圖")
    parser.add_argument("image_dir", nargs="?", default=os.path.join(PROJECT_ROOT, cfg["download_dir"]))
    args = parser.parse_args()

    sheet_cfg = cfg["contact_sheet"]
    out_dir = os.path.join(PROJECT_ROOT, sheet_cfg["output_dir"])
    os.makedirs(out_dir, exist_ok=True)
    names = sorted(n for n in os.listdir(args.image_dir) if n.lower().endswith(".jpg"))
    step = sheet_cfg["per_sheet"]
    for start in range(0, len(names), step):
        paths = [os.path.join(args.image_dir, n) for n in names[start : start + step]]
        sheet = build_sheet(paths, sheet_cfg["columns"], sheet_cfg["cell_size"])
        sheet.save(os.path.join(out_dir, f"sheet_{start:03d}.jpg"), quality=85)
    print(f"完成：{len(names)} 張圖，拼圖在 {out_dir}")


if __name__ == "__main__":
    main()
