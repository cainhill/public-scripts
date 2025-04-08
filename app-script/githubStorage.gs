function saveToGitHub(htmlContent, filePath, commitMessage) {
  Logger.log(`saveToGitHub(htmlContent: "${htmlContent}", filePath: "${filePath}", commitMessage: "${commitMessage}")`);

  // Gather the credentials
  const githubUsername = CONFIG.github.username;
  const githubRepo = CONFIG.github.repo;
  const githubToken = CONFIG.github.token;
  const githubBranch = CONFIG.github.branch || 'main';

  // Prepare the request
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;
  const headers = {
    'Authorization': `token ${githubToken}`,
    'Content-Type': 'application/json',
    'User-Agent': githubUsername
  };
  const base64Content = Utilities.base64Encode(htmlContent);
  const sha = getFileShaInternal(githubUsername, githubRepo, filePath, githubBranch, headers);
  const payload = JSON.stringify({
    message: commitMessage,
    content: base64Content,
    branch: githubBranch,
    sha: sha
  });

  // Make the request
  const response = callGithubApi(apiUrl, 'PUT', headers, payload);
  return response.code >= 200 && response.code < 300;
}

function callGithubApi(apiUrl, method, headers, payload) {
  Logger.log(`callGithubApi(apiUrl: ${apiUrl}, method: ${method}, headers: ${JSON.stringify(headers)}, payload: ${payload})`);
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
    Logger.log(`callGithubApi().error = ${e.toString()}`);
    return false;
  }
}

function getFileShaInternal(githubUsername, githubRepo, filePath, branch, headers) {
  
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}?ref=${branch}`;
  const response = callGitHubApi(apiUrl, 'GET', headers, null);
  return response.code === 200 && response.json && response.json.sha ? response.json.sha : null;
}
