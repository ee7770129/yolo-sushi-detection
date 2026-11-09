# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：讀取訓練設定（共用模組）
功能說明：
    讀 configs/train_config.yaml，並把裡面的相對路徑轉成專案根目錄下的絕對路徑，
    給 train.py、evaluate.py 共用，避免各自重複寫讀檔邏輯。

建立日期：2026-11-08
版本號：v0.1.0
"""

import os

import yaml

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(PROJECT_ROOT, "configs", "train_config.yaml")


def project_path(relative_path):
    """把相對於專案根目錄的路徑轉成絕對路徑。"""
    return os.path.join(PROJECT_ROOT, relative_path)


def load_train_config():
    """讀取訓練設定；找不到資料集時直接報錯，說明要先從 Roboflow 下載。"""
    with open(CONFIG_PATH, "r", encoding="utf-8") as file:
        config = yaml.safe_load(file)

    config["data_yaml"] = project_path(config["data_yaml"])
    config["project"] = project_path(config["project"])
    config["evaluate"]["predict_source"] = project_path(config["evaluate"]["predict_source"])

    if not os.path.exists(config["data_yaml"]):
        raise FileNotFoundError(
            f"[train_config_loader] 找不到資料集設定：{config['data_yaml']}\n"
            "請先從 Roboflow 下載 YOLOv8 格式並解壓到 data/dataset/（見 README）"
        )
    return config
