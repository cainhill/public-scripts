function runWebsiteUpdate() {
  const sheetId = CONFIG.websiteUpdater.contentTrackerSheetId;
  const limit = 10;

  // Search the content tracker sheet for any published docs that have changes since they were last built
  const filterFunction = (rowObject) => { (new Date(rowObject.lastBuilt)) < (new Date(rowObject.lastModified)) };
  const docsWithChanges = getSheetData(sheetId, filterFunction, limit);

  // Exit early if no changes found
  if (!docsWithChanges || docsWithChanges.length === 0) {
    Logger.log("runWebsiteUpdate(): No recent changes found that need a website update");
    return;
  }

  // Build the webpages for any published docs with changes
  buildWebpages(docsWithChanges);
}

function buildWebpages(docs) {
  Logger.log(`buildWebpages(${JSON.stringify(docs)})`);
  let webpagesSuccessfullyBuilt = 0;
  docs.forEach(function(doc) {
    const webpageSuccessfullyBuilt = buildWebpage(doc);
    if (webpageSuccessfullyBuilt) webpagesSuccessfullyBuilt++;
  });
  Logger.log(`buildWebpages().webpagesSuccessfullyBuilt = ${webpagesSuccessfullyBuilt}`);
}

function buildWebpage(doc) {
  Logger.log(`buildWebpage(${JSON.stringify(doc)})`);
  return true;
}
