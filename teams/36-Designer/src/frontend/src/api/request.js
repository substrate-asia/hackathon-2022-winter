import axios from "axios";

const CESS_URL = process.env.REACT_APP_CESS_URL;

const request = axios.create({
    baseURL: CESS_URL,
    timeout: 6000,
    // headers: { "Content-Type": "multipart/form-data" },
});

request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        console.log("====",config)
        // if (!token) {
        //     return config;
        // }
        config.headers["Authorization"] = token || "";
        // config.headers["Authorization"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50IjoiY1hoWDV0OWVNWmoxTGt6YVhqZVdzQ1hqZ2J3OHdmSE5mM0NuRDNqQlp6dmgxZkV5NyIsImV4cCI6MTY3NDY2NDE5MCwibmJmIjoxNjcyMDcyMTMwfQ.ib6QL4xW41mei8H4eMtFknr-Jr85bSWMK2d1f51-n-Y";
        config.headers["BucketName"] = "myspace";
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
