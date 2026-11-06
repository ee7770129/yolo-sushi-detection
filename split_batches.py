# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：把挑好的圖片分成組員各自的標註包（進入點）
功能說明：
    1. 讀 configs/picked_images.yaml 的挑選清單
    2. 握壽司圖和卷壽司圖分別輪流分配，讓每包的難度差不多
    3. 複製到 data/to_label/batch_1 ~ batch_N（原始下載圖不動），並輸出 batches.csv

用法：
    python split_batches.py

建立日期：2026-11-05
版本號：v0.1.0
"""

import csv
import os
import shutil

import yaml

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))


def load_yaml(name):
    with open(os.path.join(PROJECT_ROOT, "configs", name), "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def assign(picked, num_batches):
    """回傳 [(編號, 類型, 第幾包)]，兩種圖各自輪流分配。"""
    result, turn = [], 0
    # 追加清單排在後面，原本已分配的圖不會換包
    for kind in ("nigiri", "roll_only", "extra_nigiri", "extra_roll_only"):
        for number in picked.get(kind, []):
            result.append((number, kind.replace("extra_", ""), turn % num_batches + 1))
            turn += 1
    return result


def main():
    picked = load_yaml("picked_images.yaml")
    source_dir = os.path.join(PROJECT_ROOT, load_yaml("dataset_config.yaml")["download_dir"])
    out_root = os.path.join(PROJECT_ROOT, picked["output_dir"])

    rows = []
    for number, kind, batch in assign(picked, picked["num_batches"]):
        name = f"sushi_{number:03d}.jpg"
        batch_dir = os.path.join(out_root, f"batch_{batch}")
        os.makedirs(batch_dir, exist_ok=True)
        shutil.copy2(os.path.join(source_dir, name), os.path.join(batch_dir, name))
        rows.append({"file": name, "kind": kind, "batch": batch})

    with open(os.path.join(out_root, "batches.csv"), "w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=["file", "kind", "batch"])
        writer.writeheader()
        writer.writerows(rows)

    for batch in range(1, picked["num_batches"] + 1):
        count = sum(1 for r in rows if r["batch"] == batch)
        print(f"  batch_{batch}：{count} 張")
    print(f"完成，共 {len(rows)} 張，在 {out_root}")


if __name__ == "__main__":
    main()
