<template>
  <div class="md:max-w-30rem mx-auto relative">
    <template v-if="this.reputation > 0">
      <img src="~@/assets/nft.png" alt="">
      <div class="absolute w-4/5 h-25/40 top-21/100 left-0">
        <div class="flex items-center justify-center mt-2rem md:mt-1.5rem nft-text transform"
             :class="textScale">
          <img class="w-20px md:w-1.2rem" src="~@/assets/icon-twitter-nft.svg" alt="">
          <span class="c-text-bold text-16px md:text-0.9rem">@{{username}}</span>
        </div>
      </div>
      <div class="absolute w-4/5 h-25/40 top-21/100 left-0 flex items-center justify-center">
        <div class="number c-text-black text-4rem xl:text-78px transform"
             :class="textScale"
             :data-text="prefixInteger(reputation, 6)">{{prefixInteger(reputation, 6)}}</div>
      </div>
    </template>
    <template v-if="this.liquidation >= 0">
      <img src="~@/assets/liquidation.png" alt="">
      <div class="absolute w-5/5 h-25/40 top-65/100 left-0">
        <div class="flex items-center justify-center mt-2rem md:mt-1.5rem nft-text transform"
             :class="textScale">
          <span class="c-text-bold text-26px md:text-1.5rem">@{{username}}</span>
        </div>
      </div>
      <div class="absolute w-5/5 h-25/40 top-56/100 left-0 flex items-center justify-center">
        <div class="number c-text-black text-3rem xl:text-58px transform scale-25"
             :class="textScale"
             :data-text="formatAmount(liquidation)">${{formatAmount(liquidation)}}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { formatAmount } from '@/utils/helper'
export default {
  name: "GetNft",
  props: {
    username: {
      type: String,
      default: ''
    },
    reputation: {
      type: Number,
      default: 0
    },
    liquidation: {
      type: Number,
      default: -1
    },
    textScale: {
      type: String,
      default: 'scale-100'
    }
  },
  data() {
    return {
      showAnimation: true,
      id: '007213'
    }
  },
  methods: {
    formatAmount,
    prefixInteger(num, length) {
      return num.toString().padStart(length, '0')
    }
  },
}
</script>

<style scoped lang="scss">
.nft-text {
  color: #CBBEE7;
}
.number {
  width: fit-content;
  padding-right: 10px;
  font-style: italic;
  letter-spacing: 0.5px;
  background: linear-gradient(97.37deg, #D4B8F9 -4.1%, #BE6CFF 52.46%, #71A1FF 106.51%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  text-fill-color: transparent;
  color: #fff;
  position: relative;
  &::after {
    content: attr(data-text);
    left: 0;
    position: absolute;
    text-shadow: 0px -1px white;
    top: 0;
    z-index: -1;
  }
}
</style>
