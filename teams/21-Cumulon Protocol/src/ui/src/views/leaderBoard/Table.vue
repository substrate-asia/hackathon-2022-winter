<template>
  <div class="table-wrap">
    <el-table :data="tableData" ref="table">
      <el-table-column type="expand" fixed width="24">
        <template #default="props">
          <!-- <p>State: {{ props.row.state }}</p> -->
          <div class="expand-content">
            <div class="chart-wrap">
              <div class="title">
                <div class="icon"></div>
                <span class="text">Rewards (last 10 rounds)</span>
              </div>
              <v-chart class="chart" :option="option" />
            </div>
            <div class="rank-wrap">
              <div class="title">
                <div class="icon"></div>
                <span class="text">Top 3 Stake percent delegator</span>
              </div>
              <div class="rank">
                <div v-for="(v, i) in 3" :key="i" class="item">
                  <div class="rank-img-wrap">
                    <img
                      v-if="i == 0"
                      src="@/assets/images/home/Group1.png"
                      alt=""
                    />
                    <img
                      v-if="i == 1"
                      src="@/assets/images/home/Group1(1).png"
                      alt=""
                    />
                    <img
                      v-if="i == 2"
                      src="@/assets/images/home/Group1(2).png"
                      alt=""
                    />
                  </div>
                  <div class="head-icon">
                    <img src="@/assets/images/moonbeam/moonbeam.png" alt="" />
                  </div>
                  <div class="address">0xF97…acewaC</div>
                  <div class="percent">78.07%</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="Collator" fixed width="220">
        <template #default="scope">
          <div class="table-collector">
            <span class="text" :class="'color' + (scope.$index + 1)">{{
              getIndex(scope.$index + 1)
            }}</span>
            <IdentityWrap :address="scope.row.collator">
              <template #default="{ identity }">
                <IdentityIcon
                  class="icon"
                  :identity="identity"
                  :address="scope.row.collator"
                  :iconSize="32"
                ></IdentityIcon>
                <div class="right">
                  <a-tooltip :content="scope.row.collator" placement="top">
                    <div class="top">
                      {{
                        identity.display
                          ? identity.display
                          : $utils.shorterAddress(scope.row.collator)
                      }}
                    </div>
                  </a-tooltip>
                  <div class="bottom">
                    <span class="safe" v-if="ifSafe(scope.row)">Safe</span>
                    <span v-else class="risk">Risk</span>
                    <span class="delegated">Delegated</span>
                  </div>
                </div>
              </template>
            </IdentityWrap>
          </div>
        </template>
      </el-table-column>

      <template v-for="(v, i) in selectColumns" :key="i">
        <el-table-column
          v-if="v.name == 'APR'"
          sortable
          :prop="v.prop"
          :label="v.name"
          :width="v.width"
          :min-width="v['min-width']"
        >
          <template #default="scope">
            <span class="text">{{ scope.row[v.prop] }}%</span>
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="v.tip"
          :prop="v.prop"
          :label="v.name"
          :width="v.width"
          sortable
          :min-width="v['min-width']"
        >
          <template #header>
            <div class="flex-center">
              <span class="text">{{ v.name }}</span>
              <a-tooltip :content="v.tip">
                <img
                  style="width: 16px"
                  src="@/assets/images/moonbeam/Group_47.png"
                  alt=""
                />
              </a-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-else
          sortable
          :prop="v.prop"
          :label="v.name"
          :width="v.width"
          :min-width="v['min-width']"
        />
      </template>

      <el-table-column prop="Action" label="Action" width="150" fixed="right">
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
                            <a-checkbox
                              :disabled="ifCheckboxDisabled(element)"
                              :value="element.name"
                              >{{ element.name }}</a-checkbox
                            >
                          </li>
                        </template>
                      </draggable>
                    </a-checkbox-group>
                  </div>
                  <div class="btn-wrap">
                    <a-button type="outline" @click="comfirmSort()"
                      >Confirm</a-button
                    >
                  </div>
                </div>
              </template>
            </a-popover>
          </div>
        </template>
        <template #default="scope">
          <span class="common-table-option" @click="openDrawer(scope.row)"
            >Simulate</span
          >
          <span @click="handleDelegate(scope.row)" class="common-table-option"
            >Delegate</span
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <a-pagination
        :total="totalCount"
        v-model:current="pageIndex"
        v-model:page-size="pageSize"
        show-total
        show-jumper
      />
    </div>
    <a-drawer
      :width="720"
      :closable="false"
      :header="false"
      :footer="false"
      :visible="drawerVisible"
      @cancel="drawerVisible = false"
      unmountOnClose
    >
      <div class="drawer-content">
        <div class="drawer-title">
          <span class="title">Simulate</span>
          <img
            class="hover-item"
            @click="drawerVisible = false"
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
              <div class="title">Collator Rank</div>
              <div class="value">1790</div>
            </div>
            <div class="state">
              <div class="tag">Safe</div>
              <div class="tag yellow">Delegated</div>
            </div>
          </div>
          <div class="head">
            <div class="icon"></div>
            <span>Stake</span>
          </div>
          <div class="input-wrap">
            <a-input-number
              hide-button
              class="input"
              v-model="inputValue"
              :min="0"
            >
              <template #suffix>
                <span class="input-unit">{{
                  $store.state.global.currentChain.symbols[0]
                }}</span>
              </template>
            </a-input-number>
          </div>
          <div class="slider-wrap">
            <div class="split-wrap">
              <div v-for="v in 4" :key="v" class="split"></div>
            </div>
            <div class="gray-line">
              <div class="blue-line" :style="{ width: '20%' }"></div>
              <div class="g-split" :style="{ left: '20%' }"></div>
              <div class="popover" :style="{ left: '20%' }">
                <img src="@/assets/images/home/Subtract.png" alt="" />
                <div class="center">
                  <div>Rank 28</div>
                  <div>Stake 10056464646</div>
                </div>
              </div>
            </div>
            <div class="mark-wrap">
              <div class="mark-item">
                <div class="rank">Rank 300</div>
                <div class="stake">Stake 80</div>
              </div>
              <div class="mark-item">
                <div class="rank">Rank 270</div>
                <div class="stake">Stake 80</div>
              </div>
              <div class="mark-item">
                <div class="rank">Rank 150</div>
                <div class="stake">Stake 80</div>
              </div>
              <div class="mark-item">
                <div class="rank">Rank 1</div>
                <div class="stake">Stake 80</div>
              </div>
            </div>
          </div>
          <div class="head">
            <div class="icon"></div>
            <span>Reward next round </span>
          </div>
          <div class="range">
            <div class="left">
              <div class="top">
                <span class="num">0.0222222 </span>
                <span class="unit">GLMR</span>
              </div>
              <div class="bottom">Min Estimate Reward</div>
            </div>
            <div class="split">~</div>
            <div class="right">
              <div class="top">
                <span class="num">0.0222222 </span>
                <span class="unit">GLMR</span>
              </div>
              <div class="bottom">Max Estimate Reward</div>
            </div>
          </div>
          <div class="btn-wrap">
            <a-button @click="goToDelegate" class="btn" type="primary"
              >Go to delegate</a-button
            >
          </div>
        </div>
      </div>
    </a-drawer>
    <DelegateDrawer ref="DelegateDrawerRef" />
  </div>
</template>

<script>
import { collatorStatistics } from "@/api/staking";
import IdentityWrap from "@/components/IdentityWrap";
import IdentityIcon from "@/components/IdentityIcon";
import draggable from "vuedraggable";
import DelegateDrawer from "@/components/DelegateDrawer";
export default {
  props: ["ifSafe"],
  components: {
    draggable,
    DelegateDrawer,
    IdentityWrap,
    IdentityIcon,
  },
  data() {
    const defaultDraggableList = [
      {
        name: "Min Bond",
        prop: "minBond",
        "min-width": "140",
        tip: "minimum amount of tokens to delegate candidates once a user is in the set of delegators",
      },
      { name: "Total Stake", prop: "totalStake", "min-width": "140" },
      { name: "Delegator Stake", prop: "state", "min-width": "160" },
      { name: "Self Stake", prop: "state", "min-width": "140" },
      {
        name: "My Stake",
        prop: "state",
        "min-width": "140",
        tip: "my staked amount for this round",
      },
      {
        name: "Avg Blocks",
        prop: "state",
        "min-width": "140",
        tip: "number of blocks which has been rewarded in past 10 rounds( round 65907 - 65916 ). number in the parenthesis is changed as per round.",
      },
      {
        name: "Current Blocks",
        prop: "state",
        "min-width": "180",
        tip: "Blocks produced in the current round 65927. number in the parenthesis is changed as per round.",
      },
      { name: "APR", prop: "apr", "min-width": "140" },
      { name: "Total Rewards", prop: "totalReward", "min-width": "140" },
      { name: "Latest Rewards", prop: "totalReward", "min-width": "160" },
      {
        name: "Avg RPM",
        prop: "state",
        "min-width": "140",
        tip: "Average rewards per LIT for next round. It refers to rewards amount that you will get in the next round if you stake. This indicator is for delegators to find the average estimated rewards under the fixed token quantity.",
      },
      {
        name: "Min RPM",
        prop: "state",
        "min-width": "140",
        tip: "Minimum rewards per LIT for next round. It refers to rewards amount that you will get in the next round if you stake. This indicator is for delegators to find the minimum estimated rewards under the fixed token quantity.",
      },
      {
        name: "Max RPM",
        prop: "state",
        "min-width": "140",
        tip: "Maximum rewards per LIT for next round. It refers to rewards amount that you will get in the next round if you stake. This indicator is for delegators to find the maximum estimated rewards under the fixed token quantity.",
      },
      {
        name: "RPM Volatility Score",
        prop: "state",
        "min-width": "220",
        tip: "The volatility of rewards. We use standard deviation to indicate the volatility of rewards. The less the volatility is, the rewards of nominating this collator are relatively stable(according to the latest 10 rounds)",
      },
    ];
    const defaultCheckboxList = [
      "Total Stake",
      "Avg Blocks",
      "APR",
      "Total Rewards",
      "Latest Rewards",
      "RPM Volatility Score",
    ];
    const leadboardCheckboxList = localStorage.getItem("leadboardCheckboxList");
    const leadboardSavedDragColumns = localStorage.getItem(
      "leadboardSavedDragColumns"
    );
    const leadboardSelectColumns = localStorage.getItem(
      "leadboardSelectColumns"
    );
    return {
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,

      inputValue: 0,
      drawerVisible: false,
      popoverShow: false,
      currentRow: {},
      tableData: [],
      draggableList: JSON.parse(JSON.stringify(defaultDraggableList)),
      checkboxList: leadboardCheckboxList
        ? JSON.parse(leadboardCheckboxList)
        : defaultCheckboxList,
      savedDragColumns: leadboardSavedDragColumns
        ? JSON.parse(leadboardSavedDragColumns)
        : JSON.parse(JSON.stringify(defaultDraggableList)),
      selectColumns: leadboardSelectColumns
        ? JSON.parse(leadboardSelectColumns)
        : JSON.parse(JSON.stringify(defaultDraggableList)),
      option: {
        textStyle: {
          fontFamily: "DM Sans",
        },
        xAxis: {
          type: "category",
          data: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        grid: {
          left: 0,
          top: 5,
          right: 20,
          bottom: 0,
        },
        yAxis: {
          type: "value",
          show: false,
        },
        tooltip: {
          formatter: (params) => {
            return `
            <div>
              <div style="font-weight: 500;font-size: 12px;line-height: 20px;letter-spacing: -0.02em;color: #A3AED0;">${params.name}</div>
              <div style="font-weight: 500;font-size: 20px;line-height: 28px;color: #1B2559;margin-top:1px;">${params.value}</div>
            </div>
            `;
          },
        },
        series: [
          {
            itemStyle: {
              color: "#9374FF",
              borderRadius: 4,
            },
            data: [140, 200, 150, 80, 70, 110, 130, 80, 70, 80],
            type: "bar",
            // barWidth: 24,
          },
          {
            itemStyle: {
              color: "#FF844B",
            },
            lineStyle: {
              color: "#FF844B",
              width: 3,
            },
            data: [140, 200, 150, 80, 70, 110, 130, 80, 70, 80],
            type: "line",
          },
        ],
      },
    };
  },
  created() {
    this.comfirmSort();
    this.getTableData();
  },
  methods: {
    getTableData() {
      this.loading = true;
      collatorStatistics({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        orderBys: [],
        chainId: this.$store.state.global.currentChain.id,
      }).then((d) => {
        this.loading = false;
        this.tableData = d.list;
        // this.totalCount = res.totalCount;
        this.totalCount = 12;
      });
    },
    handleDelegate(row) {
      this.currentRow = row;
      this.goToDelegate();
    },
    goToDelegate() {
      this.$refs.DelegateDrawerRef.init(this.currentRow);
    },
    ifCheckboxDisabled(v) {
      if (v.name == "My Stake" && !this.$store.getters.ifLogin) {
        return true;
      }
      return false;
    },
    openDrawer(row) {
      this.currentRow = row;
      this.drawerVisible = true;
    },
    getIndex(index) {
      if (index < 10) {
        return "0" + index;
      }
      return index;
    },
    clickPopover() {
      this.draggableList = JSON.parse(JSON.stringify(this.savedDragColumns));
      // 若未登录，去掉myStake选项
      const myStakeIndex = this.checkboxList.findIndex((v) => v == "My Stake");
      if (myStakeIndex !== -1 && !this.$store.getters.ifLogin) {
        this.checkboxList.splice(myStakeIndex, 1);
        localStorage.setItem(
          "leadboardCheckboxList",
          JSON.stringify(this.checkboxList)
        );
        this.selectColumns = JSON.parse(
          JSON.stringify(this.savedDragColumns)
        ).filter((v) => {
          return this.checkboxList.find((sv) => sv == v.name);
        });
        localStorage.setItem(
          "leadboardSelectColumns",
          JSON.stringify(this.selectColumns)
        );
      }
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
        "leadboardCheckboxList",
        JSON.stringify(this.checkboxList)
      );
      localStorage.setItem(
        "leadboardSavedDragColumns",
        JSON.stringify(this.savedDragColumns)
      );
      localStorage.setItem(
        "leadboardSelectColumns",
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
  margin-top: 50px;
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
.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
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
  .icon {
    margin-left: 10px;
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
    :deep(.arco-btn) {
      width: 110px;
    }
  }
}
.expand-content {
  padding: 12px 31px;
  background: #f4f7fe;
  border-radius: 10px;
  left: 0;
  right: 0;
  position: sticky;
  width: calc(100vw - 404px);
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
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      letter-spacing: -0.02em;
      color: #47548c;
    }
  }
  .chart-wrap {
    margin-right: 20px;
    flex: 4;
    .chart {
      padding-top: 31px;
      height: 110px;
    }
  }
  .rank-wrap {
    flex: 3;
    .rank {
      margin-top: 12px;
      display: flex;
      align-items: center;
      .item {
        width: 132px;
        height: 138px;
        box-sizing: border-box;
        border-radius: 10px;
        & + .item {
          margin-left: 20px;
        }
        &:nth-child(1) {
          background: rgba(83, 79, 254, 0.9);
        }
        &:nth-child(2) {
          background: rgba(83, 79, 254, 0.7);
        }
        &:nth-child(3) {
          background: rgba(83, 79, 254, 0.5);
        }
        .rank-img-wrap {
          display: flex;
          justify-content: center;
          img {
            display: block;
            width: 76px;
          }
        }
        .head-icon {
          display: flex;
          justify-content: center;
          margin-top: 12px;
          img {
            display: block;
            width: 40px;
            height: 40px;
          }
        }
        .address {
          text-align: center;
          margin-top: 4px;
          font-weight: 400;
          font-size: 14px;
          line-height: 22px;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .percent {
          text-align: center;
          font-weight: 700;
          font-size: 20px;
          line-height: 28px;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
      }
    }
  }
}
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
      position: relative;
      margin-top: 60px;
      .split-wrap {
        top: -3px;
        left: 0;
        right: 0;
        position: absolute;
        display: flex;
        justify-content: space-between;
        .split {
          width: 3px;
          height: 12px;
          background: #e0e5f2;
          border-radius: 2px;
        }
      }
      .gray-line {
        background: #e9edf7;
        height: 6px;
        position: relative;
        .blue-line {
          transition: all 0.4s;
          height: 100%;
          background: linear-gradient(
            270deg,
            #4318ff 5.56%,
            rgba(67, 24, 255, 0) 100%
          );
        }
        .g-split {
          position: absolute;
          width: 3px;
          height: 12px;
          background: #4318ff;
          border-radius: 2px;
          top: -3px;
        }
        .popover {
          font-weight: 500;
          font-size: 12px;
          line-height: 100%;
          color: white;
          padding: 0 12px;
          height: 30px;
          border-radius: 38px;
          position: absolute;
          top: -45px;
          transform: translateX(-50%);
          background: #4318ff;
          display: flex;
          align-items: center;
          img {
            height: 5px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: -4px;
          }
        }
      }
      .mark-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .mark-item {
          margin-top: 16px;
          font-weight: 500;
          font-size: 12px;
          line-height: 20px;
          letter-spacing: -0.02em;
          color: #707eae;
          .rank {
          }
          .stake {
          }
        }
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