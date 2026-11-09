// 請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。
//
// 程式名稱：產生期末報告簡報（進入點）
// 功能說明：用 report/assets/ 的圖片與訓練成績，產生 report/壽司辨識_報告.pptx。
//           成績數字讀自 runs/detect/sushi_v1_metrics.csv，不寫死在程式裡。
// 用法：先 python report/make_assets.py，再 node report/build_pptx.js
//       （需要 npm 套件 pptxgenjs；可用 NODE_PATH 指到安裝位置）
// 建立日期：2026-11-08
// 版本號：v0.1.0

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const REPORT_DIR = __dirname;
const ROOT = path.dirname(REPORT_DIR);
const A = (name) => path.join(REPORT_DIR, "assets", name);
const OUTPUT = path.join(REPORT_DIR, "壽司辨識_報告.pptx");
const APPLY_THEME = process.env.PPTX_APPLY_THEME; // 技能附的 apply_theme.js 路徑（選用）

// ---------- 讀成績 ----------
function readMetrics(csvPath) {
  const lines = fs.readFileSync(csvPath, "utf-8").replace(/^﻿/, "").trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const out = {};
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    const row = Object.fromEntries(header.map((h, i) => [h, cells[i]]));
    out[`${row.split}/${row.class}`] = row;
  }
  return out;
}
const M = readMetrics(path.join(ROOT, "runs", "detect", "sushi_v1_metrics.csv"));
const M50 = readMetrics(path.join(ROOT, "runs", "detect_50ep", "sushi_v1_metrics.csv"));
const num = (m, key, field) => (m[key] ? Number(m[key][field]) : null);
const f2 = (v) => (v === null ? "—" : v.toFixed(2));

// 資料集統計（來自 Roboflow Dataset Analytics，2026-11-08）
const CLASS_COUNTS = { roll: 685, salmon: 119, tuna: 71, shrimp: 44 };
const TOTAL_BOXES = 919;
const SPLIT = { train: 70, valid: 20, test: 8 };

// ---------- 主題 ----------
const THEME = {
  name: "Sushi Nori",
  headFontFace: "Microsoft JhengHei",
  bodyFontFace: "Microsoft JhengHei",
  colors: {
    dk1: "1E2A2F", lt1: "FFFFFF", dk2: "3B4A50", lt2: "F1F3F4",
    accent1: "E8603C", accent2: "C0392B", accent3: "F2A65A",
    accent4: "3E8E7E", accent5: "7A8A91", accent6: "F7C548",
    hlink: "E8603C", folHlink: "C0392B",
  },
};
const HEX = THEME.colors;
const CLASS_COLOR = { roll: HEX.accent4, salmon: HEX.accent1, tuna: HEX.accent2, shrimp: HEX.accent3 };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 吋
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "迴轉壽司種類辨識";
const C = pres.SchemeColor;

// ---------- 版面配置 ----------
pres.defineSlideMaster({
  title: "DARK_TITLE",
  background: { color: HEX.dk1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 2.1, w: 6.6, h: 1.6,
      fontSize: 44, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 3.85, w: 6.6, h: 1.4,
      fontSize: 18, color: C.background2, valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: HEX.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.85,
      fontSize: 30, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: "迴轉壽司種類辨識｜YOLOv8", options: { x: 0.6, y: 7.0, w: 6, h: 0.3,
      fontSize: 10, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: HEX.accent5, align: "right" },
});

// ---------- 小工具 ----------
function contentSlide(title, section) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  return s;
}
function caption(s, text, x, y, w) {
  s.addText(text, { x, y, w, h: 0.35, fontSize: 11, color: C.accent5, margin: 0, isTextBox: true });
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12,
    fill: { color: fill || C.background2 }, line: { type: "none" } });
}
function numberBadge(s, n, x, y, color) {
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color }, line: { type: "none" } });
  s.addText(String(n), { x, y, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1,
    align: "center", valign: "middle", margin: 0, isTextBox: true });
}
function stat(s, value, label, x, y, w, color) {
  s.addText(value, { x, y, w, h: 0.9, fontSize: 44, bold: true, color, margin: 0, isTextBox: true });
  s.addText(label, { x, y: y + 0.9, w, h: 0.4, fontSize: 14, color: C.text2, margin: 0, isTextBox: true });
}

// ===== 1. 封面 =====
pres.addSection({ title: "開場" });
{
  const s = pres.addSlide({ masterName: "DARK_TITLE", sectionTitle: "開場" });
  s.addText("迴轉壽司種類辨識", { placeholder: "title" });
  s.addText("自己標註資料，訓練 YOLOv8 物件偵測\n影像辨識作業 Part 2", { placeholder: "body" });
  s.addImage({ path: A("pred_138.jpg"), x: 8.0, y: 1.0, w: 4.6, h: 4.6, objectName: "封面預測圖" });
  s.addText("模型實際預測結果", { x: 8.0, y: 5.7, w: 4.6, h: 0.35, fontSize: 12,
    color: C.background2, margin: 0, isTextBox: true });
}

// ===== 2. 題目與動機 =====
{
  const s = contentSlide("原本只有「sushi」一類，我們細分成 4 種", "開場");
  s.addText([
    { text: "Food-101 資料集", options: { bold: true, breakLine: true } },
    { text: "101 種食物，壽司只標成一個類別「sushi」，分不出盤上有哪些壽司。", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "我們做的事", options: { bold: true, breakLine: true } },
    { text: "下載壽司圖，自己在每一貫壽司上畫框，標成 roll / salmon / tuna / shrimp 四種，再訓練模型去找。" },
  ], { x: 0.6, y: 1.5, w: 5.6, h: 4.5, fontSize: 16, color: C.text1, valign: "top", margin: 0,
    paraSpaceAfter: 6, isTextBox: true });

  const apps = [
    ["迴轉台補貨提醒", "鏡頭看轉盤，哪一種壽司快沒了就提醒師傅補。"],
    ["熱門度統計", "統計每種壽司被拿走的數量，調整備料。"],
    ["飲食紀錄", "拍下吃過的盤子，自動記下吃了哪幾種。"],
  ];
  apps.forEach(([t, d], i) => {
    const y = 1.5 + i * 1.65;
    card(s, 6.8, y, 5.9, 1.4);
    numberBadge(s, i + 1, 7.05, y + 0.45, C.accent1);
    s.addText(t, { x: 7.8, y: y + 0.2, w: 4.7, h: 0.45, fontSize: 18, bold: true, color: C.text1, margin: 0, isTextBox: true });
    s.addText(d, { x: 7.8, y: y + 0.7, w: 4.7, h: 0.55, fontSize: 14, color: C.text2, margin: 0, isTextBox: true });
  });
  s.addText("可以用在哪", { x: 6.8, y: 1.05, w: 5.9, h: 0.4, fontSize: 14, bold: true, color: C.accent1, margin: 0, isTextBox: true });
}

// ===== 3. 標註類別 =====
pres.addSection({ title: "資料與標註" });
{
  const s = contentSlide("只標這 4 種壽司", "資料與標註");
  s.addImage({ path: A("class_reference.jpg"), x: 0.6, y: 1.45, w: 7.4, h: 3.78, objectName: "類別對照圖" });
  caption(s, "類別對照圖（上排：要標；下排：不標）", 0.6, 5.3, 7.4);
  const rows = [
    ["roll", "卷壽司", "切段的卷，一段一框；上面放魚的卷也算"],
    ["salmon", "鮭魚", "橘色、白色紋路"],
    ["tuna", "鮪魚", "紅色"],
    ["shrimp", "蝦", "紅白條紋；炸蝦不算"],
  ];
  rows.forEach(([en, zh, desc], i) => {
    const y = 1.45 + i * 0.95;
    s.addShape(pres.shapes.OVAL, { x: 8.4, y: y + 0.12, w: 0.32, h: 0.32, fill: { color: CLASS_COLOR[en] }, line: { type: "none" } });
    s.addText([{ text: `${en}  `, options: { bold: true } }, { text: zh }], { x: 8.9, y, w: 3.8, h: 0.4,
      fontSize: 17, color: C.text1, margin: 0, isTextBox: true });
    s.addText(desc, { x: 8.9, y: y + 0.4, w: 3.8, h: 0.4, fontSize: 13, color: C.text2, margin: 0, isTextBox: true });
  });
  card(s, 8.4, 5.35, 4.3, 1.1);
  s.addText([
    { text: "不標：", options: { bold: true } },
    { text: "玉子、白肉魚、淡粉紅魚、鰻魚、軍艦、章魚、薑片、芥末；被擋住一半以上或太模糊的也不標" },
  ], { x: 8.55, y: 5.45, w: 4.0, h: 0.9, fontSize: 13, color: C.text1, valign: "top", margin: 0, isTextBox: true });
}

// ===== 4. 流程 =====
{
  const s = contentSlide("整體流程：從下載到評估", "資料與標註");
  const steps = [
    ["下載", "Food-101 只抓壽司類 250 張"],
    ["挑圖", "看編號拼圖，人工挑 100 張"],
    ["分包", "分 4 包，每包 25 張"],
    ["標註", "Roboflow 手動畫框，不用 Auto-Label"],
    ["建資料集", "98 張，切 70 / 20 / 8，縮放 640"],
    ["匯出", "YOLOv8 格式 zip"],
    ["訓練", "YOLOv8n，150 輪，本機 GPU"],
    ["評估", "mAP、混淆矩陣、預測圖"],
  ];
  const colors = [C.accent4, C.accent4, C.accent4, C.accent1, C.accent1, C.accent1, C.accent2, C.accent2];
  steps.forEach(([t, d], i) => {
    const row = Math.floor(i / 4), col = i % 4;
    const x = 0.6 + col * 3.1, y = 1.7 + row * 2.3;
    card(s, x, y, 2.75, 1.8);
    numberBadge(s, i + 1, x + 0.2, y + 0.2, colors[i]);
    s.addText(t, { x: x + 0.85, y: y + 0.2, w: 1.8, h: 0.5, fontSize: 20, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(d, { x: x + 0.2, y: y + 0.85, w: 2.35, h: 0.85, fontSize: 14, color: C.text2, valign: "top", margin: 0, isTextBox: true });
    if (col < 3) {
      s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.8, y: y + 0.85, w: 0.25, h: 0.4, fill: { color: C.accent5 }, line: { type: "none" } });
    }
  });
  caption(s, "綠：資料準備　橘：Roboflow　紅：訓練與評估", 0.6, 6.15, 8);
}

// ===== 5. 挑圖 =====
{
  const s = contentSlide("從 250 張挑出 100 張可用的圖", "資料與標註");
  s.addImage({ path: A("contact_sheet.jpg"), x: 0.6, y: 1.4, w: 5.2, h: 5.2, objectName: "挑圖拼圖" });
  caption(s, "編號拼圖：一次看 25 張，記下要用的編號", 0.6, 6.62, 5.2);
  stat(s, "250", "下載的壽司圖", 6.6, 1.5, 2.9, C.accent5);
  stat(s, "100", "人工挑選", 9.7, 1.5, 2.9, C.accent1);
  stat(s, "98", "最後收入資料集", 6.6, 3.3, 2.9, C.accent4);
  stat(s, "69 / 31", "握壽司 / 卷壽司", 9.7, 3.3, 2.9, C.text1);
  card(s, 6.6, 5.1, 6.1, 1.2);
  s.addText([
    { text: "沒收的 2 張", options: { bold: true, breakLine: true } },
    { text: "sushi_225 只有玉子和淡色魚，沒有要標的類別；sushi_236 約 40 塊斜放重疊，框不準。" },
  ], { x: 6.8, y: 5.2, w: 5.7, h: 1.0, fontSize: 13, color: C.text1, valign: "top", margin: 0, isTextBox: true });
}

// ===== 6. Roboflow 標註 =====
{
  const s = contentSlide("在 Roboflow 一貫一貫手動畫框", "資料與標註");
  s.addImage({ path: A("shot_annotation.jpg"), x: 0.6, y: 1.4, w: 8.0, h: 4.7, objectName: "標註畫面截圖" });
  caption(s, "Roboflow 標註畫面：一盤上有卷壽司、鮭魚、鮪魚三種框", 0.6, 6.15, 8);
  const rules = [
    "一貫壽司一個框，框要貼緊",
    "只框看得到的部分",
    "超過一半看得到才標",
    "全部人工標，沒用 Auto-Label",
    "4 包各 25 張，每張平均 9.4 框",
  ];
  s.addText("標註規則", { x: 9.0, y: 1.4, w: 3.7, h: 0.45, fontSize: 18, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText(rules.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < rules.length - 1 } })),
    { x: 9.0, y: 1.95, w: 3.7, h: 3.6, fontSize: 15, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 10, isTextBox: true });
}

// ===== 7. 資料集統計 =====
{
  const s = contentSlide(`${TOTAL_BOXES} 個框，卷壽司佔了四分之三`, "資料與標註");
  const order = ["roll", "salmon", "tuna", "shrimp"];
  s.addChart(pres.charts.BAR, [{ name: "框數", labels: order, values: order.map((k) => CLASS_COUNTS[k]) }], {
    x: 0.6, y: 1.4, w: 7.2, h: 4.9, barDir: "bar",
    chartColors: order.map((k) => CLASS_COLOR[k]),
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: HEX.dk2, catAxisLabelFontSize: 14, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, showTitle: true, title: "各類別框數", titleFontSize: 14, titleColor: HEX.dk2, titleFontFace: "+mn-lt",
  });
  stat(s, "98", "張圖", 8.4, 1.5, 2.0, C.accent1);
  stat(s, "9.4", "框 / 張", 10.6, 1.5, 2.1, C.accent1);
  s.addText("切分", { x: 8.4, y: 3.25, w: 4.3, h: 0.4, fontSize: 16, bold: true, color: C.text1, margin: 0, isTextBox: true });
  [["訓練", SPLIT.train], ["驗證", SPLIT.valid], ["測試", SPLIT.test]].forEach(([t, n], i) => {
    const x = 8.4 + i * 1.47;
    card(s, x, 3.7, 1.3, 1.2);
    s.addText(String(n), { x, y: 3.75, w: 1.3, h: 0.65, fontSize: 28, bold: true, color: C.text1, align: "center", margin: 0, isTextBox: true });
    s.addText(t, { x, y: 4.4, w: 1.3, h: 0.4, fontSize: 13, color: C.text2, align: "center", margin: 0, isTextBox: true });
  });
  s.addText("隨機切分後，測試集沒有分到 tuna，所以成績會同時看驗證集。", { x: 8.4, y: 5.15, w: 4.3, h: 1.0,
    fontSize: 13, color: C.accent2, valign: "top", margin: 0, isTextBox: true });
}

// ===== 8. Roboflow 資料集截圖 =====
{
  const s = contentSlide("Roboflow 上的 98 張標註成果", "資料與標註");
  s.addImage({ path: A("shot_dataset_grid.jpg"), x: 0.6, y: 1.35, w: 12.1, h: 4.94, objectName: "資料集縮圖截圖" });
  caption(s, "Dataset 頁面（開啟 Show Annotations）：每張圖上的彩色框就是我們畫的標註", 0.6, 6.4, 12.1);
}

// ===== 9. 訓練設定 =====
pres.addSection({ title: "訓練與結果" });
{
  const s = contentSlide("訓練設定", "訓練與結果");
  const rows = [
    ["模型", "YOLOv8n（官方預訓練權重，約 300 萬參數）"],
    ["圖片大小", "640 × 640"],
    ["訓練輪數", "150 輪（50 輪時還在進步，所以加長）"],
    ["Batch", "16"],
    ["資料擴增", "翻轉、亮度、飽和度、馬賽克拼圖，訓練時即時做"],
    ["硬體", "本機 RTX 4070，150 輪約 1.6 分鐘"],
  ];
  s.addTable(rows.map(([k, v]) => [
    { text: k, options: { bold: true, color: HEX.dk1, fill: { color: HEX.lt2 } } },
    { text: v, options: { color: HEX.dk2 } },
  ]), { x: 0.6, y: 1.5, w: 6.9, colW: [1.6, 5.3], fontSize: 14, rowH: 0.62, valign: "middle",
    border: { type: "solid", pt: 1, color: "D9DEE0" } });
  s.addImage({ path: A("train_batch.jpg"), x: 7.9, y: 1.4, w: 4.8, h: 4.8, objectName: "訓練批次圖" });
  caption(s, "訓練時自動擴增後的圖，框是我們的標註", 7.9, 6.25, 4.8);
}

// ===== 10. 訓練過程 =====
{
  const s = contentSlide("訓練過程：多訓練 100 輪幾乎沒有變好", "訓練與結果");
  s.addImage({ path: A("results.png"), x: 0.6, y: 1.4, w: 8.2, h: 4.1, objectName: "訓練曲線" });
  caption(s, "150 輪訓練曲線：上排訓練損失與指標，下排驗證損失與 mAP", 0.6, 5.55, 8.2);
  const cmp = [
    ["", "50 輪", "150 輪"],
    ["驗證 mAP50", f2(num(M50, "val/all", "mAP50")), f2(num(M, "val/all", "mAP50"))],
    ["測試 mAP50", f2(num(M50, "test/all", "mAP50")), f2(num(M, "test/all", "mAP50"))],
    ["驗證 mAP50-95", f2(num(M50, "val/all", "mAP50-95")), f2(num(M, "val/all", "mAP50-95"))],
    ["測試 mAP50-95", f2(num(M50, "test/all", "mAP50-95")), f2(num(M, "test/all", "mAP50-95"))],
  ];
  s.addTable(cmp.map((r, i) => r.map((t, j) => ({ text: t, options: {
    bold: i === 0 || j === 0, color: HEX.dk1, align: j === 0 ? "left" : "center",
    fill: { color: i === 0 ? HEX.lt2 : HEX.lt1 } } }))),
    { x: 9.1, y: 1.5, w: 3.6, colW: [1.6, 1.0, 1.0], fontSize: 13, rowH: 0.5, valign: "middle",
      border: { type: "solid", pt: 1, color: "D9DEE0" } });
  s.addText("兩次成績差不多，代表瓶頸是資料量，不是訓練次數。", { x: 9.1, y: 4.25, w: 3.6, h: 1.2,
    fontSize: 14, bold: true, color: C.accent1, valign: "top", margin: 0, isTextBox: true });
}

// ===== 11. 各類別成績 =====
{
  const s = contentSlide("卷壽司最準，蝦最難", "訓練與結果");
  const order = ["roll", "salmon", "tuna", "shrimp"];
  s.addChart(pres.charts.BAR, [
    { name: "mAP50", labels: order, values: order.map((k) => num(M, `val/${k}`, "mAP50")) },
    { name: "mAP50-95", labels: order, values: order.map((k) => num(M, `val/${k}`, "mAP50-95")) },
  ], {
    x: 0.6, y: 1.4, w: 7.6, h: 5.0, barDir: "col", barGapWidthPct: 60,
    chartColors: [HEX.accent1, HEX.accent5],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 12, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelColor: HEX.dk2, catAxisLabelFontSize: 14, catAxisLabelFontFace: "+mn-lt",
    valAxisMinVal: 0, valAxisMaxVal: 1, valAxisLabelColor: HEX.dk2, valAxisLabelFontFace: "+mn-lt", valAxisLabelFormatCode: "0.0",
    valGridLine: { color: "E3E7E8", size: 0.75 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 12, legendColor: HEX.dk2, legendFontFace: "+mn-lt",
    showTitle: true, title: "驗證集各類別成績", titleFontSize: 14, titleColor: HEX.dk2, titleFontFace: "+mn-lt",
  });
  stat(s, f2(num(M, "val/all", "mAP50")), "整體 mAP50（驗證集）", 8.7, 1.5, 4.0, C.accent1);
  stat(s, f2(num(M, "test/all", "mAP50")), "整體 mAP50（測試集，無 tuna）", 8.7, 3.0, 4.0, C.text1);
  s.addText([
    { text: "mAP50：", options: { bold: true } },
    { text: "框和正確答案重疊一半以上就算對，平均每類的準確度。mAP50-95 的標準更嚴格。" },
  ], { x: 8.7, y: 4.65, w: 4.0, h: 1.5, fontSize: 13, color: C.text2, valign: "top", margin: 0, isTextBox: true });
}

// ===== 12. 混淆矩陣 =====
{
  const s = contentSlide("混淆矩陣：蝦常被漏掉，鮭魚會和蝦、鮪魚搞混", "訓練與結果");
  s.addImage({ path: A("confusion_matrix.png"), x: 0.6, y: 1.35, w: 6.9, h: 5.18, objectName: "混淆矩陣" });
  const notes = [
    ["對角線 = 答對比例", "tuna 0.80、roll 0.77 最好；salmon、shrimp 較差"],
    ["蝦被當成背景 0.57", "蝦只有 44 個框，模型沒學夠，常常直接漏掉"],
    ["鮭魚的混淆", "0.15 被當成蝦、0.15 被當成鮪魚：顏色都是橘紅色"],
    ["背景誤報多半是 roll", "盤子邊緣、拼盤空隙會被誤認成卷壽司"],
  ];
  notes.forEach(([t, d], i) => {
    const y = 1.45 + i * 1.28;
    card(s, 7.9, y, 4.8, 1.1);
    s.addText(t, { x: 8.1, y: y + 0.1, w: 4.4, h: 0.4, fontSize: 15, bold: true, color: C.text1, margin: 0, isTextBox: true });
    s.addText(d, { x: 8.1, y: y + 0.5, w: 4.4, h: 0.55, fontSize: 12, color: C.text2, margin: 0, isTextBox: true });
  });
}

// ===== 13. 預測示意 =====
{
  const s = contentSlide("模型在測試圖上的表現", "訓練與結果");
  const preds = [
    ["pred_000.jpg", "答對：12 塊卷壽司全部找到", C.accent4],
    ["pred_138.jpg", "部分錯：蝦、卷都對，但兩片鮭魚被當成鮪魚", C.accent3],
    ["pred_244.jpg", "誤報：盤邊的紅蘿蔔絲被當成鮭魚和蝦", C.accent2],
  ];
  preds.forEach(([img, text, color], i) => {
    const x = 0.6 + i * 4.1;
    s.addImage({ path: A(img), x, y: 1.4, w: 3.85, h: 3.85, objectName: `預測圖${i + 1}` });
    s.addShape(pres.shapes.OVAL, { x, y: 5.45, w: 0.28, h: 0.28, fill: { color }, line: { type: "none" } });
    s.addText(text, { x: x + 0.4, y: 5.35, w: 3.45, h: 0.9, fontSize: 14, color: C.text1, valign: "top", margin: 0, isTextBox: true });
  });
}

// ===== 14. 限制 =====
pres.addSection({ title: "結論" });
{
  const s = contentSlide("限制與可以改進的地方", "結論");
  const items = [
    ["資料量少", "只有 98 張圖，訓練 50 輪和 150 輪成績差不多", "多收集圖片，尤其是蝦和鮪魚"],
    ["類別不平衡", "roll 685 框，shrimp 只有 44 框", "針對少的類別補圖，或調整類別權重"],
    ["顏色相近", "鮭魚、鮪魚、蝦都是橘紅色系", "標註時加註釋規則、多放對照範例"],
    ["切分不均", "測試集只有 8 張，而且沒有 tuna", "用分層切分，讓每類都分到測試集"],
  ];
  items.forEach(([t, problem, fix], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.45 + row * 2.6;
    card(s, x, y, 5.95, 2.35);
    numberBadge(s, i + 1, x + 0.25, y + 0.25, C.accent1);
    s.addText(t, { x: x + 0.95, y: y + 0.25, w: 4.8, h: 0.5, fontSize: 19, bold: true, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(problem, { x: x + 0.3, y: y + 0.95, w: 5.4, h: 0.5, fontSize: 14, color: C.text2, margin: 0, isTextBox: true });
    s.addText([{ text: "改進：", options: { bold: true, color: C.accent4 } }, { text: fix, options: { color: C.text1 } }],
      { x: 0.3 + x, y: y + 1.5, w: 5.4, h: 0.6, fontSize: 14, margin: 0, isTextBox: true });
  });
}

// ===== 15. 結論 =====
{
  const s = pres.addSlide({ masterName: "DARK_TITLE", sectionTitle: "結論" });
  s.addText("結論", { placeholder: "title" });
  s.addText([
    { text: "用自己標的 98 張圖，模型已經能分出 4 種壽司；卷壽司最準，蝦最需要更多資料。", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "下一步：補蝦和鮪魚的圖、用分層切分，再重新訓練。" },
  ], { placeholder: "body" });
  const pts = [
    [f2(num(M, "val/all", "mAP50")), "驗證集 mAP50"],
    [f2(num(M, `val/roll`, "mAP50")), "卷壽司 mAP50"],
    [String(TOTAL_BOXES), "親手畫的框"],
  ];
  pts.forEach(([v, l], i) => {
    const y = 1.3 + i * 1.65;
    s.addText(v, { x: 8.3, y, w: 4.4, h: 0.95, fontSize: 48, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(l, { x: 8.3, y: y + 0.95, w: 4.4, h: 0.4, fontSize: 16, color: C.background2, margin: 0, isTextBox: true });
  });
}

(async () => {
  await pres.writeFile({ fileName: OUTPUT });
  if (APPLY_THEME) {
    const { applyTheme } = require(APPLY_THEME);
    await applyTheme(OUTPUT, THEME);
  }
  console.log(`[build_pptx] 完成：${OUTPUT}`);
})();
