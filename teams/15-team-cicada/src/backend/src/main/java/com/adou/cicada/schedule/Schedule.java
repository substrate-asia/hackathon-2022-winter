package com.adou.cicada.schedule;

import com.adou.cicada.service.ICicadaService;
import com.adou.cicada.service.impl.CicadaServiceImpl;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Calendar;

@Component
public class Schedule {

    private static final Logger logger = LoggerFactory.getLogger(Schedule.class);

    @Autowired
    ICicadaService cicadaService;

    String[] queryParams = {
            "{\n  query {\n    categories(\n      filter: {flag: {equalTo: true}}\n      first: 10\n      offset: 0\n      orderBy: BLOCK_HASH_ASC\n    ) {\n      nodes {\n        id\n        blockHash\n        name\n        parent\n        lastAuthor\n        lastDate\n        flag\n      }\n    }\n  }\n}\n",
            "{\n  query {\n    labels(\n      filter: {flag: {equalTo: true}}\n      first: 10\n      offset: 0\n      orderBy: BLOCK_HASH_ASC\n    ) {\n      nodes {\n        id\n        blockHash\n        name\n        categoryId\n        category{\n          name\n        }\n        lastAuthor\n        lastDate\n        flag\n      }\n    }\n  }\n}\n",
            "{\n  query {\n    subjects(\n      filter: {flag: {equalTo: true}}\n      first: 10\n      offset: 0\n      orderBy: BLOCK_HASH_ASC\n    ) {\n      nodes {\n        id\n        blockHash\n        name\n        categoryId\n        category{\n          name\n        }\n        lastAuthor\n        lastDate\n        flag\n      }\n    }\n  }\n}\n",
            "{\n  query {\n    dimensions(\n      filter: {flag: {equalTo: true}}\n      first: 10\n      offset: 0\n      orderBy: BLOCK_HASH_ASC\n    ) {\n      nodes {\n        id\n        blockHash\n        name\n        subjectId\n        subject{\n          name\n        }\n        lastAuthor\n        lastDate\n        flag\n      }\n    }\n  }\n}\n",
            "{\n  query {\n    contents(\n      filter: {flag: {equalTo: true}}\n      first: 10\n      offset: 0\n      orderBy: BLOCK_HASH_ASC\n    ) {\n      nodes {\n        id\n        blockHash\n        content\n        categoryId\n        category{\n          name\n        }\n        label\n        dimensionId\n     dimension{\n          name\n        }\n     lastAuthor\n        lastDate\n        flag\n      }\n    }\n  }\n}\n",
            "{\n  query {\n    subscribes(\n      filter: {flag: {equalTo: true}}\n      first: 10\n      offset: 0\n      orderBy: BLOCK_HASH_ASC\n    ) {\n      nodes {\n        id\n        blockHash\n        subscriber\n        subscribeDate\n        subject{\n          name\n        }\n        flag\n      }\n    }\n  }\n}\n"
    };

    @Scheduled(cron = "0 0/2 * * * ?")
    private void cicada(){
        try {
            JSONObject object = new JSONObject();
            object.put("operationName", null);
            String arr[] = {};
            object.put("variables", arr);
            Calendar cal = Calendar.getInstance();
            int p = cal.get(Calendar.MINUTE) / 2 % 6;
            object.put("query", queryParams[p]);
            String data = cicadaService.sendPostData(object);
            System.out.println(data);
        } catch (Exception e) {
            logger.error("定时器报错！" + e.getMessage(), e);
        }
    }
}
