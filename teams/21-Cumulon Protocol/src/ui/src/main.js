import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ECharts from 'vue-echarts'
import "echarts";
import '@arco-design/web-vue/es/index.less';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@/assets/css/index.less';
import 'element-plus/es/components/table/style/css'
import 'element-plus/es/components/table-column/style/css'
import { ElTable, ElTableColumn } from 'element-plus'
import eventBus from '@/utils/eventBus';
import moment from 'moment';
import * as utils from '@/utils';
import localforage from "localforage";
localforage.config({
    name: 'web3go_db_name'
});

window.localforage = localforage;
const app = createApp(App);
app.use(ArcoVueIcon);
app.component('v-chart', ECharts)
app.component(ElTable.name, ElTable);
app.component(ElTableColumn.name, ElTableColumn);
app.config.globalProperties.$utils = utils;
app.config.globalProperties.$eventBus = eventBus;
app.config.globalProperties.$moment = moment;

app.config.globalProperties.$localforage = localforage;
app.use(store).use(router).use(ArcoVue).mount('#app')