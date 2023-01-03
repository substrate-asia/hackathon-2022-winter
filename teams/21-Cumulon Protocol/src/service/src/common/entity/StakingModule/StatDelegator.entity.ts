import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "stat_delegator" })
// @Index(['roundindex'])
export class StatDelegator {
  @ApiProperty()
  @PrimaryColumn()
  delegator: string;

  @ApiProperty()
  @PrimaryColumn()
  collator: string;

  @ApiProperty()
  @Column({
    name: "stake",
    type: "decimal",
    precision: 30,
    scale: 5,
  })
  stake: number;

  @ApiProperty()
  @Column({
    name: "reward",
    comment: "total rewards",
    type: "decimal",
    precision: 30,
    scale: 5,
    default: 0,
  })
  reward: number;

  @ApiProperty()
  @Column({
    name: "latest_reward",
    comment: "latest rewards",
    type: "decimal",
    precision: 30,
    scale: 5,
    default: 0,
  })
  latestReward: number;
  
  @ApiProperty()
  @Column({ name: "latest_reward_block", type: "float8" })
  latestRewardBlock: number;


  @ApiProperty()
  @Column({
    name: "rank",
    comment: "stake rank",
    default: 0,
  })
  rank: number;

  @ApiProperty()
  @Column({
    name: "is_in_top",
    comment: "is on the top list, 1 is yes, or on the bottom list",
    default: 0,
  })
  isInTop: number;

  @ApiProperty()
  @Column({
    comment: "the timestamp of current action",
    type: "timestamptz",
    default: new Date(),
  })
  timestamp: Date;
}
