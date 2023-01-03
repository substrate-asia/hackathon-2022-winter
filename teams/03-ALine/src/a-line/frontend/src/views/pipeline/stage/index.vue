<template>
  <div class="flex justify-between">
    <Breadcrumb :currentName="pathName" />
    <div>
      <a-button class="mr-2" @click="handleToEditPage()">{{
          $t("pipeline.stage.set")
      }}</a-button>
      <a-button type="primary" @click="handleImmediateImplementation">
        {{ $t("pipeline.stage.immediateImplementation") }}</a-button>
    </div>
  </div>

  <div class="bg-white rounded-xl pb-[24px]">
    <div class="loading-page" v-if="isLoading">
      <a-spin :spinning="isLoading" class="pt-[24px]" />
    </div>

    <template v-else-if="jobs && jobs.length > 0">
      <a-table :columns="columns" :data-source="jobs" v-bind:pagination="pagination" :customRow="customRowClick"
        v-if="jobs">
        <template #headerCell="{ column }">
          <template v-if="column.key === 'status'">
            <span> Status </span>
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <span v-if="record.status == 0">{{ $t("pipeline.noData") }}</span>
            <span v-if="record.status == 1">{{ $t("pipeline.running") }}</span>
            <span v-if="record.status == 3">{{
                $t("pipeline.successfulImplementation")
            }}</span>
            <span v-if="record.status == 2">{{
                $t("pipeline.stage.fail")
            }}</span>
            <span v-if="record.status == 4">{{
                $t("pipeline.userTermination")
            }}</span>
          </template>
          <template v-else-if="column.key === 'id'">
            <!-- <span @click.stop="handleToNextPage(record.id)" class="cursor-pointer color-next-page">{{ record.id
            }}</span> -->
            <span class="cursor-pointer color-next-page">{{ record.id
            }}</span>
          </template>
          <template v-else-if="column.key === 'stages'">
            <PipelineStageVue :stages="record.stages" />
          </template>
          <template v-else-if="column.key === 'duration'">
            <span class="block" v-if="
              record?.startTime && record?.startTime != '0001-01-01T00:00:00Z'
            ">
              {{ fromNowexecutionTime(record.startTime, "operation") }}
            </span>
            <span v-if="record?.duration && record?.duration != 0">{{
                formatDurationTime(record.duration, "elapsedTime")
            }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <div v-if="record.status == 1">
              <img :src="stopButtonSVG" class="mr-2 align-baseline" />
              <a @click.stop="handleStop(record.id)" class="text-[#FF842C] hover:text-[#FF842C]">{{
                  $t("pipeline.stage.stop")
              }}</a>
            </div>
            <div v-else>
              <img :src="deleteButtonSVG" class="mr-1 align-text-bottom" />
              <a @click.stop="handleDelete(record.id)" class="text-[#F52222] hover:text-[#F52222]">{{
                  $t("pipeline.stage.delete")
              }}
              </a>
            </div>
          </template>
        </template>
      </a-table>
    </template>
    <a-empty class="pt-[24px]" v-else />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import {
  apiGetPipelineInfo,
  apiDeletePipelineInfo,
  apiImmediatelyExec,
  apiStopPipeline,
  apiGetPipelineDetail,
} from "@/apis/pipeline";
import PipelineStageVue from "./components/PipelineStage.vue";
import Breadcrumb from "@/views/components/Breadcrumb.vue";
import stopButtonSVG from "@/assets/icons/pipeline-stop-button.svg";
import deleteButtonSVG from "@/assets/icons/pipeline-delete-button.svg";
import { message } from "ant-design-vue";
import { formatDurationTime } from "@/utils/time/dateUtils.js";
import { fromNowexecutionTime } from "@/utils/time/dateUtils.js";

const router = useRouter();

const isLoading = ref(false);

const pathName = router.currentRoute.value.params.name;

const columns = reactive([
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Trigger Info",
    dataIndex: "triggerMode",
    key: "triggerMode",
  },
  {
    title: "Stage",
    key: "stages",
    dataIndex: "stages",
  },
  {
    title: "Time",
    key: "duration",
    dataIndex: "duration",
  },
  {
    title: "Action",
    key: "action",
  },
]);

const jobs = ref<
  {
    key?: string;
    id?: number;
    status?: number;
    triggerMode?: string;
    startTime?: string;
    duration?: number;
    stages?: [];
  }[]
>([]);

const pagination = reactive({
  // 分页配置器
  pageSize: 10, // 一页的数据限制
  current: 1, // 当前页
  total: 10, // 总数
  size: "small",
  hideOnSinglePage: false, // 只有一页时是否隐藏分页器
  showQuickJumper: false, // 是否可以快速跳转至某页
  showSizeChanger: false, // 是否可以改变 pageSize
  onChange: (current) => getPipelineInfo(current),
  // showTotal: total => `总数：${total}人`, // 可以展示总数
});

const customRowClick = (record: any, index: number) => {
  return {
    style: {
      cursor: 'pointer',
    },
    onClick: (event: Event) => {
      router.push(`/pipeline/${pathName}/${record.id}`);
    }
  }
};

// const handleToNextPage = (id) => {
//   router.push(`/pipeline/${pathName}/${id}`);
// };

const handleToEditPage = () => {
  router.push(`/pipeline/edit/${pathName}`);
};

const getPipelineInfo = async (page = 1, isShowLoading = true) => {
  if (isShowLoading) {
    isLoading.value = true;
  }

  try {
    const { data } = await apiGetPipelineInfo(pathName, {
      page,
      size: 10,
    });
    // console.log("data.data:", data.data);
    jobs.value = data.data;
    pagination.pageSize = data.pageSize;
    pagination.total = data.total;
    pagination.current = page;
  } catch (err) {
    console.log("err", err);
  } finally {
    if (isShowLoading) {
      isLoading.value = false;
    }
  }
};

const handleImmediateImplementation = async () => {
  try {
    await apiImmediatelyExec(pathName);
    getPipelineInfo(pagination.current, false);
  } catch (err) {
    // console.log("err", err);
  }
};

const handleDelete = async (id) => {
  try {
    await apiDeletePipelineInfo(pathName, id);
    await getPipelineInfo(pagination.current, false);
    message.success("Delete success");

    const page = Math.ceil(pagination.total / 10);
    if (page > 1 && pagination.current == page) {
      if (!jobs.value.length) {
        const previousPage = pagination.current - 1;
        if (previousPage >= 1) {
          pagination.current = pagination.current - 1;
          getPipelineInfo(previousPage);
        }
      }
    }
  } catch {
    message.error("Delete failed");
  }
};

const handleStop = async (id) => {
  const params = { name: pathName, id };
  // console.log("params:", params);
  try {
    await apiStopPipeline(params);
    getPipelineInfo(pagination.current, false);
  } catch (err) {
    // console.log("err", err);
  }
};

const jobIdsFetching = ref<number[]>([]);

watchEffect((onInvalidate) => {
  const timer = setInterval(() => {
    if (isLoading.value) {
      return;
    }

    let jobIds = [];
    jobs.value.forEach((x) => {
      const newStages = x.stages?.filter((item) => item.status == 1);
      if (newStages?.length > 0) {
        jobIds.push(x.id);
      }
    });

    jobIds.forEach(async (jobId) => {
      // console.log("jobIds", jobId);
      if (!jobIdsFetching.value.includes(jobId)) {
        jobIdsFetching.value = [...jobIdsFetching.value, jobId];
        try {
          const { data } = await apiGetPipelineDetail({
            name: pathName,
            id: jobId,
          });
          // console.log("apiGetPipelineDetail", data);

          jobs.value = jobs.value.map((x) => (x.id === jobId ? data : x));
        } finally {
          jobIdsFetching.value = jobIdsFetching.value.filter(
            (x) => x !== jobId
          );
        }
      }
    });
  }, 3000);
  onInvalidate(() => clearInterval(timer));
});

onMounted(() => {
  getPipelineInfo();
});
</script>

<style lang="less" scoped>
.loading-page {
  text-align: center;
}

:deep(.ant-table-thead > tr > th) {
  background: #121211;
  height: 48px;
  text-align: center;
  color: #ffffff;
  border-top: 12px;
}

:deep(.ant-table table) {
  text-align: center;
  border: unset;
  box-shadow: unset;
  border-radius: 12px;
}

:deep(.ant-table-container table > thead > tr:first-child th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.ant-table-container table > thead > tr:first-child th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.ant-table-tbody > tr > td) {
  font-size: 14px;
  color: #7b7d7b;

  .color-next-page {
    display: inline-block;
    width: 100%;

    &:hover {
      color: #28c57c;
    }
  }
}

:deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: 0px solid !important;
}

:deep(.ant-table-pagination-right) {
  justify-content: unset !important;
}

:deep(.ant-table-pagination) {
  display: block;
  text-align: center;
}

:deep(.ant-table-pagination.ant-pagination) {
  margin-top: 20px;
  margin-bottom: 0px;
}

:deep(.ant-pagination-item-active:hover a) {
  color: white !important;
}

:deep(.ant-table-tbody > tr > td:nth-child(4)) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 77px;
}
</style>
