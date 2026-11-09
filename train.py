# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：訓練壽司辨識模型（進入點）
功能說明：
    用 configs/train_config.yaml 的參數，以 YOLOv8n 預訓練權重為起點，
    在 data/dataset/ 的資料上訓練。結果（權重、訓練曲線、混淆矩陣等）
    會存到 runs/detect/<name>/。

用法：
    python train.py

建立日期：2026-11-08
版本號：v0.1.0
"""

from ultralytics import YOLO

from train_config_loader import load_train_config


def main():
    config = load_train_config()
    train_args = config["train"]

    model = YOLO(config["model"])
    model.train(
        data=config["data_yaml"],
        project=config["project"],
        name=config["name"],
        exist_ok=True,
        **train_args,
    )
    print(f"[train] 完成，結果在 {config['project']}/{config['name']}")


if __name__ == "__main__":
    main()
