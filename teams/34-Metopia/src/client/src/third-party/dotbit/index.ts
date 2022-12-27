import { createInstance } from 'dotbit';
const dotbit = createInstance();

/**
 * params: 
 *   address: '0x1D643FAc9a463c9d544506006a6348c234dA485f'
 *
 * return:
 *   account: 'jeffx.bit'
 *
 */
const getAccountByAddress = async (address: string) => {
	const account = await dotbit.reverse({ key: address });
	return account;
}

/**
 * params: 
 *   account: 'jeffx.bit'
 *
 * return:
 *   [addrs & profiles]
 *
 */
const getRecordsByAccount = async (account: string) => {
	const records = await dotbit.records(account);
	return records;
}

/**
 * params: 
 *   account: 'jeffx.bit'
 *   subtype: 'eth'
 *
 *[subtype: https://github.com/dotbitHQ/cell-data-generator/blob/master/data/record_key_namespace.txt]
 *
 * return:
 *   [any addrs]
 *
 */
const getAddrsByAccount = async (account: string, subtype: string) => {
	const records = await dotbit.addrs(account, subtype);
	return records;
}

/**
 * params: 
 *   account: 'jeffx.bit'
 *   subtype: 'twitter'
 *
 *[subtype: https://github.com/dotbitHQ/cell-data-generator/blob/master/data/record_key_namespace.txt]
 *
 *
 * return:
 *   [any profiles]
 *
 */
const getProfilesByAccount = async (account: string, subtype: string) => {
	const records = await dotbit.profiles(account, subtype);
	return records;
}

export { getAccountByAddress, getRecordsByAccount, getAddrsByAccount, getProfilesByAccount };


