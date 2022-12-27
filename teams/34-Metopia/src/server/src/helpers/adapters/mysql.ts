import db from '../mysql';

export async function addOrUpdateSpace(space: string, settings: any) {
  if (!settings || !settings.name) return false;
  const ts = (Date.now() / 1e3).toFixed();
  const query =`
    INSERT IGNORE INTO spaces 
    SET ? 
    ON DUPLICATE KEY UPDATE 
    updated_at = ?, 
    settings = ?
  `;
  await db.queryAsync(query, [
    {
      id: space,
      created_at: ts,
      updated_at: ts,
      settings: JSON.stringify(settings)
    },
    ts,
    JSON.stringify(settings)
  ]);
}


export async function storeSettings(space, body) {
  const msg = JSON.parse(body.msg);
  await addOrUpdateSpace(space, msg.payload);
}

export async function getProposals() {
  const ts = parseInt((Date.now() / 1e3).toFixed());
  const query = `
    SELECT space, COUNT(id) AS count,
    COUNT(IF(start < ? AND end > ?, 1, NULL)) AS active,
    COUNT(IF(created > (UNIX_TIMESTAMP() - 86400), 1, NULL)) AS count_1d
    FROM proposals GROUP BY space
  `;
  return await db.queryAsync(query, [ts, ts]);
}

export async function getProposal(space, id) {
  const query = `SELECT * FROM proposals WHERE space = ? AND id = ?`;
  const proposals = await db.queryAsync(query, [space, id]);
  return proposals[0];
}