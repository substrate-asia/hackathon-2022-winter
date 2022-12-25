<template>
  <div class="moobeam-leaderboard-page">
    <div class="info-wrap">
      <div class="item">
        <img
          class="left-icon"
          src="@/assets/images/moonbeam/total_rewards.png"
          alt=""
        />
        <div class="right">
          <div class="head">
            <span> Collators Count </span>
            <a-tooltip content="Number of collators">
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">{{ networkInfo.collatorCount }}</div>
        </div>
      </div>
      <div class="item">
        <img class="left-icon" src="@/assets/images/moonbeam/Icon.png" alt="" />
        <div class="right">
          <div class="head">
            <span> Total Staked</span>
            <a-tooltip content="the amount of tokens that all collators staked">
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">
            {{ $utils.roundNumber(networkInfo.totalStake) }}
          </div>
        </div>
      </div>
      <div class="item">
        <img
          class="left-icon"
          src="@/assets/images/moonbeam/Icon-1.png"
          alt=""
        />
        <div class="right">
          <div class="head">
            <span> Blocks Count </span>
            <a-tooltip content="number of blocks that have been produced">
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">{{ $utils.roundNumber(latestBlockNumber) }}</div>
        </div>
      </div>
      <div class="item">
        <img
          class="left-icon"
          src="@/assets/images/moonbeam/Icon-2.png"
          alt=""
        />
        <div class="right">
          <div class="head">
            <span> Issued Rewards </span>
            <a-tooltip content="the amount of rewards that have been delivered">
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">
            {{ $utils.roundNumber(networkInfo.totalReward) }}
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="main-title">Current Round</div>
      <div class="main-info">
        <div class="item">
          <div class="head">
            <div class="icon"></div>
            <span>Current Ronud</span>
          </div>
          <div class="num">{{ roundInfo.current }}</div>
        </div>
        <div class="item">
          <div class="head">
            <div class="icon"></div>
            <span>Round Progress</span>
          </div>
          <div class="num">
            <span class="color">{{ latestBlockNumber - roundInfo.first }}</span
            >/{{ roundInfo.length }}
          </div>
        </div>
      </div>
      <div class="rank-wrap">
        <div class="rank">
          <div class="rank-title">Leaderboard-based on APR</div>
          <a-spin
            style="width: 100%; min-height: 361px"
            :loading="rank1Loading"
          >
            <div
              class="rank-item"
              v-for="(v, i) in apiRankList"
              :key="i"
              :class="{ first: i == 0 }"
            >
              <img
                v-if="i == 0"
                class="bg"
                src="@/assets/images/home/Shadow.png"
                alt=""
              />
              <div class="r-left">
                <img class="num" :src="rankImgList[i]" alt="" />
                <IdentityWrap :address="v.collator">
                  <template #default="{ identity }">
                    <IdentityIcon
                      class="icon"
                      :identity="identity"
                      :address="v.collator"
                      :iconSize="i == 0 ? 48 : 32"
                    ></IdentityIcon>

                    <div class="middle">
                      <a-tooltip :content="v.collator" placement="top">
                        <div class="mt">
                          {{
                            identity.display
                              ? identity.display
                              : $utils.shorterAddress(v.collator)
                          }}
                        </div>
                      </a-tooltip>
                      <div class="mb">
                        <span v-if="ifSafe(v)">Safe</span>
                        <span v-else class="risk">Risk</span>
                        <span class="delegate">Delegated</span>
                      </div>
                    </div>
                  </template>
                </IdentityWrap>
              </div>

              <div class="percent">{{ $utils.roundNumber(v.apr) }}%</div>
            </div>
          </a-spin>
        </div>
        <div class="rank right">
          <div class="rank-title">
            <span> Avg Blocks Leaderboard </span>
            <div class="r-right">
              <span class="rr-title">Caculate Avg Blocks By</span>
              <a-dropdown
                class="leadboard-select-round-dropdown"
                :popup-max-height="false"
                @select="handleSelectRound"
              >
                <div class="dropdown-button">
                  <span>{{ selectRound }} Rounds</span>
                  <img src="@/assets/images/home/arrow_drop_up.png" alt="" />
                </div>
                <template #content>
                  <a-doption v-for="(v, i) in roundsDropdown" :key="i">
                    {{ v }}
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
          <a-spin
            style="width: 100%; min-height: 361px"
            :loading="rank2Loading"
          >
            <div
              class="rank-item"
              v-for="(v, i) in avgBlocksRankList"
              :key="i"
              :class="{ first: i == 0 }"
            >
              <img
                v-if="i == 0"
                class="bg"
                src="@/assets/images/home/Shadow.png"
                alt=""
              />
              <div class="r-left">
                <img class="num" :src="rankImgList[i]" alt="" />
                <IdentityWrap :address="v.collator">
                  <template #default="{ identity }">
                    <IdentityIcon
                      class="icon"
                      :identity="identity"
                      :address="v.collator"
                      :iconSize="i == 0 ? 48 : 32"
                    ></IdentityIcon>

                    <div class="middle">
                      <a-tooltip :content="v.collator" placement="top">
                        <div class="mt">
                          {{
                            identity.display
                              ? identity.display
                              : $utils.shorterAddress(v.collator)
                          }}
                        </div>
                      </a-tooltip>
                      <div class="mb">
                        <span v-if="ifSafe(v)">Safe</span>
                        <span v-else class="risk">Risk</span>
                        <span class="delegate">Delegated</span>
                      </div>
                    </div>
                  </template>
                </IdentityWrap>
              </div>
              <div class="percent">
                {{ $utils.roundNumber(v[`avgBlockIn${this.selectRound}R`]) }}
              </div>
            </div>
          </a-spin>
        </div>
      </div>
      <Table :ifSafe="ifSafe" />
    </div>
  </div>
</template>

<script>
import {
  collatorStatistics,
  getLatestBlockNumber,
  getCurrentRoundInfo,
  networkStatistics,
  getSafeStateConfig,
} from "@/api/staking";
import IdentityWrap from "@/components/IdentityWrap";
import IdentityIcon from "@/components/IdentityIcon";
import Table from "./Table";
export default {
  components: {
    Table,
    IdentityWrap,
    IdentityIcon,
  },
  data() {
    return {
      // {"max":64,"collatorSafeStateThreshold":0.9}
      safeStateConfig: {},
      latestBlockNumber: null,
      networkInfo: {},
      roundInfo: {
        current: null,
        first: null,
        length: null,
        totalIssuance: null,
      },
      rank1Loading: false,
      rank2Loading: false,
      apiRankList: [],
      avgBlocksRankList: [],
      selectRound: 10,
      roundsDropdown: [1, 3, 4, 5, 8, 10],
      rankImgList: [
        require("@/assets/images/home/1st.png"),
        require("@/assets/images/home/2nd.png"),
        require("@/assets/images/home/3rd.png"),
        require("@/assets/images/home/4th.png"),
        require("@/assets/images/home/5th.png"),
      ],
    };
  },
  created() {
    this.getSafeStateConfig();
    this.getLatestBlockNumber();
    this.getRoundInfo();
    this.getNetworkStatistics();
    this.rank1Loading = true;
    collatorStatistics({
      pageSize: 5,
      pageIndex: 1,
      orderBys: [{ sort: "aprRank", order: "DESC" }],
      chainId: this.$store.state.global.currentChain.id,
    }).then((d) => {
      this.rank1Loading = false;
      this.apiRankList = d.list;
    });
    this.getAvgBlocksRankList();
  },
  methods: {
    ifSafe(v) {
      if (
        v.totalStakeRank >=
        this.safeStateConfig.max *
          this.safeStateConfig.collatorSafeStateThreshold
      ) {
        return false;
      }
      return true;
    },
    getSafeStateConfig() {
      getSafeStateConfig({
        chainId: this.$store.state.global.currentChain.id,
      }).then((d) => {
        this.safeStateConfig = d;
      });
    },
    getNetworkStatistics() {
      networkStatistics().then((d) => {
        this.networkInfo = d.find(
          (v) => v.chainId == this.$store.state.global.currentChain.id
        );
      });
    },
    getLatestBlockNumber() {
      getLatestBlockNumber({
        chainId: this.$store.state.global.currentChain.id,
      }).then((d) => {
        this.latestBlockNumber = d;
      });
    },
    getRoundInfo() {
      getCurrentRoundInfo({
        chainId: this.$store.state.global.currentChain.id,
      }).then((d) => {
        this.roundInfo = d;
      });
    },
    getAvgBlocksRankList() {
      this.rank2Loading = true;
      collatorStatistics({
        pageSize: 5,
        pageIndex: 1,
        orderBys: [{ sort: `avgBlockIn${this.selectRound}R`, order: "DESC" }],
        chainId: this.$store.state.global.currentChain.id,
      }).then((d) => {
        this.rank2Loading = false;
        this.avgBlocksRankList = d.list;
      });
    },
    handleSelectRound(v) {
      this.selectRound = v;
      this.getAvgBlocksRankList();
    },
  },
};
</script>

<style lang="less" scoped>
.moobeam-leaderboard-page {
  padding: 24px 20px 37px 20px;
  .risk {
    color: #e31a1a;
  }
  .big-title {
    padding: 40px 11px;
    font-size: 34px;
    color: #2b3674;
    font-weight: 700;
  }
  .info-wrap {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    .item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 21px 16px;
      background: #ffffff;
      border-radius: 20px;
      flex: 1;
      margin-right: 20px;
      &:last-child {
        margin-right: 0;
      }
      .left-icon {
        width: 56px;
        height: 56px;
        margin-right: 19px;
      }
      .right {
        .head {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #a3aed0;

          .icon {
            margin-left: 4px;
            width: 16px;
            height: 16px;
          }
        }
        .value {
          margin-top: 5px;
          font-weight: 700;
          color: #1b2559;
          font-size: 24px;
          .color {
            color: #4318ff;
          }
        }
      }
    }
  }
  .main {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px 28px;
    .main-title {
      font-weight: 700;
      color: #1b2559;
      font-size: 24px;
    }
    .main-info {
      display: flex;
      margin-top: 20px;
      .item {
        margin-right: 93px;
        .head {
          display: flex;
          align-items: center;
          .icon {
            width: 3px;
            height: 8px;
            background: #7551ff;
            border-radius: 2px;
            margin-right: 4px;
          }
          span {
            font-size: 12px;
            color: #a3aed0;
          }
        }
        .num {
          margin-top: 5px;
          font-weight: 700;
          font-size: 24px;
          color: #1b2559;
        }
        .color {
          color: #4318ff;
        }
      }
    }
    .rank-wrap {
      display: flex;
      margin-top: 24px;
      .rank {
        background: #ffffff;
        box-shadow: 0px 50px 309px rgba(210, 208, 225, 0.24),
          0px 20px 129.093px rgba(210, 208, 225, 0.172525),
          0px 10px 69.0192px rgba(210, 208, 225, 0.143066),
          0px 6px 38.6916px rgba(210, 208, 225, 0.12),
          0px 3px 20.5488px rgba(210, 208, 225, 0.0969343),
          0px 1px 8.55082px rgba(210, 208, 225, 0.0674749);
        border-radius: 20px;
        padding: 20px 24px;
        flex: 1;
        margin-right: 20px;
        &.right {
          .rank-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .r-right {
              display: flex;
              align-items: center;
              .rr-title {
                font-weight: 500;
                font-size: 12px;
                line-height: 20px;
                letter-spacing: -0.02em;
                color: #a3aed0;
              }
              .dropdown-button {
                margin-left: 5px;
                display: flex;
                align-items: center;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
                line-height: 24px;
                letter-spacing: -0.02em;
                color: #707eae;
                img {
                  width: 24px;
                }
              }
            }
          }
          .first {
            background: linear-gradient(
              91.25deg,
              #98f4c8 -5.01%,
              #1ccf63 103.03%
            ) !important;
          }
        }
        &:last-child {
          margin-right: 0;
        }
        .rank-title {
          font-weight: 700;
          font-size: 18px;
          color: #2b3674;
        }
        .rank-item {
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          &:last-child {
            margin-bottom: 0;
          }
          &.first {
            margin-bottom: 25px;
            margin-top: 16px;
            background: linear-gradient(135deg, #868cff 0%, #4318ff 100%);
            box-shadow: 0px 18px 40px rgba(154, 152, 255, 0.25);
            border-radius: 10px;
            padding: 12px 20px;
            position: relative;
            .bg {
              pointer-events: none;
              position: absolute;
              height: 72px;
              top: 0;
              right: 0;
            }
            .r-left {
              .num {
                height: 25px;
              }
              .icon {
                width: 48px;
                height: 48px;
                margin-left: 20px;
                margin-right: 12px;
              }
              .middle {
                .mt {
                  font-weight: 700;
                  font-size: 16px;
                  line-height: 24px;
                  color: #ffffff;
                }
                .mb {
                  margin-top: -2px;
                  font-weight: 400;
                  font-size: 12px;
                  line-height: 20px;
                  letter-spacing: -0.02em;
                  color: #fafcfe;
                  .risk {
                    color: inherit;
                  }
                  .delegate {
                    color: inherit;
                  }
                }
              }
            }
            .percent {
              font-weight: 700;
              font-size: 34px;
              line-height: 42px;
              letter-spacing: -0.02em;
              color: #ffffff;
            }
          }
          .r-left {
            display: flex;
            align-items: center;
            .num {
              height: 15px;
            }

            .icon {
              width: 32px;
              height: 32px;
              margin-left: 16px;
              margin-right: 8px;
            }
            .middle {
              .mt {
                font-weight: 400;
                font-size: 14px;
                line-height: 22px;
                letter-spacing: -0.02em;
                color: #47548c;
              }
              .mb {
                margin-top: -2px;
                font-weight: 400;
                font-size: 12px;
                line-height: 20px;
                letter-spacing: -0.02em;
                color: #05cd99;
                .delegate {
                  color: #ffa800;
                  margin-left: 8px;
                }
              }
            }
          }
          .percent {
            font-weight: 700;
            font-size: 20px;
            line-height: 28px;
            letter-spacing: -0.02em;
            color: #4318ff;
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
.leadboard-select-round-dropdown {
  width: 88px;
}
</style>