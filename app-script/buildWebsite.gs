function buildWebsite() {
    addRecentChangesToTracker();
}

function addRecentChangesToTracker() {
    var lastRun = Number(PropertiesService.getScriptProperties().getProperty('lastRun')) || 0;
    Logger.log('addRecentChangesToTracker().lastRun = ' + lastRun);
    var sheet = SpreadsheetApp.openById(CONFIG.drive.sheetId).getSheetByName('Sheet1');
    var folder = DriveApp.getFolderById(CONFIG.drive.folderId);
    var docs = folder.getFilesByType(MimeType.GOOGLE_DOCS);
    var recentlyChanged = getRecentlyChanged(docs, lastRun);
    saveToSheet(recentlyChanged, sheet);
    PropertiesService.getScriptProperties().setProperty('lastRun', new Date().getTime());
}

function saveToSheet(recentlyChanged, sheet) {
    if (recentlyChanged.length === 0) {
        Logger.log('saveListToSheet().recentlyChanged.length = ' + recentlyChanged.length);
        return;
    }
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
        sheet.getRange(1, 1, recentlyChanged.length, 3).setValues(recentlyChanged);
    } else {
        sheet.getRange(lastRow + 1, 1, recentlyChanged.length, 3).setValues(recentlyChanged);
    }
}

function getRecentlyChanged(docs, lastRun) {
    var changedDocs = [];
    while (docs.hasNext()) {
        var doc = docs.next();
        var docId = doc.getId();
        Logger.log('getRecentlyChanged().docId = ' + docId);
        var lastModified = doc.getLastUpdated().getTime();
        Logger.log('getRecentlyChanged().lastModified = ' + lastModified);
        if (lastModified <= lastRun) {
            continue;
        }
        var publishedLink = getPublishedLink(docId);
        Logger.log('getRecentlyChanged().publishedLink = ' + publishedLink);
        if (!publishedLink) {
            continue;
        }
        changedDocs.push([doc.getUrl(), publishedLink, doc.getLastUpdated()]);
    }
    return changedDocs;
}

function getPublishedLink(docId) {
    try {
        const revisions = Drive.Revisions.list(docId).revisions;
        Logger.log('getPublishedLink().revisions = ' + JSON.stringify(revisions));
        if (!revisions || revisions.length === 0) {
            Logger.log('getPublishedLink().revisions.length = ' + (revisions ? revisions.length : 0));
            return false;
        }
        revisions.sort(function(a, b) {
            return new Date(b.modifiedTime) - new Date(a.modifiedTime);
        });
        var latestRevisionId = revisions[0].id;
        var publishedLink = Drive.Revisions.get(docId, latestRevisionId, {
            fields: 'publishedLink'
        }).publishedLink || false;
        Logger.log('getPublishedLink().publishedLink = ' + publishedLink);
        return publishedLink;
    } catch (e) {
        Logger.log('getPublishedLink().error = ' + e.toString());
        return false;
    }
}
