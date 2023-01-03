import { storeSettings } from '../helpers/adapters/mysql';
import { jsonParse } from '../helpers/utils';

export async function verify(body): Promise<any> {
  
}

export async function action(body): Promise<void> {
  const msg = jsonParse(body.msg);
  try {
    await storeSettings(msg.space, body);
  } catch (e) {
    console.log('[writer] Failed to store settings', msg.space, e);
  }
}
