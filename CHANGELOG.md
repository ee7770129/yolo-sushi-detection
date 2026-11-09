# CHANGELOG

## [0.2.0] - 2026-11-08
### 新增
- batch_2～4 標註完成（皆人工框，未用 Auto-Label）；全資料 98 張、919 框（roll 685、salmon 119、tuna 71、shrimp 44）
- Roboflow 資料集版本 v1：train 70 / valid 20 / test 8，Stretch 640，未加擴增；匯出 YOLOv8 到 data/dataset/
- configs/train_config.yaml、train_config_loader.py、train.py、evaluate.py
- report/screenshots/：Roboflow 截圖 6 張（版本、切分、看板、類別數、資料集、標註畫面）
- README：Roboflow 操作流程文字流程圖、訓練與評估指令
### 變更
- 分工：batch_2～4 改由 1 號完成，組員改為依 README 自行重跑練習
- .gitignore 加入 `*.log`、Office 開檔暫存 `~$*`（2026-11-09）
- 擴增改由 YOLO 訓練時進行（fliplr、hsv），不用 Roboflow 額度
- 訓練結果（150 輪，YOLOv8n，RTX 4070 約 1.6 分鐘）：驗證 mAP50 0.72、mAP50-95 0.48；測試 mAP50 0.72（無 tuna）。各類驗證 mAP50：roll 0.86、tuna 0.80、salmon 0.68、shrimp 0.51
- 50 輪版本保留在 runs/detect_50ep/ 做比較：驗證 mAP50 0.77、測試 0.65，與 150 輪相近（瓶頸在資料量）
- report/make_assets.py（整理報告圖片）、report/build_pptx.js（產生簡報）、report/壽司辨識_報告.pptx（15 頁）
### 已知限制
- sushi_225（只有玉子與淡色魚）、sushi_236（約 40 塊斜放重疊）不收入資料集
- 測試集隨機切分後沒有 tuna，評估同時報告驗證集

## [0.1.1] - 2026-11-06
### 新增
- README.md：類別說明、完整流程圖、分工、自己重跑的步驟
- .gitignore：data/、runs/、權重檔不進 git
- 建立 git（main、develop 分支），推到 GitHub（ee7770129/yolo-sushi-detection）
- batch_1 標註完成：25 張、212 框（roll 155、salmon 20、tuna 19、shrimp 18），未使用 Auto-Label
- 類別對照圖 data/reference/class_reference.jpg（不進 git）
### 變更
- 分工調整：組員各標一包；訓練、結果整理、報告由 1 號完成，再提供流程給組員自行重跑

## [0.1.0] - 2026-11-05
### 新增
- 建立專案資料夾與設定檔（dataset_config.yaml、picked_images.yaml）
- download_sushi.py：以 HTTP Range 只下載 Food-101 壽司類，共 250 張
- make_contact_sheet.py：產生編號預覽拼圖
- split_batches.py：依挑選清單分成 4 包，握壽司與卷壽司輪流分配
- 人工挑選 100 張（先 80 張，同日追加 20 張改為每人 25 張；追加清單排在後面，不影響已分配的圖）
- Roboflow 專案 sushi-type：類別 salmon、tuna、shrimp、roll（已鎖定），上傳 batch_1～4 各 25 張
