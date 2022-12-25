<template>
  <div class="moobeam-leaderboard-page">
    <div class="info-wrap">
      <div class="item">
        <img class="left-icon" src="@/assets/images/home/Icon(1).png" alt="" />
        <div class="right">
          <div class="head">
            <span> Total Staked </span>
            <a-tooltip content="the amount of tokens that you staked">
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">
            <span> 39,024,467 </span>
            <span class="unit">GLMR</span>
          </div>
        </div>
      </div>
      <div class="item">
        <img
          class="left-icon"
          src="@/assets/images/home/Group1(3).png"
          alt=""
        />
        <div class="right">
          <div class="head">
            <span> Staked Collators </span>
            <a-tooltip content="Number of collators I delegated">
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">39,024,467</div>
        </div>
      </div>
      <div class="item">
        <img class="left-icon" src="@/assets/images/home/Icon(2).png" alt="" />
        <div class="right">
          <div class="head">
            <span> Latest Rewards </span>
            <a-tooltip
              content="the amount of latest rewards that delivered to you"
            >
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">
            <span> 39,024,467 </span>
            <span class="unit">GLMR</span>
          </div>
        </div>
      </div>
      <div class="item">
        <img class="left-icon" src="@/assets/images/home/Icon(3).png" alt="" />
        <div class="right">
          <div class="head">
            <span> Total Rewards </span>
            <a-tooltip content="the amount of tokens that you've been rewarded">
              <img
                class="icon"
                src="@/assets/images/moonbeam/Group_47.png"
                alt=""
              />
            </a-tooltip>
          </div>
          <div class="value">
            <span> 39,024,467 </span>
            <span class="unit">GLMR</span>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <a-tabs class="tabs" v-model:active-key="tabKey">
        <a-tab-pane :key="1" title="Staking Collators"></a-tab-pane>
        <a-tab-pane :key="2" title="Time Machine"></a-tab-pane>
      </a-tabs>
      <StakingCollators v-if="tabKey == 1" />
      <Timemachine v-else />
    </div>
  </div>
</template>

<script>
import StakingCollators from "./StakingCollators";
import Timemachine from "./Timemachine";
export default {
  components: {
    StakingCollators,
    Timemachine,
  },
  data() {
    return {
      tabKey: 1,
    };
  },
};
</script>

<style lang="less" scoped>
.moobeam-leaderboard-page {
  .big-title {
    padding: 40px 11px;
    font-size: 34px;
    color: #2b3674;
    font-weight: 700;
  }
  .info-wrap {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    .item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 21px 16px;
      background: #ffffff;
      border-radius: 20px;
      flex: 1;
      margin-right: 20px;
      &:last-child {
        margin-right: 0;
      }
      .left-icon {
        width: 56px;
        height: 56px;
        margin-right: 19px;
      }
      .right {
        .head {
          display: flex;
          align-items: center;
          font-size: 14px;
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