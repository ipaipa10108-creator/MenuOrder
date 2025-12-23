# Plan.md

## Phase 1: Backend (Google Apps Script)
1. 提供 `Code.gs` 原始碼。
2. 使用者操作指引：
   - 開啟 Google Sheet -> Extensions -> Apps Script。
   - 貼上程式碼。
   - 部署為 Web App (權限: Anyone)。
   - 取得 `WEB_APP_URL`。

## Phase 2: Frontend (HTML/JS)
1. 建立 `index.html`。
2. 實作 API Client (包裝 fetch)。
3. 實作 UI 邏輯：
   - 狀態管理 (State Management)。
   - Gemini 圖片解析 (前端 JS SDK)。
   - 渲染菜單與訂單。
4. 美化樣式 (CSS)。

## Phase 3: Setup & Verification
1. 使用者建立 GitHub Repository。
2. 上傳 `index.html`。
3.開啟 GitHub Pages。
4. 進入網頁，在設定介面填入 `WEB_APP_URL` (儲存在 LocalStorage)。
5. 驗證流程。
