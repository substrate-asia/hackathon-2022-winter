<template>
  <div class="absolute left-0 right-0 bottom-0 top-0 flex flex-col text-14px xl:text-0.8rem">
    <div class="flex-1">
      <div class="border-b-1 border-color84/30 light:border-colorF4 sticky -top-1 z-2 bg-primaryBg light:bg-white">
        <div class="px-1.5rem pt-25px sm:px-0 container mx-auto sm:max-w-600px lg:max-w-35rem">
          <div class="flex overflow-hidden text-16px xl:text-0.9rem font-bold ">
            <router-link v-if="getAccountInfo && (getAccountInfo.isRegistry === 1 || getAccountInfo.source === 3)"
                         :to="`/profile/${$route.params.user}/wallet`" v-slot="{isActive}"
                         class="flex-1 cursor-pointer">
              <div class="w-full h-40px xl:h-2.4rem flex items-center justify-center border-b-2 md:border-b-4"
                   :class="isActive?'text-color62 border-color62':'text-color7D border-transparent'">
                {{$t('myWallet')}}
              </div>
            </router-link>
            <router-link :to="`/profile/${$route.params.user}/reward`" v-slot="{isActive}"
                         class="flex-1 cursor-pointer">
              <div class="w-full h-40px xl:h-2.4rem flex items-center justify-center border-b-2 md:border-b-4"
                   :class="isActive?'text-color62 border-color62':'text-color7D border-transparent'">
                {{$t('myReward')}}
              </div>
            </router-link>
          </div>
        </div>
      </div>
      <div class="md:pb-4rem sm:max-w-600px lg:max-w-35rem mx-auto flex flex-col">
        <div class="py-1rem mx-1.5rem sm:mx-0 relative">
          <div class="flex tabs mx-36px relative min-h-30px">
            <button class="tab flex-1 h-30px" :class="timeTab===0?'active':''" @click="timeTab=0">
              Today
            </button>
            <button class="tab flex-1 h-30px" :class="timeTab===1?'active':''" @click="timeTab=1">
              Last week
            </button>
            <button class="tab flex-1 h-30px" :class="timeTab===2?'active':''" @click="timeTab=2">
              Last month
            </button>
          </div>
          <div class="gradient-bg gradient-bg-color3 reward-box rounded-12px overflow-hidden px-17px pt-12px pb-20px">
            <div class="mb-1rem flex items-center justify-between cursor-pointer">
              <span class="c-text-black text-white text-16px 2xl:text-0.8rem mx-15px">{{$t('common.summary')}}</span>
            </div>
            <div class="text-left flex flex-col gap-y-10px font-bold text-12px 2xl:text-0.75rem
                          bg-primaryColor rounded-12px p-15px">
              <div>Claim 2335 sp($10000) from author posts;</div>
              <div>Claim 15533 NUT from curation;</div>
              <div>Claim 235USDT from curation;</div>
            </div>
          </div>
        </div>
        <div class="bg-blockBg light:bg-white pt-1rem rounded-12px basis-full md:basis-auto relative">
          <div class="px-1.5rem text-14px w-min flex gap-1rem mt-1rem font-bold">
            <button class="flex items-center rounded-full
                    border-1 border-white/20 leading-14px text-14px py-10px px-24px
                    light:bg-colorF2 light:text-color7D"
                    :class="tabIndex===0?'active-tab':''"
                    @click="tabIndex=0">{{$t('curations')}}</button>
            <button class="flex items-center rounded-full
                     border-1 border-white/20 leading-14px text-14px py-10px px-24px
                     light:bg-colorF2 light:text-color7D"
                    :class="tabIndex===1?'active-tab':''"
                    @click="tabIndex=1">{{$t('common.post')}}</button>
          </div>
          <RewardCuration v-show="tabIndex===0"/>
          <RewardPost v-show="tabIndex===1"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {ethers} from "ethers";
import {notify} from "@/utils/notify";
import {formatAddress} from "@/utils/tool";
import RewardCuration from "@/views/user/RewardCuration";
import RewardPost from "@/views/user/RewardPost";

export default {
  components: {RewardCuration, RewardPost},
  data() {
    return {
      tabIndex: 0,
      timeTab: 0
    }
  },
  computed: {
    ...mapGetters(['getAccountInfo'])
  },
  methods: {
    formatAddress,
    copy(address) {
      if (ethers.utils.isAddress(address)) {
        navigator.clipboard.writeText(address).then(() => {
          notify({
            message: 'Copied address:'+address,
            duration: 5000,
            type: 'success'
          })
        }, (e) => {
          console.log(e)
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.active-tab {
  background: linear-gradient(135.53deg, #917AFD 2.61%, #6246EA 96.58%);
  color: white!important;
  border: none;
}
.tab {
  text-transform: uppercase;
  display: inline-block;
  filter: opacity(0.2);
  border: none;
  border-radius: 6px 6px 0 0;
  position: relative;
  background: var(--primary-custom);
  white-space: nowrap;
  cursor: pointer;
  font-weight: bold;
  min-width: 120px;
  margin: 0 12px;
  &.active {
    z-index: 1;
    position: relative;
    filter: opacity(1);
  }
  &::before{
    right: -5%;
    transform: skew(25deg);
    border-radius: 0 8px 0 0;
  }
  &::after{
    transform: skew(-25deg);
    left: -5%;
    border-radius: 8px 0 0 0;
  }
}
.tab:before, .tab:after {
  content: "";
  height: 100%;
  position: absolute;
  background: var(--primary-custom);
  border-radius: 8px 8px 0 0;
  width: 10%;
  min-width: 15px;
  top: 0;
}
@media (max-width: 550px) {
  .tabs {
    position: relative;
  }
  .tab:nth-child(1) {
    position: absolute;
    left: 0;
  }
  .tab:nth-child(2) {
    position: absolute;
    left: 47%;
    transform: translateX(-50%);
  }
  .tab:nth-child(3) {
    position: absolute;
    right: 0%;
  }
}
</style>
