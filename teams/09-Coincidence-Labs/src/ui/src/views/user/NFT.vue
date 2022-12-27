<template>
  <div>
<!--    <div v-if="dataList.length===0">-->
<!--      <div class="c-text-black text-zinc-700 text-2rem my-4rem">None</div>-->
<!--      <div class="text-zinc-400 text-0.8rem leading-1.4rem">-->
<!--        This service is still in Beta. Please be careful and do not deposit anything more than you can lose.-->
<!--        By depositing into this account, you are agreeing to our terms of service.-->
<!--      </div>-->
<!--    </div>-->
    <div class="pt-1rem px-1.5rem">
      <div class="grid grid-cols-3 xs:grid-cols-5 gap-20px">
        <div class="col-span-1">
          <div class="relative min-w hover-scale" @click="collectionIndex=0">
            <img class="w-full " src="~@/assets/nft-collection-bg.png" alt="">
            <div class="absolute w-full h-full top-0 left-0 pt-2/10 pb-6px flex flex-col justify-between">
              <div class="w-80/100 mx-auto">
                <GetNft :username="username" :reputation="reputation" text-scale="scale-20"></GetNft>
              </div>
              <div class="text-12px scale-text leading-14px text-white">Reputation<br>{{prefixInteger(reputation, 6)}}</div>
            </div>
          </div>
        </div>
        <div class="col-span-1">
          <div class="relative min-w hover-scale" @click="collectionIndex=1">
            <img class="w-full " src="~@/assets/nft-collection-bg.png" alt="">
            <div class="absolute w-full h-full top-0 left-0 pt-2/10 pb-6px flex flex-col justify-between">
              <img class="w-70/100 mx-auto" src="~@/assets/nft-collection1.png" alt="">
              <div class="text-12px scale-text leading-14px text-white">The Fastest <br> Way <br> To Da Moon</div>
            </div>
          </div>
        </div>
        <div class="col-span-1">
          <div class="relative min-w hover-scale" @click="collectionIndex=2">
            <img class="w-full " src="~@/assets/nft-collection-bg.png" alt="">
            <div class="absolute w-full h-full top-0 left-0 pt-2/10 pb-6px flex flex-col justify-between">
              <img class="w-70/100 mx-auto" src="~@/assets/nft-collection2.png" alt="">
              <div class="text-12px scale-text leading-14px text-white">FIFA World Cup<br>Qatar 2022</div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-1px w-full bg-primaryBg light:bg-colorF2 my-2rem"></div>
      <template  v-if="reputation>0 || showingStellarTreks.length > 0">
        <div class="grid grid-cols-3 xs:grid-cols-5 gap-x-20px" v-show="collectionIndex===0">
          <div class="col-span-1 text-left">
            <div class="relative min-w cursor-pointer hover-scale" @click="modalVisible=true">
              <img class="w-full " src="~@/assets/nft-bg.png" alt="">
              <div class="absolute w-full h-full top-0 left-0 flex flex-col justify-center">
                <div class="w-80/100 mx-auto">
                  <GetNft :username="username" :reputation="reputation" text-scale="scale-15"></GetNft>
                </div>
              </div>
            </div>
            <div class="w-120/100 mx-auto transform scale-70 relative -left-10/100 -top-5/100">
              <div class="text-14px leading-14px mt-5px">Twitter Reputation NFT</div>
              <div class="text-12px leading-13px text-color8B mt-6px">From @wormhole3 official</div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 xs:grid-cols-5 gap-x-20px" v-show="collectionIndex===1">
          <div v-if="showingStellarTreks.length===0"
               class="col-span-3 xs:col-span-5 text-color8B/30 c-text-black py-2rem text-center">{{$t('common.none')}}</div>
          <div class="col-span-1 text-left" v-for="st of showingStellarTreks" :key="st">
            <div class="relative min-w cursor-pointer hover-scale" @click="showTrek(st.image)">
              <img class="w-full " src="~@/assets/nft-bg.png" alt="">
              <div class="absolute w-full h-full top-0 left-0 flex flex-col justify-center">
                <div class="w-80/100 mx-auto">
                  <img :src="st.image" alt="">
                </div>
              </div>
            </div>
            <div class="w-120/100 mx-auto transform scale-70 relative -left-10/100 -top-5/100">
              <div class="text-14px leading-14px">{{st.name}}</div>
              <div class="text-12px leading-13px text-color8B mt-6px">{{st.description}}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 xs:grid-cols-5 gap-x-20px" v-show="collectionIndex===2">
          <div v-if="showingWC2022.length===0"
               class="col-span-3 xs:col-span-5 text-color8B/30 c-text-black py-2rem text-center">{{$t('common.none')}}</div>
          <div class="col-span-1 text-left" v-for="st of showingWC2022" :key="st">
            <div class="relative min-w cursor-pointer hover-scale" @click="showTrek(st.image)">
              <img class="w-full " src="~@/assets/nft-bg.png" alt="">
              <div class="absolute w-full h-full top-0 left-0 flex flex-col justify-center">
                <div class="w-80/100 mx-auto">
                  <img :src="st.image" alt="">
                </div>
              </div>
            </div>
            <div class="w-120/100 mx-auto transform scale-70 relative -left-10/100 -top-5/100">
              <div class="text-14px leading-14px">{{st.name}}</div>
              <div class="text-12px leading-13px text-color8B mt-6px">{{st.description}}</div>
            </div>
          </div>
        </div>
    </template>
      <div class="my-2rem" v-else>
        <div class="text-center">{{$t('token.noNft')}}</div>
      </div>
    </div>
    <el-dialog v-model="modalVisible" class="c-dialog c-dialog-lg c-dialog-center c-dialog-no-bg c-dialog-no-shadow">
      <GetNft @close="modalVisible=false" :username="username" :reputation="reputation"></GetNft>
    </el-dialog>
    <el-dialog v-model="showTrekImage" class="c-dialog c-dialog-lg c-dialog-center c-dialog-no-bg c-dialog-no-shadow">
      <img :src="showingTrekImage" alt="">
    </el-dialog>
    <el-dialog v-model="showWcImage" class="c-dialog c-dialog-lg c-dialog-center c-dialog-no-bg c-dialog-no-shadow">
      <img :src="showingWcImage" alt="">
    </el-dialog>
  </div>
</template>

<script>
import GetNft from "@/views/user/components/GetNft";
import { mapGetters, mapState } from 'vuex'
import { getStellarTreks, getLiquidationNft, getWc2022 } from '@/utils/asset'
import { STELLAR_TREK_NFT, WC2022_NFT } from '@/config'

export default {
  name: "NFT",
  components: {GetNft},
  computed: {
    ...mapState(['stellarTreks', 'worldCupNFT']),
    ...mapGetters(['getAccountInfo']),
    username() {
      return this.getAccountInfo?.twitterUsername
    },
    reputation() {
      return this.getAccountInfo?.reputation
    },
    showingStellarTreks() {
      let sts = []
      if (this.stellarTreks && Object.keys(this.stellarTreks).length > 0) {
        for (let id in this.stellarTreks) {
          sts.push(STELLAR_TREK_NFT[id])
        }
      }
      return sts
    },
    showingWC2022() {
      let sts = []
      if (this.worldCupNFT && Object.keys(this.worldCupNFT).length > 0) {
        for (let id in this.worldCupNFT) {
          sts.push(WC2022_NFT[id])
        }
      }
      return sts
    }
  },
  data() {
    return {
      dataList: [],
      modalVisible: false,
      modalVisibleLiq: false,
      // stellar treck
      showTrekImage: false,
      showingTrekImage: '',
      liquidation:{},
      // world cup 2022
      showingWcImage: '',
      showWcImage: false,
      collectionIndex: 0
    }
  },
  methods: {
    showTrek(url) {
      this.showingTrekImage = url
      this.showTrekImage = true
    },
    showLiquidation() {
      this.showingTrekImage = this.liquidation.image;
      this.showTrekImage = true
    },
    showWC2022(url) {
      this.showingWcImage = url;
      this.showWcImage = true;
    },
    prefixInteger(num, length) {
      return num.toString().padStart(length, '0')
    }
  },
  mounted() {
    const { ethAddress } = this.getAccountInfo
    getStellarTreks(ethAddress).then(balances => {
      this.$store.commit('saveStellarTreks', balances)
    }).catch(e => {
      console.log(60, e);
    })
    getLiquidationNft(ethAddress).then(res => this.liquidation = res).catch(console.log)
    getWc2022(ethAddress).then(balances => {
      this.$store.commit('saveWorldCupNFT', balances)
    }).catch(e => {
      console.log(64, e);
    })
  }
}
</script>

<style scoped lang="scss">
.c-list-item:last-child {
  border: none;
}
.scale-text {
  transform: scale(0.7);
}
.multi-content {
  word-break: break-word;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.hover-scale:hover {
  cursor: pointer;
  transform: scale(1.1);
}
</style>
