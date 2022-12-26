const {
  ApiPromise,
  WsProvider,
} = require("@polkadot/api");
const provider = new WsProvider(
  "ws://192.168.8.103:9944"
);

const getEvents = async () => {
  const api = await ApiPromise.create(provider);
  // console.log(api);

  const blockHash =
    await api.rpc.chain.getBlockHash(669);
  console.log("-----------blockHash:", blockHash);

  const apiAt = await api.at(blockHash);
  // console.log(apiAt);

  const events =
    await apiAt.query.system.events();
  // console.log("-----------events:", event.toHuman());

  const sendMailEvent = events[2];

  sendMailEvent.event.toHuman();

  console.log(
    "-----------send mail events:",
    sendMailEvent.event.toHuman()
  );
  console.log(
    "-----------send mail events meta data:",
    sendMailEvent.event.meta.toHuman()
  );
};

getEvents();
