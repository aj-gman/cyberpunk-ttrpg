const crypto = require('node:crypto');
const { getConfig } = require('./_discord-config');
const { DAY_MS, updateState } = require('./_github-contents');

function rawBodyFromRequest(req) {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.rawBody === 'string') return Buffer.from(req.rawBody, 'utf8');
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  return null;
}

function validDiscordSignature(rawBody, timestamp, signature, publicKeyHex) {
  if (!rawBody || !timestamp || !signature || !/^[0-9a-f]{128}$/i.test(signature)) return false;
  try {
    const keyDer = Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      Buffer.from(publicKeyHex, 'hex')
    ]);
    const publicKey = crypto.createPublicKey({ key: keyDer, format: 'der', type: 'spki' });
    return crypto.verify(null, Buffer.from(timestamp + rawBody.toString('utf8')), publicKey, Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

function jsonResponse(res, body) {
  res.status(200).json(body);
}

function ephemeral(res, content) {
  return jsonResponse(res, { type: 4, data: { content, flags: 64 } });
}

function discordHeaders(config) {
  return {
    Authorization: `Bot ${config.discordBotToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'cyberpunk-discord-approval-bot'
  };
}

async function editApprovalMessage(config, interaction, content) {
  const response = await fetch(
    `https://discord.com/api/v10/webhooks/${config.discordApplicationId}/${interaction.token}/messages/@original`,
    {
      method: 'PATCH',
      headers: discordHeaders(config),
      body: JSON.stringify({ content, components: [] })
    }
  );
  if (!response.ok) throw new Error(`Discord approval update failed with ${response.status}.`);
}

async function postApprovedMessage(config, record) {
  const response = await fetch(`https://discord.com/api/v10/channels/${config.discordChannelId}/messages`, {
    method: 'POST',
    headers: discordHeaders(config),
    body: JSON.stringify({
      content: [
        '**GitHub update approved**',
        `**${record.title}**${record.author ? ` by ${record.author}` : ''}`,
        `Changed: ${record.files.join(', ') || 'No file list provided'}${record.totalFiles > record.files.length ? ` and ${record.totalFiles - record.files.length} more` : ''}`,
        record.url
      ].join('\n')
    })
  });
  if (!response.ok) throw new Error(`Discord approved post failed with ${response.status}.`);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  try {
    const config = getConfig();
    const rawBody = rawBodyFromRequest(req);
    if (!validDiscordSignature(rawBody, req.headers['x-signature-timestamp'], req.headers['x-signature-ed25519'], config.discordPublicKey)) {
      return res.status(401).send('invalid request signature');
    }

    const interaction = JSON.parse(rawBody.toString('utf8'));
    if (interaction.type === 1) return jsonResponse(res, { type: 1 });
    if (interaction.type !== 3) return ephemeral(res, 'Unsupported interaction.');
    if (!interaction.member || !interaction.member.roles.includes(config.discordApproverRoleId)) {
      return ephemeral(res, 'You are not authorized to approve GitHub updates.');
    }

    const [action, id] = String(interaction.data && interaction.data.custom_id || '').split(':');
    if (!['approve', 'reject'].includes(action) || !id) return ephemeral(res, 'Invalid approval action.');

    const now = Date.now();
    const stateResult = await updateState(config, async (state) => {
      const record = state.records.find((item) => item.id === id);
      if (!record) return { kind: 'missing' };
      if (record.status !== 'pending') return { kind: 'stale', status: record.status };
      if (now - new Date(record.createdAt).getTime() >= DAY_MS) {
        record.status = 'expired';
        record.updatedAt = new Date(now).toISOString();
        return { kind: 'stale', status: 'expired' };
      }
      record.status = action === 'approve' ? 'approved' : 'rejected';
      record.approvedBy = interaction.member.user && interaction.member.user.id;
      record.updatedAt = new Date(now).toISOString();
      return { kind: 'changed', record };
    });

    const result = stateResult.result;
    if (!result || result.kind === 'missing') return ephemeral(res, 'That approval request no longer exists.');
    if (result.kind === 'stale') return ephemeral(res, `That request is already ${result.status}.`);

    const record = result.record;
    const label = action === 'approve' ? 'approved' : 'rejected';
    jsonResponse(res, {
      type: 7,
      data: { content: `GitHub update **${label}** by <@${record.approvedBy}>.`, components: [] }
    });

    if (action === 'approve') {
      try {
        await postApprovedMessage(config, record);
      } catch (error) {
        await updateState(config, async (state) => {
          const stored = state.records.find((item) => item.id === id);
          if (stored) stored.postError = error.message;
          return true;
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Discord interaction failed.' });
  }
};

module.exports._private = { validDiscordSignature };