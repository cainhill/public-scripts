function callGitHubApi(apiUrl, method, headers, payload) {
  const options = {
    method: method,
    headers: headers,
    payload: payload,
    muteHttpExceptions: true
  };
  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    return {
      code: response.getResponseCode(),
      body: response.getContentText(),
      json: JSON.parse(response.getContentText())
    };
  } catch (e) {
    Logger.log(`callGitHubApi() - Error during API request to ${apiUrl}: ${e.toString()}`);
    return { code: -1, body: null, json: null };
  }
}

function getFileShaInternal(githubUsername, githubToken, githubRepo, filePath, branch) {
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}?ref=${branch}`;
  const headers = {
    'Authorization': `token ${githubToken}`,
    'User-Agent': githubUsername
  };
  const response = callGitHubApi(apiUrl, 'GET', headers, null);
  return response.code === 200 && response.json && response.json.sha ? response.json.sha : null;
}

function buildGitHubHeaders(githubToken, githubUsername) {
  return {
    'Authorization': `token ${githubToken}`,
    'Content-Type': 'application/json',
    'User-Agent': githubUsername
  };
}

function saveToGitHub(htmlContent, filePath, commitMessage) {
  Logger.log(`saveToGitHub(htmlContent: "${htmlContent}", filePath: "${filePath}", commitMessage: "${commitMessage}")`);
  const githubUsername = CONFIG.github.username;
  const githubRepo = CONFIG.github.repo;
  const githubToken = CONFIG.github.token;
  const githubBranch = CONFIG.github.branch || 'main';

  // Build the variables needed for the request
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;
  const headers = buildGitHubHeaders(githubToken, githubUsername);
  const base64Content = Utilities.base64Encode(htmlContent);
  const sha = getFileShaInternal(githubUsername, githubToken, githubRepo, filePath, githubBranch);

  const payload = JSON.stringify({
    message: commitMessage,
    content: base64Content,
    branch: githubBranch,
    sha: sha
  });

  const response = callGitHubApi(apiUrl, 'PUT', headers, payload);

  Logger.log(`saveToGitHub() - Response Code: ${response.code}`);
  Logger.log(`saveToGitHub() - Response Body: ${response.body}`);

  return response.code >= 200 && response.code < 300;
}
