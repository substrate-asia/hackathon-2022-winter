    
<template>
  <div class="table-wrap">
    <a-spin style="width: 100%" :loading="loading">
      <el-table
        :data="
          collectorData.allNominators.slice(
            (pageIndex - 1) * pageSize,
            pageIndex * pageSize
          )
        "
      >
        <el-table-column label="Rank" min-width="90">
          <template #default="scope">
            <div
              class="rank-icon"
              :class="{
                first: scope.row.rank == 1,
                second: scope.row.rank == 2,
                third: scope.row.rank == 3,
              }"
            >
              {{ scope.row.rank < 10 ? "0" + scope.row.rank : scope.row.rank }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="Delegator" min-width="120">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <IdentityWrap :address="scope.row.owner">
                <template #default="{ identity }">
                  <IdentityIcon
                    :identity="identity"
                    :address="scope.row.owner"
                  ></IdentityIcon>
                  <a-tooltip :content="scope.row.owner" placement="top">
                    <span style="margin-left: 8px">{{
                      identity.display
                        ? identity.display
                        : $utils.shorterAddress(scope.row.owner)
                    }}</span>
                  </a-tooltip>
                </template>
              </IdentityWrap>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Stake" min-width="120">
          <template #default="scope">
            {{ $utils.roundNumber(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column label="Percent" min-width="120">
          <template #default="scope"> {{ scope.row.percent }} % </template>
        </el-table-column>
      </el-table>
    </a-spin>
    <div class="pagination-wrap">
      <a-pagination
        :total="collectorData.allNominators.length"
        v-model:current="pageIndex"
        v-model:page-size="pageSize"
        show-total
        show-jumper
      />
    </div>
  </div>
</template>

<script>
import IdentityWrap from "@/components/IdentityWrap";
import IdentityIcon from "@/components/IdentityIcon";

export default {
  props: {
    collectorData: {
      type: Object,
    },
    loading: {
      type: Boolean,
    },
  },
  components: {
    IdentityWrap,
    IdentityIcon,
  },
  data() {
    return {
      pageIndex: 1,
      pageSize: 10,
      marks: {
        0: "Rank 300",
        33: "Rank 270",
        66: "Rank 150",
        100: "Rank 1",
      },
      inputValue: 0,
      drawerVisible: false,
      popoverShow: false,
      currentRow: {},
      tableData: [],
    };
  },
  methods: {},
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
.rank-icon {
  font-weight: 700;
  font-size: 16px;
  line-height: 28px;
  letter-spacing: -0.02em;
  color: #b0bbd5;
  &.first {
    color: #ffa800;
  }
  &.second {
    color: #707eae;
  }
  &.third {
    color: #cf8080;
  }
}
.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>