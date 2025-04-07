function getSheetInfo(sheetId, columnName) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Sheet1'); // Replace 'Sheet1' with your sheet name
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const columnIndex = header.indexOf(columnName);

    if (columnIndex === -1) {
      Logger.log(`getSheetInfo(${sheetId}).Column "${columnName}" not found.`);
      return false;
    }

    return {
      sheet: sheet,
      header: header,
      columnIndex: columnIndex
    };

  } catch (e) {
    Logger.log(`getSheetInfo(${sheetId}).Error: ${e.toString()}`);
    return false;
  }
}

function getSheetData(sheetId, columnName, searchValue) {
  Logger.log(`getSheetData(${sheetId}).Called with columnName: "${columnName}", searchValue: "${searchValue}".`);
  const sheetInfo = getSheetInfo(sheetId, columnName);

  if (!sheetInfo) {
    return false;
  }

  try {
    const { sheet, header, columnIndex } = sheetInfo;

    const values = sheet.getDataRange().getValues();

    if (values.length === 0) {
      Logger.log(`getSheetData(${sheetId}).values.length = ${values.length}`);
      return null;
    }

    const dataRows = values.slice(1);
    Logger.log(`getSheetData(${sheetId}).dataRows.length = ${dataRows.length}`);

    for (const row of dataRows) {
      if (row[columnIndex] === searchValue) {
        const rowObject = {};
        for (let i = 0; i < header.length; i++) {
          rowObject[header[i]] = row[i];
        }
        Logger.log(`getSheetData(${sheetId}).Found row: ${JSON.stringify(rowObject)}`);
        return rowObject;
      }
    }

    Logger.log(`getSheetData(${sheetId}).No matching row found for column "${columnName}" with value "${searchValue}".`);
    return null;

  } catch (e) {
    Logger.log(`getSheetData(${sheetId}).error = ${e.toString()}`);
    return false;
  }
}


function saveSheetData(sheetId, columnName, rowData) {
  const sheetInfo = getSheetInfo(sheetId, columnName);

  if (!sheetInfo) {
    return false;
  }

  try {
    const { sheet, header, columnIndex } = sheetInfo;

    const dataRows = sheet.getDataRange().getValues().slice(1);
    let rowIndex = -1;

    for (let i = 0; i < dataRows.length; i++) {
      if (dataRows[i][columnIndex] === rowData[columnName]) {
        rowIndex = i;
        break;
      }
    }

    const valuesArray = header.map(col => rowData[col] !== undefined ? rowData[col] : '');

    if (rowIndex !== -1) {
      sheet.getRange(rowIndex + 2, 1, 1, header.length).setValues([valuesArray]);
      Logger.log(`saveSheetData(${sheetId}).Row updated.`);
    } else {
      sheet.appendRow(valuesArray);
      Logger.log(`saveSheetData(${sheetId}).Row appended.`);
    }

    return true;

  } catch (e) {
    Logger.log(`saveSheetData(${sheetId}).Error: ${e.toString()}`);
    return false;
  }
}
