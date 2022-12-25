<template>
  <div class="home-page">
    <div class="banner" v-if="!$store.getters.ifLogin" @click="goSignIn">
      <div class="left">
        <div class="b-title">
          <div class="row1">Connect Wallet to</div>
          <div class="row2">
            <span> check your staking status </span>
            <img src="@/assets/images/home/Slide-right.png" alt="" />
          </div>
        </div>
        <div class="sub-title">
          Support Litentry; manta; moonriver; moonbeam; bifrost
        </div>
      </div>
      <img class="bg-img" src="@/assets/images/home/Group404.png" alt="" />
    </div>
    <div class="top-row" v-if="$store.getters.ifLogin">
      <div class="base-info section">
        <div class="section-title">My Wallet</div>
        <div class="section-content">
          <div
            v-if="$store.state.global.metamaskWallet.address"
            class="wallet-item"
          >
            <div class="w-left">
              <div class="rect">
                <img
                  class="icon half-scale"
                  src="@/assets/images/home/metamask.png"
                  alt=""
                />
              </div>
              <div class="text-wrap">
                <div class="name">Account</div>
                <div class="address">
                  <a-tooltip
                    :content="$store.state.global.metamaskWallet.address"
                  >
                    <span>{{
                      $utils.shorterAddress(
                        $store.state.global.metamaskWallet.address
                      )
                    }}</span>
                  </a-tooltip>
                </div>
              </div>
            </div>
            <img
              @click="$utils.copy($store.state.global.metamaskWallet.address)"
              class="copy hover-item"
              src="@/assets/images/home/copy.png"
              alt=""
            />
          </div>
          <div
            v-if="$store.state.global.polkadotWallet.address"
            class="wallet-item"
          >
            <div class="w-left">
              <div class="rect">
                <img
                  class="icon half-scale"
                  src="@/assets/images/home/polkadot.png"
                  alt=""
                />
              </div>
              <div class="text-wrap">
                <div class="name">
                  {{ $store.state.global.polkadotWallet.meta.name }}
                </div>
                <div class="address">
                  <a-tooltip
                    :content="$store.state.global.polkadotWallet.address"
                  >
                    <span>{{
                      $utils.shorterAddress(
                        $store.state.global.polkadotWallet.address
                      )
                    }}</span>
                  </a-tooltip>
                </div>
              </div>
            </div>
            <img
              @click="$utils.copy($store.state.global.polkadotWallet.address)"
              class="copy hover-item"
              src="@/assets/images/home/copy.png"
              alt=""
            />
          </div>
          <div class="btn-wrap">
            <div class="btn hover-item" @click="goSwitchWallet">
              Manage Accounts
            </div>
          </div>
        </div>
      </div>
      <div class="assets section">
        <div class="section-title">Assets</div>
        <div class="section-content">
          <div
            v-for="(v, i) in Math.ceil(supportChainList.length / 3)"
            :key="i"
            class="row"
          >
            <div v-for="(sv, si) in getNetworkRow(i)" :key="si" class="item">
              <div class="i-top">
                <div class="rect">
                  <img :src="sv.icon" alt="" />
                </div>
                <span>{{ sv.name }}</span>
              </div>
              <div class="num">
                {{ sv.free == undefined ? "--" : sv.free }}
              </div>
              <div class="tag-wrap">
                <div
                  class="tag"
                  :style="{
                    backgroundColor: sv.tagBgColor,
                    color: sv.tagColor,
                  }"
                >
                  {{ sv.symbols[0] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="$store.getters.ifLogin" class="table section">
      <div class="section-title">My Stake on Parachain</div>
      <div class="section-content">
        <Table></Table>
      </div>
    </div>
    <a-spin
      style="width: 100%; min-height: 335px"
      :loading="!chainStatisticsList.length"
    >
      <div class="card-list">
        <div
          v-for="(v, i) in supportChainList"
          :key="i"
          class="card"
          :style="{
            background: v.bgColor,
          }"
        >
          <img class="bg-img" :src="v.bgIcon" alt="" />
          <div class="card-header">
            <div class="ch-left">
              <div class="circle">
                <img :src="v.icon" alt="" />
              </div>
              <span>{{ v.name }}</span>
            </div>
            <a class="btn" @click="goToLeadboard(v)">
              <img src="@/assets/images/home/Vector(2).png" alt="" />
            </a>
          </div>
          <div class="white-bg">
            <div class="w-left">
              <div class="title">Highest APR</div>
              <div class="value">{{ $utils.roundNumber(v.highestApr) }}%</div>
            </div>
            <div class="w-right">
              <div class="title">Token</div>
              <div
                class="tag"
                :style="{ backgroundColor: v.tagBgColor, color: v.tagColor }"
              >
                {{ v.symbols[0] }}
              </div>
            </div>
          </div>
          <div class="form">
            <div class="form-item">
              <span class="label">Collators Count</span>
              <span class="value">{{ v.collatorCount }}</span>
            </div>
            <div class="form-item">
              <span class="label">Total Staked</span>
              <span class="value">{{ $utils.roundNumber(v.totalStake) }}</span>
            </div>
            <div class="form-item">
              <span class="label">Delegators Count</span>
              <span class="value">{{ v.delegatorCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { networkStatistics } from "@/api/staking";

import Table from "./Table.vue";
export default {
  components: { Table },
  data() {
    return {
      chainStatisticsList: [],
    };
  },
  async created() {
    networkStatistics().then((d) => {
      this.chainStatisticsList = d;
    });
  },
  computed: {
    supportChainList() {
      return this.$store.state.global.supportChainList.map((v) => {
        const find = this.chainStatisticsList.find((sv) => sv.chainId == v.id);
        if (find) {
          return { ...v, ...find };
        }
        return v;
      });
    },
  },
  methods: {
    goToLeadboard(v) {
      this.$store.commit("changeCurrentChain", v);
      this.$router.push({
        name: "leaderBoard",
      });
    },
    getNetworkRow(i) {
      const arr = [];
      this.supportChainList.forEach((sv, si) => {
        if (si >= 3 * i && si < 3 * (i + 1)) {
          arr.push(sv);
        }
      });
      return arr;
    },
    goSignIn() {
      this.$eventBus.emit("goSignIn");
    },
    goSwitchWallet() {
      this.$eventBus.emit("goSignIn", true);
    },
  },
};
</script>

<style lang="less" scoped>
.home-page {
  .banner {
    width: 100%;
    height: 160px;
    box-sizing: border-box;
    border-radius: 20px;
    background: linear-gradient(135deg, #868cff 0%, #4318ff 100%);
    padding: 36px 0 29px 48px;
    position: relative;
    cursor: pointer;
    .left {
      .b-title {
        font-weight: 500;
        font-size: 28px;
        line-height: 32px;
        letter-spacing: -0.02em;
        color: #eff4fb;
        .row2 {
          display: flex;
          align-items: center;
        }
        img {
          width: 24px;
          margin-left: 8px;
        }
      }
      .sub-title {
        margin-top: 11px;
        font-weight: 500;
        font-size: 12px;
        line-height: 20px;
        letter-spacing: -0.02em;
        color: #fafcfe;
      }
    }
    .bg-img {
      position: absolute;
      width: 315px;
      top: 0;
      right: 160px;
    }
  }
  .section {
    background: #ffffff;
    border-radius: 20px;
    .section-title {
      font-weight: 700;
      font-size: 20px;
      line-height: 32px;
      letter-spacing: -0.02em;
      color: #1b2559;
      padding-top: 20px;
      padding-left: 24px;
    }
  }
  .top-row {
    display: flex;
  }
  .base-info {
    margin-right: 20px;
    flex: 1;
    .section-content {
      padding: 24px;
      .wallet-item {
        padding: 11px 12px;
        border: 1px solid #e9edf7;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        .w-left {
          display: flex;
          align-items: center;
          .rect {
            width: 46px;
            height: 46px;
            background: #f4f7fe;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
          }
          .text-wrap {
            .name {
              font-weight: 700;
              font-size: 16px;
              line-height: 28px;
              letter-spacing: -0.02em;
              color: #1b2559;
            }
            .address {
              font-weight: 500;
              font-size: 12px;
              line-height: 20px;
              letter-spacing: -0.02em;
              color: #a3aed0;
            }
          }
        }
        .copy {
          margin-right: 4px;
          width: 16px;
        }
      }
      .btn-wrap {
        text-align: center;
        .btn {
          display: inline-block;
          background: #f4f7fe;
          border-radius: 70px;
          padding: 4px 21px;
          font-weight: 500;
          font-size: 14px;
          line-height: 24px;
          text-align: center;
          letter-spacing: -0.02em;
          color: #4318ff;
        }
      }
    }
  }
  .assets {
    flex: 2;
    .section-content {
      margin-top: -7px;
      padding: 0 24px;
    }
    .row {
      display: flex;
      border-bottom: 1px solid #f4f7fe;
      padding: 20px 0;
      &:last-child {
        border-bottom: 0;
      }
      .item {
        width: 33%;
        box-sizing: border-box;
        &:not(:first-child) {
          border-left: 1px solid #f4f7fe;
          padding-left: 30px;
        }
        .i-top {
          display: flex;
          align-items: center;
          .rect {
            margin-right: 4px;
            width: 20px;
            height: 20px;
            background: #f4f7fe;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
              transform: scale(0.19);
            }
          }
          span {
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            letter-spacing: -0.02em;
            color: #707eae;
          }
        }
        .num {
          margin-top: 8px;
          font-weight: 700;
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.02em;
          color: #1b2559;
        }
        .tag-wrap {
          margin-top: 4px;
          .tag {
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            letter-spacing: -0.02em;
            padding: 0 8px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 2px;
          }
        }
      }
    }
  }
  .table {
    margin-top: 20px;
  }
  .card-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(357px, 1fr));
    grid-gap: 20px;
    margin-top: 20px;
    padding-bottom: 20px;
    .card {
      overflow: hidden;
      position: relative;
      padding: 24px;
      height: 315px;
      box-sizing: border-box;
      border-radius: 20px;

      .bg-img {
        height: 227px;
        position: absolute;
        right: 0;
        top: 0;
        pointer-events: none;
      }
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .ch-left {
          display: flex;
          align-items: center;
          .circle {
            width: 48px;
            height: 49px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
              display: block;
              transform: scale(0.5);
            }
          }
          span {
            margin-left: 12px;
            font-weight: 700;
            font-size: 24px;
            line-height: 32px;
            letter-spacing: -0.02em;
            color: #1b2559;
          }
        }
        .btn {
          position: relative;
          width: 37px;
          height: 37px;
          background: #ffffff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:hover {
            background: #f6f8fd;
          }
          img {
            transform: scale(0.5);
          }
        }
      }
      .white-bg {
        box-sizing: border-box;
        margin-top: 24px;
        position: relative;
        height: 68px;
        padding: 10px 24px;
        background: #ffffff;
        box-shadow: 0px 18px 40px 4px rgba(112, 144, 176, 0.12);
        border-radius: 12px;
        display: flex;
        .w-left {
          flex: 1;
          border-right: 1px solid #f4f7fe;
        }
        .w-right {
          flex: 1;
          padding-left: 24px;
        }
        .title {
          margin-top: 2px;
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          color: #a3aed0;
        }
        .value {
          font-weight: 700;
          font-size: 20px;
          line-height: 28px;
          letter-spacing: -0.02em;
          color: #47548c;
        }
        .tag {
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          letter-spacing: -0.02em;
          padding: 0 8px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 2px;
        }
      }
      .form {
        margin-top: 33px;
        .form-item {
          display: flex;
          justify-content: space-between;
          & + .form-item {
            margin-top: 12px;
          }
          .label {
            font-weight: 500;
            font-size: 14px;
            line-height: 22px;
            color: #a3aed0;
          }
          .value {
            font-weight: 700;
            font-size: 14px;
            line-height: 22px;
            text-align: right;
            letter-spacing: -0.02em;
            color: #47548c;
          }
        }
      }
    }
  }
}
</style>