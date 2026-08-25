import axios, {type InternalAxiosRequestConfig} from "axios"

// the candidate MFE communicates with the backend only through the API Gateway. 

const api = axios.create({
    baseURL: "http://localhost:4000/api/v1", 

    headers: {
        "Content-Type": "application/json"
    }
}) 

// The Shell stores the access token in localStorage after login. Because the Candidate MFE runs in the same browser, it can read that token and attach it to requests 

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken") ; 

    if(accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config ; 
})

export default api ; 