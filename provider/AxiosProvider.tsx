"use client";

import { useEffect } from "react";
import axios from "axios";

export default function AxiosInterceptor() {
  useEffect(() => {
    // 1. Cấu hình để luôn gửi kèm Cookie
    axios.defaults.withCredentials = true;

    // 2. Đánh chặn phản hồi từ Server
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Nếu 200 OK thì cho qua
      async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa thử refresh lần nào
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // TỰ ĐỘNG GỌI REFRESH
            await axios.post("http://localhost:5001/api/auth/refresh-token");
            
            // Nếu refresh xong, thực hiện lại request vừa bị lỗi
            return axios(originalRequest);
          } catch (refreshError) {
            // Nếu cả Refresh Token cũng hết hạn (văng ra login)
            window.location.href = "/signin";
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return null; // Component này không hiển thị gì cả
}