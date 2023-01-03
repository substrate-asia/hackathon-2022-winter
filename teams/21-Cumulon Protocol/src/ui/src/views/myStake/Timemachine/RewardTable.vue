<template>
  <div class="table-wrap">
    <el-table :data="tableData">
      <el-table-column prop="state" label="Collator" min-width="120">
        <template #default="scope">
          <div class="table-collector">
            <img src="@/assets/images/moonbeam/moonbeam.png" alt="" />
            <span>binance account</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="state" label="Staked Round" min-width="120" />
      <el-table-column prop="state" label="Issued Round" min-width="120" />
      <el-table-column prop="state" label="Issued Block" min-width="120" />
      <el-table-column prop="state" label="Amount" min-width="120" />
      <el-table-column prop="state" label="Timestamp" min-width="120" />
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
    };
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.table-wrap {
  margin-top: 20px;
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