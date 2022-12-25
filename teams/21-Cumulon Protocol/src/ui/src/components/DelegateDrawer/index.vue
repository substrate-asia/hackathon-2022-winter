<template>
  <a-drawer
    :width="520"
    :closable="false"
    :header="false"
    :footer="false"
    :visible="visible"
    @cancel="visible = false"
    unmountOnClose
  >
    <div class="drawer-content">
      <div class="drawer-title">
        <span class="title">Delegate</span>
        <img
          class="hover-item"
          @click="visible = false"
          src="@/assets/images/moonbeam/Vector1.png"
          alt=""
        />
      </div>
      <div class="drawer-main">
        <div class="info-wrap">
          <div class="collector">
            <img src="@/assets/images/moonbeam/moonbeam.png" alt="" />
            <div class="right">
              <div class="title">Collator</div>
              <div class="value">Jetblue-125</div>
            </div>
          </div>
          <div class="rank">
            <div class="title">Already Staked</div>
            <div class="value">
              <span> 1790 </span>
              <span class="unit">{{
                $store.state.global.currentChain.symbols[0]
              }}</span>
            </div>
          </div>
        </div>
        <div class="head">
          <div class="icon"></div>
          <span>Stake</span>
        </div>
        <div class="input-wrap">
          <a-input-number hide-button class="input" v-model="num" :min="0">
            <template #suffix>
              <span class="input-unit">{{
                $store.state.global.currentChain.symbols[0]
              }}</span>
            </template>
          </a-input-number>
        </div>
        <div class="min-bond-tip">
          The minimum delegation amount is <span class="blue">xx</span> GLMR
        </div>
        <div class="btn-wrap">
          <a-button
            :loading="btnLoading"
            class="btn"
            type="primary"
            @click="confirm"
            >Confirm</a-button
          >
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromAddress, web3Enable } from "@polkadot/extension-dapp";
import { BigNumber } from "bignumber.js";

export default {
  data() {
    return {
      minBond: 50,
      isDelegateMore: false,
      btnLoading: false,
      address: "",
      visible: false,
      num: 1,
      apiPromise: null,
    };
  },
  async created() {
    const wsProvider = new WsProvider(
      this.$store.state.global.currentChain.wssEndpoints
    );
    const api = await ApiPromise.create({
      provider: wsProvider,
    });
    this.apiPromise = api;
  },

  methods: {
    multiplyDecimals(value) {
      return BigNumber(value)
        .multipliedBy(
          new BigNumber(
            "1e" + this.$store.state.global.currentChain.decimals[0]
          )
        )
        .toString();
    },
    init(row, isMore) {
      this.visible = true;
      this.address = row.address;
      if (isMore) {
        this.num = 1;
      } else {
        this.num = this.minBond;
      }
      this.isDelegateMore = isMore;
    },
    async confirm() {
      if (this.num <= 0) {
        this.$message.error("Please enter a number greater than 0");
        return;
      }
      if (!this.isDelegateMore && this.num < this.minBond) {
        this.$message.error("The minimum delegate is " + this.minBond);
        return;
      }
      this.btnLoading = true;
      await web3Enable(`Go Staking`);
      const injector = await web3FromAddress(
        this.$store.getters.currentChainWalletAddress
      );
      if (this.isDelegateMore) {
        await this.apiPromise.tx.parachainStaking
          .delegatorBondMore(this.address, this.multiplyDecimals(this.num))
          .signAndSend(
            this.$store.getters.currentChainWalletAddress,
            { signer: injector.signer },
            ({ status }) => {
              if (status.isInBlock) {
                this.visible = false;
                this.btnLoading = false;
                this.$message.success("Delegate success");
                this.$emit("success");
                console.log(
                  `Completed at block hash #${status.asInBlock.toString()}`
                );
              } else {
                console.log(`Current status: ${status.type}`);
              }
            }
          )
          .catch((error) => {
            this.btnLoading = false;
            this.$message.error("transaction failed" + error);
            console.log(":( transaction failed", error);
          });
      } else {
        const candidateInfoBack =
          await this.apiPromise.query.parachainStaking.candidateInfo(
            this.address
          );
        const candidateInfo = candidateInfoBack.toHuman();
        const delegationCount = candidateInfo.delegationCount;
        const delegatorInfo =
          await this.apiPromise.query.parachainStaking.delegatorState(
            this.$store.getters.currentChainWalletAddress
          );
        let myDelegationCount = 0;
        if (delegatorInfo.toHuman()) {
          myDelegationCount = delegatorInfo.toHuman()["delegations"].length;
        }

        let delegateTx = null;
        if (this.$store.state.global.currentChain.network == "litentry") {
          delegateTx = await this.apiPromise.tx.parachainStaking.delegate(
            this.address,
            this.multiplyDecimals(this.num)
          );
        } else {
          delegateTx = await this.apiPromise.tx.parachainStaking.delegate(
            this.address,
            this.multiplyDecimals(this.num),
            delegationCount,
            myDelegationCount
          );
        }

        delegateTx
          .signAndSend(
            this.$store.getters.currentChainWalletAddress,
            { signer: injector.signer },
            ({ status }) => {
              if (status.isInBlock) {
                this.visible = false;
                this.btnLoading = false;
                this.$message.success("Delegate success");
                this.$emit("success");
                console.log(
                  `Completed at block hash #${status.asInBlock.toString()}`
                );
              } else {
                console.log(`Current status: ${status.type}`);
              }
            }
          )
          .catch((error) => {
            this.btnLoading = false;
            this.$message.error("transaction failed" + error);
            console.log(":( transaction failed", error);
          });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.drawer-content {
  letter-spacing: -0.02em;
  padding: 10px 14px;
  .drawer-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-weight: 700;
      font-size: 34px;
      color: #2b3674;
    }
    img {
      width: 15px;
      height: 15px;
    }
  }
  .drawer-main {
    .info-wrap {
      margin-top: 26px;
      display: flex;
      .collector {
        flex: 3;
        border-right: 1px dashed #e0e5f2;
        display: flex;
        align-items: center;
        img {
          margin-right: 11px;
          width: 56px;
          height: 56px;
        }
        .right {
          .title {
            font-size: 14px;
            color: #8f9bba;
          }
          .value {
            font-weight: 700;
            font-size: 24px;
            color: #1b2559;
          }
        }
      }
      .rank {
        flex: 2;
        padding-left: 20px;
        .title {
          font-size: 14px;
          color: #8f9bba;
        }
        .value {
          font-weight: 700;
          font-size: 24px;
          color: #1b2559;
          .unit {
            font-weight: 400;
            font-size: 12px;
            line-height: 24px;
            letter-spacing: -0.02em;
            color: #707eae;
          }
        }
      }
      .state {
        flex: 2;
        display: flex;
        align-items: center;
        padding-left: 20px;
        .tag {
          width: 79px;
          height: 36px;
          background: rgba(5, 205, 153, 0.1);
          border-radius: 7px;
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          letter-spacing: -0.02em;
          color: #05cd99;
          display: flex;
          align-items: center;
          justify-content: center;
          &.yellow {
            background: rgba(255, 168, 0, 0.1);
            color: #ffa800;
            margin-left: 8px;
          }
        }
      }
    }
    .head {
      margin-top: 60px;
      display: flex;
      align-items: center;
      .icon {
        width: 4px;
        height: 16px;
        background: #7551ff;
        border-radius: 2px;
        margin-right: 4px;
      }
      span {
        font-weight: 700;
        font-size: 24px;
        color: #2b3674;
      }
    }
    .input-unit {
      font-weight: 400;
      font-size: 18px;
      line-height: 30px;
      letter-spacing: -0.02em;
      color: #b0bbd5;
    }
    .input-wrap {
      margin-top: 16px;
      /deep/ .arco-input {
        font-weight: 500;
        font-size: 24px;
        letter-spacing: -0.02em;
        color: #1b2559;
      }
      .input {
        padding: 2px 16px;
        width: 100%;
        height: 48px;
        background: #f4f7fe;
        border-radius: 4px;
      }
      /deep/ .arco-input-focus {
        background: white;
      }
    }
    .min-bond-tip {
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: #8f9bba;
      .blue {
        color: #4318ff;
      }
    }
    .btn-wrap {
      margin-top: 80px;
      text-align: center;
      .btn {
        width: 375px;
        height: 46px;
      }
    }
  }
}
</style>