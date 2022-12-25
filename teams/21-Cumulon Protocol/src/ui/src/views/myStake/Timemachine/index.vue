<template>
  <div class="tab-content">
    <div class="charts">
      <div class="line-chart">
        <div class="title">
          <span class="text"> Trend of My Rewards </span>
          <a-tooltip content="This is tooltip content">
            <img
              class="icon"
              src="@/assets/images/moonbeam/Group_47.png"
              alt=""
            />
          </a-tooltip>
        </div>
        <v-chart class="chart" :option="lineChartOption" />
      </div>
      <div class="bar-chart">
        <div class="title">
          <span class="text"> My Mostly-staking collators </span>
          <a-tooltip content="This is tooltip content">
            <img
              class="icon"
              src="@/assets/images/moonbeam/Group_47.png"
              alt=""
            />
          </a-tooltip>
        </div>
        <v-chart class="chart" :option="barChartOption" />
      </div>
    </div>
    <div class="table-title">
      <div class="tab-wrap">
        <div
          class="tab-item"
          :class="{ active: currentTab == 1 }"
          @click="currentTab = 1"
        >
          Staking History
        </div>
        <div
          class="tab-item"
          :class="{ active: currentTab == 2 }"
          @click="currentTab = 2"
        >
          Reward History
        </div>
      </div>
      <div class="select-wrap">
        <a-select allow-clear placeholder="Select Collator">
          <a-option>Beijing</a-option>
          <a-option>Shanghai</a-option>
          <a-option>Guangzhou</a-option>
        </a-select>
        <a-select allow-clear placeholder="Select Round">
          <a-option>Beijing</a-option>
          <a-option>Shanghai</a-option>
          <a-option>Guangzhou</a-option>
        </a-select>
      </div>
    </div>
    <StakingTable v-if="currentTab == 1" />
    <RewardTable v-if="currentTab == 2" />
  </div>
</template>

<script>
import StakingTable from "./StakingTable";
import RewardTable from "./RewardTable";
export default {
  components: {
    StakingTable,
    RewardTable,
  },
  data() {
    return {
      currentTab: 1,
      lineChartOption: {
        textStyle: {
          fontFamily: "DM Sans",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisLine: {
            lineStyle: {
              color: "#E0E5F2",
            },
          },
          axisLabel: {
            color: "#A3AED0",
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dotted",
            },
          },
          axisLine: {
            lineStyle: {
              color: "#E0E5F2",
            },
          },
          axisLabel: {
            color: "#A3AED0",
          },
        },
        grid: {
          left: 5,
          top: 30,
          right: 20,
          bottom: 10,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            lineStyle: {
              color: "#E0E5F2",
            },
          },
          formatter: (params) => {
            return `
            <div>
              <div style="font-weight: 500;font-size: 12px;line-height: 20px;letter-spacing: -0.02em;color: #A3AED0;">${params[0].name}</div>
              <div style="font-weight: 500;font-size: 20px;line-height: 28px;color: #1B2559;margin-top:1px;">${params[0].value}</div>
            </div>
            `;
          },
        },
        series: {
          type: "line",
          symbol: "none",
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(49, 0, 243, 0.3)", // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: "rgba(255, 255, 255, 0)", // 100% 处的颜色
                },
              ],
              global: false, // 缺省为 false
            },
          },
          lineStyle: {
            color: "#4318ff",
            width: 3,
          },
          data: [120, 200, 150, 80, 70, 110, 130],
          smooth: true,
        },
      },
      barChartOption: {
        textStyle: {
          fontFamily: "DM Sans",
        },
        xAxis: {
          type: "value",
          axisLabel: {
            color: "#A3AED0",
          },
          splitLine: {
            lineStyle: {
              type: "dotted",
            },
          },
        },
        yAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: "#E0E5F2",
            },
          },
          axisLabel: {
            color: "#A3AED0",
          },
        },
        grid: {
          left: 5,
          top: 30,
          right: 20,
          bottom: 10,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params) => {
            return `
            <div>
              <div style="font-weight: 500;font-size: 12px;line-height: 20px;letter-spacing: -0.02em;color: #A3AED0;">${params[0].name}</div>
              <div style="font-weight: 500;font-size: 20px;line-height: 28px;color: #1B2559;margin-top:1px;">${params[0].value}</div>
            </div>
            `;
          },
        },
        series: {
          itemStyle: {
            color: "#9374FF",
            borderRadius: 2,
          },
          data: [120, 200, 150, 80, 70, 110, 130],
          type: "bar",
        },
      },
    };
  },
};
</script>

<style lang="less" scoped>
.tab-content {
  padding: 0 24px;
}
.charts {
  margin-top: 10px;
  display: flex;
  .line-chart {
    flex: 1;
    margin-right: 20px;
    background: #f4f7fe;
    border-radius: 12px;
    padding: 20px;
    .title {
      font-weight: 700;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: -0.02em;
      color: #47548c;
      display: flex;
      align-items: center;
      .text {
        margin-right: 4px;
      }
      .icon {
        width: 16px;
      }
    }
    .chart {
      height: 310px;
    }
  }
  .bar-chart {
    margin-left: 10px;
    flex: 1;
    background: #f4f7fe;
    border-radius: 12px;
    padding: 20px;
    .title {
      font-weight: 700;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: -0.02em;
      color: #47548c;
      display: flex;
      align-items: center;
      .text {
        margin-right: 4px;
      }
      .icon {
        width: 16px;
      }
    }
    .chart {
      height: 310px;
    }
  }
}
.table-title {
  margin-top: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .tab-wrap {
    display: flex;
    align-items: center;
    .tab-item {
      cursor: pointer;
      margin-right: 20px;
      font-weight: 400;
      font-size: 20px;
      line-height: 32px;
      letter-spacing: -0.02em;
      color: #a3aed0;
      padding: 7px 12px;
      &:hover {
        color: #4318ff;
      }
      &.active {
        color: #4318ff;
        background: #e9e3ff;
        border-radius: 10px;
      }
    }
  }
  .select-wrap {
    /deep/ .arco-select {
      width: 194px;
      .arco-select-view-input {
        font-weight: 700;
        font-size: 16px;
        letter-spacing: -0.02em;
      }
      & + .arco-select {
        margin-left: 12px;
      }
    }
  }
}
</style>