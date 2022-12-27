<template>
  <div class="px-1.5rem">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh"
                      loading-text="Loading"
                      pulling-text="Pull to refresh data"
                      loosing-text="Release to refresh">
      <van-list :loading="loading"
                :finished="finished"
                :immediate-check="false"
                :loosing-text="$t('common.pullRefresh')"
                :loading-text="$t('common.loading')"
                :finished-text="$t('common.noMore')"
                @load="onLoad">
        <div class="c-list">
          <div v-for="(item, index) of 10" :key="index"
               class="border-b-1px border-listBgBorder py-1rem flex justify-between items-center">
            <ChainTokenIcon height="40px" width="40px" class=" p-2px">
              <template #amount>
                <span class="px-8px c-text-black whitespace-nowrap flex items-center text-14px 2xl:text-0.8rem">
                  100 USDT
                </span>
              </template>
            </ChainTokenIcon>
            <div class="flex flex-col items-end">
              <button class="border-1 border-color62 rounded-full h-24px 2xl:h-1.4rem w-min whitespace-nowrap px-12px mb-8px">
                View more
              </button>
              <span class="text-12px text-color8B light:text-color7D">2022-12-25 00:00:00</span>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import ChainTokenIcon from "@/components/ChainTokenIcon";
export default {
  name: "RewardCuration",
  components: {ChainTokenIcon},
  data() {
    return{
      refreshing: false,
      loading: false,
      finished: false,
      list: []
    }
  },
  mounted() {
    this.onLoad()
  },
  methods: {
    onLoad() {
    },
    onRefresh() {
      this.finished = false;
      this.loading = true;
      this.onLoad();
    }
  }
}
</script>

<style scoped>
.c-list :last-child {
  border: none;
}
</style>
