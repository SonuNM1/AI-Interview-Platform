import axios from "axios"

export const api = axios.create({
    baseURL: "http://localhost:4000/api/v1", 
    withCredentials: true, 
    headers: {
        "Content-Type": "application/json"
    }
})

// we will add the JWT refresh interceptors here next 

api.interceptors.response.use(
    (response) => response, 
    async (error) => {

        // token refresh logic will be implemented 

        return Promise.reject(error) ; 
    }
)