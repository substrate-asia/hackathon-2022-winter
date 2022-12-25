import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "stat_network" })
// @Index(['roundindex'])
export class StatNetwork {
  @ApiProperty()
  @PrimaryColumn({ name: "chain_id" })
  chainId: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  @Column({
    name: "total_stake",
    type: "decimal",
    precision: 30,
    scale: 5,
  })
  totalStake: number;

  @ApiProperty()
  @Column({
    name: "collator_count",
    comment: "how many collator",
    default: 0,
  })
  collatorCount: number;

  @ApiProperty()
  @Column({
    name: "delegator_count",
    comment: "how many delegators for all collators",
    default: 0,
  })
  delegatorCount: number;
  
  @ApiProperty()
  @Column({
    name: "total_reward",
    default: 0,
    type: "decimal",
    precision: 30,
    scale: 5,
  })
  totalReward: number;

  @ApiProperty()
  @Column({
    name: "highest_apr",
    default: 0,
    type: "decimal",
    precision: 30,
    scale: 5,
  })
  highestApr: number;

  @ApiProperty()
  @Column({
    comment: "the timestamp of current action",
    type: "timestamptz",
    default: new Date(),
  })
  timestamp: Date;
}
