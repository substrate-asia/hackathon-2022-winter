<template>
  <div class="bg-[#FFFFFF] rounded-[12px] leading-[24px]">
    <div class="bg-[#121211] p-[24px] rounded-tl-[12px] rounded-tr-[12px]">
      <div class="flex justify-between">
        <div class="text-[24px] font-semibold text-[#FFFFFF]">
          {{ $t("template.title") }}
        </div>
      </div>
      <div class="text-[#979797] text-[14px] mt-2">
        {{ $t("template.titleDesc") }}
      </div>
    </div>
    <div class="p-[24px] rounded-bl-[12px] rounded-br-[12px] box-border">
      <Tabs :defaultActiveKey="activeKey">
        <TabPane key="0" :tab="$t('template.allText')">
          <div class="card-div">
            <div class="card-item" @click="setCurrId(item.id)" :class="{ 'check-border': checkCurrId === item.id }"
              v-for="(item, index) in allTemplatesList" :key="index">
              <div class="card-img-div">
                <img :src="getImageURL(`${item.imageName}.png`)" />
              </div>
              <div class="col-span-5">
                <div class="card-title">{{ item.name }}</div>
                <a-popover :visible="hovered">
                  <template #content>
                    <div class="card-desc-popover">{{ item.description }}</div>
                  </template>
                  <div @mouseover="checkDivHeight(`descDiv${index}`)" :class="`descDiv${index}`"
                    class="card-desc show-line">
                    {{ item.description }}
                  </div>
                </a-popover>
              </div>
            </div>
          </div>
        </TabPane>
        <TabPane v-for="(data, index) in templatesList" :key="index + 1" :tab="$t(`template.${data.tag}`)">
          <div class="card-div">
            <div class="card-item" @click="setCurrId(item.id)" :class="{ 'check-border': checkCurrId === item.id }"
              v-for="(item, index2) in data.items" :key="index2">
              <div>
                <img :src="getImageURL(`${item.imageName}.png`)" />
              </div>
              <div class="col-span-5">
                <div class="card-title">{{ item.name }}</div>
                <div class="card-desc show-line">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
      <div class="mt-8 text-center">
        <Button @click="backStep" class="normal-button">{{
            $t("template.cancelBtn")
        }}</Button>
        <Button type="primary" class="ml-4" @click="nextStep">{{
            $t("template.nextBtn")
        }}</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeMount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { apiGetTemplates } from "@/apis/template";
import { Tabs, TabPane, Button } from "ant-design-vue";
import { message } from "ant-design-vue";
import useAssets from "@/stores/useAssets";
const { getImageURL } = useAssets();

const language = window.localStorage.getItem("language");

const router = useRouter();
const activeKey = ref("0");
const checkCurrId = ref(0);
const hovered = ref(false);

const templatesList = reactive([]);
const allTemplatesList = reactive([]);

onMounted(async () => {
  getTemplates();
});

const getTemplates = async () => {
  try {
    const { data } = await apiGetTemplates(language || "en");
    Object.assign(allTemplatesList, data); //赋值
    //拆分相同 tabs 下的数据
    const templates: string | any[] = [];
    const templateTabs: any[] = [];
    allTemplatesList.forEach((item: any) => {
      let tagVal = item.tag;
      if (tagVal === "DAPP_TEMPLATE(Frontend)") {
        tagVal = "DAPP_TEMPLATE_Frontend";
      }

      if (templateTabs.includes(tagVal)) {
        templates.forEach((subItem, index) => {
          if (subItem.tag === tagVal) {
            templates[index]["items"].push(item);
          }
        });
      } else {
        templateTabs.push(tagVal);
        templates.push({ tag: tagVal, items: [item] });
      }
    });
    Object.assign(templatesList, templates); //赋值
  } catch (error: any) {
    console.log("erro:", error);
  }
};
const setCurrId = async (id: number) => {
  checkCurrId.value = id;
};
const backStep = async () => {
  router.push({ path: "/pipeline" });
};
const nextStep = async () => {
  if (checkCurrId.value === 0) {
    message.info("Please select the pipeline template");
  } else {
    router.push({ path: "/pipeline/create/config/" + checkCurrId.value });
  }
};
const checkDivHeight = (className: string) => {
  var targetDiv = document.getElementsByClassName(className);
  var scrollHeight = targetDiv[0].scrollHeight;
  if (scrollHeight < 40) {
    hovered.value = false;
  } else {
    hovered.value = undefined;
  }
};
</script>

<style scoped lang="less">
@baseColor: #28c57c;

.help-text {
  color: @baseColor;
  font-size: 14px;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  @apply font-semibold;
  color: #121211;
}

.card-div {
  @apply grid grid-cols-2 gap-4;
}

.card-item {
  @apply p-6 grid grid-cols-6 gap-4 cursor-pointer;
  border: 1px solid #efefef;
  border-radius: 12px;
}

.card-item:hover {
  /* 投影 */
  box-shadow: 3px 3px 12px rgba(203, 217, 207, 0.2);
  border: 1px solid #28c57c;
}

.card-img-div {
  @apply flex justify-center;
}

.card-item img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
}

.card-title {
  @apply font-semibold;
  font-size: 16px;
  color: #121211;
}

.card-desc {
  font-size: 12px;
  color: #7b7d7b;
  margin-top: 4px;
}

.card-desc-popover {
  font-size: 12px;
  color: #7b7d7b;
  max-width: 500px;
}

.show-line {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.check-border {
  border-color: @baseColor;
  background: #f3fffa;
}

.normal-button {
  width: 120px;
  height: 40px;
  border-radius: 6px;
}
</style>
