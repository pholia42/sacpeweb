import request from '@/axios'; // Assuming axios instance is exported from src/axios.js

/**
 * 用户登录
 * @param {object} data - 包含 username 和 password 的对象
 * @returns Promise
 */
export function login(data) {
  return request({
    url: '/auth/login', // 确认这是你的登录接口路径
    method: 'post',
    data
  });
}

/**
 * 用户注册 (如果需要)
 * @param {object} data - 包含注册信息的对象
 * @returns Promise
 */
export function register(data) {
    return request({
        url: '/auth/register', // 确认这是你的注册接口路径
        method: 'post',
        data
    });
}

// 你可以在这里添加其他认证相关接口，例如获取用户信息等 