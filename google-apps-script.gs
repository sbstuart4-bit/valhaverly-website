/**
 * Valhaverly Early Access — Google Sheets intake
 *
 * SETUP:
 * 1. Create a new Google Sheet named "Valhaverly Early Access Intake"
 * 2. Add these headers in row 1:
 *    Timestamp | Name | Email | Phone | Asset Type | Location | Circle Size | Role | Booking Method | Contributions | Biggest Challenge | Notes
 * 3. Extensions → Apps Script → paste this file → Save
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL into intake.js (GOOGLE_SHEET_URL)
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.assetType || '',
      data.location || '',
      data.circleSize || '',
      data.role || '',
      data.bookingMethod || '',
      data.contributions || '',
      data.biggestChallenge || '',
      data.notes || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Valhaverly intake endpoint ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}
