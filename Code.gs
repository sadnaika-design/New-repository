// ============================================================
//  סדנת תיאטרון איקה זהר — Google Apps Script
//  קובץ זה מטפל בשני דברים:
//  1. קבלת נתוני טופס ושמירה ב-Google Sheets
//  2. הגשת האתר (HTML) כ-Web App
// ============================================================

// ---- הגדרות ----
const SHEET_NAME = 'פניות'; // שם הגיליון לשמירת הנתונים

// ============================================================
//  1. הגשת האתר כ-Web App
//     כאשר גולש נכנס לכתובת ה-Web App, הוא יקבל את ה-HTML
// ============================================================
function doGet(e) {
  return HtmlService
    .createHtmlOutputFromFile('index') // index.html שמור ב-Apps Script
    .setTitle('סדנת תיאטרון איקה זהר')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
//  2. קבלת נתוני הטופס (POST) ושמירה ב-Sheets
// ============================================================
function doPost(e) {
  try {
    // פענוח הנתונים שנשלחו מהטופס
    const data = JSON.parse(e.postData.contents);

    // פתיחת ה-Spreadsheet הנוכחי וגיליון "פניות"
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let sheet   = ss.getSheetByName(SHEET_NAME);

    // אם הגיליון לא קיים — ניצור אותו עם כותרות
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'תאריך ושעה',
        'שם פרטי',
        'שם משפחה',
        'טלפון',
        'דוא"ל',
        'סוג פנייה',
        'סדנה מבוקשת',
        'הודעה'
      ]);
      // עיצוב שורת כותרת
      sheet.getRange(1, 1, 1, 8)
        .setBackground('#6B2FA0')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // הוספת שורה חדשה עם הנתונים
    sheet.appendRow([
      data.timestamp  || new Date().toLocaleString('he-IL'),
      data.firstName  || '',
      data.lastName   || '',
      data.phone      || '',
      data.email      || '',
      data.clientType || '',
      data.workshop   || '',
      data.message    || ''
    ]);

    // שליחת התראה במייל (אופציונלי — הסירו // כדי להפעיל)
    // sendEmailNotification(data);

    // החזרת תשובת הצלחה
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // החזרת שגיאה
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
//  (אופציונלי) שליחת התראה במייל לכל פנייה חדשה
// ============================================================
function sendEmailNotification(data) {
  const recipient = 'sadnaika@gmail.com'; // החליפו בכתובת המייל הרצויה
  const subject   = 'פנייה חדשה מהאתר — ' + (data.firstName || '') + ' ' + (data.lastName || '');
  const body = `
פנייה חדשה התקבלה מהאתר:

שם: ${data.firstName} ${data.lastName}
טלפון: ${data.phone}
דוא"ל: ${data.email}
סוג פנייה: ${data.clientType}
סדנה מבוקשת: ${data.workshop}
הודעה: ${data.message}

תאריך: ${data.timestamp}
  `;
  MailApp.sendEmail(recipient, subject, body);
}
