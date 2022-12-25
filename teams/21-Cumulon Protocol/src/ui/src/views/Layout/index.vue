<template>
  <div class="container">
    <div class="container-side">
      <div class="header">
        <router-link :to="{ name: 'home' }">
          <img class="icon" src="@/assets/images/home/Frame(1).png" alt="" />
        </router-link>
      </div>
      <router-link
        class="home-menu"
        :class="{ active: $route.name == 'home' }"
        :to="{ name: 'home' }"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="#A3AED0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_326_9327)">
            <path
              d="M10.0001 19V14H14.0001V19C14.0001 19.55 14.4501 20 15.0001 20H18.0001C18.5501 20 19.0001 19.55 19.0001 19V12H20.7001C21.1601 12 21.3801 11.43 21.0301 11.13L12.6701 3.59997C12.2901 3.25997 11.7101 3.25997 11.3301 3.59997L2.9701 11.13C2.6301 11.43 2.8401 12 3.3001 12H5.0001V19C5.0001 19.55 5.4501 20 6.0001 20H9.0001C9.5501 20 10.0001 19.55 10.0001 19Z"
            />
          </g>
          <defs>
            <clipPath id="clip0_326_9327">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span>Home</span>
      </router-link>
      <a-dropdown
        class="layout-side-menu-dropdown"
        :popup-max-height="false"
        @select="handleSelectParachain"
      >
        <div
          v-if="$store.state.global.currentChain.network"
          class="dropdown-button hover-item"
        >
          <img
            class="icon"
            :src="$store.state.global.currentChain.icon"
            alt=""
          />
          <span>{{ $store.state.global.currentChain.name }}</span>
          <img
            class="switch"
            :src="require('@/assets/images/home/compare_arrows.png')"
            alt=""
          />
        </div>
        <div v-else class="dropdown-button hover-item choose">
          <span>Choose chain</span>
          <img
            class="down"
            :src="require('@/assets/images/home/downArrow.png')"
            alt=""
          />
        </div>
        <template #content>
          <a-dgroup title="Polkadot & Parachain" v-if="unKusamaList.length">
            <a-doption v-for="(v, i) in unKusamaList" :value="v" :key="i">
              <div class="circle">
                <img :src="v.icon" alt="" />
              </div>
              <span>
                {{ v.name }}
              </span>
            </a-doption>
          </a-dgroup>
          <a-dgroup title="Kusama & Parachain" v-if="kusamaList.length">
            <a-doption v-for="(v, i) in kusamaList" :key="i" :value="v">
              <div class="circle">
                <img :src="v.icon" alt="" />
              </div>
              <span>
                {{ v.name }}
              </span>
            </a-doption>
          </a-dgroup>
        </template>
      </a-dropdown>
      <div class="menu-wrap">
        <a-tooltip
          :popup-visible="
            $store.state.global.currentChain.network ? false : undefined
          "
          background-color="#4318FF"
          position="rt"
          v-for="(v, i) in menu"
          :key="i"
          content="Please select chain frist"
        >
          <div
            v-if="!$store.state.global.currentChain.network"
            class="menu-item"
            style="cursor: not-allowed"
            :class="{ active: $route.name == v.routeName }"
          >
            {{ v.name }}
          </div>
          <div
            v-else
            class="menu-item"
            :class="{ active: $route.name == v.routeName }"
            @click="goToPage(v)"
          >
            {{ v.name }}
          </div>
        </a-tooltip>
      </div>
    </div>
    <div class="container-main">
      <div class="big-title">
        <div>
          <div v-if="$route.name !== 'home'" class="bread">
            {{ $store.state.global.currentChain.name }}/
            {{ $route.meta.title }}
          </div>
          <div class="bt-text">{{ $route.meta.title }}</div>
        </div>
        <a-button
          v-if="
            !$store.state.global.metamaskWallet.address &&
            !$store.state.global.polkadotWallet.address
          "
          @click="handleConnect"
          class="btn"
          type="primary"
        >
          <img
            class="icon"
            src="@/assets/images/home/account_balance_wallet.png"
            alt=""
          />
          <span> Connect </span>
        </a-button>
        <div v-else class="switch-btn hover-item" @click="switchAccount">
          <div v-if="$store.state.global.metamaskWallet.address" class="circle">
            <img
              class="icon metamask"
              src="@/assets/images/home/metamask.png"
              alt=""
            />
          </div>
          <div v-if="$store.state.global.polkadotWallet.address" class="circle">
            <img
              class="icon polkadot"
              src="@/assets/images/home/polkadot.png"
              alt=""
            />
          </div>
          <img
            class="arrow"
            src="@/assets/images/home/arrow_drop_up.png"
            alt=""
          />
        </div>
      </div>
      <div class="cm-content">
        <router-view />
      </div>
    </div>
    <ConnectWalletModal ref="ConnectWalletModalRef" />
  </div>
</template>

<script>
import ConnectWalletModal from "./ConnectWalletModal";
export default {
  components: {
    ConnectWalletModal,
  },
  data() {
    return {
      menu: [
        {
          name: "Leaderboard",
          routeName: "leaderBoard",
        },
        {
          name: "My stake",
          routeName: "myStake",
        },
        {
          name: "Collator Detail",
          routeName: "collatorDetail",
        },
        {
          name: "Delegator Detail",
          routeName: "delegatorDetail",
        },
      ],
    };
  },
  created() {
    this.$eventBus.on("goSignIn", (ifSwitch) => {
      this.$refs.ConnectWalletModalRef.init(ifSwitch);
    });
  },
  computed: {
    unKusamaList() {
      return this.$store.state.global.supportChainList.filter(
        (v) => !this.$utils.ifKusama(v.network)
      );
    },
    kusamaList() {
      return this.$store.state.global.supportChainList.filter((v) =>
        this.$utils.ifKusama(v.network)
      );
    },
  },

  methods: {
    goToPage(v) {
      if (v.routeName == "myStake") {
        // 未登录或者钱包与网络不匹配
        if (
          !this.$store.getters.ifLogin ||
          (this.$utils.ifSupportPolkadot(
            this.$store.state.global.currentChain.network
          ) &&
            !this.$store.state.global.polkadotWallet.address) ||
          (!this.$utils.ifSupportPolkadot(
            this.$store.state.global.currentChain.network
          ) &&
            !this.$store.state.global.metamaskWallet.address)
        ) {
          this.$eventBus.emit("goSignIn");
          return;
        }
      }
      this.$router.push({
        name: v.routeName,
      });
    },
    handleSelectParachain(chainObj) {
      this.$store.commit("changeCurrentChain", chainObj);
    },
    handleConnect() {
      this.$refs.ConnectWalletModalRef.init();
    },
    switchAccount() {
      this.$refs.ConnectWalletModalRef.init(true);
    },
  },
};
</script>
<style lang="less" scoped>
.container {
  height: 100%;
  .container-side {
    z-index: 4;
    position: fixed;
    width: 290px;
    top: 0;
    bottom: 0;
    background: #ffffff;
    .header {
      padding: 49px 62px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f4f7fe;
      .icon {
        cursor: pointer;
        width: 142px;
        margin-right: 7px;
      }
      .text {
      }
    }
    .home-menu {
      display: flex;
      align-items: center;
      margin: 0 24px;
      margin-top: 24px;
      margin-bottom: 16px;
      padding-left: 9px;
      &:hover,
      &.active {
        svg {
          fill: #4318ff;
        }
        span {
          color: #2b3674;
        }
      }
      span {
        margin-left: 12px;
        font-weight: 700;
        font-size: 18px;
        line-height: 44px;
        /* identical to box height, or 244% */

        letter-spacing: -0.02em;

        /* Secondary/Grey/600 */

        color: #a3aed0;
      }
    }
    .dropdown-button {
      padding: 12px 31px;
      margin: 0 24px;
      margin-bottom: 12px;
      background: #ffffff;
      /* Shadows/Soft Shadow/Soft Shadow - Style 1 */
      box-shadow: 0px 18px 40px rgba(112, 144, 176, 0.12);
      border-radius: 61px;
      display: flex;
      align-items: center;
      cursor: pointer;
      &.choose {
        span {
          font-weight: 400;
          font-size: 18px;
          line-height: 30px;
          letter-spacing: -0.02em;
          color: #4318ff;
          margin-right: 34px;
        }
        .down {
          width: 24px;
        }
      }
      .icon {
        width: 36px;
        height: 36px;
      }
      span {
        font-weight: 700;
        font-size: 18px;
        line-height: 30px;
        letter-spacing: -0.02em;
        color: #1b2559;
        margin-right: 16px;
        margin-left: 8px;
      }
      .switch {
        width: 24px;
      }
    }
    .menu-wrap {
      margin: 0 24px;
      height: calc(100% - 265px);
      overflow: auto;
      .menu-item {
        cursor: pointer;
        width: 242px;
        height: 44px;
        box-sizing: border-box;
        padding-left: 45px;
        display: block;
        font-weight: 500;
        font-size: 18px;
        line-height: 44px;
        color: #a3aed0;
        margin-top: 8px;
        &.active {
          color: #2b3674;
        }
        &:hover {
          background: linear-gradient(
            89.97deg,
            #f6f8fd 0.02%,
            rgba(233, 237, 247, 0) 99.97%
          );
          border-radius: 27px;
        }
      }
    }
    .aside-bottom {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 40px;
      padding: 0 24px;
      .token {
        text-align: center;
        height: 45px;
        line-height: 45px;
        background: #e9e3ff;
        border-radius: 10px;
        font-size: 14px;
        color: #9374ff;
      }
    }
  }
  .container-main {
    min-height: 100vh;
    min-width: 1200px;
    background: #f4f7fe;
    margin-left: 290px;
    .big-title {
      padding: 40px 20px 24px 31px;
      font-size: 34px;
      color: #2b3674;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
      letter-spacing: -0.02em;
      .bread {
        margin-top: -10px;
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;
        letter-spacing: 0;
        color: #707eae;
        margin-bottom: 2px;
      }
      .btn {
        width: 129px;
        height: 46px;
        display: flex;
        align-items: center;
        .icon {
          width: 16px;
          margin-right: 4px;
        }
      }
      .switch-btn {
        padding: 8px 11px;
        background: #ffffff;
        box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
        border-radius: 30px;
        display: flex;
        align-items: center;
        .circle {
          width: 46px;
          height: 46px;
          background: #f4f7fe;
          border-radius: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          & + .circle {
            margin-left: 12px;
          }
          .metamask {
            width: 24px;
          }
          .polkadot {
            width: 19px;
          }
        }
        .arrow {
          width: 24px;
          margin-block: 3px;
        }
      }
    }
    .cm-content {
      padding: 0 20px;
    }
  }
}
</style>
<style lang="less">
.layout-side-menu-dropdown {
  .arco-dropdown-list {
    width: 196px;
    padding: 0 12px;
  }
  .arco-dropdown-group-title {
    padding: 0 4px;
    margin-bottom: 8px;
  }
  .arco-dropdown-option {
    padding: 6px;
    border-radius: 4px;
    .arco-dropdown-option-content {
      display: flex;
      align-items: center;
    }
    .circle {
      margin-right: 8px;
      width: 32px;
      height: 32px;
      background: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        transform: scale(0.36);
      }
    }
  }
}
</style>