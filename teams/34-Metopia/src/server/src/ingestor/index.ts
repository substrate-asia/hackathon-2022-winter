import onflowSign from './onflowSign';
import substrateSign from './substrateSign';

export default async function (body, version) {

  // console.log('process.env.MAINTENANCE:', process.env.MAINTENANCE);
  // if (!!process.env.MAINTENANCE)
  //   return Promise.reject('update in progress, try later');
  try {
    console.log('version:', version);
    if (version === 'onflow-sign') {
      return await onflowSign(body);
    } else {
      return await substrateSign(body);
    }
  } catch (e) {
    console.log('error:', e);
    return Promise.reject(e);
  }
}
