# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：評估模型並產生預測示意圖（進入點）
功能說明：
    1. 載入 train.py 訓練好的 best.pt
    2. 在設定的資料切分（驗證集、測試集）上算 mAP、precision、recall，
       各切分的混淆矩陣等圖存到 runs/detect/<name>_<split>/
    3. 印出每個類別的成績，並存成 runs/detect/<name>_metrics.csv 給報告用
    4. 對測試集圖片畫出預測框，存到 runs/detect/<predict_name>/

用法：
    python evaluate.py

建立日期：2026-11-08
版本號：v0.1.0
"""

import csv
import os

from ultralytics import YOLO

from train_config_loader import load_train_config


def evaluate_split(model, config, split):
    """在單一切分上評估，回傳每個類別的成績列。"""
    metrics = model.val(
        data=config["data_yaml"],
        split=split,
        imgsz=config["train"]["imgsz"],
        device=config["train"]["device"],
        project=config["project"],
        name=f"{config['name']}_{split}",
        exist_ok=True,
    )
    rows = [{
        "split": split, "class": "all",
        "precision": metrics.box.mp, "recall": metrics.box.mr,
        "mAP50": metrics.box.map50, "mAP50-95": metrics.box.map,
    }]
    for index, class_id in enumerate(metrics.box.ap_class_index):
        precision, recall, map50, map50_95 = metrics.box.class_result(index)
        rows.append({
            "split": split, "class": model.names[int(class_id)],
            "precision": precision, "recall": recall,
            "mAP50": map50, "mAP50-95": map50_95,
        })
    return rows


def save_metrics(rows, path):
    with open(path, "w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        for row in rows:
            writer.writerow({k: (round(v, 4) if isinstance(v, float) else v) for k, v in row.items()})


def main():
    config = load_train_config()
    weights = os.path.join(config["project"], config["name"], "weights", "best.pt")
    if not os.path.exists(weights):
        raise FileNotFoundError(f"[evaluate] 找不到權重 {weights}，請先執行 python train.py")

    model = YOLO(weights)
    eval_config = config["evaluate"]

    all_rows = []
    for split in eval_config["splits"]:
        all_rows.extend(evaluate_split(model, config, split))

    metrics_path = os.path.join(config["project"], f"{config['name']}_metrics.csv")
    save_metrics(all_rows, metrics_path)
    for row in all_rows:
        print(f"[evaluate] {row['split']:5s} {row['class']:7s} "
              f"P={row['precision']:.3f} R={row['recall']:.3f} "
              f"mAP50={row['mAP50']:.3f} mAP50-95={row['mAP50-95']:.3f}")
    print(f"[evaluate] 成績表：{metrics_path}")

    model.predict(
        source=eval_config["predict_source"],
        conf=eval_config["conf"],
        imgsz=config["train"]["imgsz"],
        device=config["train"]["device"],
        project=config["project"],
        name=eval_config["predict_name"],
        exist_ok=True,
        save=True,
    )
    print(f"[evaluate] 預測示意圖：{config['project']}/{eval_config['predict_name']}")


if __name__ == "__main__":
    main()
