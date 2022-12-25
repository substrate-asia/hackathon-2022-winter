<template>
  <div class="page">
    <div class="search-wrap">
      <div class="input-wrap">
        <a-input
          v-model="inputValue"
          @press-enter="handleSearch"
          @clear="handleClear"
          placeholder="Please input wallet address"
          allow-clear
        />
      </div>
      <a-button class="btn" type="primary" @click="handleSearch">
        <icon-search />
      </a-button>
    </div>

    <div v-if="ifDefault" class="default">
      <div class="title">
        <span> Round xxx-Delegator Leaderboard</span>
        <img
          class="hover-item"
          src="@/assets/images/home/keyboard_arrow_right(1).png"
          alt=""
        />
      </div>
      <div class="collector-list">
        <div class="collector-item" v-for="(v, i) in 3" :key="i">
          <div class="collector-info">
            <img
              class="headicon"
              src="@/assets/images/moonbeam/moonbeam.png"
              alt=""
            />
            <div class="ci-right">
              <div class="top">
                <span class="address">0x1245…1470fs</span>
                <img
                  class="copy hover-item"
                  src="@/assets/images/home/copy2.png"
                  alt=""
                />
              </div>
              <div class="tag">Collator</div>
            </div>
          </div>
          <div class="delegator-box">
            <div class="delegator-title">
              <span>Top3 Delegators </span>
              <span class="small">(Staked Amount%)</span>
            </div>
            <div class="delegator-item" v-for="(v, i) in 3" :key="i">
              <img class="rank" :src="rankImgList[i]" alt="" />
              <div class="di-left">
                <img
                  class="headicon"
                  src="@/assets/images/moonbeam/moonbeam.png"
                  alt=""
                />
                <span class="address">0x1245…1470fs</span>
                <img
                  class="copy hover-item"
                  src="@/assets/images/home/copy2.png"
                  alt=""
                />
              </div>
              <span class="percent">79%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="
        !ifDefault && rewardData.latestReward === undefined && !loading
      "
      class="none"
    >
      <div class="center">
        <div class="img-wrap">
          <img src="@/assets/images/home/image109.png" alt="" />
        </div>
        <div class="text">Sorry, no data found by Web3go.</div>
        <div class="blue hover-item" @click="ifDefault = true">
          Explore more →
        </div>
      </div>
    </div>
    <div v-else class="has-result">
      <div class="info-wrap">
        <div class="first-item">
          <img class="bg" src="@/assets/images/home/Rectangle612.png" alt="" />
          <IdentityWrap :address="inputValue">
            <template #default="{ identity }">
              <IdentityIcon
                :identity="identity"
                :address="inputValue"
                :iconSize="56"
              ></IdentityIcon>
              <div class="fi-right">
                <span class="name">Delegator</span>
                <div class="fir-bottom">
                  <a-tooltip :content="inputValue" placement="top">
                    <span class="address">{{
                      $utils.shorterAddress(inputValue)
                    }}</span>
                  </a-tooltip>
                  <img
                    class="copy hover-item"
                    @click="$utils.copy(inputValue)"
                    src="@/assets/images/home/copyWhite.png"
                    alt=""
                  />
                </div>
              </div>
            </template>
          </IdentityWrap>
        </div>
        <div class="item">
          <img
            class="left-icon"
            src="@/assets/images/home/Icon(4).png"
            alt=""
          />
          <div class="right">
            <div class="head">
              <span> Total Bonded </span>
            </div>
            <div class="value">
              <span> 39,024,467 </span>
              <span class="unit">GLMR</span>
            </div>
          </div>
        </div>
        <div class="item">
          <img
            class="left-icon"
            src="@/assets/images/home/Icon(5).png"
            alt=""
          />
          <div class="right">
            <div class="head">
              <span> Latest Rewards </span>
            </div>
            <div class="value">
              <span> {{ $utils.roundNumber(rewardData.latestReward) }} </span>
              <span class="unit">{{
                $store.state.global.currentChain.symbols[0]
              }}</span>
            </div>
          </div>
        </div>
        <div class="item">
          <img
            class="left-icon"
            src="@/assets/images/home/Icon(6).png"
            alt=""
          />
          <div class="right">
            <div class="head">
              <span> Total Rewards </span>
            </div>
            <div class="value">
              <span> {{ $utils.roundNumber(rewardData.totalReward) }} </span>
              <span class="unit">{{
                $store.state.global.currentChain.symbols[0]
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="main">
        <a-tabs class="tabs" v-model:active-key="tabKey">
          <a-tab-pane :key="1" title="Reward"></a-tab-pane>
          <a-tab-pane :key="2" title="Action"></a-tab-pane>
        </a-tabs>
        <RewardTable v-if="tabKey == 1" :inputValue="inputValue" />
        <ActionTable v-if="tabKey == 2" :inputValue="inputValue" />
      </div>
    </div>
  </div>
</template>

<script>
import IdentityWrap from "@/components/IdentityWrap";
import IdentityIcon from "@/components/IdentityIcon";
import RewardTable from "./RewardTable";
import ActionTable from "./ActionTable";
import { getDelegatorRewardStatistic } from "@/api/staking";
export default {
  components: {
    RewardTable,
    ActionTable,
    IdentityWrap,
    IdentityIcon,
  },
  data() {
    return {
      rewardData: {
        totalReward: 0,
      },
      inputValue: "4Aoj2JtzjYRizRA2fMxg437gWbUmf5o951ZD11bY7YJSPeAY",
      ifDefault: true,
      tabKey: 1,
      rankImgList: [
        require("@/assets/images/home/Group13.png"),
        require("@/assets/images/home/Group1(6).png"),
        require("@/assets/images/home/Group1(5).png"),
      ],
    };
  },
  created() {},
  methods: {
    getBonded() {
      this.$localforage
        .getItem(this.paraChainName + "CollectorSortList")
        .then((str) => {
          let bondSum = 0;
          if (str) {
            const collectorList = JSON.parse(str);
            for (const c of collectorList) {
              for (const n of c.allNominators) {
                if (n.owner === this.address) {
                  bondSum += Number(n.amount);
                }
              }
            }
          }
          this.bonded = bondSum;
        });
    },
    handleSearch() {
      this.ifDefault = false;
      this.rewardData = {
        totalReward: 0,
      };
      getDelegatorRewardStatistic({
        chainId: this.$store.state.global.currentChain.id,
        delegatorAccount: this.inputValue,
      }).then((resp) => {
        this.rewardData = resp;
      });
      // this.getBonded();
    },
    handleClear() {
      this.ifDefault = true;
    },
  },
};
</script>

<style lang="less" scoped>
.page {
  .big-title {
    padding: 40px 11px;
    font-size: 34px;
    color: #2b3674;
    font-weight: 700;
  }
  .search-wrap {
    display: flex;
    .input-wrap {
      flex: 1;
      :deep(.arco-input-wrapper) {
        border-radius: 20px;
        background: #ffffff;
        padding: 0;
        .arco-input {
          box-sizing: border-box;
          padding: 10px 24px;
          background: #ffffff;
          border-radius: 20px;
          height: 48px;
          font-weight: 400;
          font-size: 18px;
          line-height: 30px;
          letter-spacing: -0.02em;
          color: #707eae;
        }
        .arco-input-clear-btn {
          margin-right: 16px;
        }
      }
    }
    .btn {
      margin-left: 16px;
      flex: none;
      width: 55px;
      height: 48px;
      box-sizing: border-box;
      box-shadow: 0px 26px 10px rgba(67, 24, 255, 0.01),
        0px 15px 9px rgba(67, 24, 255, 0.05),
        0px 7px 7px rgba(67, 24, 255, 0.09), 0px 2px 4px rgba(67, 24, 255, 0.1),
        0px 0px 0px rgba(67, 24, 255, 0.1);
      border-radius: 20px;
      .arco-icon {
        font-size: 20px;
      }
    }
  }
  .none {
    text-align: center;
    background: #ffffff;
    border-radius: 20px;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 230px);
    img {
      width: 160px;
    }
    .text {
      margin-top: 16px;
    }
    .blue {
      margin-top: 8px;
      color: #4318ff;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .default {
    margin-top: 20px;
    background: #ffffff;
    border-radius: 20px;
    padding: 20px 24px 32px;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 700;
      font-size: 20px;
      line-height: 32px;
      letter-spacing: -0.02em;
      color: #1b2559;
      img {
        width: 24px;
      }
    }
    .collector-list {
      margin-top: 20px;
      display: flex;
      .collector-item {
        border: 1px solid #e9edf7;
        border-radius: 8px;
        flex: 1;
        & + .collector-item {
          margin-left: 20px;
        }
        .collector-info {
          background: #f6f8fd;
          border-radius: 8px 8px 0px 0px;
          height: 130px;
          box-sizing: border-box;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          .headicon {
            margin-right: 20px;
            width: 90px;
            height: 90px;
            border-radius: 10px;
          }
          .ci-right {
            .top {
              .address {
                font-weight: 500;
                font-size: 20px;
                line-height: 32px;
                letter-spacing: -0.02em;
                color: #1b2559;
              }
              .copy {
                width: 16px;
                margin-left: 8px;
              }
            }
            .tag {
              margin-top: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #7551ff;
              border-radius: 4px;
              width: 67px;
              height: 24px;
              font-weight: 500;
              font-size: 14px;
              line-height: 24px;
              letter-spacing: -0.02em;
              color: #ffffff;
            }
          }
        }
        .delegator-box {
          padding: 18px 24px 24px;
          .delegator-title {
            margin-bottom: 14px;
            font-weight: 400;
            font-size: 20px;
            line-height: 32px;
            letter-spacing: -0.02em;
            color: #47548c;
            .small {
              font-size: 12px;
            }
          }
          .delegator-item {
            border: 1px solid #e9edf7;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            padding: 26px 18px;
            & + .delegator-item {
              margin-top: 12px;
            }
            .rank {
              position: absolute;
              left: 0;
              top: 0;
              width: 50px;
            }
            .di-left {
              display: flex;
              align-items: center;
              .headicon {
                width: 48px;
                margin-right: 12px;
              }
              .address {
                margin-right: 8px;
                font-weight: 400;
                font-size: 14px;
                line-height: 24px;
                letter-spacing: -0.02em;
                color: #47548c;
              }
              .copy {
                width: 16px;
              }
            }
            .percent {
              font-weight: 700;
              font-size: 24px;
              line-height: 32px;
              text-align: right;
              letter-spacing: -0.02em;
              color: #4318ff;
            }
          }
        }
      }
    }
  }
  .info-wrap {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    .first-item {
      padding: 19px 16px;
      display: flex;
      align-items: center;
      flex: 1;
      position: relative;
      background: linear-gradient(135deg, #868cff 0%, #4318ff 100%), #ffffff;
      border-radius: 20px;
      .bg {
        pointer-events: none;
        height: 99px;
        position: absolute;
        right: 0;
        top: 0;
      }

      .fi-right {
        margin-left: 12px;
        .name {
          font-weight: 500;
          font-size: 14px;
          line-height: 22px;
          color: #ffffff;
        }
        .fir-bottom {
          .address {
            font-weight: 700;
            font-size: 20px;
            line-height: 28px;
            letter-spacing: -0.02em;
            color: #ffffff;
          }
          .copy {
            margin-left: 4px;
            width: 16px;
          }
        }
      }
    }
    .item {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 21px 16px;
      background: #ffffff;
      border-radius: 20px;
      flex: 1;
      margin-left: 20px;

      .left-icon {
        width: 28px;
        margin-right: 12px;
      }
      .right {
        .head {
          line-height: 22px;
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 500;
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
          font-size: 20px;
          line-height: 28px;
          letter-spacing: -0.02em;
          color: #1b2559;
          .unit {
            margin-left: 4px;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            color: #a3aed0;
          }
        }
      }
    }
  }
  .main {
    background: #ffffff;
    border-radius: 20px;
    padding: 20px 0;
    .main-title {
      font-weight: 700;
      color: #1b2559;
      font-size: 24px;
    }
    :deep(.arco-tabs-nav-tab-list) {
      margin-left: 24px;
    }
  }
}
</style>