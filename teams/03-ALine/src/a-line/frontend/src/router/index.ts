import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/home/HomeView.vue";
import PipelineIndex from "../views/pipeline/index/index.vue";
import Process from "../views/pipeline/process/index.vue";
import Stage from "../views/pipeline/stage/index.vue";
import Create from "../views/pipeline/create/index.vue";
import Edit from "../views/pipeline/edit/index.vue";
import AllLogs from "../views/pipeline/allLogs/index.vue";
import CreatePipeline from "../views/pipeline/create/config/index.vue";

const router = createRouter({
  history: createWebHashHistory(), 
  routes :[
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/",
      redirect: "/pipeline",
      children:[
        {
          path: "/pipeline",
          name: "Pipeline",
          component: PipelineIndex,
        },
        {
          path: "/pipeline/:name",
          name: "Stage",
          component: Stage,
        },
        {
          path: "/pipeline/:name/:id",
          name: "Process",
          component: Process,
        },
        {
          path: "/allLogs/:name/:id",
          name: "AllLogs",
          component: AllLogs,
          meta: {
            title: "全部日志",
            layout: "null",
          },
        },
        {
          path: "/pipeline/create",
          name: "Create",
          component: Create,
        },
        {
          path: "/pipeline/create/config/:id",
          name: "CreateConfig",
          component: CreatePipeline,
        },
        {
          path: "/pipeline/edit/:id",
          name: "Edit",
          component: Edit,
        },
      ],
    },
  ],
});

export default router;
