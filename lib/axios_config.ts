// lib/axiosClient.js
import axios from "axios";

// 1. Khởi tạo một instance riêng để không ảnh hưởng đến thư viện gốc
const axiosClient = axios.create({
  baseURL: "http://localhost:5001", 
  withCredentials: true, // Bắt buộc để luôn gửi Cookie
});

// 2. Cắm Interceptor trực tiếp vào instance này (Không cần useEffect)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Chặn vòng lặp vô tận nếu chính api refresh cũng bị 401
      if (originalRequest.url.includes('/refresh-token')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Tự động gọi API Refresh (dùng luôn axiosClient hoặc axios gốc đều được)
        await axios.post("http://localhost:5001/api/auth/refresh-token", {}, {
            withCredentials: true 
        });

        // Refresh thành công, gọi lại request ban đầu
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu Refresh thất bại (hết 14 ngày) thì mới kick ra
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;