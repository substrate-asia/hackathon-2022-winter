import { Injectable } from "@nestjs/common";
import { skip } from "rxjs/operators";
import { StatCollator } from "src/common/entity/StakingModule/StatCollator.entity";
import { PageRequest } from "src/viewModel/base/pageRequest";
import { StatCollatorPageRequest } from "src/viewModel/staking/portal/StatCollatorPageRequest";
import { StakingRequest } from "src/viewModel/staking/StakingRequest";
import { In, Like } from "typeorm";
import { ChainConnectManager } from "../../core/chain/chain-connect-manager";
import { DbManager } from "../../core/db/db-manager";

@Injectable()
export class StatCollatorStatService {
  async getSafeStateConfig(request: StakingRequest): Promise<any> {
    const data = await DbManager.get(request).cnhRepository.findOne({
      order: { id: "DESC" },
    });
    const max = data && data.new ? data.new : 64;
    return {
      max,
      collatorSafeStateThreshold:
        ChainConnectManager.get(request).defaultValues
          .collatorSafeStateThreshold,
    };
  }

  async list(request: StatCollatorPageRequest): Promise<any> {
    let order = undefined;
    request.orderBys &&
      request.orderBys.forEach((it) => {
        if (it.sort) {
          order = order || {};
          order[it.sort] = it.order;
        }
      });
    const where = {} as any;
    const skip = PageRequest.getSkip(request);
    const take = PageRequest.getTake(request);
    if (
      request.collator &&
      (request.collator = request.collator.trim()).length > 0
    ) {
      where.collator = Like(request.collator);
    } else if (
      request.delegator &&
      (request.delegator = request.delegator.trim()).length > 0
    ) {
      const rawData = await DbManager.get(
        request
      ).statDelegatorRepository.query(
        `SELECT DISTINCT collator  FROM stat_delegator  WHERE	delegator LIKE'%${request.delegator}%' LIMIT ${take} OFFSET ${skip}`
      );
      if (rawData && rawData.length) {
        where.collator = In(rawData.map((it) => it.collator));
      } else if (request.needTotal) {
        return [[], 0];
      } else return [];
    }

    const method = request.needTotal ? "findAndCount" : "find";
    return await DbManager.get(request).statCollatorRepository[method]({
      where,
      order,
      skip,
      take,
    });
  }
}
