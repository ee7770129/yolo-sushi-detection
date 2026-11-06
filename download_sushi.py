# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：下載 Food-101 壽司類圖片（進入點）
功能說明：
    逐一讀取 Food-101 parquet 分片，先只讀「類別」欄找出壽司所在的資料組，
    再只下載那幾組的圖片，存成 sushi_000.jpg、sushi_001.jpg…
    不用下載整包 5 GB 資料集。

用法：
    python download_sushi.py

建立日期：2026-11-05
版本號：v0.1.0
"""

import os
import sys

import pyarrow.parquet as pq
import yaml

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

from dataset.http_range_file import HttpRangeFile  # noqa: E402


def load_config():
    with open(os.path.join(PROJECT_ROOT, "configs", "dataset_config.yaml"), "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def main():
    cfg = load_config()
    out_dir = os.path.join(PROJECT_ROOT, cfg["download_dir"])
    os.makedirs(out_dir, exist_ok=True)
    saved = len([n for n in os.listdir(out_dir) if n.endswith(".jpg")])
    if saved >= cfg["max_images"]:
        print(f"已有 {saved} 張，不用再下載")
        return

    seen = 0  # 已經走過的壽司張數，用來支援中斷後續傳
    for shard in cfg["shards"]:
        url = cfg["parquet_url_template"].format(split=cfg["split"], shard=shard)
        parquet = pq.ParquetFile(HttpRangeFile(url, cfg["request_timeout_secs"]))
        for group in range(parquet.num_row_groups):
            labels = parquet.read_row_group(group, columns=["label"]).column("label").to_pylist()
            index = [k for k, v in enumerate(labels) if v == cfg["sushi_label"]]
            if not index:
                continue
            if seen + len(index) <= saved:
                seen += len(index)
                continue
            images = parquet.read_row_group(group, columns=["image"]).column("image").to_pylist()
            for k in index:
                if seen >= saved and saved < cfg["max_images"]:
                    path = os.path.join(out_dir, f"sushi_{saved:03d}.jpg")
                    with open(path, "wb") as file:
                        file.write(images[k]["bytes"])
                    saved += 1
                seen += 1
            print(f"分片 {shard} 第 {group} 組：{len(index)} 張壽司，累計存 {saved} 張", flush=True)
            if saved >= cfg["max_images"]:
                print("完成")
                return
    print(f"完成，共 {saved} 張")


if __name__ == "__main__":
    main()
