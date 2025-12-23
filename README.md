# 下午茶神隊友 (Smart Tea Order)

這是一個基於 **Google Sheets + Apps Script** 的無伺服器點餐系統。
前端採用純靜態 **HTML/JS**，可直接部署於 GitHub Pages。

## 功能特色
- ☁️ **雲端同步**: 資料即時儲存於 Google Sheets。
- 🤖 **AI 辨識**: 整合 Google Gemini，拍照上傳菜單自動解析。
- ⚡ **Severless**: 無需架設伺服器，完全免費。
- 📱 **RWD**: 支援手機與電腦版面，Glassmorphism 玻璃擬態設計。

## 快速安裝

### 1. 後端 (Google Sheets)
1. 建立 Google Sheet。
2. Extensions > Apps Script。
3. 複製 `Code.gs` 内容貼上。
4. Deploy > Web App > Access: **Anyone**。
5. 複製 URL。

### 2. 前端 (Web)
1. 下載 `index.html`。
2. 丟上 GitHub Pages 或直接打開。
3. 填入 Web App URL 即可使用。

詳情請參考 [Walkthrough](walkthrough.md)。
