import axios from 'axios'
import Vue from 'vue';
import router from '@/router';
import { Message } from '@arco-design/web-vue';
// create an axios instance
const service = axios.create({
    baseURL: window.BASE_API, // url = base url + request url 
    timeout: 60000, // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo && userInfo.token) {
            // let each request carry token
            // ['X-Token'] is a custom headers key
            // please modify it according to the actual situation
            config.headers['Authorization'] = `Bearer ${userInfo.token}`;
        }
        if (config.headers['Host'] && config.headers['Host'] != 'web3go.xyz') {
            config.headers['Host'] = `web3go.xyz`;
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data
        return res;

    },
    error => {
        console.log('err:', error) // for debug
        let message = error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message;
        if (message === 'Unauthorized') {
            message = 'it seems you are not login yet.';
        }
        Message.error({
            content: message,
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

export default service