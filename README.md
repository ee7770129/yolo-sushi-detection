# YOLO 壽司種類辨識

影像辨識作業 Part 2（自行標註）。
Food-101 原本只有「sushi」一個類別，我們自己把壽司細分成 4 類重新標註，再訓練 YOLOv8 物件偵測模型。
應用情境：迴轉壽司自動結帳、盤數計算、出餐統計。

## 標註類別

| 類別 | 中文 | 怎麼標 |
|------|------|--------|
| salmon | 鮭魚 | 鮭魚握壽司、鮭魚生魚片（橘色、白色紋路） |
| tuna | 鮪魚 | 鮪魚握壽司、鮪魚生魚片（紅色） |
| shrimp | 蝦 | 蝦握壽司（紅白條紋），炸蝦不算 |
| roll | 卷壽司 | 切段的卷壽司，一段一個框 |

不標：玉子、鰻魚、白肉魚、鮭魚卵、軍艦、豆皮壽司、盤子、薑片、芥末；擋住一半以上或看不清楚的也不標。
每一貫壽司一個框，框要貼緊。全部人工標註，沒有使用 Auto-Label。

## 完整流程

```
1. 收集資料    Food-101 只下載 sushi 類 250 張（download_sushi.py）
      ↓
2. 挑圖        產生編號拼圖（make_contact_sheet.py），人工挑 100 張
               握壽司 69 張、卷壽司 31 張（configs/picked_images.yaml）
      ↓
3. 分包        分 4 包各 25 張，兩種圖平均分配（split_batches.py）
      ↓
4. 標註        上傳 Roboflow，4 位組員各標一包
      ↓
5. 產生資料集  訓練 70% / 驗證 20% / 測試 10%，縮放 640，翻轉與亮度增強
      ↓
6. 匯出        YOLOv8 格式
      ↓
7. 訓練        YOLOv8n，本機 GPU
      ↓
8. 評估        mAP、各類別準確率、混淆矩陣、預測示意圖
      ↓
9. 報告與展示
```

## 分工

| 組員 | 工作 |
|------|------|
| 1 號 | batch_1 標註、資料準備、訓練、結果整理、報告 |
| 2 號 | batch_2 標註 |
| 3 號 | batch_3 標註 |
| 4 號 | batch_4 標註 |

## 自己跑一次

### 1. 準備環境
```
pip install pyarrow pyyaml pillow ultralytics
```

### 2. 下載與分包（可略過，圖已在 Roboflow 上）
```
python download_sushi.py        # 下載 250 張到 data/food101_sushi
python make_contact_sheet.py    # 產生拼圖到 data/contact_sheets
python split_batches.py         # 依挑選清單分包到 data/to_label
```

### 3. 從 Roboflow 下載標註好的資料集
Roboflow 專案 sushi-type → Versions → Download Dataset → 格式選 YOLOv8 → 解壓到 `data/dataset/`

### 4. 訓練與評估
```
yolo detect train data=data/dataset/data.yaml model=yolov8n.pt epochs=50 imgsz=640
yolo detect val   model=runs/detect/train/weights/best.pt data=data/dataset/data.yaml
yolo detect predict model=runs/detect/train/weights/best.pt source=data/dataset/test/images
```
結果會在 `runs/detect/` 裡（results.png、confusion_matrix.png、預測圖）。

## 專案結構

```
├── download_sushi.py        # 只下載 Food-101 壽司類
├── make_contact_sheet.py    # 產生編號預覽拼圖
├── split_batches.py         # 分成 4 包標註包
├── configs/
│   ├── dataset_config.yaml  # 下載、拼圖、類別設定
│   └── picked_images.yaml   # 人工挑選清單
├── dataset/
│   └── http_range_file.py   # HTTP Range 分段讀檔
└── data/                    # 圖片與資料集（不放進 git，用程式重新產生）
```

## 資料來源
Food-101（Bossard et al., ECCV 2014），Hugging Face `ethz/food101`。圖片不放在此 repo。
