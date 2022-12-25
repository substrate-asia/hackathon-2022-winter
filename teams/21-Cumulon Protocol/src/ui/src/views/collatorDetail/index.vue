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
        <span> Round xxx-Collator Leaderboard</span>
        <img
          class="hover-item"
          src="@/assets/images/home/keyboard_arrow_right(1).png"
          alt=""
        />
      </div>
      <div class="rank-list">
        <div class="item" v-for="(v, i) in rankImgList" :key="i">
          <div class="i-left">
            <div class="num-icon-wrap">
              <img class="num" :src="v" alt="" />
            </div>
            <img class="icon" src="@/assets/images/home/Group7(1).png" alt="" />
            <span class="address">0x1245…1470fs</span>
            <img
              class="copy hover-item"
              src="@/assets/images/home/copy2.png"
              alt=""
            />
          </div>
          <div class="i-middle">
            <div class="safe">Safe</div>
            <div class="delegated">Delegated</div>
          </div>
          <div class="i-right">
            <div class="ir-left">
              <div class="apr">APR</div>
              <span class="percent">12.78%</span>
            </div>
            <img
              class="arrow hover-item"
              src="@/assets/images/home/keyboard_arrow_right(1).png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!ifDefault && !collectorData.id && !loading" class="none">
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
          <img class="icon" src="@/assets/images/home/Group7(1).png" alt="" />
          <span class="text">1800</span>
          <span class="unit">Rank</span>
        </div>
        <div class="item">
          <img
            class="left-icon"
            src="@/assets/images/home/Group1(4).png"
            alt=""
          />
          <div class="right">
            <div class="head">
              <span> Self-Bonded </span>
            </div>
            <div class="value">
              <span> {{ $utils.roundNumber(collectorData.bond) }} </span>
              <span class="unit">{{
                $store.state.global.currentChain.symbols[0]
              }}</span>
            </div>
          </div>
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
              <span> {{ $utils.roundNumber(collectorData.TotalBonded) }} </span>
              <span class="unit">{{
                $store.state.global.currentChain.symbols[0]
              }}</span>
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
          <a-tab-pane :key="1" title="Delegator"></a-tab-pane>
          <a-tab-pane :key="2" title="Reward"></a-tab-pane>
          <a-tab-pane :key="3" title="Action"></a-tab-pane>
        </a-tabs>
        <DelegatorTable
          :collectorData="collectorData"
          :inputValue="inputValue"
          :loading="loading"
          v-if="tabKey == 1"
        />
        <RewardTable v-if="tabKey == 2" :inputValue="inputValue" />
        <ActionTable v-if="tabKey == 3" :inputValue="inputValue" />
      </div>
    </div>
  </div>
</template>

<script>
import DelegatorTable from "./DelegatorTable";
import RewardTable from "./RewardTable";
import ActionTable from "./ActionTable";
import {
  getCollatorRewardStatistic,
  getRealtimeCollatorState,
} from "@/api/staking";
import { BigNumber } from "bignumber.js";

export default {
  components: {
    DelegatorTable,
    RewardTable,
    ActionTable,
  },
  data() {
    return {
      loading: false,
      inputValue: "49d8PJE2QUMqoQugP5m2xL76hp4usgxE4KnGBvFnDnQNLk8a",
      ifDefault: true,
      tabKey: 1,
      collectorData: {
        allNominators: [],
      },
      rewardData: {
        latestReward: 0,
        totalReward: 0,
      },
      rankImgList: [
        require("@/assets/images/home/1st.png"),
        require("@/assets/images/home/2nd.png"),
        require("@/assets/images/home/3rd.png"),
        require("@/assets/images/home/4th.png"),
        require("@/assets/images/home/5th.png"),
      ],
    };
  },
  created() {},
  methods: {
    getCollectDetailData() {
      this.loading = true;
      getRealtimeCollatorState({
        chainId: this.$store.state.global.currentChain.id,
        collators: [this.inputValue],
      }).then((d) => {
        this.loading = false;
        if (d.length) {
          const data = d[0];
          data.bond = this.formatWithDecimals(data.bond);
          let allAmount = BigNumber(0);
          // 计算Nominator总和
          data.topDelegations.forEach((sv) => {
            sv.amount = this.formatWithDecimals(sv.amount);
            allAmount = allAmount.plus(sv.amount);
          });
          data.topDelegations.forEach((sv) => {
            sv.percent = sv.amount
              .dividedBy(allAmount)
              .multipliedBy(100)
              .toFixed(2);
          });
          data.bottomDelegations.forEach((sv) => {
            sv.amount = this.formatWithDecimals(sv.amount);
            sv.percent = 0;
          });
          data.allNominators = [
            ...data.topDelegations,
            ...data.bottomDelegations,
          ];
          //排序小弟
          data.allNominators.sort((a, b) => {
            const totalB = b.amount;
            const totalA = a.amount;
            const result = totalB.minus(totalA);
            return result;
          });
          for (let index = 0; index < data.allNominators.length; index++) {
            const element = data.allNominators[index];
            element.rank = index + 1;
          }

          // collector Total Bonded
          data.TotalBonded = data.bond.plus(allAmount);
          this.collectorData = data;
        }
      });
    },
    formatWithDecimals(value) {
      return BigNumber(value).dividedBy(
        new BigNumber("1e" + this.$store.state.global.currentChain.decimals[0])
      );
    },
    handleSearch() {
      this.ifDefault = false;
      this.collectorData = {
        allNominators: [],
      };
      getCollatorRewardStatistic({
        chainId: this.$store.state.global.currentChain.id,
        collatorAccount: this.inputValue,
      }).then((resp) => {
        this.rewardData = resp;
      });
      this.getCollectDetailData();
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
    .rank-list {
      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        border: 1px solid #e9edf7;
        border-radius: 8px;
        height: 96px;
        box-sizing: border-box;
        padding: 24px 40px 32px 24px;
        &:nth-child(1) {
          background: linear-gradient(
            90deg,
            #fff9e4 0%,
            rgba(255, 255, 255, 0) 100%
          );
          .num-icon-wrap .num {
            height: 27px !important;
          }
        }
        &:nth-child(2) {
          background: linear-gradient(
            90deg,
            #f8fbff 0%,
            rgba(255, 255, 255, 0) 100%
          );
        }
        &:nth-child(3) {
          background: linear-gradient(
            90deg,
            #fff9f4 0%,
            rgba(255, 255, 255, 0) 100%
          );
        }
        .i-left {
          display: flex;
          align-items: center;
          .num-icon-wrap {
            width: 37px;
            .num {
              height: 21px;
            }
          }
          .icon {
            margin-right: 16px;
            margin-left: 38px;
            height: 48px;
          }
          .address {
            font-weight: 500;
            font-size: 20px;
            line-height: 32px;
            letter-spacing: -0.02em;
            color: #1b2559;
            margin-right: 8px;
          }
          .copy {
            width: 16px;
          }
        }
        .i-middle {
          display: flex;
          align-items: center;
          .safe {
            width: 60px;
            height: 36px;
            background: rgba(5, 205, 153, 0.1);
            border-radius: 8px;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            letter-spacing: -0.02em;
            color: #05cd99;
          }
          .delegated {
            margin-left: 12px;
            width: 79.6px;
            height: 36px;
            background: rgba(255, 168, 0, 0.1);
            border-radius: 8px;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            letter-spacing: -0.02em;
            color: #ffa800;
          }
        }
        .i-right {
          display: flex;
          align-items: center;
          .ir-left {
            display: flex;
            align-items: center;
            .apr {
              margin-right: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 42px;
              height: 24px;
              background: #7551ff;
              border-radius: 4px;
              font-weight: 500;
              font-size: 14px;
              line-height: 24px;
              letter-spacing: -0.02em;
              color: #ffffff;
            }
            .percent {
              font-weight: 700;
              font-size: 34px;
              line-height: 42px;
              letter-spacing: -0.02em;
              color: #47548c;
            }
          }
          .arrow {
            margin-left: 63px;
            width: 24px;
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
        height: 99px;
        position: absolute;
        right: 0;
        top: 0;
      }
      .icon {
        width: 56px;
        margin-right: 12px;
      }
      .text {
        margin-right: 3px;
        font-weight: 700;
        font-size: 20px;
        line-height: 28px;
        letter-spacing: -0.02em;
        color: #ffffff;
      }
      .unit {
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        color: #ffffff;
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