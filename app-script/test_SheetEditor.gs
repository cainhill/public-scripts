const sheetEditor = SheetEditor('1shhhDzm1UhQBup_5QQ0B31ZGX9TR7X8HtxLMWqLl3jQ');
const rowToUpdate = sheetEditor.findByIndex('ID', 61);
rowToUpdate.country = 'Australia';
sheetEditor.apply(rowToUpdate);
sheetEditor.save();

const sheetEditor = SheetEditor('1shhhDzm1UhQBup_5QQ0B31ZGX9TR7X8HtxLMWqLl3jQ');
const rowToAdd = {ID: 1, country: 'United States'};
sheetEditor.apply(rowToAdd);
sheetEditor.save();