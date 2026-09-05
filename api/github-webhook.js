const crypto = require('node:crypto');
const { getConfig } = require('./_discord-config');
const { updateState } = require('./_github-contents');

function rawBodyFromRequest(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.rawBody === 'string') return Buffer.from(req.rawBody, 'utf8');
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  return null;
}

function validSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !signature.startsWith('sha256=')) return false;
  const expected = Buffer.from(`sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`);
  const actual = Buffer.from(signature);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function commitSummary(payload) {
  const commits = (payload.commits || []).filter((commit) => String(commit.message || '').trim());
  if (!commits.length) return null;
  const files = new Set();
  commits.forEach((commit) => {
    [...(commit.added || []), ...(commit.modified || []), ...(commit.removed || [])].forEach((file) => files.add(file));
  });
  const head = payload.head_commit || commits[commits.length - 1];
  return {
    title: String(head.message).split(/\r?\n/, 1)[0].trim().slice(0, 180),
    files: [...files].sort().slice(0, 40),
    totalFiles: files.size,
    sha: head.id,
    url: head.url || `https://github.com/${payload.repository.full_name}/commit/${head.id}`,
    author: head.author && (head.author.name || head.author.username || '')
  };
}

function discordHeaders(config) {
  return {
    Authorization: `Bot ${config.discordBotToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'cyberpunk-discord-approval-bot'
  };
}

function approvalMessage(record) {
  const fileText = record.totalFiles > record.files.length
    ? `${record.files.join(', ')} and ${record.totalFiles - record.files.length} more`
    : (record.files.join(', ') || 'No file list provided');
  return [
    '**GitHub update awaiting approval**',
    `**${record.title}**${record.author ? ` by ${record.author}` : ''}`,
    `Changed: ${fileText}`,
    record.url
  ].join('\n');
}

async function postApproval(config, record) {
  const response = await fetch(`https://discord.com/api/v10/channels/${config.discordChannelId}/messages`, {
    method: 'POST',
    headers: discordHeaders(config),
    body: JSON.stringify({
      content: approvalMessage(record),
      components: [{
        type: 1,
        components: [
          { type: 2, style: 3, label: 'Approve', custom_id: `approve:${record.id}` },
          { type: 2, style: 4, label: 'Reject', custom_id: `reject:${record.id}` }
        ]
      }]
    })
  });
  if (!response.ok) throw new Error(`Discord approval message failed with ${response.status}.`);
  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  try {
    const config = getConfig();
    const rawBody = rawBodyFromRequest(req);
    if (!validSignature(rawBody, req.headers['x-hub-signature-256'], config.githubWebhookSecret)) {
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    if (req.headers['x-github-event'] !== 'push') return res.status(202).json({ ignored: true });
    const payload = JSON.parse(rawBody.toString('utf8'));
    if (payload.ref !== `refs/heads/${config.githubBranch}`) return res.status(202).json({ ignored: true });

    const summary = commitSummary(payload);
    if (!summary) return res.status(202).json({ ignored: true, reason: 'No described commits.' });

    const deliveryId = req.headers['x-github-delivery'] || `${summary.sha}:${payload.ref}`;
    const id = crypto.createHash('sha256').update(`${deliveryId}:${summary.sha}`).digest('hex').slice(0, 24);
    const now = new Date().toISOString();
    const record = {
      id,
      deliveryId,
      sha: summary.sha,
      branch: config.githubBranch,
      title: summary.title,
      files: summary.files,
      totalFiles: summary.totalFiles,
      url: summary.url,
      author: summary.author,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    const inserted = await updateState(config, async (state) => {
      if (state.records.some((item) => item.id === id || item.deliveryId === deliveryId || item.sha === summary.sha)) return false;
      state.records.forEach((item) => {
        if (item.status === 'pending' && item.branch === config.githubBranch && item.sha !== summary.sha) {
          item.status = 'superseded';
          item.updatedAt = now;
        }
      });
      state.records.push(record);
      return true;
    });

    if (!inserted.result) return res.status(202).json({ duplicate: true });

    const discordMessage = await postApproval(config, record);
    await updateState(config, async (state) => {
      const stored = state.records.find((item) => item.id === id);
      if (stored) {
        stored.discordMessageId = discordMessage.id;
        stored.updatedAt = new Date().toISOString();
      }
      return true;
    });
    return res.status(202).json({ pending: true, id });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Webhook processing failed.' });
  }
};

module.exports._private = { commitSummary, validSignature };