import { Injectable } from "@nestjs/common";
import { PageRequest } from "src/viewModel/base/pageRequest";
import { StatDelegatorPageRequest } from "src/viewModel/staking/portal/StatDelegatorPageRequest";
import { DbManager } from "../../core/db/db-manager";

@Injectable()
export class StatDelegatorService {

  async list(request: StatDelegatorPageRequest): Promise<any> {
    let order = undefined;
    request.orderBys && request.orderBys.forEach(it=> {
      if (it.sort) {
        order = order || {};
        order[it.sort] = it.order;
      }
    })
    const method = request.needTotal? 'findAndCount' : 'find'
    return await DbManager.get(request).statDelegatorRepository[method]({
      where: {
        collator: request.collator
      },
      order,
      skip: PageRequest.getSkip(request),
      take: PageRequest.getTake(request),
    });
  }
}
