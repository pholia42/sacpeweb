<template>
    <div class="profile-container">
        <!-- 顶部个人信息 -->
        <el-card class="profile-header-card">
            <div class="profile-header">
                <el-avatar :size="100" :src="user.avatar">{{ user.nickname.charAt(0) }}</el-avatar>
                <div class="user-details">
                    <h2 class="nickname">{{ user.nickname }}</h2>
                    <p class="signature">{{ user.signature || '这位用户很懒，什么都没留下...' }}</p>
                    <div class="user-stats">
                        <span><el-icon><Clock /></el-icon> 打卡次数: <b>{{ user.checkinCount }}</b></span>
                        <span><el-icon><Flag /></el-icon> 完成旅程: <b>{{ user.completedJourneysCount }}</b></span>
                        <span><el-icon><Trophy /></el-icon> 获得成就: <b>{{ user.achievementsCount }}</b></span>
                    </div>
                     <el-button type="primary" plain @click="goToEditProfile" class="edit-profile-btn">
                         <el-icon><Edit /></el-icon> 编辑个人信息
                     </el-button>
                </div>
            </div>
        </el-card>

        <!-- 已完成的旅程列表 (将被替换) -->
        <!-- 
        <el-card class="completed-journeys-card">
            ...
        </el-card>
        -->

        <!-- 新增：我的成就 -->
        <el-card class="achievements-card profile-section-card">
            <template #header>
                <div class="card-header">
                    <span><el-icon><Trophy /></el-icon> 我的成就</span>
                </div>
            </template>
            <div class="achievements-list" v-if="userAchievements.length > 0">
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
            <el-empty v-else description="暂无成就，继续努力哦！"></el-empty>
        </el-card>

        <!-- 新增：历史动态 -->
        <el-card class="history-card profile-section-card">
            <template #header>
                <div class="card-header">
                    <span><el-icon><Tickets /></el-icon> 历史动态</span>
                </div>
            </template>
            <el-timeline v-if="userHistoryRecords.length > 0" class="profile-timeline">
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
            <el-empty v-else description="暂无历史动态"></el-empty>
        </el-card>

    </div>
</template>

<script setup>
import { ref, onMounted, shallowRef } from 'vue'; // shallowRef for icons
import { useRouter } from 'vue-router';
// Updated icon imports
import { Clock, Flag, Trophy, Edit, Tickets, Location as LocationIcon, StarFilled, Promotion, EditPen as EditPenIcon, CircleCheckFilled as CircleCheckFilledIcon } from '@element-plus/icons-vue';

const router = useRouter();

// 模拟当前用户信息 (实际应从状态管理或API获取)
const user = ref({
    id: 1,
    nickname: '蘑菇',
    avatar: require('@/assets/mogu.jpg'),
    signature: '热爱生活，热爱旅行！',
    checkinCount: 10,
    completedJourneysCount: 2,
    achievementsCount: 5 // This can be dynamically computed from userAchievements.filter(a => a.achieved).length
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

// Update achievementsCount based on actual achieved achievements
onMounted(() => {
    user.value.achievementsCount = userAchievements.value.filter(a => a.achieved).length;
    // TODO: 获取用户详细信息、成就、历史动态等
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
}

.profile-header-card {
    margin-bottom: 20px;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 30px;
}

.user-details {
    flex: 1;
}

.nickname {
    margin: 0 0 10px 0;
    font-size: 24px;
}

.signature {
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
    min-height: 20px; 
}

.user-stats {
    display: flex;
    gap: 25px;
    color: #888;
    font-size: 14px;
    margin-bottom: 20px;
}

.user-stats span {
    display: flex;
    align-items: center;
    gap: 5px;
}

.user-stats b {
    font-weight: bold;
    color: #333;
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