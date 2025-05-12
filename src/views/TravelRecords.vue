<template>
    <div class="travel-records-container">
        <el-row :gutter="20">
            <!-- 统计卡片 -->
            <el-col :span="8">
                <el-card class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>总打卡次数</span>
                        </div>
                    </template>
                    <div class="stat-value">{{ stats.totalCheckins }}</div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>完成旅程</span>
                        </div>
                    </template>
                    <div class="stat-value">{{ stats.completedJourneys }}</div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>活跃度</span>
                        </div>
                    </template>
                    <div class="stat-value">{{ stats.activityLevel }}</div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 成就展示 -->
        <el-card class="achievements-card">
            <template #header>
                <div class="card-header">
                    <span>我的成就</span>
                </div>
            </template>
            <div class="achievements-list">
                <el-row :gutter="20">
                    <el-col :span="8" v-for="achievement in achievements" :key="achievement.id">
                        <div class="achievement-item" :class="{ 'achieved': achievement.achieved }">
                            <el-icon :size="24">
                                <component :is="achievement.icon"></component>
                            </el-icon>
                            <div class="achievement-info">
                                <h4>{{ achievement.title }}</h4>
                                <p>{{ achievement.description }}</p>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </el-card>

        <!-- 历史记录 -->
        <el-card class="history-card">
            <template #header>
                <div class="card-header">
                    <span>历史记录</span>
                </div>
            </template>
            <el-timeline>
                <el-timeline-item
                    v-for="record in historyRecords"
                    :key="record.id"
                    :timestamp="record.time"
                    :type="record.type"
                >
                    <h4>{{ record.title }}</h4>
                    <p>{{ record.description }}</p>
                </el-timeline-item>
            </el-timeline>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Location, Trophy, Star } from '@element-plus/icons-vue';

// 统计数据
const stats = ref({
    totalCheckins: 42,
    completedJourneys: 5,
    activityLevel: '活跃'
});

// 成就数据
const achievements = ref([
    {
        id: 1,
        title: '初出茅庐',
        description: '完成第一次打卡',
        icon: 'Location',
        achieved: true
    },
    {
        id: 2,
        title: '旅行达人',
        description: '完成5次旅程',
        icon: 'Trophy',
        achieved: true
    },
    {
        id: 3,
        title: '探索先锋',
        description: '打卡10个不同地点',
        icon: 'Star',
        achieved: false
    }
]);

// 历史记录
const historyRecords = ref([
    {
        id: 1,
        title: '完成云南大理之旅',
        description: '成功完成所有打卡点',
        time: '2024-03-20',
        type: 'success'
    },
    {
        id: 2,
        title: '获得"旅行达人"成就',
        description: '完成5次旅程',
        time: '2024-03-15',
        type: 'primary'
    }
]);
</script>

<style scoped>
.travel-records-container {
    padding: 20px;
}

.stat-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-value {
    font-size: 36px;
    font-weight: bold;
    color: #409EFF;
    text-align: center;
    padding: 20px 0;
}

.achievements-card,
.history-card {
    margin-bottom: 20px;
}

.achievements-list {
    padding: 20px 0;
}

.achievement-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    background-color: #f5f7fa;
    margin-bottom: 15px;
}

.achievement-item.achieved {
    background-color: #f0f9eb;
}

.achievement-info {
    margin-left: 15px;
}

.achievement-info h4 {
    margin: 0 0 5px 0;
    color: #303133;
}

.achievement-info p {
    margin: 0;
    color: #606266;
    font-size: 14px;
}
</style> 