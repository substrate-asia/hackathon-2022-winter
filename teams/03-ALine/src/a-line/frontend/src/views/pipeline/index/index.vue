<template>
  <div class="mx-auto bg-white p-[24px] mx-[24px] rounded-xl">
    <div class="flex justify-between mb-4">
      <a-input v-model:value="searchValue" placeholder="search here..." allow-clear style="width: 370px"
        class="w-[340px] h-[40px]" @keyup.enter="handleSearch">
        <template #prefix>
          <div @click="handleSearch">
            <img :src="searchSVG" />
          </div>
        </template>
      </a-input>
      <router-link to="/pipeline/create">
        <a-button type="primary">{{ $t("pipeline.createPipeline") }}</a-button>
      </router-link>
    </div>

    <div class="loading-page" v-if="isLoading">
      <a-spin :spinning="isLoading" />
    </div>
    <template v-else-if="pipelineList && pipelineList.length > 0">
      <!-- <a-card v-for="(data, index) in pipelineList" :key="index" @click="$router.push(`/pipeline/${data.name}`)"> -->
      <a-card v-for="(data, index) in pipelineList" :key="index" @click="toPilelinePath(data.name)">
        <div class="grid grid-cols-3 cursor-pointer">
          <div>
            <div class="mb-3 text-xl font-semibold text-[#121211]">
              {{ data.name }}
            </div>
            <div class="mb-3 text-sm font-normal text-[#7B7D7B]" v-if="data.status != 0">
              {{ $t("pipeline.manualTrigger") }}
            </div>
            <div>
              <div v-if="data.status == 0" class="text-sm font-normal text-[#7B7D7B]">
                {{ $t("pipeline.noData") }}
              </div>
              <div v-if="data.status == 1" class="text-sm font-normal text-[#2C5AFF]">
                <img src="@/assets/images/run.gif" class="h-[20px] w-[20px]" />
                {{ $t("pipeline.running") }}
              </div>
              <div v-if="data.status == 3" class="text-sm font-normal text-[#2DCE83]">
                <img :src="successSVG" class="h-[20px] w-[20px]" />
                {{ $t("pipeline.successfulImplementation") }}
              </div>
              <div v-if="data.status == 2" class="text-sm font-normal text-[#F52222]">
                <img :src="failedSVG" class="h-[20px] w-[20px]" />
                {{data?.error}}
              </div>
              <div v-if="data.status == 4" class="text-sm font-normal text-[#FF842C]">
                <img :src="stopSVG" class="h-[20px] w-[20px]" />
                {{ $t("pipeline.userTermination") }}
              </div>
            </div>
          </div>
          <div class="text-center cursor-pointer place-self-center" @click="$router.push(`/pipeline/${data.name}`)">
            <span class="text-sm font-normal bg-[#F8F8F8] py-2 px-3 rounded text-[#3F4641] block mb-3" v-if="
              data?.startTime && data?.startTime != '0001-01-01T00:00:00Z'
            ">{{ fromNowexecutionTime(data.startTime, "operation") }}</span>
            <span class="text-sm" v-if="data?.duration && data?.duration != 0">
              <img :src="wasteTimeSVG" class="h-[20px] w-[20px]" />
              {{ formatDurationTime(data.duration, "elapsedTime") }}
            </span>
          </div>
          <div class="set-exec-btn">
            <a-button type="primary" v-if="data.status !== 1" @click.stop="handleImmediateImplementation(data.name)">
              {{ $t("pipeline.immediateImplementation") }}
            </a-button>
            <a-button type="primary" danger v-if="data.status === 1"
              @click.stop="handleStopExec(data.name, data.pipelineDetailId)">
              {{ $t("pipeline.stop") }}
            </a-button>
            <a-button class="normal-button" @click.stop="handleToEditPage(data.name)">{{ $t("pipeline.set") }}
            </a-button>
          </div>
        </div>
      </a-card>

      <a-pagination class="block float-right" v-bind="pagination" />
    </template>
    <a-empty v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";
import {
  apiGetPipelines,
  apiImmediatelyExec,
  apiStopPipeline,
} from "@/apis/pipeline";
import searchSVG from "@/assets/icons/search.svg";
import successSVG from "@/assets/icons/pipeline-success.svg";
import failedSVG from "@/assets/icons/pipeline-failed.svg";
import stopSVG from "@/assets/icons/pipeline-stop.svg";
import wasteTimeSVG from "@/assets/icons/pipeline-waste-time.svg";
import { formatDurationTime } from "@/utils/time/dateUtils.js";
import { fromNowexecutionTime } from "@/utils/time/dateUtils.js";

const router = useRouter();

const searchValue = ref("");

const isLoading = ref(false);

const pipelineList = ref<
  {
    name?: string;
    description?: string;
    status?: number;
    id?: number;
    duration?: number;
    startTime?: string;
    error?: string;
  }[]
>([]);

const pagination = reactive({
  // 分页配置器
  pageSize: 10, // 一页的数据限制
  current: 1, // 当前页
  total: 10, // 总数,
  size: "small",
  hideOnSinglePage: false, // 只有一页时是否隐藏分页器
  showQuickJumper: false, // 是否可以快速跳转至某页
  showSizeChanger: false,
  onChange: (current) => getPipelineInfo(current),
});

const getPipelineInfo = async (page = 1, options = { showLoading: true }) => {
  if (options.showLoading) {
    isLoading.value = true;
  }

  try {
    const { data } = await apiGetPipelines({
      query: searchValue.value,
      page,
      size: 10,
    });
    // console.log("data:", data.data);
    pipelineList.value = data.data;
    pagination.pageSize = data.pageSize;
    pagination.total = data.total;
    pagination.current = page;
  } catch (err) {
    console.log("err", err);
  } finally {
    if (options.showLoading) {
      isLoading.value = false;
    }
  }
};

const handleSearch = async () => {
  if (searchValue.value) {
    try {
      await getPipelineInfo();
    } catch (err) {
      console.log('err', err)
    }
  }
};

const toPilelinePath = (name: string) => {
  router.push(`/pipeline/${name}`)
}

const handleToEditPage = (name: string) => {
  router.push(`/pipeline/edit/${name}`);
};

const handleImmediateImplementation = async (name) => {
  try {
    await apiImmediatelyExec(name);
    getPipelineInfo(pagination.current, { showLoading: false });
  } catch (err) {
    console.log("err", err);
  }
};

const handleStopExec = async (name, id) => {
  const params = { name, id };
  // console.log("params:", params);
  try {
    await apiStopPipeline(params);
    getPipelineInfo(pagination.current, { showLoading: false });
  } catch (err) {
    console.log("err", err);
  }
};

watchEffect((onInvalidate) => {
  const timer = setInterval(() => {
    if (!isLoading.value) {
      getPipelineInfo(pagination.current, { showLoading: false });
    }
  }, 5000);
  onInvalidate(() => clearInterval(timer));
});

onMounted(() => {
  getPipelineInfo();
});
</script>

<style scoped lang="less">
// .ant-input-affix-wrapper {
//   border: 1px solid #efefef;
//   border-radius: 6px;

//   // &:not(.ant-input-affix-wrapper-disabled):hover {
//   //   border-color: #6481dc;
//   // }
// }

.ant-card-bordered {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #efefef;
}

.ant-card-bordered:hover {
  border: 1px solid #28c57c;
  box-shadow: 3px 3px 12px rgba(203, 217, 207, 0.2);
}

.ant-btn {
  display: block;
  // width: 120px;
  // height: 40px;
  // border-radius: 6px;
  font-size: 12px;
}

.ant-btn-primary {
  margin-bottom: 10px;
  // border-radius: 6px;
  // width: 120px;
  // height: 40px;
  // background: #28c57c;
}

.ant-btn-dangerous.ant-btn-primary {
  border-color: #ff842c;
  background: #ff842c;

  &:hover,
  &:focus {
    border-color: #ff842c;
    background: #ff842c;
  }
}

.set-exec-btn {
  text-align: -webkit-right;
}

.loading-page {
  text-align: center;
}

.ant-card-bordered {
  border: 1px solid #dedddc;
}

.float-right {
  float: unset;
}
</style>
