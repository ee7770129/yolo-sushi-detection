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
├── README.md                # 給組員看的流程與重跑步驟
├── .gitignore               # data/、runs/ 不進 git
├── download_sushi.py        # 進入點：只下載 Food-101 壽司類
├── make_contact_sheet.py    # 進入點：產生編號預覽拼圖，供人工挑圖
├── split_batches.py         # 進入點：依挑選清單分成 4 包標註包
├── train.py                 # 進入點：訓練 YOLOv8n
├── evaluate.py              # 進入點：驗證集＋測試集評估、成績 CSV、預測示意圖
├── train_config_loader.py   # 共用：讀 train_config.yaml、轉絕對路徑
├── configs/
│   ├── dataset_config.yaml  # 下載、拼圖、類別設定
│   ├── picked_images.yaml   # 人工挑選清單（握壽司 / 卷壽司 / 追加）
│   └── train_config.yaml    # 訓練與評估參數（epochs、imgsz、擴增、輸出位置）
├── report/
│   ├── make_assets.py       # 進入點：裁截圖、複製訓練圖到 assets/
│   ├── build_pptx.js        # 進入點：產生簡報（需 pptxgenjs，成績讀 runs/detect/*_metrics.csv）
│   ├── 壽司辨識_報告.pptx    # 期末報告簡報
│   ├── assets/              # 簡報用圖片（由 make_assets.py 產生）
│   └── screenshots/         # 報告用 Roboflow 截圖（01～06）
├── dataset/
│   └── http_range_file.py   # HTTP Range 分段讀檔
├── data/
│   ├── food101_sushi/       # 下載的 250 張原圖（sushi_000～249）
│   ├── contact_sheets/      # 預覽拼圖
│   ├── to_label/            # batch_1～4（各 25 張）+ batches.csv
│   └── dataset/             # Roboflow v1 匯出（YOLOv8）：train 70 / valid 20 / test 8
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
| 標註 | 全部完成（2026-11-08，batch_1～4 皆由 1 號完成，未用 Auto-Label）。98 張、919 框：roll 685、salmon 119、tuna 71、shrimp 44。sushi_225（無目標類別）、sushi_236（太密）不收 |
| 資料集版本 | v1 完成（2026-11-08）：70/20/8 張、Stretch 640、Roboflow 不加擴增（改由 YOLO 訓練時翻轉、亮度） |
| 訓練與評估 | 完成（2026-11-08）150 輪：驗證 mAP50 0.72 / 測試 0.72（測試集無 tuna）。50 輪版本在 runs/detect_50ep/ |
| 報告 | 完成（2026-11-08）report/壽司辨識_報告.pptx，15 頁；make_assets.py → build_pptx.js 重產 |

## 專案管理備註
- 作業要求自行標註：不可使用 Roboflow Auto-Label（使用者 2026-11-06 同意由 Claude 代標）
- 2026-11-08 分工再調整：因組員進度慢，batch_2～4 也由 1 號完成；組員之後另開練習專案依 README 重跑
- Roboflow 下載 zip 會先存成 .tmp（需使用者在 Chrome 允許下載），內容即 zip
- 截止：2026-11-05（週四），時間待確認
- 分工（2026-11-06 調整）：組員各標一包；訓練、結果、報告由 1 號（使用者）完成，再給組員流程（README）自行重跑
- Git：main + develop，日常 commit 在 develop

## 變更日誌
詳見 [CHANGELOG.md](CHANGELOG.md)

---
**文檔版本**：v0.2.0
**建立日期**：2026-11-05
**最後更新**：2026-11-08（標註全部完成、資料集 v1、新增 train.py / evaluate.py）
