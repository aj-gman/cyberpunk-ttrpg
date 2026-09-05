const DAY_MS = 24 * 60 * 60 * 1000;

function contentsUrl(config, path) {
  return `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/contents/${path}`;
}

function headers(config) {
  return {
    Authorization: `Bearer ${config.githubToken}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'cyberpunk-discord-approval-bot'
  };
}

async function readJson(config, path, fallback) {
  const response = await fetch(`${contentsUrl(config, path)}?ref=${encodeURIComponent(config.githubBranch)}`, {
    headers: headers(config)
  });
  if (response.status === 404) return { data: fallback, sha: null };
  if (!response.ok) throw new Error(`GitHub read failed with ${response.status}.`);
  const file = await response.json();
  return {
    data: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')),
    sha: file.sha
  };
}

async function writeJson(config, path, data, sha, message) {
  const response = await fetch(contentsUrl(config, path), {
    method: 'PUT',
    headers: { ...headers(config), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64'),
      branch: config.githubBranch,
      ...(sha ? { sha } : {})
    })
  });
  if (response.status === 409) return false;
  if (!response.ok) throw new Error(`GitHub write failed with ${response.status}.`);
  return true;
}

function emptyState() {
  return { version: 1, records: [] };
}

function pruneState(state, now = Date.now()) {
  state.records = (state.records || []).filter((record) => {
    if (record.status === 'pending') {
      return now - new Date(record.createdAt).getTime() < DAY_MS;
    }
    return now - new Date(record.updatedAt || record.createdAt).getTime() < 30 * DAY_MS;
  });
  return state;
}

async function updateState(config, updater) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readJson(config, config.statePath, emptyState());
    const state = pruneState(current.data);
    const result = await updater(state);
    if (result === undefined) return { state, result: undefined };
    if (await writeJson(config, config.statePath, state, current.sha, 'Update Discord approval state')) {
      return { state, result };
    }
  }
  throw new Error('Could not update Discord approval state after retries.');
}

module.exports = { DAY_MS, emptyState, pruneState, readJson, updateState };