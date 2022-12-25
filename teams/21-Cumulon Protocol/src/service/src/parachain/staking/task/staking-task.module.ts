import { HttpModule, Module } from "@nestjs/common";

import {
  StatDataSyncTask,
  DelegatorsScheduleTestController,
} from "./stat-data-sync-task";
import { CollatorService } from "./service/collator-service";

@Module({
  imports: [HttpModule],
  controllers: [DelegatorsScheduleTestController],
  providers: [CollatorService, StatDataSyncTask],
  // exports: [CollatorService],
})
export class StakingTask2Module {}
