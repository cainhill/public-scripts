/*

# Limitations
- Only reads from the first sheet in a given workbook
- Does not re-index after changes

# Conventions (make sure that...)
- Your Google Sheet column headings use lowercase_snakecase
- Any columns you want to index are named with UPPERCASE_SNAKECASE
- The indexed columns have unique values in every row
- Your primary key column is the left-most column that is also named with UPPERCASE_SNAKECASE

*/

function SheetEditor(workbookId) {
	
	console.log(`[INFO] [SheetEditor] - Started to open the Google Sheet for reading. (workbookId: ${workbookId})`);
	
	try {
    const workbook = SpreadsheetApp.openById(workbookId);
  } catch (error) {
    console.error(`[ERROR] [SheetEditor] - Stopped opening the Google Sheet because of unknown issue. Please recheck the workbookId. (workbookId: ${workbookId})`);
    return null;
  }
	
	console.log(`[INFO] [SheetEditor] - Started pre-checks to confirm the sheet is well-structured for editing. (workbookId: ${workbookId})`);
	
  const sheet = workbook.getSheets()[0]; // Read from the first sheet only
	const sheetName = sheet.getName();
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
		console.error(`[ERROR] [SheetEditor] - Stopped pre-checks because this sheet seems blank. Please make sure this sheet at least has column headings. (sheetName: ${sheetName})`)
		return null;
	}
	
  const header = data[0];
  const content = data.slice(1);
	const indexes = [];
	
  const columnsToIndex = header.filter(columnName => /[A-Z]/.test(columnName));
	if (columnsToIndex.length === 0) {
		console.error(`[ERROR] [SheetEditor] - Stopped pre-checks because this sheet is missing index column(s). Please make sure this sheet has at least one index column. (sheetName: ${sheetName})`)
		return null;
	}
	
  columnsToIndex.forEach(indexedColumn => {
    indexes[indexedColumn] = {};
  });
	
  const primaryKeyColumn = columnsToIndex[0];
	
	console.log(`[INFO] [SheetEditor] - Started reading sheet into memory. (workbookId: ${workbookId})`);
	
  const rows = content.map(row => {
    const obj = {};
    header.forEach((columnName, index) => {
      obj[columnName] = row[index] || '';
    });
    columnsToIndex.forEach(indexedColumn => {
      const value = obj[indexedColumn];
      if (value === undefined || value === '' || indexes[indexedColumn][value]) {
				console.warn(`[WARN] [SheetEditor] - Skipped adding this row to indexed colum because of row content. Please recheck the row content. (row: ${JSON.stringify(obj)}, indexedColumn: ${indexedColumn})`);
				return;
			}
      indexes[indexedColumn][value] = obj;
    });
    return obj;
	});
	
  console.log(`[INFO] [SheetEditor] - Finished reading sheet into memory. Editing functions are now available.`);
	
	return {
		
	  // Returns a single row that matches a search value in a given indexed column
		getByIndex: (indexedColumn, searchValue) => {
			if (!indexes[indexedColumn]) {
				console.error(`[ERROR] [SheetEditor] - Stopped because the referenced column is not indexed. Please make sure the column is indexed. (indexedColumn: ${indexedColumn})`);
				return null;
			}
			return indexes[indexedColumn][searchValue] || null;
		},
		
    // Returns an array with rows that match a custom filter function
    getByFilter: (filterFunction) => {
      return rows.filter(filterFunction);
    },
		
		// Updates or creates rows in memory
		apply: (obj) => {
			
			if (!obj[primaryKeyColumn] || obj[primaryKeyColumn] === '') {
				console.error(`[ERROR] [SheetEditor] - Stopped because the given object is missing a value for its primary key. Please make sure the row object contains a valid value for its primary key column. (primaryKeyColumn: ${primaryKeyColumn}, row: ${JSON.stringify(obj)})`);
				return false;
			}
			
			const existingRow = this.getByIndex(primaryKeyColumn, obj[primaryKeyColumn]);
			
			if (existingRow) {
				
				Object.keys(obj).forEach(key => {
					if (obj[key] === undefined) return;
					existingRow[key] = obj[key]; // Update existing row by merging
				});
				console.log(`[INFO] [SheetEditor] - Updated existing row (primaryKeyColumn: ${primaryKeyColumn}, row: ${JSON.stringify(obj)})`);
				return true;
				
			} else {
				
				const newRow = {};
				header.forEach(columnName => {
					if (obj[columnName] !== undefined) {
						newRow[columnName] = obj[columnName];
					} else {
						newRow[columnName] = '';
					}
				});
				rows.push(newRow);
				console.log(`[INFO] [SheetEditor] - Created new row (primaryKeyColumn: ${primaryKeyColumn}, row: ${JSON.stringify(obj)})`);
				return true;
				
			}
		},
		
		// Save all rows to the Google Sheet
		save: () => {
			try {
				
				// Clear existing content except for header
				if (rows.length > 0) {
					const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, header.length);
					range.clearContent();
				}
				
				// Prepare data for writing
				const dataToWrite = rows.map(row => {
					return header.map(columnName => row[columnName] || '');
				});
				
				// Write all rows to sheet
				if (dataToWrite.length > 0) {
					const writeRange = sheet.getRange(2, 1, dataToWrite.length, header.length);
					writeRange.setValues(dataToWrite);
				}
				
				console.log(`[INFO] [SheetEditor] - Saved rows to sheet. (rows.length: ${rows.length})`);
				return true;
				
			} catch (error) {
				
				console.error(`[ERROR] [SheetEditor] - Stopped saving to sheet because of unknown error. Please check the error message to resolve. (error.message: ${error.message})`);
				return false;
				
			}
		}
		
	};
	
}
		
		
/*
tests:
workbook does not exist
sheet has no headers
sheet header has duplicate column names
sheet header contains a blank column name
no index columns specified
no primary key column specified
non-unique values detected in index or primary key