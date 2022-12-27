import db from '../../helpers/mysql';
import { formatSpace } from '../helpers';

export default async function(_parent, { id }) {
  const query = `SELECT s.* FROM spaces s WHERE s.id = ? AND s.settings IS NOT NULL GROUP BY s.id LIMIT 1`;
  
  try {
    const spaces = await db.queryAsync(query, [id]);
    let data = spaces.map(space =>
      Object.assign(space, formatSpace(space.id, space.settings))
    )[0] || null
    // console.log('data::::::', data);
    return data;
  } catch (e) {
    console.log('[graphql]', e);
    return Promise.reject('request failed');
  }
}
