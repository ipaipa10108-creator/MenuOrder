# Spec.md

## 架構說明
1. **Google Sheet**: 包含 `Events`, `Orders` 分頁，以及一個綁定的 `Apps Script` 專案。
2. **Web App**: 靜態網頁，透過 AJAX (fetch) 呼叫 Apps Script URL。

## 1. Google Sheets 資料模型

### Sheet: Events
| event_id (A) | event_name (B) | created_at (C) | menu_json (D) | status (E) |
| --- | --- | --- | --- | --- |
| uuid | 12/23 下午茶 | ISOString | JSON String | Active/Closed |

### Sheet: Orders
| order_id (A) | event_id (B) | buyer_name (C) | item_name (D) | price (E) | notes (F) | timestamp (G) |
| --- | --- | --- | --- | --- | --- | --- |
| uuid | uuid | Amy | 珍珠奶茶 | 50 | 微糖 | ISOString |

## 2. Google Apps Script API 規格

### 請求格式 (Requests)
採用單一進入點 `doPost(e)`，透過 `action` 參數區分功能。
Payload 為 JSON 字串。

#### A. 取得當前活動 (GetActiveEvent)
- **Action**: `get_active_event`
- **Response**: `{ status: "success", data: { event: {...}, menu: [...] } }`

#### B. 建立新活動 (CreateEvent)
- **Action**: `create_event`
- **Params**: `event_name`, `menu_json`
- **Response**: `{ status: "success", event_id: "..." }`

#### C. 新增訂單 (AddOrder)
- **Action**: `add_order`
- **Params**: `event_id`, `buyer_name`, `item_name`, `price`, `notes`
- **Response**: `{ status: "success", order_id: "..." }`

#### D. 取得訂單列表 (GetOrders)
- **Action**: `get_orders`
- **Params**: `event_id` (optional, default active)
- **Response**: `{ status: "success", orders: [...] }`

#### E. 結單 (CloseEvent)
- **Action**: `close_event`
- **Params**: `event_id`
- **Response**: `{ status: "success" }`

## 3. 前端 UI 規格 (index.html)

### App State
- `viewMode`: 'loading' | 'user' | 'admin'
- `currentEvent`: Object | null
- `cart`: { item, price, notes, buyer }

### 主要視圖
1. **Loading Overlay**: 檢查 API 連線與活動狀態。
2. **Admin View**:
   - Gemini API Key 輸入欄。
   - 圖片上傳區域 (與 Gemini API 互動)。
   - 菜單預覽表格 (Editable)。
   - "發布活動" 按鈕。
3. **User View**:
   - 頂部: 活動名稱、狀態。
   - 中間: 菜單卡片網格 (Grid Layout)。
   - 底部: 浮動購物車 / 下單區。
   - 側邊/下方: 訂單即時列表 (每 10秒 Polling 更新)。

### UI 風格
- 背景: 深色漸層 (Dark Mode)。
- 卡片: 半透明玻璃擬態 (Backdrop filter blur)。
- 互動: 按鈕 Hover 發光效果。
