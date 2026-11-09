# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：整理報告用圖片（進入點）
功能說明：
    把 Roboflow 截圖裁成只剩重點的區域，並把訓練產生的圖、類別對照圖、
    挑圖拼圖複製到 report/assets/，給 build_pptx.js 製作簡報。

用法：
    python report/make_assets.py

建立日期：2026-11-08
版本號：v0.1.0
"""

import os
import shutil

from PIL import Image

REPORT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(REPORT_DIR)
ASSETS_DIR = os.path.join(REPORT_DIR, "assets")
SHOTS_DIR = os.path.join(REPORT_DIR, "screenshots")
RUN_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "sushi_v1")
PREDICT_DIR = os.path.join(PROJECT_ROOT, "runs", "detect", "sushi_v1_predict")

# 截圖裁切範圍（左, 上, 右, 下），座標以 1568x783 截圖為準
CROPS = {
    "06_roboflow_annotation.jpg": ("shot_annotation.jpg", (76, 0, 1410, 783)),
    "02_roboflow_split.jpg": ("shot_split.jpg", (603, 430, 1510, 740)),
    "04_roboflow_class_counts.jpg": ("shot_class_counts.jpg", (343, 110, 1510, 550)),
    "05_roboflow_dataset_grid.jpg": ("shot_dataset_grid.jpg", (330, 255, 1530, 745)),
    "03_roboflow_board.jpg": ("shot_board.jpg", (330, 170, 1545, 530)),
}

# 直接複製的圖：來源路徑 → 新檔名
COPIES = {
    os.path.join(PROJECT_ROOT, "data", "reference", "class_reference.jpg"): "class_reference.jpg",
    os.path.join(PROJECT_ROOT, "data", "contact_sheets", "sheet_000.jpg"): "contact_sheet.jpg",
    os.path.join(RUN_DIR, "results.png"): "results.png",
    os.path.join(RUN_DIR, "confusion_matrix_normalized.png"): "confusion_matrix.png",
    os.path.join(RUN_DIR, "train_batch0.jpg"): "train_batch.jpg",
}

# 預測示意圖：檔名開頭 → 新檔名
PREDICTIONS = {
    "sushi_138": "pred_138.jpg",
    "sushi_074": "pred_074.jpg",
    "sushi_244": "pred_244.jpg",
    "sushi_000": "pred_000.jpg",
}


def main():
    os.makedirs(ASSETS_DIR, exist_ok=True)

    for source_name, (target_name, box) in CROPS.items():
        image = Image.open(os.path.join(SHOTS_DIR, source_name)).convert("RGB")
        image.crop(box).save(os.path.join(ASSETS_DIR, target_name), quality=92)

    for source_path, target_name in COPIES.items():
        shutil.copyfile(source_path, os.path.join(ASSETS_DIR, target_name))

    for prefix, target_name in PREDICTIONS.items():
        matches = [f for f in os.listdir(PREDICT_DIR) if f.startswith(prefix)]
        if not matches:
            raise FileNotFoundError(f"[make_assets] 找不到預測圖 {prefix}，請先執行 python evaluate.py")
        shutil.copyfile(os.path.join(PREDICT_DIR, matches[0]), os.path.join(ASSETS_DIR, target_name))

    print(f"[make_assets] 完成，共 {len(os.listdir(ASSETS_DIR))} 張，在 {ASSETS_DIR}")


if __name__ == "__main__":
    main()
