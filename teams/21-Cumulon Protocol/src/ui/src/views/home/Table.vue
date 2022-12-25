<template>
  <a-spin style="width: 100%" :loading="loading">
    <el-table
      class="home-table"
      :data="formatTableData"
      :span-method="objectSpanMethod"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column class-name="first-col" label="Chain">
        <template #default="scope">
          <div class="chain-cell">
            <div class="rect">
              <img :src="scope.row.icon" alt="" />
            </div>
            <span>{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column class-name="collector-col" label="Staked Collator">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <IdentityWrap :address="scope.row.collator">
              <template #default="{ identity }">
                <IdentityIcon
                  :iconSize="24"
                  :identity="identity"
                  :address="scope.row.collator"
                ></IdentityIcon>
                <a-tooltip :content="scope.row.collator" placement="top">
                  <span style="margin-left: 8px">{{
                    identity.display
                      ? identity.display
                      : $utils.shorterAddress(scope.row.collator)
                  }}</span>
                </a-tooltip>
              </template>
            </IdentityWrap>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Staked Amount">
        <template #default="scope">
          <div class="unit-cell">
            <span class="num">{{
              $utils.roundNumber(scope.row.stakedAmount)
            }}</span>
            <span class="unit">{{ scope.row.symbols[0] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="apr">
        <template #default="scope">
          {{ $utils.roundNumber(scope.row.apr) }}%
        </template>
      </el-table-column>
      <el-table-column sortable prop="rank" label="My Rank" />
      <el-table-column sortable label="Latest Reward">
        <template #default="scope">
          <div class="unit-cell">
            <span class="num">{{
              $utils.roundNumber(scope.row.latestReward)
            }}</span>
            <span class="unit">{{ scope.row.symbols[0] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column sortable label="Total Rewards">
        <template #default="scope">
          <div class="unit-cell">
            <span class="num">{{
              $utils.roundNumber(scope.row.totalReward)
            }}</span>
            <span class="unit">{{ scope.row.symbols[0] }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </a-spin>
</template>

<script>
import IdentityWrap from "@/components/IdentityWrap";
import IdentityIcon from "@/components/IdentityIcon";
import { homeMyStake } from "@/api/staking";
export default {
  components: {
    IdentityWrap,
    IdentityIcon,
  },
  data() {
    return {
      loading: false,
      tableData: [],
    };
  },
  created() {
    // this.tableData = [
    //   ...this.tableData,
    //   ...[
    //     {
    //       chainId: "litentry",
    //       collator: "fGd1ED9fqVp4m2gLYK5oyVq2BY5s6xBBtedBQF6v6wMXfPC",
    //       stakedAmount: 52.710000010001,
    //       totalReward: 2073.3247550582455,
    //       rank: 0,
    //       apr: 0,
    //       rowSpan: 2,
    //     },
    //     {
    //       chainId: "litentry",
    //       collator: "nnd1ED9fqVp4m2gLYK5oyVq2BY5s6xBBtedBQF6v6wMXfPC",
    //       stakedAmount: 52.710000010001,
    //       totalReward: 2073.3247550582455,
    //       rank: 0,
    //       apr: 0,
    //     },
    //   ],
    // ];
    let requestCount = 0;
    const addRequestCount = () => {
      requestCount++;
      if (requestCount == this.$store.state.global.supportChainList.length) {
        this.loading = false;
      }
    };
    this.loading = true;
    for (const v of this.$store.state.global.supportChainList) {
      if (
        this.$utils.ifSupportPolkadot(v.network) &&
        this.$store.state.global.polkadotWallet.address
      ) {
        homeMyStake({
          chainId: v.id,
          accountId: this.$store.state.global.polkadotWallet.address,
        }).then((d) => {
          addRequestCount();
          if (d.length) {
            d[0].rowSpan = d.length;
          }
          this.tableData = [...this.tableData, ...d];
        });
      }
      if (
        !this.$utils.ifSupportPolkadot(v.network) &&
        this.$store.state.global.metamaskWallet.address
      ) {
        homeMyStake({
          chainId: v.id,
          accountId: this.$store.state.global.metamaskWallet.address,
        }).then((d) => {
          addRequestCount();
          if (d.length) {
            d[0].rowSpan = d.length;
          }
          this.tableData = [...this.tableData, ...d];
        });
      }
    }
  },
  computed: {
    formatTableData() {
      const arr = this.tableData.map((v) => {
        const find = this.$store.state.global.supportChainList.find(
          (sv) => sv.id == v.chainId
        );
        if (find) {
          return {
            ...v,
            ...find,
          };
        }
      });
      return arr;
    },
  },
  methods: {
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (row.rowSpan) {
          return {
            rowspan: row.rowSpan,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.home-table {
  padding-bottom: 24px;
  :deep(.el-table__inner-wrapper) {
    th,
    tr,
    td {
      background: transparent !important;
    }
    th {
      border-radius: 0 !important;
    }
    .el-table__cell {
      border-color: #e2e8f0 !important;
    }
    .first-col .cell,
    .collector-col .cell {
      padding-left: 24px;
    }
    td.first-col {
      border-right: 1px solid #e2e8f0;
    }
    .chain-cell {
      display: flex;
      align-items: center;
      .rect {
        margin-right: 8px;
        width: 48px;
        height: 48px;
        background: #f4f7fe;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          transform: scale(0.5);
        }
      }
      span {
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        display: flex;
        align-items: center;
        letter-spacing: -0.02em;
        color: #2b3674;
      }
    }
    .collector-cell {
      display: flex;
      align-items: center;
      img {
        width: 24px;
        margin-right: 4px;
      }
    }
    .unit-cell {
      .unit {
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
        letter-spacing: -0.02em;
        color: #707eae;
        margin-left: 4px;
      }
    }
  }
}
</style>