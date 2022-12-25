<template>
  <div class="table-wrap">
    <a-spin style="width: 100%" :loading="loading">
      <el-table :data="tableData">
        <el-table-column prop="roundindex" label="RoundIndex" min-width="120" />
        <el-table-column prop="actiontype" label="Action" min-width="120" />
        <el-table-column
          prop="blocknumber"
          label="Block Number"
          min-width="120"
        />
        <el-table-column prop="state" label="Balance Change" min-width="120">
          <template #default="scope">
            {{ $utils.roundNumber(scope.row.balancechange) }}
          </template>
        </el-table-column>
        <el-table-column prop="state" label="Balance Current" min-width="120">
          <template #default="scope">
            {{ $utils.roundNumber(scope.row.balancecurrent) }}
          </template>
        </el-table-column>
      </el-table>
    </a-spin>
    <div class="pagination-wrap">
      <a-pagination
        @change="getList"
        :total="totalCount"
        v-model:current="pageIndex"
        v-model:page-size="pageSize"
        show-total
        show-jumper
      />
    </div>
  </div>
</template>

<script>
import { getCollatorActionHistory } from "@/api/staking";

export default {
  props: ["inputValue"],
  components: {},
  data() {
    return {
      pageIndex: 1,
      pageSize: 10,
      loading: false,
      tableData: [],
      totalCount: 0,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getCollatorActionHistory({
        chainId: this.$store.state.global.currentChain.id,
        collatorAccount: this.inputValue,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      }).then((res) => {
        this.loading = false;
        this.tableData = res.list;
        this.totalCount = res.totalCount;
      });
    },
  },
};
</script>
<style lang="less" scoped>
.table-wrap {
  padding: 4px 24px;
}
.flex-center {
  display: flex;
  align-items: center;
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
.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>