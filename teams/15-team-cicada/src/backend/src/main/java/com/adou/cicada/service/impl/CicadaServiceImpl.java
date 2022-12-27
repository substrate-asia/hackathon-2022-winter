package com.adou.cicada.service.impl;

import com.adou.cicada.service.ICicadaService;
import com.alibaba.fastjson.JSONObject;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.Charset;

@Service
public class CicadaServiceImpl implements ICicadaService {

    private static Logger logger = LoggerFactory.getLogger(CicadaServiceImpl.class);

    @Override
    public String sendPostData(JSONObject object) {
        String result = null;
        try (CloseableHttpClient httpClient = HttpClients.createDefault()){
            HttpPost post = new HttpPost("http://192.168.31.97:3009");
            post.setHeader("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36");
            post.setHeader("connection", "keep-alive");
            post.setHeader("accept", "*/*");
            StringEntity entity = new StringEntity(object.toJSONString());
            entity.setContentType("application/json");
            post.setEntity(entity);
            HttpResponse response = httpClient.execute(post);
            HttpEntity responseEntity = response.getEntity();
            if (responseEntity != null)
                result = EntityUtils.toString(responseEntity, Charset.forName("UTF-8"));
        } catch (Exception e) {
            logger.error("发送POST请求报错！" + e.getMessage(), e);
        }
        return result;
    }
}
