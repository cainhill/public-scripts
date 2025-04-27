function getAllDocs(contentFolderId) {

  logs(`Started: Searching for all docs in the content folder (getAllDocs)`);
  const searchQuery = `'${contentFolderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed = false`;
  const docs = getFiles(searchQuery);
  logs(`Result: Found "${docs.length}" docs within the content folder (getAllDocs)`);

  return docs;
  
}

function getDocsFromLastSevenDays(contentFolderId) {

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const formattedDate = Utilities.formatDate(sevenDaysAgo, "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  const searchQuery = `'${contentFolderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed = false and modifiedTime > '${formattedDate}'`;

  logs(`Started: Searching for docs changed in the last seven days (getDocsFromLastSevenDays)`, 1);
  const docs = getFiles(searchQuery);
  logs('', -1);
  logs(`Result: Found "${docs.length}" docs changed in the last seven days (getDocsFromLastSevenDays)`, -1);

  return docs;

}

function getFiles(searchQuery) {
  try {

    const filesArray = [];
    const response = Drive.Files.list({
      q: searchQuery,
      fields: 'files(id, name, modifiedTime)',
      pageSize: 100,
    });

    logs(`Found:`, 1);

    for (const file of response.files) {
      logs(file.name);
      filesArray.push(file);
    }

    logs('', -1);

    return filesArray;

  } catch (error) {
    logs(`Error: Encountered an error while getting a list of files (getFiles)`, 1);
    logs(error.toString(), -1);
    return [];
  }
}

function updateTrackerWithAllDocs(docs, contentTrackerSheet) {

  logs(`Started: Updating tracker with all docs (updateTrackerWithAllDocs)`, 1);
  logs(`Found:`, 1);

  for (const doc of docs) {

    const docInfo = getLatestDocInfo(doc, contentTrackerSheet);
    if ( !(docInfo.publishedLink) ) continue;

    logs(JSON.stringify(docInfo));

    const rowIndex = contentTrackerSheet.rowIndex('id', docInfo.id);
    if (rowIndex === -1) {
      contentTrackerSheet.append(docInfo);
    } else {
      contentTrackerSheet.update(rowIndex, docInfo);
    }

  }

}

function updateTrackerWithLatestChanges(docs, contentTrackerSheet) {

  logs(`Started: Updating tracker with latest changes (updateTrackerWithLatestChanges)`, 1);
  logs(`Found:`, 1);

  for (const doc of docs) {

    const docInfo = getLatestDocInfo(doc, contentTrackerSheet);
    if ( !(docInfo.publishedLink && (new Date(docInfo.lastModified)) > (new Date(docInfo.lastBuilt))) ) continue;

    logs(JSON.stringify(docInfo));

    const rowIndex = contentTrackerSheet.rowIndex('id', docInfo.id);
    if (rowIndex === -1) {
      contentTrackerSheet.append(docInfo);
    } else {
      contentTrackerSheet.update(rowIndex, docInfo);
    }

  }

  logs('', -2);
  logs(`Result: Finished updating tracker with latest changes (updateTrackerWithLatestChanges)`);

}

function getLatestDocInfo(doc, contentTrackerSheet) {
  const contentTrackerRow = contentTrackerSheet.find('id', doc.id);
  return {
    id: doc.id,
    title: doc.name,
    publishedLink: contentTrackerRow && contentTrackerRow.publishedLink ? contentTrackerRow.publishedLink : getPublishedLink(doc.id),
    lastModified: new Date(doc.modifiedTime).toISOString(),
    lastBuilt: (contentTrackerRow && contentTrackerRow.lastBuilt && !isNaN(new Date(contentTrackerRow.lastBuilt).getTime()))
      ? new Date(contentTrackerRow.lastBuilt).toISOString()
      : new Date(Date.UTC(1900, 0, 1)).toISOString()
  };
}

function getPublishedLink(docId) {
  try {
    const revision = Drive.Revisions.get(docId, 'head', {fields: 'publishedLink'}); 
    return revision.publishedLink || '';
  } catch (error) {
    logs(`Error: Could not access published link for doc "${docId}" (getPublishedLink)`, 1);
    logs(error.toString(), -1);
    return '';
  }
}
