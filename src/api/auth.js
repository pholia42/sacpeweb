import request from '@/axios'; // Assuming axios instance is exported from src/axios.js

/**
 * 用户登录
 * @param {object} data - 包含 username 和 password 的对象
 * @returns Promise
 */
export function login(data) {
  return request({
    url: '/auth/login', // 改回不带 /api 的路径，因为 baseURL 已包含 /api
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
        url: '/auth/register', // 改回不带 /api 的路径
        method: 'post',
        data
    });
}

/**
 * 获取当前登录用户的个人资料
 * @returns Promise
 */
export function getCurrentUserProfile() {
    return request({
        url: '/profile/me', // 后端 UserController 的 @RequestMapping 是 /api/profile
        method: 'get'
    });
}

/**
 * 更新当前登录用户的个人资料
 * @param profileData { nickname?, avatarurl?, signature?, skillsDescription?, birthday?, gender?, email?, phone? }
 * @returns Promise
 */
export function updateUserProfile(profileData) {
    return request({
        url: '/profile/me', // 后端 UserController 的 @RequestMapping 是 /api/profile
        method: 'put',
        data: profileData
    });
}

/**
 * 修改当前登录用户的密码
 * @param passwordData { oldPassword, password } (password is the new password)
 * @returns Promise
 */
export function changePassword(passwordData) {
  return request({
    url: '/profile/me/password',
    method: 'put',
    data: passwordData
    });
}

// 你可以在这里添加其他认证相关接口，例如获取用户信息等 