function buildWebsite() {

  addRecentChangesToTracker();

}

function addRecentChangesToTracker() {

  var lastRun = Number(PropertiesService.getScriptProperties().getProperty('lastRun')) || 0;
  Logger.log( 'addRecentChangesToTracker().lastRun = ' + lastRun );
  var sheet = SpreadsheetApp.openById(CONFIG.drive.sheetId).getSheetByName('Sheet1');
  var folder = DriveApp.getFolderById(CONFIG.drive.folderId);

  if (!folder) {
    Logger.log('addRecentChangesToTracker(): Folder not found');
    return;
  }

  var docs = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  var recentlyChanged = getRecentlyChanged(docs, lastRun);
  Logger.log('addRecentChangesToTracker().recentlyChanged.length = ' + recentlyChanged.length);
  if (recentlyChanged.length > 0) {
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.getRange(1, 1, recentlyChanged.length, 3).setValues(recentlyChanged);
    } else {
      sheet.getRange(lastRow + 1, 1, recentlyChanged.length, 3).setValues(recentlyChanged);
    }
  } else {
    Logger.log('addRecentChangesToTracker(): No recent changes found.');
  }

  PropertiesService.getScriptProperties().setProperty('lastRun', new Date().getTime());

}

function getRecentlyChanged(docs, lastRun) {
  var changedDocs = [];
  while (docs.hasNext()) {
    var doc = docs.next();
    var docId = doc.getId();
    Logger.log('getRecentlyChanged().docId = ' + docId);
    var lastModified = doc.getLastUpdated().getTime();
    Logger.log('getRecentlyChanged().lastModified = ' + lastModified);
    var publishedLink = getPublishedLink(docId);
    Logger.log('getRecentlyChanged().publishedLink = ' + publishedLink);
    if (lastModified > lastRun && publishedLink) {
      changedDocs.push([doc.getUrl(), publishedLink, doc.getLastUpdated()]);
    }
  }
  return changedDocs;
}

function getPublishedLink(docId) {
  try {
    var revisions = Drive.Revisions.list(docId).revisions;
    Logger.log('getPublishedLink().revisions = ' + JSON.stringify(revisions));
    if (!revisions || revisions.length === 0) {
      Logger.log('getPublishedLink().revisions.length = ' + (revisions ? revisions.length : 0));
      return false;
    }
    revisions.sort(function(a, b) {
      return new Date(b.modifiedTime) - new Date(a.modifiedTime);
    });
    var latestRevisionId = revisions[0].id;
    var publishedLink = Drive.Revisions.get(docId,latestRevisionId,{fields:'publishedLink'}).publishedLink;
    Logger.log( 'getPublishedLink().publishedLink = ' + publishedLink );
    return publishedLink;
  } catch (e) {
    Logger.log( 'getPublishedLink().error = ' + e.toString() );
    return false;
  }
}
