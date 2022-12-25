import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { StakingPageRequest, StakingRequest } from "src/viewModel/staking/StakingRequest";

@Injectable()
export class ServiceManager {
  constructor(private moduleRef: ModuleRef) {}
  
  /**
   *
   * @param req chainId see ParachainNetwork.info.id)
   * @param defaultServiceClassName the convention here for the service is naming neither ServiceClassName nor 
   * {ChainId}ServiceClassName. ServiceClassName is for the default implementation while there is 
   *  no specific implementation for the chain network.
   * @returns null or the service instance.
   */
  getService<T>(req: string | StakingRequest | StakingPageRequest, defaultServiceClassName): T {
    const chainId = typeof req === "string" ? req : req.chainId;
    const serviceClassName =
      chainId[0].toUpperCase() +
      chainId.substring(1) + defaultServiceClassName;
    try {
      const serviceInstance: T = this.moduleRef.get(serviceClassName, {
        strict: false,
      });
      return serviceInstance;
    } catch (e) {}
    return this.moduleRef.get(defaultServiceClassName, { strict: false });
  }
}
