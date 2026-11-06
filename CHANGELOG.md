# CHANGELOG

## [0.1.1] - 2026-11-06
### 新增
- README.md：類別說明、完整流程圖、分工、自己重跑的步驟
- .gitignore：data/、runs/、權重檔不進 git
- 建立 git（main、develop 分支），準備推到 GitHub
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
