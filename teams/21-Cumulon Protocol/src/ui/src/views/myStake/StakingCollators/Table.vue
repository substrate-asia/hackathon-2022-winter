<template>
  <div class="table-wrap">
    <el-table :data="tableData">
      <el-table-column prop="date" label="Collator" fixed width="220">
        <template #default="scope">
          <div class="table-collector">
            <img src="@/assets/images/moonbeam/moonbeam.png" alt="" />
            <div class="right">
              <div class="top">jetblue-125</div>
              <div class="bottom">
                <span class="safe">Safe</span>
                <!-- <span class="risk">Risk</span> -->
                <span class="delegated">Delegated</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <template v-for="(v, i) in selectColumns" :key="i">
        <el-table-column :prop="v.prop" :label="v.name" :width="v.width" />
      </template>

      <el-table-column prop="Action" label="Action" width="200" fixed="right">
        <template #header>
          <div class="flex-center" style="flex: 1">
            <span class="text">Action</span>
            <a-popover
              v-model:popup-visible="popoverShow"
              trigger="click"
              position="br"
            >
              <img
                @click="clickPopover"
                class="table-option-icon"
                src="@/assets/images/moonbeam/Frame_67.png"
                alt=""
              />
              <template #content>
                <div class="table-option-content">
                  <div class="title">Select Incidators</div>
                  <div class="sort-list">
                    <a-checkbox-group v-model="checkboxList">
                      <draggable
                        tag="ul"
                        :list="draggableList"
                        class="list-group"
                        handle=".handle"
                        item-key="name"
                      >
                        <template #item="{ element, index }">
                          <li class="list-group-item">
                            <img
                              class="icon handle"
                              src="@/assets/images/moonbeam/Glyph_move.png"
                              alt=""
                            />
                            <a-checkbox :value="element.name">{{
                              element.name
                            }}</a-checkbox>
                          </li>
                        </template>
                      </draggable>
                    </a-checkbox-group>
                  </div>
                  <div class="btn-wrap">
                    <a-button type="outline" @click="comfirmSort"
                      >Confirm</a-button
                    >
                  </div>
                </div>
              </template>
            </a-popover>
          </div>
        </template>
        <template #default="scope">
          <span class="common-table-option" @click="handleDelegate(scope.row)"
            >Delegate</span
          >
          <span
            @click="handleUnstake(scope.row)"
            v-if="scope.$index == 0"
            class="common-table-option"
            >Unstake</span
          >

          <span v-if="scope.$index == 1" class="common-table-option excute">
            <span @click="handleExcute(scope.row)"> Excute </span>
            <a-dropdown
              style="width: 69px"
              @select="handleCancelUnstake(scope.row)"
            >
              <div class="dropdown-btn">
                <img
                  src="@/assets/images/home/keyboard_arrow_down.png"
                  alt=""
                />
              </div>
              <template #content>
                <a-doption>Cancel</a-doption>
              </template>
            </a-dropdown>
          </span>
          <a-popover
            v-if="scope.$index == 2"
            position="left"
            class="my-stake-time-popover"
            trigger="click"
          >
            <div class="common-table-option popover-btn">
              <img src="@/assets/images/home/keyboard_arrow_down.png" alt="" />
              <span class="text">
                <span class="num">12</span>
                <span class="unit">d</span>
                <span class="num">00</span>
                <span class="unit">h</span>
                <span class="num">08</span>
                <span class="unit">m</span>
              </span>
            </div>
            <template #content>
              <div class="popover-content">
                <div class="title">When you can manually unstake</div>
                <div class="form-item">
                  <span class="label">Round Index: </span>
                  <span class="value">289</span>
                </div>
                <div class="form-item">
                  <span class="label">Estimated time:</span>
                  <span class="value">2021-12-20 17:58</span>
                </div>
                <div class="form-item">
                  <span class="label"> Estimated time left:</span>
                  <span class="value">20days 20hours 58minutes</span>
                </div>
                <div class="split">
                  <div class="line"></div>
                  <span>or</span>
                  <div class="line"></div>
                </div>
                <div class="btn-wrap">
                  <a-button
                    class="btn"
                    type="outline"
                    @click="handleCancelUnstake(scope.row)"
                    >Cancel request</a-button
                  >
                </div>
              </div>
            </template>
          </a-popover>
        </template>
      </el-table-column>
    </el-table>
    <DelegateDrawer ref="DelegateDrawerRef" />
  </div>
</template>

<script>
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromAddress, web3Enable } from "@polkadot/extension-dapp";

import draggable from "vuedraggable";
import { h } from "vue";
import DelegateDrawer from "@/components/DelegateDrawer";
export default {
  components: {
    draggable,
    DelegateDrawer,
  },
  data() {
    const defaultDraggableList = [
      {
        name: "Collator's Rank",
        prop: "state",
        "min-width": "140",
      },
      { name: "Self Stake", prop: "state", "min-width": "140" },
      { name: "Delegator Stake", prop: "state", "min-width": "140" },
      {
        name: "Total Stake",
        prop: "state",
        "min-width": "140",
      },
      {
        name: "My Stake",
        prop: "state",
        "min-width": "140",
      },
      {
        name: "My Rank",
        prop: "state",
        "min-width": "140",
      },
      {
        name: "My Share",
        prop: "state",
        "min-width": "140",
      },
    ];
    const myStakeCheckboxList = localStorage.getItem("myStakeCheckboxList");
    const myStakeSavedDragColumns = localStorage.getItem(
      "myStakeSavedDragColumns"
    );
    const myStakeSelectColumns = localStorage.getItem("myStakeSelectColumns");
    return {
      leaveDelegatorsDelay: 0,
      popoverShow: false,
      currentRow: {},
      tableData: [
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
        {
          date: "2016-05-03",
          name: "Tom",
          state: "California",
          city: "Los Angeles",
          address: "Los Angeles",
          zip: "CA 90036",
        },
      ],
      draggableList: JSON.parse(JSON.stringify(defaultDraggableList)),
      checkboxList: myStakeCheckboxList
        ? JSON.parse(myStakeCheckboxList)
        : defaultDraggableList.map((v) => v.name),
      savedDragColumns: myStakeSavedDragColumns
        ? JSON.parse(myStakeSavedDragColumns)
        : JSON.parse(JSON.stringify(defaultDraggableList)),
      selectColumns: myStakeSelectColumns
        ? JSON.parse(myStakeSelectColumns)
        : JSON.parse(JSON.stringify(defaultDraggableList)),
      apiPromise: null,
    };
  },
  async created() {
    this.comfirmSort();
    const wsProvider = new WsProvider(
      this.$store.state.global.currentChain.wssEndpoints
    );
    const api = await ApiPromise.create({
      provider: wsProvider,
    });
    this.apiPromise = api;
    this.leaveDelegatorsDelay =
      this.apiPromise.consts.parachainStaking.leaveDelegatorsDelay;
  },
  methods: {
    handleUnstake(row) {
      // this.currentRow = row;
      this.currentRow = {
        address: "67D6ecyNhnAzZqgRbxr3MdGnxB9Bw8VadMhjpLAYB3wf5Pq6",
      };
      const { close } = this.$modal.confirm({
        title: "Unstake",
        okText: "Ok",
        closable: true,
        cancelText: "Cancel",
        modalClass: "common-confirm-modal",
        content: () =>
          h("div", [
            h("div", { class: "confirm-modal-close-icon", onClick: close }),
            h(
              "div",
              "Are you sure you want to revoke your delegation to this collator?"
            ),
            h(
              "div",
              { class: "sub-content" },
              `This action will be scheduled for the next ${this.leaveDelegatorsDelay} rounds and then it will have to be manually executed.`
            ),
          ]),
        onOk: () => {
          this.doRevoke();
        },
      });
    },
    async getSign() {
      await web3Enable(`Go Staking`);
      const injector = await web3FromAddress(
        this.$store.getters.currentChainWalletAddress
      );
      return { signer: injector.signer };
    },
    getTxStatus(events) {
      let flag = { success: false, fail: false };
      events.forEach(({ phase, event: { data, method, section } }) => {
        console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
        if (method === "ExtrinsicFailed") {
          flag.fail = true;
        } else if (method === "ExtrinsicSuccess") {
          flag.success = true;
        }
      });
      return flag;
    },
    async doRevoke() {
      const unsub = await this.apiPromise.tx.parachainStaking
        .scheduleRevokeDelegation(this.currentRow.address)
        .signAndSend(
          this.$store.getters.currentChainWalletAddress,
          await this.getSign(),
          ({ events = [], status, txHash }) => {
            // console.log(`Transaction included at blockHash ${status.asFinalized}`);
            txHash && console.log(`Transaction hash ${txHash.toHex()}`);
            console.info(status, ".................");

            if (status && (status.isInBlock || status.isFinalized)) {
              const txStatus = this.getTxStatus(events);
              if (txStatus.success) {
                this.$message.success("Unstake success");
              } else if (txStatus.fail) {
                this.$message.error("Something is wrong");
              }
              unsub();
            }
          }
        )
        .catch((error) => {
          this.$message.error("transaction failed" + error);
          // console.log(":( transaction failed", error);
        });
    },
    async doRequestExecuteRevoke() {
      const unsub = await this.apiPromise.tx.parachainStaking
        .executeDelegationRequest(
          this.$store.getters.currentChainWalletAddress,
          this.currentRow.address
        )
        .signAndSend(
          this.$store.getters.currentChainWalletAddress,
          await this.getSign(),
          ({ events = [], status, txHash }) => {
            // console.log(`Transaction included at blockHash ${status.asFinalized}`);
            txHash && console.log(`Transaction hash ${txHash.toHex()}`);
            console.info(status, ".................");

            if (status && (status.isInBlock || status.isFinalized)) {
              const txStatus = this.getTxStatus(events);
              if (txStatus.success) {
                this.$message.success("Revoke successfully");
              } else if (txStatus.fail) {
                this.$message.error("Something is wrong");
              }
              unsub();
            }
          }
        )
        .catch((error) => {
          this.$message.error("transaction failed" + error);
          // console.log(":( transaction failed", error);
        });
    },
    async doRequestCancelRevoke() {
      const unsub = await this.apiPromise.tx.parachainStaking
        .cancelDelegationRequest(this.currentRow.address)
        .signAndSend(
          this.$store.getters.currentChainWalletAddress,
          await this.getSign(),
          ({ events = [], status, txHash }) => {
            txHash && console.log(`Transaction hash ${txHash.toHex()}`);
            console.info(status, ".................");
            if (status && (status.isInBlock || status.isFinalized)) {
              const txStatus = this.getTxStatus(events);
              if (txStatus.success) {
                this.$message.success("Cancel unstake success");
              } else if (txStatus.fail) {
                this.$message.error("Something is wrong");
              }
              unsub();
            }
          }
        )
        .catch((error) => {
          this.$message.error("transaction failed" + error);
          // console.log(":( transaction failed", error);
        });
    },
    handleDelegate(row) {
      this.currentRow = row;
      this.$refs.DelegateDrawerRef.init(this.currentRow);
    },
    handleExcute(row) {
      this.currentRow = row;
      this.doRequestExecuteRevoke();
    },
    handleCancelUnstake(row) {
      // this.currentRow = row;
      this.currentRow = {
        address: "67D6ecyNhnAzZqgRbxr3MdGnxB9Bw8VadMhjpLAYB3wf5Pq6",
      };
      const { close } = this.$modal.confirm({
        title: "Cancel Unstake",
        okText: "Ok",
        closable: true,
        cancelText: "Cancel",
        modalClass: "common-confirm-modal",
        content: () =>
          h("div", [
            h("div", { class: "confirm-modal-close-icon", onClick: close }),
            h("div", "Are you sure you want to cancel your unstake request?"),
          ]),
        onOk: () => {
          this.doRequestCancelRevoke();
        },
      });
    },

    getIndex(index) {
      if (index < 10) {
        return "0" + index;
      }
      return index;
    },
    clickPopover() {
      this.draggableList = JSON.parse(JSON.stringify(this.savedDragColumns));
    },
    comfirmSort() {
      this.popoverShow = false;
      this.savedDragColumns = JSON.parse(JSON.stringify(this.draggableList));
      this.selectColumns = JSON.parse(
        JSON.stringify(this.savedDragColumns)
      ).filter((v) => {
        return this.checkboxList.find((sv) => sv == v.name);
      });
      localStorage.setItem(
        "myStakeCheckboxList",
        JSON.stringify(this.checkboxList)
      );
      localStorage.setItem(
        "myStakeSavedDragColumns",
        JSON.stringify(this.savedDragColumns)
      );
      localStorage.setItem(
        "myStakeSelectColumns",
        JSON.stringify(this.selectColumns)
      );
      // 若宽度不够，防止表格变窄
      // this.$nextTick(() => {
      //   const table = this.$refs.table;
      //   if (this.selectColumns.find((v) => !v.width)) {
      //     return;
      //   }
      //   let totalWidth = 0;
      //   this.selectColumns.forEach((v) => {
      //     totalWidth += Number(v.width);
      //   });
      //   if (
      //     totalWidth +
      //       table.layout.fixedWidth.value +
      //       table.layout.rightFixedWidth.value <
      //     table.layout.bodyWidth.value
      //   ) {
      //     // // 最后一列宽度放开
      //     this.selectColumns[this.selectColumns.length - 1].width = undefined;
      //   }
      // });
    },
  },
};
</script>
<style lang="less" scoped>
.table-wrap {
  margin-top: 40px;
  .dropdown-btn {
    span {
      vertical-align: middle;
    }
    img {
      vertical-align: middle;
      width: 16px;
      margin-left: 4px;
    }
  }
  .popover-btn {
    img {
      vertical-align: middle;
      width: 16px;
      margin-left: 4px;
    }
    .text {
      vertical-align: middle;
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      color: #4318ff;
      .num {
      }
      .unit {
        display: inline-block;
        transform: scale(0.7);
        transform-origin: center 70%;
      }
    }
  }
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .text {
    margin-top: 1px;
    margin-right: 4px;
  }
}
.table-collector {
  display: flex;
  align-items: center;
  .text {
    width: 22px;
    font-weight: 700;
    font-size: 16px;
    color: #b0bbd5;
    &.color1 {
      color: #ffa800;
    }
    &.color2 {
      color: #707eae;
    }
    &.color3 {
      color: #cf8080;
    }
  }
  img {
    margin-right: 8px;
    width: 32px;
    height: 32px;
  }
  .right {
    .top {
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: -0.02em;
      color: #2b3674;
    }
    .bottom {
      margin-top: -2px;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      letter-spacing: -0.02em;
      color: #05cd99;
      .risk {
        color: #e31a1a;
      }
      .delegated {
        color: #ffa800;
        margin-left: 6px;
      }
    }
  }
}
.excute {
  .dropdown-btn {
    display: inline-block;
  }
}
.table-option-content {
  .title {
    text-align: center;
    font-weight: 700;
    font-size: 16px;
    color: #000000;
  }
  .sort-list {
    margin-top: 15px;
    .list-group {
      .list-group-item {
        padding: 6px 10px;
        display: flex;
        align-items: center;
        &.sortable-chosen:not(.sortable-ghost) {
          background: #e9e3ff;
          border-radius: 10px;
        }
        .icon {
          margin-right: 12px;
          width: 16px;
          cursor: move;
        }
        /deep/ .arco-checkbox-label {
          font-size: 13px;
          color: #8f9bba;
        }
      }
    }
  }
  .btn-wrap {
    text-align: center;
    margin-top: 18px;
  }
}
.expand-content {
  padding: 12px 31px;
  background: #f4f7fe;
  border-radius: 10px;
  left: 0;
  right: 0;
  position: sticky;
  width: calc(100vw - 395px);
  display: flex;

  .title {
    display: flex;
    align-items: center;
    .icon {
      margin-right: 4px;
      width: 3px;
      height: 10px;
      background: #7551ff;
      border-radius: 2px;
    }
    .text {
      font-size: 14px;
      color: #a3aed0;
    }
  }
  .chart-wrap {
    flex: 4;
    .chart {
      padding-top: 31px;
      height: 110px;
    }
  }
  .rank-wrap {
    flex: 3;
    .rank {
      margin-left: 20px;
      position: relative;
      .account-wrap {
        display: flex;
        width: 271px;
        margin-bottom: -15px;
        margin-top: 35px;
        .account-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          &:nth-child(1) {
            margin-top: -7px;
          }
          &:nth-child(2) {
            margin-top: -20px;
          }
          .img-wrap {
            img {
              width: 24px;
              height: 24px;
            }
          }
          .account {
            font-size: 12px;
            color: #707eae;
          }
          .percent {
            margin-top: 3px;
            width: 53px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            background: #e9e3ff;
            border-radius: 20px;
            color: #9374ff;
            font-size: 14px;
          }
        }
      }
      .rank-bg {
      }
      .absolute1 {
        position: absolute;
        bottom: 7px;
        left: 130px;
        font-size: 34px;
        font-weight: 700;
        color: #ffffff;
      }
      .absolute2 {
        position: absolute;
        bottom: 5px;
        left: 40px;
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
      }
      .absolute3 {
        position: absolute;
        bottom: 5px;
        left: 10px;
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        bottom: 2px;
        left: 221px;
      }
    }
  }
}
.drawer-content {
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
        border-right: 1px dashed #e0e5f2;
        padding-left: 20px;
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
      .state {
        flex: 2;
        display: flex;
        align-items: center;
        padding-left: 20px;
        .tag {
          width: 74px;
          height: 48px;
          line-height: 48px;
          text-align: center;
          background: rgba(5, 205, 153, 0.1);
          border-radius: 7px;
          font-weight: 700;
          font-size: 24px;
          color: #05cd99;
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
    .input-wrap {
      margin-top: 16px;
      /deep/ .arco-input {
        color: #1b2559;
        font-weight: 700;
        font-size: 34px;
      }
      .input {
        padding-left: 20px;
        padding-right: 20px;
        width: 100%;
        height: 100px;
        background: #f4f7fe;
        border-radius: 10px;
      }
      /deep/ .arco-input-focus {
        background: white;
      }
    }
    .slider-wrap {
      padding: 0 30px;
      margin-top: 60px;
      /deep/ .arco-slider-with-marks {
        padding: 0;
      }
      .slider {
        width: 100%;
      }
    }
    .range {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 42px;
      color: #2200b7;
      .left {
        text-align: left;
        .top {
          display: flex;
          align-items: center;
          .unit {
            margin-left: 7px;
            margin-top: 21px;
            font-size: 14px;
            font-weight: 500;
          }
        }
        .bottom {
          font-weight: 500;
          font-size: 14px;
          color: #8f9bba;
        }
      }
      .split {
      }
      .right {
        text-align: right;
        .top {
          display: flex;
          align-items: center;
          .unit {
            margin-left: 7px;
            margin-top: 21px;
            font-size: 14px;
            font-weight: 500;
          }
        }
        .bottom {
          text-align: left;
          font-weight: 500;
          font-size: 14px;
          color: #8f9bba;
        }
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
<style lang="less">
.my-stake-time-popover {
  .arco-popover-popup-content {
    border-radius: 8px;
    padding: 12px;
    .popover-content {
      .title {
        margin-bottom: 4px;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        letter-spacing: -0.02em;
        color: #47548c;
      }
      .form-item {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        letter-spacing: -0.02em;
        color: #a3aed0;
        .label {
        }
        .value {
          margin-left: 4px;
          color: #707eae;
        }
      }
      .split {
        margin-top: 4px;
        display: flex;
        align-items: center;
        .line {
          flex: 1;
          background: #f4f7fe;
          height: 1px;
        }
        span {
          flex: none;
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          letter-spacing: -0.02em;
          color: #a3aed0;
        }
      }
      .btn-wrap {
        margin-top: 8px;
        text-align: center;
        .btn {
          width: 130px;
          height: 24px;
        }
      }
    }
  }
}
</style>