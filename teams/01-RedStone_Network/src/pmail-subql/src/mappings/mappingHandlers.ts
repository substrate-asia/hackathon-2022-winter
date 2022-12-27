import {
  SubstrateExtrinsic,
  SubstrateEvent,
  SubstrateBlock,
} from "@subql/types";
import { Account, MailAddress, Mail, Contact } from "../types";
import { AccountId } from "@polkadot/types/interfaces";
import { getAccount, getMailAddress, getContact } from "../utils";


export async function handleSendMail(
  event: SubstrateEvent
): Promise<void> {
  //Retrieve the record by its ID
  const record = new Mail(
    `${event.block.block.header.number.toString()}-${
      event.idx
    }`
  );

  const {
    event: {
      data: [from, to, mail],
    },
  } = event;

  let fromObj = from.toJSON();
  let toObj = to.toJSON();

  {
    let strType = Object.keys(fromObj)[0];
    let strAddr = fromObj[strType].toString();
    let mailAddress = await getMailAddress(strType, strAddr);
    record.fromId = mailAddress.id;
  }
  {
    let strType = Object.keys(toObj)[0];
    let strAddr = toObj[strType].toString();
    let mailAddress = await getMailAddress(strType, strAddr);
    record.toId = mailAddress.id;
  }

  let t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(mail["timestamp"]);

  record.timestamp = t;
  record.hash = mail["storeHash"];
  await record.save();
}

export async function handleSendAlias(
  event: SubstrateEvent
): Promise<void> {
  const {
    event: {
      data: [account, addr, alias],
    },
  } = event;

  const owner = await getAccount(account.toString());

  let addrObj = addr.toJSON();
  let strType = Object.keys(addrObj)[0];
  let strAddr = addrObj[strType].toString();
  let mailAddress = await getMailAddress(strType, strAddr);

  const record = await getContact(
    `${owner.id}-${
      mailAddress.id
    }`
  );
  
  record.ownerId = owner.id;
  record.addrId = mailAddress.id;
  record.alias = alias.toHuman().toString();
  await record.save();
}