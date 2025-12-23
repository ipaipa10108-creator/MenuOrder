# Constitution.md

## 1. 技術堆疊 (Tech Stack)
- **Frontend**:
    - **Host**: GitHub Pages (Static HTML/JS)
    - **Language**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
    - **Framework**: 無 (使用 Vanilla JS 或輕量級 Alpine.js/Vue CDN，視複雜度而定，目前採用 Vanilla JS 以保持單檔部屬容易)
    - **Design**: Modern Dark Theme, Glassmorphism (CSS Variables)
- **Backend (Serverless)**:
    - **Google Apps Script (GAS)**: 部署為 Web App，負責處理 GET/POST 請求並操作 Sheets。
- **Database**:
    - **Google Sheets**: 儲存 Events 與 Orders。
- **AI**:
    - **Google Gemini API**: 前端直接呼叫 (需使用者輸入 Key) 或 後端 GAS 呼叫 (較安全，但前端呼叫較簡單不需設定 GAS Property)。
    - *決策*: 為了簡化 GAS 部署，採用 **前端呼叫 Gemini API** (使用者在 UI 輸入 Key 或透過網址參數帶入)，或者由主揪輸入。

## 2. 開發原則
- **Serverless & No-Ops**: 不依賴 GCP Console 設定，僅使用 Google Drive/Sheets 生態系。
- **單檔交付 (Single File Delivery)**: 前端盡量整合為一個 `index.html` (含 CSS/JS)，方便使用者直接丟上 GitHub Pages 或本地開啟。
- **API 通訊**:
    - 前端透過 `fetch()` POST JSON 到 GAS Web App URL。
    - 解決 CORS 問題：GAS 回傳 `ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON)`。
- **安全性**:
    - 由於是公開網頁，GAS Web App 權限需設為 "Execute as Me" 且 "Access: Anyone"。
    - 不要在前端暴露敏感邏輯，但此專案為內部點餐，風險可控。
