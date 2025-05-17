<template>
    <div class="profile-container">
        <!-- 顶部个人信息 -->
        <el-card class="profile-header-card" v-if="user">
            <div class="profile-main-info">
                <el-avatar :size="100" :src="user.avatarurl" class="profile-avatar">
                    <span v-if="!user.avatarurl && user.nickname">{{ user.nickname.charAt(0) }}</span>
                    <span v-else-if="!user.avatarurl && user.username">{{ user.username.charAt(0) }}</span>
                </el-avatar>
                <div class="user-details">
                    <div class="username-row">
                        <h2 class="nickname">{{ user.nickname || '未设置昵称' }}</h2>
                        <span class="username-tag">@{{ user.username }}</span>
                    </div>
                    <p class="signature">{{ user.signature || '这位用户很懒，什么都没留下...' }}</p>
                    
                    <div class="additional-info">
                        <span v-if="formattedBirthday" class="info-item birthday-item">
                            <el-icon><Cake /></el-icon> {{ formattedBirthday }}
                        </span>
                        <span v-if="user.gender" class="info-item gender-item">
                            <el-icon v-if="user.gender === '男'"><Male /></el-icon>
                            <el-icon v-else-if="user.gender === '女'"><Female /></el-icon>
                            <el-icon v-else-if="user.gender === '保密'"><QuestionFilled /></el-icon>
                            <span v-else class="gender-text-fallback">{{ user.gender }}</span>
                            {{ user.gender !== '保密' ? user.gender : '性别保密' }}
                        </span>
                        <span v-if="user.skillsDescription" class="info-item skills-item">
                           <el-icon><PriceTag /></el-icon>
                           <span class="skills-text">{{ user.skillsDescription }}</span>
                        </span>
                    </div>
                     <el-button type="primary" plain @click="goToEditProfile" class="edit-profile-btn">
                         <el-icon><Edit /></el-icon> 编辑个人信息
                     </el-button>
                </div>
            </div>
        </el-card>
        <el-empty v-else description="加载用户信息中或用户未登录..."></el-empty>

        <!-- 已完成的旅程列表 (将被替换) -->
        <!-- 
        <el-card class="completed-journeys-card">
            ...
        </el-card>
        -->

        <!-- 新增：我的成就 -->
        <el-card class="achievements-card profile-section-card" v-if="userAchievements.length > 0">
            <template #header>
                <div class="card-header">
                    <span><el-icon><Trophy /></el-icon> 我的成就</span>
                </div>
            </template>
            <div class="achievements-list">
                <el-row :gutter="20">
                    <el-col :xs="24" :sm="12" :md="8" v-for="achievement in userAchievements" :key="achievement.id">
                        <div class="achievement-item" :class="{ 'achieved': achievement.achieved }">
                            <el-icon :size="32" class="achievement-icon">
                                <component :is="achievement.iconComponent" />
                            </el-icon>
                            <div class="achievement-info">
                                <h4>{{ achievement.title }}</h4>
                                <p>{{ achievement.description }}</p>
                                <el-tag v-if="achievement.achieved" type="success" effect="light" size="small">已达成</el-tag>
                                <el-tag v-else type="info" effect="light" size="small">未达成</el-tag>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </el-card>
        <el-empty v-else-if="user" description="暂无成就，继续努力哦！"></el-empty>

        <!-- 新增：历史动态 -->
        <el-card class="history-card profile-section-card" v-if="userHistoryRecords.length > 0">
            <template #header>
                <div class="card-header">
                    <span><el-icon><Tickets /></el-icon> 历史动态</span>
                </div>
            </template>
            <el-timeline class="profile-timeline">
                <el-timeline-item
                    v-for="record in userHistoryRecords"
                    :key="record.id"
                    :timestamp="record.time"
                    :type="record.type || 'primary'"
                    :icon="record.iconComponent"
                    size="normal" 
                >
                    <h4>{{ record.title }}</h4>
                    <p>{{ record.description }}</p>
                </el-timeline-item>
            </el-timeline>
        </el-card>
        <el-empty v-else-if="user" description="暂无历史动态"></el-empty>

    </div>
</template>

<script setup>
import { ref, onMounted, shallowRef, computed } from 'vue'; // shallowRef for icons, computed for formattedBirthday
import { useRouter } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
import { getCurrentUserProfile } from '@/api/auth.js'; // 引入API
// Updated icon imports
import { Male, Female, User, PriceTag, Cake, CollectionTag, Flag, Trophy, Edit, Tickets, Location as LocationIcon, StarFilled, Promotion, EditPen as EditPenIcon, CircleCheckFilled as CircleCheckFilledIcon, QuestionFilled } from '@element-plus/icons-vue';

const router = useRouter();

// user 状态，初始为 null
const user = ref(null);
const isTestUser = ref(localStorage.getItem('isTestUser') === 'true');

const formattedBirthday = computed(() => {
    if (user.value && user.value.birthday) {
        try {
            const date = new Date(user.value.birthday);
            if (isNaN(date.getTime())) {
                return null; 
            }
            // 不补零
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}月${day}日`;
        } catch (e) {
            console.error("Error formatting birthday:", e);
            return null; 
        }
    }
    return null;
});

// 新增：用户成就数据 (从 TravelRecords.vue 迁移并重命名)
const userAchievements = ref([
    {
        id: 1, title: '初出茅庐', description: '完成第一次打卡',
        iconComponent: shallowRef(LocationIcon), achieved: true
    },
    {
        id: 2, title: '旅行达人', description: '完成5次旅程',
        iconComponent: shallowRef(Trophy), achieved: true
    },
    {
        id: 3, title: '探索先锋', description: '打卡10个不同地点',
        iconComponent: shallowRef(StarFilled), achieved: true
    },
    {
        id: 4, title: '分享之乐', description: '首次生成旅行手账',
        iconComponent: shallowRef(Promotion), achieved: false
    },
    {
        id: 5, title: '规划能手', description: '创建第一个行程计划',
        iconComponent: shallowRef(EditPenIcon), achieved: true // Renamed EditPen to EditPenIcon to avoid conflict
    },
    {
        id: 6, title: '完美旅程', description: '完成一个包含5个以上打卡点的行程',
        iconComponent: shallowRef(CircleCheckFilledIcon), achieved: false // Renamed CircleCheckFilled to CircleCheckFilledIcon
    }
]);

// 新增：用户历史动态数据 (从 TravelRecords.vue 迁移并重命名)
const userHistoryRecords = ref([
    {
        id: 1, title: '完成了「云南大理之旅」',
        description: '所有计划打卡点均已完成，并生成了旅行手账。',
        time: '2024-05-25', type: 'success',
        iconComponent: shallowRef(CircleCheckFilledIcon)
    },
    {
        id: 2, title: '在「大理古城」打卡',
        description: '上传了3张照片，并写下了感想。',
        time: '2024-05-20', type: 'primary',
        iconComponent: shallowRef(LocationIcon)
    },
    {
        id: 3, title: '获得了「旅行达人」成就',
        description: '累计完成5次旅程，解锁新徽章！',
        time: '2024-05-15', type: 'warning',
        iconComponent: shallowRef(Trophy)
    },
    {
        id: 4, title: '创建了新的行程「日本东京动漫考察」',
        description: '计划已制定，等待招募队员或开始旅行。',
        time: '2024-04-01', type: 'info',
        iconComponent: shallowRef(EditPenIcon)
    }
]);

const fetchUserProfile = async () => {
    if (isTestUser.value) {
        console.log("Profile.vue: Test user mode, loading mock profile data.");
        user.value = {
            username: '123456',
            nickname: '测试蘑菇',
            avatarurl: '', // Or a mock avatar URL: 'https://via.placeholder.com/100'
            signature: '这是测试用户的签名，用于展示目的。',
            phone: '13800138000',
            email: 'test@example.com',
            skillsDescription: '测试技能1, 测试技能2',
            birthday: '2000-01-01',
            gender: '保密'
        };
        // 模拟成就和历史数据，如果测试用户也应该有这些
        // userAchievements.value = [...] 
        // userHistoryRecords.value = [...] 
        return;
    }

    const loadingInstance = ElLoading.service({ text: '加载中...', background: 'rgba(0, 0, 0, 0.7)' });
    try {
        console.log("Profile.vue: Fetching user profile...");
        const response = await getCurrentUserProfile();
        console.log("Profile.vue: Received profile data:", response);
        if (response && response.data && response.data.success) {
            user.value = response.data.data;
            console.log("Profile.vue: User data set:", user.value);
            // 更新成就统计 (如果 user.value.achievementsCount 来自后端，则不需要这行)
            // user.value.achievementsCount = userAchievements.value.filter(a => a.achieved).length;
        } else {
            ElMessage.error(response.data.message || '获取用户信息失败');
            console.error("Profile.vue: Failed to fetch profile:", response.data);
        }
    } catch (error) {
        ElMessage.error('获取用户信息请求失败，请检查网络或稍后再试');
        console.error("Profile.vue: Error fetching profile:", error);
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('isTestUser');
            router.push('/'); // Redirect to login if unauthorized
        }
    } finally {
        loadingInstance.close();
    }
};

onMounted(() => {
    fetchUserProfile();
    // 静态成就数量统计 (如果后端不直接提供此统计)
    // user.value.achievementsCount = userAchievements.value.filter(a => a.achieved).length; 
    // ^^^ This line would error if user.value is null initially.
    // Consider moving this to after user.value is populated if achievementsCount is not part of UserDTO
});

const goToEditProfile = () => {
    router.push('/profile/edit');
};

// viewJourneyDetail function is no longer needed here as completedJourneys list is removed
/*
const viewJourneyDetail = (journeyId) => {
    ...
};
*/

</script>

<style scoped>
.profile-container {
    padding: 20px;
    max-width: 900px; /* Added max-width for better layout on wider screens */
    margin: 0 auto; /* Center the container */
}

.profile-header-card {
    margin-bottom: 30px; /* Increased margin */
    border-radius: 12px; /* Softer corners */
    box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* Subtle shadow */
}

.profile-main-info {
    display: flex;
    align-items: flex-start; /* Align items to the top */
    gap: 30px;
}

.profile-avatar {
    flex-shrink: 0; /* Prevent avatar from shrinking */
    border: 3px solid #fff; /* White border around avatar */
    box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Shadow for avatar */
}

.user-details {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.username-row {
    display: flex;
    align-items: baseline; /* Align nickname and username nicely */
    margin-bottom: 8px;
    flex-wrap: wrap; /* Allow wrapping if space is tight */
}

.nickname {
    margin: 0;
    font-size: 26px; /* Slightly larger nickname */
    font-weight: 600; /* Bolder nickname */
    color: #303133;
    margin-right: 10px; /* Space between nickname and username tag */
}

.username-tag {
    font-size: 14px;
    color: #909399; /* Softer color for username */
    background-color: #f4f4f5;
    padding: 2px 6px;
    border-radius: 4px;
}

.signature {
    color: #606266;
    font-size: 15px; /* Slightly larger signature */
    margin-bottom: 15px;
    min-height: 20px; 
    line-height: 1.6;
}

.additional-info {
    display: flex;
    flex-wrap: wrap; 
    gap: 15px 25px; /* Adjusted gap for better spacing */
    margin-bottom: 20px;
    align-items: center; /* Vertically align items in a row */
    padding-top: 5px; /* Add some space above this section */
}

.info-item {
    display: inline-flex; /* Changed to inline-flex for better wrapping with gap */
    align-items: center;
    font-size: 14px;
    color: #555;
    line-height: 1.5; /* Ensure consistent line height */
}

.info-item .el-icon {
    margin-right: 6px;
    font-size: 16px; 
    color: #009688; 
    flex-shrink: 0; /* Prevent icon from shrinking */
}
.gender-item .el-icon {
    /* Vertically align gender icon with text if needed, assuming text is slightly taller */
    /* margin-bottom: -2px; */ 
}
.gender-text-fallback {
    margin-left: 4px; /* If icon is not shown for some gender strings */
}
/* Specific alignment for skills if needed, but inline-flex with align-items should handle most cases */
.skills-item .el-icon {
   margin-top: 1px; /* Fine-tune icon vertical alignment if needed */
}
.skills-text {
    word-break: break-all; /* Allow long skill descriptions to wrap */
}

.edit-profile-btn {
   align-self: flex-start; 
}

/* Styles for new sections, adapted from TravelRecords.vue */
.profile-section-card {
    margin-bottom: 20px;
}

.profile-section-card .card-header span {
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.achievements-list {
    padding-top: 10px;
}

.achievement-item {
    display: flex;
    align-items: flex-start; 
    padding: 15px;
    border-radius: 8px;
    background-color: #f8f9fa;
    margin-bottom: 15px;
    border: 1px solid #e9ecef;
    min-height: 110px; /* Adjusted height */
    transition: all 0.2s ease-in-out;
}
.achievement-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.achievement-item.achieved {
    background-color: #f0f9eb; 
    border-color: #c2e7b0;
}
.achievement-item.achieved .achievement-info h4{
    color: #67c23a;
}

.achievement-icon {
    margin-right: 15px;
    color: #409EFF;
    flex-shrink: 0; 
    margin-top: 2px; /* Align icon better with text */
}

.achievement-item.achieved .achievement-icon {
    color: #67c23a;
}

.achievement-info {
    flex-grow: 1;
}

.achievement-info h4 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 16px;
}

.achievement-info p {
    margin: 0 0 8px 0;
    color: #606266;
    font-size: 13px;
    line-height: 1.5;
}

.profile-timeline {
    padding-top: 10px;
    margin-left: 5px; /* Align timeline better */
}

.profile-timeline .el-timeline-item h4 {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 5px;
}
.profile-timeline .el-timeline-item p {
    font-size: 13px;
    color: #555;
    line-height: 1.6;
}

/* Removed styles for completed-journeys-card */
/*
.completed-journeys-card .card-header span {
    ...
}
...
*/
</style> 