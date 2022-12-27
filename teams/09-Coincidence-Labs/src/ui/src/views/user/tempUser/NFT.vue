<template>
  <div>
<!--    <div v-if="dataList.length===0">-->
<!--      <div class="c-text-black text-zinc-700 text-2rem my-4rem">None</div>-->
<!--      <div class="text-zinc-400 text-0.8rem leading-1.4rem">-->
<!--        This service is still in Beta. Please be careful and do not deposit anything more than you can lose.-->
<!--        By depositing into this account, you are agreeing to our terms of service.-->
<!--      </div>-->
<!--    </div>-->
    <div>
      <template  v-if="reputation > 0 || showingStellarTreks.length > 0">
        <div class="flex items-center py-1rem px-1.5rem border-b-1 border-listBgBorder cursor-pointer"
            @click="modalVisible=true">
          <img class="w-43px h-43px 2xl:w-2rem 2xl:h-2rem rounded-full"
              src="~@/assets/icon-nft.svg" alt="">
          <div class="text-left ml-1rem">
            <div class="c-text-black text-1rem light:text-blueDark">Twitter Reputation NFT</div>
            <div class="text-color8B light:text-color7D text-0.8rem mt-0.5rem">from @wormhole3 official</div>
          </div>
        </div>
        <div v-for="st of showingStellarTreks" :key="st.name" class="flex items-center py-1rem px-1.5rem border-b-1 border-listBgBorder cursor-pointer"
            @click="showTrek(st.image)">
          <img class="w-43px h-43px 2xl:w-2rem 2xl:h-2rem rounded-full"
              :src="st.image" alt="">
          <div class="text-left ml-1rem">
            <div class="c-text-black text-1rem light:text-blueDark">{{st.name}}</div>
            <div class="text-color8B light:text-color7D text-0.8rem mt-0.5rem">{{st.description}}</div>
          </div>
        </div>
        <div v-for="st of showingWC2022" :key="st.name" class="flex items-center py-1rem px-1.5rem border-b-1 border-listBgBorder cursor-pointer"
            @click="showWC2022(st.image)">
          <img class="w-43px h-43px 2xl:w-2rem 2xl:h-2rem rounded-full"
              :src="st.image" alt="">
          <div class="text-left ml-1rem">
            <div class="c-text-black text-1rem light:text-blueDark">{{st.name}}</div>
            <div class="text-color8B light:text-color7D text-0.8rem mt-0.5rem">{{st.description}}</div>
          </div>
        </div>
      </template>
      <div class="mt-2rem" v-else>
        <div class="text-center">{{$t('token.noNft')}}</div>
      </div>
    </div>
    <el-dialog v-model="modalVisible"
               class="c-dialog c-dialog-lg c-dialog-center c-dialog-no-bg c-dialog-no-shadow">
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
import { STELLAR_TREK_NFT, WC2022_NFT } from '@/config'
import { getStellarTreks, getWc2022 } from '@/utils/asset'
import { WHILE_TYPES } from "@babel/types";

export default {
  name: "NFT",
  components: {GetNft},
  props: {
    accountInfo: {
      type: Object,
      default: {}
    },
  },
  computed: {
    username() {
      return this.accountInfo?.twitterUsername
    },
    reputation() {
      return this.accountInfo?.reputation
    },
  },
  data() {
    return {
      dataList: [],
      modalVisible: false,
      // stellar treck
      showingStellarTreks: [],
      showingTrekImage: '',
      showTrekImage: false,
      // world cup 2022
      showingWC2022: [],
      showingWcImage: '',
      showWcImage: false,
    }
  },
  methods: {
    showTrek(url) {
      this.showingTrekImage = url
      this.showTrekImage = true;
    },
    showWC2022(url) {
      this.showingWcImage = url;
      this.showWcImage = true;
    }
  },
  mounted () {
    getStellarTreks(this.accountInfo?.ethAddress).then(res => {
      let sts = []
      if (res && Object.keys(res).length > 0) {
        for (let id in res) {
          sts.push(STELLAR_TREK_NFT[id])
        }
      }
      this.showingStellarTreks = sts
    }).catch(e => {
      console.log(3908, e);
    })
    getWc2022(this.accountInfo?.ethAddress).then(res => {
      let wc = [];
      if (res && Object.keys(res).length > 0) {
        for (let id in res) {
          wc.push(WC2022_NFT[id])
        }
      }
      this.showingWC2022 = wc
    }).catch(e => {
      console.log(64, e);
    })
  }
}
</script>

<style scoped>
.top-box {
  background: linear-gradient(99.28deg, rgba(83, 83, 83, 0.8) 0.41%, rgba(78, 72, 61, 0.8) 75.78%);
  border: 1px solid #323436;
  border-radius: 12px;
}
.router-link-exact-active {
  background-color: var(--primary-custom);
}
</style>
