import axios from "axios";
import axiosRetry from "axios-retry";
import store from '@/store';

axiosRetry(axios, { retries: 5 });

axios.defaults.timeout = 30000;

axios.interceptors.request.use(
  config => {
    if (store.getters.getAccountInfo && store.getters.getAccountInfo.accessToken) {
      config.headers['AccessToken'] = store.getters.getAccountInfo.accessToken;
    }
    return config;
  },
  error => {
    return Promise.reject(error)
  }
)

export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        console.log("network err", err);
        if (err.response) {
          reject(err.response.status);
          return;
        } else {
          reject(500);
        }
      }).then(resolve);
  });
}

export function post(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, params)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        if (err.response) {
          reject(err.response.status);
          return;
        }
        reject(500);
      });
  });
}

export function put(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .put(url, params)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        if (err.response) {
          reject(err.response.status);
          return;
        }
        reject(500);
      });
  });
}
