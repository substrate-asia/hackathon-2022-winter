<template>
  <div>
    <div class="md:border-b-1 border-dividerColor mb-1rem">
      <div class="relative container mx-auto max-w-50rem md:px-1rem px-15px flex items-center md:justify-start justify-center h-2.8rem">
        <div class="c-text-black text-1.5rem md:text-1rem mx-1.9rem">
          {{$t('curation.claimReward')}}
        </div>
      </div>
    </div>
    <div class="container mx-auto max-w-600px xl:max-w-30rem bg-blockBg light:bg-white
                rounded-20px px-2rem sm:px-4.5rem py-2rem mb-2rem text-left">
      <div class="italic text-12px leading-24px 2xl:text-0.6rem 2xl:leading-1.2rem">
        {{$t('curation.claimRewardTip')}}
      </div>
      <div class="mt-2rem">
        <div class="mb-6px">{{$t('common.connectMetamask')}}</div>
        <div class="relative border-1 gradient-border gradient-border-color3 rounded-12px h-50px 2xl:2.5rem
                    flex justify-center items-center cursor-pointer"
             @click="connectWallet">
          <span class="font-600 text-15px 2xl:text-0.75rem
                       light:bg-gradient-text-light
                       gradient-text gradient-text-purple-white">
            {{showAccount ? showAccount : $t('common.connectMetamask')}}
          </span>
          <img class="absolute h-32px right-20px" src="~@/assets/icon-metamask.png" alt="">
          <div v-if="connectLoading"
               class="absolute bg-black/70 light:bg-white/40 w-full h-full rounded-12px flex justify-center items-center">
            <img class="w-3rem" src="~@/assets/loading-points.svg" alt="">
          </div>
        </div>
      </div>
      <div v-loading="loading"
           class="border-1 border-color8B/30 rounded-15px mt-1rem text-left mt-1.5rem overflow-hidden">
        <div class="px-1rem py-0.5rem min-h-7rem">
          <div class="text-primaryColor light:text-color62 mb-10px text-15px 2xl:text-0.75rem">{{$t('curation.pendingClaim')}}  {{totalRecords - lastId}}</div>
          <div v-if="!loading && pendingList.length===0"
               class="flex flex-col justify-center items-center py-1rem">
            <div class="icon-list-no-data w-6rem h-4rem"></div>
            <div class="text-color84/30 font-600">{{$t('common.none')}}</div>
          </div>
          <template v-if="!loading && pendingList.length > 0">
            <div class="flex justify-between items-center py-6px" v-for="record of pendingList.slice(0,3)" :key="record.id">
              <div class="flex items-center">
                <img class="w-34px h-34px 2xl:w-1.7rem 2xl:h-1.7rem rounded-full"
                     :src="record.profileImg" alt="">
                <div class="text-12px leading-18px 2xl:text-0.7rem 2xl:leading-1rem ml-15px">
                  <div>{{record.twitterUsername}} </div>
                  <div class="text-color8B">{{parseTimestamp(record.createAt)}}</div>
                </div>
              </div>
              <div class="flex items-center">
                <span class="font-700 text-15px leading-18px 2xl:text-0.75rem 2xl:leading-1rem">{{ formatAmount(record.amount / (10 ** record.decimals)) }} {{record.tokenSymbol}} </span>
                <!-- <img class="w-15px h-15px 2xl:w-0.75rem 2xl:h-0.75rem ml-5px"
                     src="~@/assets/icon-question-white.svg" alt=""> -->
              </div>
            </div>
            <div class="text-right mt-0.6rem cursor-pointer" v-if="pendingList.length > 3" @click="gotoList(pendingList, 'pending')">
              {{$t('curation.viewAll')}}  >
            </div>
          </template>
        </div>
        <button class="w-full text-white gradient-bg gradient-bg-color3 h-34px 2xl:h-1.7rem text-15px 2xl:text-0.75rem flex justify-center items-center font-600 cursor-pointer"
          @click="claim"
          :disabled="!showAccount || pendingList.length === 0 || claiming"
        >
          <c-spinner class="w-1.5rem h-1.5rem ml-0.5rem" v-show="claiming"></c-spinner>
          {{$t('curation.claim')}}
        </button>
      </div>
      <div v-loading="loading"
           class="border-1 border-color8B/30 rounded-15px mt-1rem text-left mt-1.5rem overflow-hidden">
        <div class="px-1rem py-0.5rem min-h-7rem">
          <div class="text-primaryColor light:text-color62 mb-10px text-15px 2xl:text-0.75rem">{{$t('curation.claimed')}}  {{issuedRecords}}</div>
          <div v-if="!loading && issuedList.length===0"
               class="flex flex-col justify-center items-center py-1rem">
            <div class="icon-list-no-data w-6rem h-4rem"></div>
            <div class="text-color84/30 font-600">{{$t('common.none')}}</div>
          </div>
          <template v-if="!loading && issuedList.length > 0">
            <div class="flex justify-between items-center py-6px" v-for="record of issuedList.slice(0,3)" :key="record.id">
              <div class="flex items-center">
                <img class="w-34px h-34px 2xl:w-1.7rem 2xl:h-1.7rem rounded-full"
                     :src="record.profileImg" alt="">
                <div class="text-12px leading-18px 2xl:text-0.7rem 2xl:leading-1rem ml-15px">
                  <div>{{record.twitterUsername}} </div>
                  <div class="text-color8B">{{parseTimestamp(record.createAt)}}</div>
                </div>
              </div>
              <div class="flex items-center">
                <span class="font-700 text-15px leading-18px 2xl:text-0.75rem 2xl:leading-1rem">{{ formatAmount(record.amount / (10 ** record.decimals)) }} {{record.tokenSymbol}}</span>
                <img class="w-15px h-15px 2xl:w-0.75rem 2xl:h-0.75rem ml-5px"
                     src="~@/assets/icon-question-white.svg" alt="">
              </div>
            </div>
            <div class="text-right mt-0.6rem cursor-pointer" @click="gotoList(issuedList, 'issued')" v-if="issuedList.length > 3">
              {{$t('curation.viewAll')}}  >
            </div>
          </template>
        </div>
        <!-- <div class="bg-color8B/30 h-34px 2xl:h-1.7rem text-15px 2xl:text-0.75rem flex justify-center items-center text-color8B font-600">
          {{$t('curation.claimed')}}
        </div> -->
      </div>
    </div>
    <el-dialog v-model="modalVisible" fullscreen
               class="c-dialog-fullscreen c-dialog-no-shadow bg-primaryBg">
      <Submissions :records="records" :state="state" @claim="claim" @close="modalVisible=false"></Submissions>
    </el-dialog>
  </div>
</template>

<script>
import { getRefreshCurationRecord } from '@/api/api'
import { getCurationInfo, claimReward } from '@/utils/curation'
import { mapState, mapGetters } from 'vuex'
import { setupNetwork, chainChanged } from '@/utils/web3/web3'
import { accountChanged, getAccounts } from '@/utils/web3/account'
import { CHAIN_ID, errCode } from "@/config";
import { parseTimestamp, formatAmount } from '@/utils/helper'
import { notify, showError } from '@/utils/notify'
import Submissions from "@/views/curations/Submissions";

export default {
  name: "ConfirmReward",
  components: {Submissions},
  computed: {
    ...mapState('curation', ['detailCuration']),
    ...mapGetters(['getAccountInfo']),
    ...mapState('web3', ['account', 'chainId']),
    showAccount() {
      if (this.account && this.chainId === CHAIN_ID)
        return this.account.slice(0, 12) + '...' + this.account.slice(this.account.length - 12, -1);
      return false
    },
  },
  data() {
    return {
      connectLoading: false,
      totalRecords: 0,
      issuedRecords: 0,
      lastId: 0,
      pendingList: [],
      issuedList: [],
      loading: true,
      claiming: false,
      modalVisible: false,
      records: [],
      state: ''
    }
  },
  methods: {
    async connectWallet() {
      this.connectLoading = true
      try{
        if (await setupNetwork()) {
          await getAccounts(true);
        }
      } catch (e) {
        notify({message: 'Connect metamask fail', duration: 5000, type: 'error'})
      } finally {
        this.connectLoading = false
      }
    },
    parseTimestamp(time) {
      return parseTimestamp(time)
    },
    formatAmount(amount) {
      return formatAmount(amount)
    },
    async claim(){
      if (!this.showAccount) {
        notify({message: this.$t('tips.connectMetamaskFirst')})
        return;
      }
      this.modalVisible = false
      try{
        this.claiming = true
        await claimReward(this.detailCuration.curationId)
        const info = await getCurationInfo(this.detailCuration.curationId)
        const status = info.task.taskState;
        const totalCount = parseInt(info.userCount);
        const lastId = parseInt(info.task.currentIndex);
        this.totalRecords = totalCount;
        this.issuedRecords = lastId;
        this.lastId = lastId
        if (status === 2) {
          // finished
          this.detailCuration.curationStatus = 2;
        }
        this.loading = true
        // refresh issued list
        if (this.issuedList.length > 0) {
          // no need udpate
        }else {
          getRefreshCurationRecord(this.detailCuration.curationId, 0, true).then(issuedList=>{
            this.issuedList = issuedList.slice(0, lastId);
          })
        }

        // refresh pending list
        getRefreshCurationRecord(this.detailCuration.curationId, lastId, true).then(pendingList=>{
            this.pendingList = pendingList
          })
      } catch(e) {
        showError(errCode.TRANSACTION_FAIL)
      } finally {
        this.loading = false
        this.claiming = false
      }
    },
    gotoList(list, state) {
      this.state = state
      this.records = list
      this.modalVisible = true
    }
  },
  async mounted() {
    if (!this.getAccountInfo || !this.getAccountInfo.twitterId){
      this.$router.replace('/')
    }
    if (!this.detailCuration || !this.detailCuration.curationId) {
      this.$router.go(-1)
      return;
    }
    chainChanged()
    accountChanged()
    if (this.detailCuration && this.detailCuration.curationId) {
      const info = await getCurationInfo(this.detailCuration.curationId)
      const lastId = parseInt(info.task.currentIndex);
      const totalCount = parseInt(info.userCount)
      this.totalRecords = totalCount;
      this.issuedRecords = lastId;
      this.lastId = lastId
      const [pendingList, issuedList] = await Promise.all([getRefreshCurationRecord(this.detailCuration.curationId, lastId, true),
                                                              getRefreshCurationRecord(this.detailCuration.curationId, 0, true)])
                                              .finally(() => {
                                                this.loading = false
                                              });
      this.pendingList = pendingList;
      this.issuedList = issuedList.slice(0, lastId);
    }
  }
}
</script>

<style scoped>

</style>
