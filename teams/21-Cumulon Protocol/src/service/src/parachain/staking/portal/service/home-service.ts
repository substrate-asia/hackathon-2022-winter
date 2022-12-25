import { Injectable } from "@nestjs/common";
import { StatNetwork } from "src/common/entity/StakingModule/StatNetwork.entity";
import { DbManager } from "../../core/db/db-manager";
import { ServiceManager } from "../../core/service/service-manager";
import { MyStakeRequest } from "../model/MyStakeRequest";
import { MyStake } from "../model/MyStakeResponse";
import { MyStakeListService } from "./my-stake-list-service";

@Injectable()
export class HomeService {
  constructor(
    private serviceManager: ServiceManager
  ) {}

  async listMyStake(request: MyStakeRequest): Promise<Array<MyStake>> {
    return this.serviceManager
      .getService<MyStakeListService>(request, MyStakeListService.name)
      .listMyStake(request);
  }

  async listNetworkStat(chainId: string): Promise<StatNetwork> {
    return DbManager.get(chainId).statNetworkRepository.findOne({});
  }
}
