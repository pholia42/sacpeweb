<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="header fixed-topbar">
      <div class="logo">旅行协作打卡系统</div>
      <el-menu mode="horizontal" :router="true" class="nav-menu">
        <el-menu-item index="/plaza">广场</el-menu-item>
        <el-menu-item index="/my-journeys">我的旅程</el-menu-item>
        <el-menu-item index="/travel-records">旅行记录</el-menu-item>
      </el-menu>
      <div class="user-info">
        <el-dropdown @command="handleCommand">
          <span class="user-dropdown">
            <el-avatar :size="32" :src="userAvatar">{{ userAvatar }}</el-avatar>
            <span class="username">{{ username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人主页</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <!-- Router view with a key to potentially help with re-rendering issues -->
      <router-view :key="$route.fullPath"></router-view>
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
// const username = ref(localStorage.getItem('username') || ''); // 读取本地存储用户名（已注释）
// const userAvatar = ref(localStorage.getItem('userAvatar') || ''); // 读取本地存储头像（已注释）
const username = ref('蘑菇');
const userAvatar = require('@/assets/mogu.jpg');

// 计算用户名的首字母作为头像显示
//const userInitials = computed(() => {
//  return username.value ? username.value.charAt(0).toUpperCase() : '';
//});

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

// 处理退出登录
const handleLogout = () => {
  // localStorage.removeItem('username'); // 清除本地存储用户名（已注释）
  // localStorage.removeItem('userAvatar'); // 清除本地存储头像（已注释）
  ElMessage.success('已退出登录');
  router.push('/');
};
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 60px; /* 为固定顶栏预留空间 */
}

.header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 60px; /* 显式设置高度 */
}

.fixed-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 确保在顶层 */
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
  color: #409EFF;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.user-info {
  margin-left: 20px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  /* 移除容器的内边距顶部空间，因为父容器已经有了 */
  /* padding-top: 0; */ 
}
</style>