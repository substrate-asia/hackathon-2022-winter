import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const request = axios.create({
    baseURL: BASE_URL,
    timeout: 9000,
    // headers: { "Content-Type": "application/json" },
});

request.interceptors.request.use(
    (config) => {
        const userKey = localStorage.getItem("user-key");
        if (!userKey) {
            return config;
        }
        config.headers["user-key"] = userKey || "";
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => {
        return response;
    },
    function (error) {
        return Promise.reject(error);
    }
);

/**
 * get
 * @method get
 * @param {url, params, loading}
 */
const get = function (url, data, config) {
    return new Promise((resolve, reject) => {
        request
            .get(url, { params: data, ...config })
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
/**
 * post
 * @method post
 * @param {url, params}
 */
const post = function (url, data) {
    return new Promise((resolve, reject) => {
        request
            .post(url, data)
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

/**
 * put
 * @method put
 * @param {url, params}
 */
const put = function (url, data) {
    return new Promise((resolve, reject) => {
        request
            .put(url, data)
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

/**
 * delete
 * @method delete
 * @param {url, params}
 */
const rdelete = function (url, data){
    return new Promise((resolve, reject) => {
        request
            .delete(url, data)
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { get, post, put, delete: rdelete };
