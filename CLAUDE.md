# YOLO 壽司辨識 - 系統說明

## 專案定位
影像辨識作業 Part 2（自行標註）。使用 Food-101 的壽司類圖片（原資料集只有 sushi 一個類別），
由 4 位組員自行標註更細的壽司種類，訓練 YOLOv8 物件偵測模型。
用途情境：迴轉壽司自動結帳與盤數計算、出餐統計、飲食紀錄。

## 標註類別
| 類別 | 中文 | 說明 |
|------|------|------|
| salmon | 鮭魚 | 鮭魚握壽司、鮭魚生魚片 |
| tuna | 鮪魚 | 鮪魚握壽司、鮪魚生魚片 |
| shrimp | 蝦 | 蝦握壽司（紅白條紋），炸蝦不算 |
| roll | 卷壽司 | 切段的卷壽司，一段一框 |

玉子原本在候選中，但樣本中太少（40 張約 2–3 張），2026-11-04 檢查後拿掉，改加 roll。

## 技術選擇
- 資料來源：Hugging Face `ethz/food101`（validation 分割，類別 95 = sushi），以 HTTP Range 只下載壽司段
- 標註平台：Roboflow 工作區 `nchudelivery`，專案 `sushi-type`（Object Detection，私人，類別已鎖定）
- 訓練：本機 conda env `traffic`（有 GPU），ultralytics YOLOv8
- 下載與挑圖工具用 base env（`C:/Users/54lan/anaconda3/python.exe`，有 pyarrow）

## 架構依賴圖
```
YOLO 壽司辨識/
├── CLAUDE.md
├── CHANGELOG.md
├── download_sushi.py        # 進入點：只下載 Food-101 壽司類
├── make_contact_sheet.py    # 進入點：產生編號預覽拼圖，供人工挑圖
├── split_batches.py         # 進入點：依挑選清單分成 4 包標註包
├── configs/
│   ├── dataset_config.yaml  # 下載、拼圖、類別設定
│   └── picked_images.yaml   # 人工挑選清單（握壽司 / 卷壽司 / 追加）
├── dataset/
│   └── http_range_file.py   # HTTP Range 分段讀檔
├── data/
│   ├── food101_sushi/       # 下載的 250 張原圖（sushi_000～249）
│   ├── contact_sheets/      # 預覽拼圖
│   └── to_label/            # batch_1～4（各 25 張）+ batches.csv
├── tests/
└── 計畫記錄區/
```

## 關鍵資料流
Food-101 parquet → download_sushi.py → data/food101_sushi → 人工看拼圖挑 100 張（picked_images.yaml）
→ split_batches.py → data/to_label/batch_1～4 → 上傳 Roboflow（批次名稱 batch_1～4）
→ 組員各標一包 → 匯出 YOLOv8 格式 → 本機訓練 → 報告

## 功能現狀
| 項目 | 狀態 |
|------|------|
| 下載 250 張壽司圖 | 完成 |
| 挑選 100 張（69 張握壽司、31 張卷壽司） | 完成 |
| Roboflow 專案與 4 個類別 | 完成 |
| 上傳 4 包各 25 張 | 完成 |
| 組員加入工作區、指派批次 | 待辦 |
| 標註 | 待辦 |
| 匯出與訓練 | 待辦 |

## 專案管理備註
- 作業要求自行標註：不可使用 Roboflow Auto-Label，Claude 只能示範不可代標
- 截止：2026-11-05（週四），時間待確認

## 變更日誌
詳見 [CHANGELOG.md](CHANGELOG.md)

---
**文檔版本**：v0.1.0
**建立日期**：2026-11-05
**最後更新**：2026-11-05（建立專案、完成挑圖與上傳）
