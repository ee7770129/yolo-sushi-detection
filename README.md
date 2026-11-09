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
4. 標註        上傳 Roboflow，4 包各 25 張，全部人工框（不用 Auto-Label）
      ↓
5. 產生資料集  （Roboflow 網頁操作，見下方「Roboflow 操作流程」）
               訓練 70% / 驗證 20% / 測試 10%，縮放 640
      ↓
6. 匯出        YOLOv8 格式 zip，解壓到 data/dataset/
      ↓
7. 訓練        YOLOv8n，本機 GPU
      ↓
8. 評估        mAP、各類別準確率、混淆矩陣、預測示意圖
      ↓
9. 報告與展示
```

### Roboflow 操作流程

```
專案 sushi-type → Annotate
      ↓
點某一包（batch_1～4）→ 選「Label Manually」（不要選 Auto-Label）
      ↓
進入標註畫面，每張圖：
   按 B 選方框工具 → 拖曳框住一貫壽司 → 選類別（roll / salmon / shrimp / tuna）
   → 這張框完按右上「>」換下一張
      ↓
25 張標完 → 回 Annotate，點該包 → Annotated 分頁 → 「Add N Images To Dataset」
   分配方式：Split Images Between Train/Valid/Test，比例 70 / 20 / 10
      ↓
4 包都加完，Dataset 共 98 張（2 張不收：sushi_225 沒有目標類別、
   sushi_236 疊太密框不準）
      ↓
Versions → Create New Version
   Preprocessing：Auto-Orient、Resize 改成 Stretch to 640×640
   Augmentation：不加（翻轉、亮度變化交給 YOLO 訓練時自動做，不花 Roboflow 額度）
   → Create，得到版本 v1
      ↓
v1 → Download Dataset → 格式選 YOLOv8 → Download zip to computer
      ↓
解壓到專案的 data/dataset/（裡面有 data.yaml、train/、valid/、test/）
```

## 分工

| 組員 | 工作 |
|------|------|
| 1 號 | batch_1～4 標註、資料準備、訓練、結果整理、報告（因時間關係先全部完成） |
| 2～4 號 | 依本 README 自行重跑一次流程練習（另開練習專案，不影響正式資料） |

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
python train.py      # 訓練，參數在 configs/train_config.yaml
python evaluate.py   # 驗證集＋測試集成績、預測示意圖
```
結果會在 `runs/detect/` 裡：
- `sushi_v1/`：權重（weights/best.pt）、訓練曲線 results.png、混淆矩陣、標註拼貼圖
- `sushi_v1_val/`、`sushi_v1_test/`：各切分的評估圖
- `sushi_v1_metrics.csv`：每個類別的 precision / recall / mAP
- `sushi_v1_predict/`：測試圖的預測結果

## 專案結構

```
├── download_sushi.py        # 只下載 Food-101 壽司類
├── make_contact_sheet.py    # 產生編號預覽拼圖
├── split_batches.py         # 分成 4 包標註包
├── train.py                 # 訓練 YOLOv8n
├── evaluate.py              # 評估＋預測示意圖
├── train_config_loader.py   # 讀訓練設定（共用）
├── configs/
│   ├── dataset_config.yaml  # 下載、拼圖、類別設定
│   ├── picked_images.yaml   # 人工挑選清單
│   └── train_config.yaml    # 訓練與評估參數
├── report/
│   ├── 壽司辨識_報告.pptx    # 期末報告簡報
│   ├── make_assets.py       # 整理簡報用圖片
│   ├── build_pptx.js        # 產生簡報（npm install pptxgenjs）
│   └── screenshots/         # Roboflow 截圖
├── dataset/
│   └── http_range_file.py   # HTTP Range 分段讀檔
└── data/                    # 圖片與資料集（不放進 git，用程式重新產生）
```

## 資料來源
Food-101（Bossard et al., ECCV 2014），Hugging Face `ethz/food101`。圖片不放在此 repo。
