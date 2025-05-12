<template>
    <div class="journey-detail-public">
        <el-row :gutter="20">
            <el-col :span="16">
                <el-card class="journey-info-card">
                    <template #header>
                        <div class="journey-title">
                            <h2>{{ journey.title }}</h2>
                            <el-tag type="info" v-if="journey.status === 'published'">招募中</el-tag>
                        </div>
                    </template>
                    
                    <div class="info-layout">
                        <div class="meta-and-description">
                            <div class="journey-meta">
                                <span>发起人：
                                    <el-avatar :size="24" :src="journey.creator.avatar" style="vertical-align: middle; margin-right: 5px;">{{ journey.creator.name.charAt(0) }}</el-avatar>
                                    {{ journey.creator.name }}
                                </span>
                                <span>发布时间：{{ journey.publishDate }}</span>
                                <span>计划开始：{{ journey.startDate }}</span>
                                <span>计划结束：{{ journey.endDate }}</span>
                                <span class="budget">预算：¥{{ journey.budget }}</span>
                            </div>
                            <div class="journey-description">
                                <h3>行程描述</h3>
                                <p>{{ journey.description }}</p>
                            </div>
                        </div>
                         <div class="journey-cover" v-if="journey.coverImage">
                            <img :src="journey.coverImage" :alt="journey.title">
                        </div>
                    </div>
                    
                    <div class="journey-tags">
                        <h3>标签</h3>
                        <el-tag v-for="tag in journey.tags" :key="tag" size="small" class="journey-tag">
                            {{ tag }}
                        </el-tag>
                    </div>

                    <div class="journey-itinerary">
                        <h3>详细行程安排</h3>
                        <el-timeline>
                            <el-timeline-item 
                                v-for="(item, index) in journey.itinerary" 
                                :key="index" 
                                :timestamp="item.date + ' ' + item.time">
                                {{ item.activity }}
                            </el-timeline-item>
                        </el-timeline>
                    </div>

                    <div class="actions">
                        <el-button type="primary" @click="joinJourney">报名参加</el-button>
                        <el-button @click="goBack">返回</el-button>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card class="creator-card">
                    <template #header>
                        <span>发起人信息</span>
                    </template>
                    <div class="creator-info">
                        <el-avatar :size="64" :src="journey.creator.avatar">{{ journey.creator.name.charAt(0) }}</el-avatar>
                        <div class="creator-meta">
                            <div class="creator-name">{{ journey.creator.name }}</div>
                            <!-- 可以添加更多发起人信息，如信誉、历史行程等 -->
                        </div>
                    </div>
                </el-card>
                <!-- 可以添加地图、天气等相关信息卡片 -->
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

// 模拟公共行程数据
const journey = ref({
    id: 2, // 假设这是从广场点击的行程ID
    title: '西藏朝圣之旅', 
    status: 'published', // 状态为招募中
    startDate: '2025-06-15',
    endDate: '2025-06-25',
    budget: 5200,
    // 使用正确的 require 路径
    coverImage: require('@/assets/tibet.png'), 
    publishDate: '2025-03-01',
    description: '探索西藏神秘文化，感受高原风光。计划游览布达拉宫、大昭寺、纳木错等地，体验独特的藏传佛教氛围和壮丽的自然景观。',
    tags: ['文化', '摄影', '自然', '宗教'],
    creator: {
        id: 101, // 发起人ID
        name: '鱼丸粗面',
        // 使用正确的 require 路径 (假设有这个头像文件)
        avatar: require('@/assets/avatar3.jpg')
    },
    // 添加详细行程安排
    itinerary: [
        { date: '2025-06-15', time: '全天', activity: '抵达拉萨，入住酒店，适应高原环境' },
        { date: '2025-06-16', time: '09:00', activity: '参观布达拉宫' },
        { date: '2025-06-16', time: '14:00', activity: '参观大昭寺及八廓街' },
        { date: '2025-06-17', time: '08:00', activity: '前往纳木错，欣赏湖光山色' },
        { date: '2025-06-18', time: '10:00', activity: '参观色拉寺，观看辩经' },
        // ... 更多行程安排
    ]
});

// 方法
const joinJourney = () => {
    // TODO: 实现报名参加行程的逻辑
    ElMessage.info('报名功能开发中');
};

const goBack = () => {
    router.back();
};

onMounted(() => {
    // TODO: 根据路由参数 route.params.id 从后端获取真实的公共行程详情
    console.log('Fetching public journey details for ID:', route.params.id);
    // 模拟：如果路由ID和模拟数据ID不符，可以清空或提示错误
    const routeId = route.params.id;
    if (routeId && routeId !== journey.value.id.toString()) {
        // 这里演示加载 ID 为 1 的大理数据
        if (routeId === '1') {
             journey.value = {
                id: 1,
                title: '云南大理之旅',
                status: 'published',
                startDate: '2025-05-20',
                endDate: '2025-05-25',
                budget: 2000,
                coverImage: require('@/assets/dali.png'),
                publishDate: '2025-04-01',
                description: '一起探索大理古城，感受洱海边的浪漫，体验白族风情。计划环洱海骑行，参观崇圣寺三塔，品尝当地美食。',
                tags: ['文化', '美食', '摄影', '休闲'],
                creator: {
                    id: 1, // 假设是蘑菇发布的
                    name: '蘑菇',
                    avatar: require('@/assets/mogu.jpg')
                },
                itinerary: [
                    { date: '2025-05-20', time: '14:00', activity: '抵达大理，入住古城客栈' },
                    { date: '2025-05-21', time: '09:00', activity: '租车环洱海东路骑行，途径小普陀' },
                    { date: '2025-05-22', time: '10:00', activity: '参观崇圣寺三塔' },
                    { date: '2025-05-23', time: '09:30', activity: '乘坐缆车上苍山，俯瞰洱海全景' },
                    { date: '2025-05-24', time: '全天', activity: '古城闲逛，品尝白族美食，购买纪念品' },
                    { date: '2025-05-25', time: '下午', activity: '整理行装，前往机场/火车站返程' }
                ]
            };
             console.warn(`Route ID is 1. Showing Dali journey data.`);
        } else {
            ElMessage.error('行程信息加载失败');
            journey.value = { creator: {}, itinerary: [] }; // 清空数据
            console.warn(`Route ID ${routeId} doesn't match sample ID ${journey.value.id}. Clearing data.`);
        }
    }
});
</script>

<style scoped>
.journey-detail-public {
    padding: 20px;
}

.journey-info-card {
    margin-bottom: 20px;
}

.journey-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.journey-title h2 {
    margin: 0;
}

/* 新增: 信息布局容器 */
.info-layout {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

/* 新增: 元信息和描述容器 */
.meta-and-description {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.journey-cover {
    width: 250px; /* 图片宽度 */
    height: 180px; /* 图片高度 */
    overflow: hidden;
    border-radius: 8px;
    flex-shrink: 0; /* 防止图片被压缩 */
}

.journey-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.journey-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px; /* 行间距和列间距 */
    color: #666;
    margin-bottom: 20px; /* 与描述的间距 */
}

.journey-meta span {
    display: flex;
    align-items: center; /* 头像和名字垂直居中 */
}

.journey-meta .budget {
    color: #f56c6c;
    font-weight: bold;
}

.journey-description h3,
.journey-tags h3,
.journey-itinerary h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
}

.journey-description p {
    line-height: 1.6;
    color: #555;
    margin-bottom: 0; /* 移除与 meta 的间距 */
}

.journey-tags {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.journey-tag {
    margin-right: 5px;
    margin-bottom: 5px;
}

/* 新增: 行程安排样式 */
.journey-itinerary {
    margin-bottom: 30px;
}

:deep(.el-timeline-item__timestamp) {
    font-weight: bold;
}

.actions {
    text-align: right;
    margin-top: 20px;
}

.creator-card {
    position: sticky;
    top: 20px;
}

.creator-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.creator-name {
    font-weight: bold;
}
</style> 