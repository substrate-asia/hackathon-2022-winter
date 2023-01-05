<template>
  <div class="bg-[#FFFFFF] rounded-[12px] leading-[24px]">
    <div class="bg-[#121211] p-[24px] rounded-tl-[12px] rounded-tr-[12px]">
      <div class="flex justify-between">
        <div class="text-[24px] font-semibold text-[#FFFFFF]">
          {{ templateInfo.name }}
        </div>
      </div>
      <div class="text-[#979797] text-[14px] mt-2">
        {{ templateInfo.description }}
      </div>
    </div>
    <div class="p-[24px] rounded-bl-[12px] rounded-br-[12px] box-border">
      <div class="w-1/4 mb-4">
        <div class="mb-2">Pipeline Name</div>
        <a-input v-model:value="pipelineName" @change="setYamlName()" placeholder="Pipeline Name" allow-clear />
      </div>
      <a-row class="create" :gutter="24">
        <a-col :span="8">
          <div class="bg-[#EFEFEF] p-4 rounded-tl-[12px] rounded-tr-[12px]">
            <div class="flex justify-between">
              <div class="text-[16px] font-semibold text-[#121211]">
                Pipeline Process
              </div>
            </div>
          </div>
          <div class="p-4 rounded-bl-[12px] rounded-br-[12px] border border-solid border-[#EFEFEF] box-border">
            <a-form :label-col="{ xs: { span: 24 }, sm: { span: 7 } }" layout="vertical">
              <div v-for="(data, key) in yamlList" :key="key">
                <div class="flex mb-4">
                  <div
                    class="text-[#FFFFFF] bg-[#121211] rounded-[50%] h-[20px] w-[20px] text-center leading-[20px] text-[14px]">
                    {{ key + 1 }}
                  </div>
                  <div class="ml-2 text-[#121211] font-semibold">
                    {{ data.stage }}
                  </div>
                </div>
                <div v-for="(item, index) in data.steps" :key="index">
                  <div v-if="item.eleName === 'git-checkout'">
                    <GitCheckout :stage="data.stage" :index="index" :url="item.eleValues.url"
                      :branch="item.eleValues.branch" @setYamlCode="setYamlCode"></GitCheckout>
                  </div>
                  <div v-else-if="item.eleName === 'workdir'">
                    <Workdir :stage="data.stage" :index="index" :workdir="item.eleValues.workdir"
                      @setYamlCode="setYamlCode"></Workdir>
                  </div>
                  <div v-else-if="item.eleName === 'artifactory'">
                    <Artifactory :stage="data.stage" :index="index" :name="item.eleValues.name"
                      :path="item.eleValues.path" @setYamlCode="setYamlCode"></Artifactory>
                  </div>
                  <div v-else-if="item.eleName === 'deploy-contract'">
                    <DeployContract :stage="data.stage" :index="index" :network="item.eleValues.network"
                      :privateKey="(item.eleValues['private-key'])" @setYamlCode="setYamlCode"></DeployContract>
                  </div>
                  <div v-else-if="item.eleName === 'deploy-ink-contract'">
                    <DeployInkContract :stage="data.stage" :index="index" :network="item.eleValues.network"
                      :privateKey="(item.eleValues['mnemonic'])" @setYamlCode="setYamlCode"></DeployInkContract>
                  </div>
                  <div v-else-if="item.eleName === 'shell'">
                    <Shell :stage="data.stage" :index="index" :run="item.eleValues.run" :runsOn="item.eleValues.runsOn"
                      @setYamlCode="setYamlCode"></Shell>
                  </div>
                </div>
              </div>
            </a-form>
          </div>
        </a-col>
        <a-col :span="16">
          <div class="bg-[#EFEFEF] p-4 rounded-tl-[12px] rounded-tr-[12px]">
            <div class="text-[16px] font-semibold text-[#121211]">
              Pipelinefile Preview
            </div>
          </div>
          <div class="codeScrollHeight">
            <CodeEditor :readOnly="true" :value="codeValue"></CodeEditor>
          </div>
          <!-- <CodeEditor :readOnly="true" :value="codeValue"></CodeEditor> -->
        </a-col>
      </a-row>
      <div class="mt-6">
        <Checkbox v-model:checked="checked"></Checkbox>
      </div>
      <div class="mt-8 text-center">
        <a-button @click="lastStep" class="normal-button">{{
          $t("template.lastBtn")
        }}</a-button>
        <a-button type="primary" @click="submitData" class="ml-4">{{
          $t("template.submitBtn")
        }}</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import YAML from "yaml";
import { useRoute, useRouter } from "vue-router";
import { apiGetTemplatesById, apiAddPipeline } from "@/apis/template";
import { apiImmediatelyExec } from '@/apis/pipeline';
import CodeEditor from "./components/CodeEditor.vue";
import GitCheckout from "./components/GitCheckout.vue";
import Artifactory from "./components/Artifactory.vue";
import Checkbox from './components/Checkbox.vue'
import Workdir from "./components/Workdir.vue";
import DeployContract from "./components/DeployContract.vue";
import DeployInkContract from "./components/DeployInkContract.vue";
import Shell from "./components/Shell.vue";
import { message } from "ant-design-vue";



const codeValue = ref<String>();
const router = useRouter();
const { params } = useRoute();
const templateId = ref(params.id);
const checked = ref(false)
const templateInfo = reactive({
  name: "",
  description: "",
  yaml: "",
});
const yamlList = ref([
  {
    stage: "",
    steps: [
      {
        eleName: "",
        eleValues: {},
      },
    ],
  },
]);
const pipelineName = ref("");

onMounted(async () => {
  getTemplatesById(templateId.value.toString());
});

const getTemplatesById = async (templateId: String) => {
  try {
    const { data } = await apiGetTemplatesById(templateId);
    Object.assign(templateInfo, data); //赋值
    codeValue.value = templateInfo.yaml;

    const config = YAML.parse(codeValue.value.toString());
    pipelineName.value = config.name;
    yamlList.value = [];
    for (let key in config["stages"]) {
      let obj = config["stages"][key];
      let steps: { eleName: string; eleValues: {} }[] = [];
      if (obj["steps"]) {
        obj["steps"].forEach((item: { [x: string]: any }) => {
          let eleName = "";
          let eleValues = {};
          if (item["uses"]) {
            if (item["uses"] === "hamster-artifactory") {
              eleName = "artifactory";
            } else {
              eleName = item["uses"];
            }
            eleValues = item["with"];
          } else {
            eleName = "shell";
            eleValues = {
              run: item["run"],
              runsOn: item["runs-on"],
            };
          }
          steps.push({
            eleName: eleName,
            eleValues: eleValues,
          });
        });
      }
      const yaml = {
        stage: key,
        steps: steps,
      };
      yamlList.value.push(yaml);
    }
  } catch (error: any) {
    console.log("erro:", error);
  }
};
const lastStep = async () => {
  router.push({ path: "/pipeline/create" });
};

const submitData = async () => {
  try {
    if (pipelineName.value === "" || pipelineName.value === null) {
      message.error("Please input Pipeline Name");
      return false;
    }
    const result = await apiAddPipeline(pipelineName.value, codeValue.value);
    if (result.code === 400) {
      message.error(result.message);
    } else {
      if (checked.value) {
        message.success(result.message);
        await apiImmediatelyExec(pipelineName.value);
        router.push({ path: "/pipeline" });
      } else {
        message.success(result.message);
        router.push({ path: "/pipeline" });
      }
    }
  } catch (error: any) {
    console.log("erro:", error);
    message.error("Failed: " + error.response.data.message);
  }
};

const setYamlCode = async (
  isUsers: any,
  key: string,
  index: number,
  item: string,
  val: any
) => {
  const config = YAML.parse(codeValue.value);
  if (isUsers) {
    config["stages"][key]["steps"][index]["with"][item] = val;
  } else {
    config["stages"][key]["steps"][index][item] = val;
  }

  codeValue.value = YAML.stringify(config);
};

const setYamlName = async () => {
  pipelineName.value = pipelineName.value.replace(/\s+/g, "");
  const config = YAML.parse(codeValue.value);
  config["name"] = pipelineName.value;
  codeValue.value = YAML.stringify(config);
};
</script>
<style scoped lang="less">
.create {
  height: 100%;

  .codeScrollHeight {
    height: calc(100% - 56px);
  }
}

.normal-button {
  width: 120px;
  height: 40px;
  border-radius: 6px;
}
</style>
