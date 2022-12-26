// @ts-nocheck
import axios from 'axios';
import axiosRetry from 'axios-retry';

export default function initAxios(config) {
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.post['X-API-Key'] = config.SUBSCAN_API_KEY;
  axiosRetry(axios, { retries: 10, retryDelay: () => 600, retryCondition: error => error.response.status === 429 });
}
