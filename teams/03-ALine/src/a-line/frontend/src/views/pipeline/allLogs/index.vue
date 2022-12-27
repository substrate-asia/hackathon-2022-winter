<template>
  <div class="all-logs">
    <div v-for="it in jobLogsData.contentList" :key="it">{{ it }}</div>
  </div>
</template>
<script lang='ts' setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiGetAllJobLogs } from '@/apis/jobs';

const router = useRouter()
const jobLogsData = reactive({ contentList: [] })

const queryJson = reactive({
  id: router.currentRoute.value.params.id,
  name: router.currentRoute.value.params.name
})

const getjobLogsData = async () => {
  const data = await apiGetAllJobLogs(queryJson)
  Object.assign(jobLogsData, data.data)
  // jobLogsData.value = data.data
  jobLogsData.contentList = jobLogsData.content?.split('\r')
}

onMounted(() => {
  getjobLogsData()
})
</script>
<style lang='less' scoped>
.all-logs {
  background-color: #fff;
  padding: 32px;
  min-height: 100vh;
}
</style>