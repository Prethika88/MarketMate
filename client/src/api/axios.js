import axios from "axios"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URL_ENDPOINT,
  withCredentials: true, 
})

export default axiosInstance
