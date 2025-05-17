<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="header fixed-topbar">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" class="logo-image">
        <span class="logo-text">山水一程</span>
      </div>
      <el-menu mode="horizontal" :router="true" :default-active="activeMenuIndex" class="nav-menu">
        <el-menu-item index="/plaza">广场</el-menu-item>
        <el-menu-item index="/my-journeys" v-if="isLoggedIn">我的旅程</el-menu-item>
        <el-menu-item index="/travel-records" v-if="isLoggedIn">旅行记录</el-menu-item>
      </el-menu>
      <div class="user-info">
        <template v-if="isLoggedIn && loggedInUserNickname">
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="loggedInUserAvatarUrl" class="user-avatar-dynamic">
                 {{ !loggedInUserAvatarUrl && loggedInUserNickname ? loggedInUserNickname.charAt(0).toUpperCase() : (!loggedInUserAvatarUrl ? 'U' : '') }}
              </el-avatar>
              <span class="username">{{ loggedInUserNickname }}</span>
               <el-icon class="el-icon--right" style="margin-left: 4px;"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人主页</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/" class="auth-link-old-style">登录</router-link>
          <span class="auth-separator-old-style">|</span>
          <router-link to="/reg" class="auth-link-old-style">注册</router-link>
        </template>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <router-view :key="$route.fullPath"></router-view>
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue'; // 确保引入

const router = useRouter();
const route = useRoute();

// --- Start: Dynamic user info logic ---
const loggedInUserNickname = ref(localStorage.getItem('nickname') || '');
const loggedInUserAvatarUrl = ref(localStorage.getItem('avatarurl') || null);
const isLoggedIn = computed(() => !!localStorage.getItem('token'));

const updateUserInfoFromStorage = () => {
  loggedInUserNickname.value = localStorage.getItem('nickname') || '';
  const avatarUrl = localStorage.getItem('avatarurl');
  loggedInUserAvatarUrl.value = avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'null' ? avatarUrl : null;
};

const handleUserLoggedIn = () => {
  updateUserInfoFromStorage();
};

const handleUserLoggedOut = () => {
  loggedInUserNickname.value = '';
  loggedInUserAvatarUrl.value = null;
};

const handleUserInfoUpdated = () => {
  updateUserInfoFromStorage();
};

onMounted(() => {
  updateUserInfoFromStorage();
  window.addEventListener('userLoggedIn', handleUserLoggedIn);
  window.addEventListener('userLoggedOut', handleUserLoggedOut);
  window.addEventListener('userInfoUpdated', handleUserInfoUpdated);
});

onUnmounted(() => {
  window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  window.removeEventListener('userLoggedOut', handleUserLoggedOut);
  window.removeEventListener('userInfoUpdated', handleUserInfoUpdated);
});
// --- End: Dynamic user info logic ---

// 计算当前激活的菜单项 (from old version)
const activeMenuIndex = computed(() => {
  if (route.path.startsWith('/profile')) {
    return ''; 
  }
  return route.path; 
});

// 处理下拉菜单命令 (adapted for dynamic user)
const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'logout') {
    handleLogout(); // Use the new logout logic
  }
};

// 处理退出登录 (new dynamic version)
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nickname');
  localStorage.removeItem('avatarurl');
  localStorage.removeItem('isTestUser');
  window.dispatchEvent(new CustomEvent('userLoggedOut'));
  ElMessage.success('已退出登录'); // Keep success message
  router.push('/'); 
};

</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 60px;
}

.header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fixed-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
  color: #409EFF;
  display: flex;
  align-items: center;
}

.logo-image {
  height: 35px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  font-size: 16px;
}

.nav-menu > .el-menu-item {
  padding: 0 22px !important;
  font-size: 16px;
}

.user-info {
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-avatar-dynamic {
  margin-right: 8px;
}

.username {
  font-size: 15px !important;
  margin-left: 10px !important;
}

.auth-link-old-style {
  font-size: 15px !important;
  margin: 0 10px !important;
}

.el-icon--right {
  font-size: 15px;
  margin-left: 8px !important;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>