
//for build
cd android                                                                                       
./gradlew clean
./gradlew assembleRelease --no-daemon --stacktrace --info

function doGet(e) {
  const sheetId = e.parameter.sheet;

  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName("Sheet1");
  const data = sheet.getDataRange().getValues();

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheetId = e.parameter.sheetId;
    const action = e.parameter.action;

    Logger.log('Received postData: ' + e.postData.contents);
    Logger.log('Action: ' + action);

    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName("Sheet1");

    if (action === 'appendRow') {
      const otherValues = JSON.parse(e.postData.contents);
      const lastRow = sheet.getLastRow();
      const serialNo = lastRow > 0 ? (sheet.getRange(lastRow, 1).getValue() || 0) + 1 : 1;
      sheet.appendRow([serialNo, ...otherValues]);

      return ContentService
        .createTextOutput("Row appended")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    if (action === 'updateCell') {
      const range = e.parameter.range;
      const value = e.parameter.value;
      const cell = sheet.getRange(range);
      cell.setValue(value);

      return ContentService
        .createTextOutput("Cell updated")
        .setMimeType(ContentService.MimeType.TEXT);
    }

    return ContentService
      .createTextOutput("Invalid action")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}


