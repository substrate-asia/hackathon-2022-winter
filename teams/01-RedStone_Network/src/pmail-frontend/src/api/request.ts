import Axios from 'axios'

const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// response interceptor
axios.interceptors.response.use(
  (response) => {
    const data = response.data
    if (response.status === 200) {
      return data
    }

    return Promise.reject(new Error(response.statusText || 'Error'))
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axios
