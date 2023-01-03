import { Module } from "@nestjs/common";
import { StatusMonitorModule } from "nestjs-status-monitor";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ScheduleModule } from "@nestjs/schedule";
import { StakingAnalysis2Module } from "./parachain/staking/staking-analysis.module";
@Module({
  imports: [
    ScheduleModule.forRoot(),
    StatusMonitorModule.forRoot(),
    StakingAnalysis2Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
