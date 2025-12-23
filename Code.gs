/**
 * Smart Tea Order - Backend API (Google Apps Script)
 * 
 * 部署說明:
 * 1. 貼上此程式碼到 Script Editor
 * 2. 點擊 Deploy > New deployment
 * 3. Select type: Web app
 * 4. Description: API v1
 * 5. Execute as: Me (您的帳號)
 * 6. Who has access: Anyone (任何擁有連結的人) - *重要*
 * 7. 複製 Web App URL
 */

// --- 設定 ---
const SHEET_EVENTS = "Events";
const SHEET_ORDERS = "Orders";

/**
 * 處理 POST 請求
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // 避免並發寫入衝突

  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    let result = {};

    switch (action) {
      case "get_active_event":
        result = getActiveEvent();
        break;
      case "create_event":
        result = createEvent(params);
        break;
      case "add_order":
        result = addOrder(params);
        break;
      case "get_orders":
        result = getOrders(params.event_id);
        break;
      case "get_history":
        result = getHistory();
        break;
      case "close_event":
        result = closeEvent(params.event_id);
        break;
      default:
        throw new Error("Unknown action: " + action);
    }

    return createJSONOutput({ status: "success", ...result });

  } catch (err) {
    return createJSONOutput({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * 處理 cors 與 JSON 輸出
 */
function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- 核心邏輯 ---

/**
 * 取得當前活動
 */
function getActiveEvent() {
  const sheet = getSheet(SHEET_EVENTS);
  const data = sheet.getDataRange().getValues();
  // 假設第一列是標題，從第二列開始
  // 尋找最後一個 status = 'Active'
  
  // Header: event_id, event_name, created_at, menu_json, status
  let activeEvent = null;
  let menuData = [];

  // 從後面往前找
  for (let i = data.length - 1; i >= 1; i--) {
    const row = data[i];
    if (row[4] === "Active") {
      activeEvent = {
        event_id: row[0],
        event_name: row[1],
        created_at: row[2],
        // menu_json 不回傳給前端大物件，除非需要? 這裡規格說要回傳
        // menu_json: row[3], 
        status: row[4]
      };
      try {
        menuData = JSON.parse(row[3]);
      } catch (e) {
        menuData = [];
      }
      break;
    }
  }

  return { event: activeEvent, menu: menuData };
}

/**
 * 建立新活動
 */
function createEvent(params) {
  const sheet = getSheet(SHEET_EVENTS);
  const eventId = Utilities.getUuid();
  const createdAt = new Date().toISOString();
  
  // event_id, event_name, created_at, menu_json, status
  sheet.appendRow([
    eventId,
    params.event_name,
    createdAt,
    params.menu_json,
    "Active"
  ]);

  return { event_id: eventId };
}

/**
 * 新增訂單
 */
function addOrder(params) {
  const sheet = getSheet(SHEET_ORDERS);
  const orderId = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  
  // order_id, event_id, buyer_name, item_name, price, notes, timestamp
  sheet.appendRow([
    orderId,
    params.event_id,
    params.buyer_name,
    params.item_name,
    params.price,
    params.notes,
    timestamp
  ]);
  
  return { order_id: orderId };
}

/**
 * 取得訂單列表
 */
function getOrders(eventId) {
  if (!eventId) {
    const active = getActiveEvent();
    if (active.event) eventId = active.event.event_id;
    else return { orders: [] };
  }

  const sheet = getSheet(SHEET_ORDERS);
  const data = sheet.getDataRange().getValues();
  // Header: order_id, event_id, buyer_name, item_name, price, notes, timestamp
  
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // 轉字串比對比較保險
    if (String(row[1]) === String(eventId)) {
      orders.push({
        order_id: row[0],
        // event_id: row[1],
        buyer_name: row[2],
        item_name: row[3],
        price: row[4],
        notes: row[5],
        timestamp: row[6]
      });
    }
  }
  
  return { orders: orders };
}

/**
 * 結單
 */
function closeEvent(eventId) {
  const sheet = getSheet(SHEET_EVENTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(eventId)) {
      // Status is col index 4 (E)
      // Range indexes are 1-based. Row is i+1, Col is 5
      sheet.getRange(i + 1, 5).setValue("Closed");
      return { success: true };
    }
  }
  return { success: false, message: "Event not found" };
}

/**
 * 取得歷史統計
 */
function getHistory() {
    const sheetEvents = getSheet(SHEET_EVENTS);
    const eventsData = sheetEvents.getDataRange().getValues();
    
    const sheetOrders = getSheet(SHEET_ORDERS);
    const ordersData = sheetOrders.getDataRange().getValues();
    
    // 建立 events map
    // { event_id: { name, date, total, count, status } }
    let stats = {};
    
    // 1. Process Events (skip header)
    for(let i=1; i<eventsData.length; i++){
        let row = eventsData[i];
        let eid = String(row[0]); // event_id
        stats[eid] = {
            event_name: row[1],
            created_at: row[2],
            status: row[4],
            total_amount: 0,
            order_count: 0
        };
    }
    
    // 2. Process Orders (calculate sum)
    for(let i=1; i<ordersData.length; i++){
        let row = ordersData[i];
        let eid = String(row[1]); // event_id
        let price = Number(row[4]) || 0;
        
        if(stats[eid]){
            stats[eid].total_amount += price;
            stats[eid].order_count += 1;
        }
    }
    
    // 3. Convert to Array and Sort
    let result = Object.values(stats).sort((a,b) => {
        return new Date(b.created_at) - new Date(a.created_at); // Descending
    });
    
    return { history: result };
}

// --- Helper ---
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Init Header
    if (name === SHEET_EVENTS) {
        sheet.appendRow(["event_id", "event_name", "created_at", "menu_json", "status"]);
    } else if (name === SHEET_ORDERS) {
        sheet.appendRow(["order_id", "event_id", "buyer_name", "item_name", "price", "notes", "timestamp"]);
    }
  }
  return sheet;
}
