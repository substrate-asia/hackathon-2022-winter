// import { Module, DynamicModule } from "@nestjs/common";
// import { ChainConnector } from "src/common/chain/chain-connector";

// import { parachainNetworks } from "../chain-network-register";
// import { ChainConnectManager } from "./chain-connect-manager";

// @Module({
//   providers: [],
// })
// export class ChainConnectModule {
//   static async forRoot(): Promise<DynamicModule> {
//     const providers = [];
//     parachainNetworks.forEach(({ info }) => {
//       const conn = new ChainConnector(info);
//       providers.push({
//         provide: info.id + "-chain-connect",
//         useValue: conn,
//       });
//       ChainConnectManager.register(info.id, conn);
//     });
//     debugger;
//     return {
//       module: ChainConnectModule,
//       providers: providers,
//       exports: providers,
//     };
//   }
// }
