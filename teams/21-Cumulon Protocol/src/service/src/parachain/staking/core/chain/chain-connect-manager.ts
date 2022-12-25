import { ChainConnector } from "src/common/chain/chain-connector";
import { StakingPageRequest, StakingRequest } from "src/viewModel/staking/StakingRequest";

// @Injectable()
export class ChainConnectManager {
  //private moduleRef: ModuleRef
  // todo test
  constructor(private readonly connector: ChainConnector) {}

  static readonly instances: Record<string, ChainConnectManager> = {};

  static register(chainId: string, connector: ChainConnector) {
    if (!ChainConnectManager.instances[chainId]) {
      ChainConnectManager.instances[chainId] = new ChainConnectManager(
        connector
      );
    }
  }

  static get(req: string | StakingRequest | StakingPageRequest) {
    let chainId = null;
    if (typeof req === "string") {
      chainId = req;
    } else {
      chainId = req.chainId;
    }
    return ChainConnectManager.instances[chainId].connector;
  }
}
