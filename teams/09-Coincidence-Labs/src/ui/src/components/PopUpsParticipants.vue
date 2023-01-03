<template>
  <div class="relative pt-1rem max-h-60vh min-h-60vh flex flex-col text-white light:text-blueDark">
    <div class="c-text-black text-20px 2xl:text-1rem leading-30px 2xl:leading-1.5rem pb-1rem text-center">
      {{$t('curation.participants')}}
    </div>
    <button class="absolute right-20px top-18px"
            @click="$emit('close')">
      <i class="w-18px h-18px 2xl:w-1rem 2xl:h-1rem icon-close"></i>
    </button>
    <div class="flex-1 overflow-auto pb-2rem">
      <van-list :loading="loading"
                :finished="finished"
                :immediate-check="false"
                :loosing-text="$t('common.pullRefresh')"
                :loading-text="$t('common.loading')"
                :finished-text="$t('common.noMore')"
                @load="onLoad">
        <van-pull-refresh v-model="refreshing"
                          @refresh="onRefresh"
                          loading-text="Loading"
                          pulling-text="Pull to refresh data"
                          loosing-text="Release to refresh">
          <div class="flex justify-between items-center py-1rem px-1.5rem text-left border-b-1 border-color8B/30"
               v-for="record of (participants ?? [])" :key="record.id">
            <div class="flex items-center cursor-pointer" @click="$router.push('/account-info/@' + record.username)">
              <img class="w-40px min-w-40px h-40px 2xl:w-2rem 2xl:min-w-2rem 2xl:h-2rem
                        rounded-full border-1 gradient-border "
                   :src="record.profileImg?.replace('normal', '200x200')" alt="" @error="replaceEmptyImg">
              <div class="text-12px leading-18px 2xl:text-0.7rem 2xl:leading-1rem ml-15px">
                <div>{{record.username}} </div>
                <div class="text-color8B">{{parseTimestamp(record.replyTime)}}</div>
              </div>
            </div>
            <div class="flex items-center">
              <ChainTokenIconVue height="20px" width="20px"
                                 :token="{symbol: popUp?.symbol, address: popUp?.token}"
                                 :chainName="popUp.chainId.toString()">
                <template #amount>
                <span class="px-8px h-17px whitespace-nowrap flex items-center text-12px 2xl:text-0.8rem font-bold">
                  {{ formatAmount(record.reward?.toString() / (10 ** popUp.decimals)) }} {{ popUp.symbol }}
                </span>
                </template>
              </ChainTokenIconVue>
            </div>
          </div>
        </van-pull-refresh>
      </van-list>
    </div>
  </div>
</template>

<script>
import { parseTimestamp, formatAmount } from "@/utils/helper";
import ChainTokenIconVue from "@/components/ChainTokenIcon";
import emptyAvatar from "@/assets/icon-default-avatar.svg";
import {getCurationRecord, popupRecords} from '@/api/api'

export default {
  name: "PopUpsParticipants",
  components: {ChainTokenIconVue},
  props: {
    popUp: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      participants: [],
      finished: false,
      refreshing: false,
      loading: false
    }
  },
  methods: {
    parseTimestamp,
    formatAmount,
    replaceEmptyImg(e) {
      e.target.src = emptyAvatar;
    },
    onRefresh() {
      this.finished = false
      this.onLoad()
    },
    onLoad() {
      if(this.loading || this.finished) return
      this.refreshing = false
      this.loading = true
      let rowIndex;
      if (this.participants && this.participants.length > 0) {
        rowIndex = this.participants[this.participants.length - 1].rowIndex
      }
      popupRecords(this.popUp.tweetId, rowIndex).then(pop => {
        this.loading = false
        this.participants =  this.participants.concat(pop ?? [])
        if (pop && pop.length < 20) {
          this.finished = true
        }
      }).catch(() => {
        this.finished = true
        this.loading = false
      })
    }
  },
  mounted () {
    this.onLoad()
  },
}
</script>

<style scoped>

</style>
