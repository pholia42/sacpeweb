<template>
    <div class="my-journeys-container">
        <el-row :gutter="20">
            <el-col :span="6">
                <div class="sidebar">
                    <el-card class="user-card">
                        <div class="user-info">
                            <el-avatar :size="64" :src="user.avatar">{{ userInitials }}</el-avatar>
                            <div class="user-meta">
                                <div class="user-name">{{ user.nickname }}</div>
                                <div class="user-stats">
                                    <span>行程数 <b>{{ user.journeyCount }}</b></span>
                                    <span>打卡数 <b>{{ user.checkinCount }}</b></span>
                                </div>
                            </div>
                        </div>
                    </el-card>
                    <el-card class="calendar-card">
                        <el-calendar v-model="calendarDate">
                            <template #header="{ date }">
                                <div class="calendar-header">
                                    <span>{{ formatCalendarHeader(date) }}</span>
                                </div>
                            </template>
                            <template #dateCell="{ data }">
                                <div :class="getDateClass(data)">
                                    <p class="date-number">{{ data.day.split('-').slice(2).join('') }}</p>
                                    <div v-if="getJourneyOnDate(data.day)" class="journey-dot"></div>
                                    <div v-if="getJourneyStartDate(data.day)" class="journey-start-tag" @click="viewJourneyOnDate(data.day)">
                                        <el-tag size="small" type="success">{{ getJourneyTitle(data.day) }}</el-tag>
                                    </div>
                                </div>
                            </template>
                        </el-calendar>
                    </el-card>
                </div>
            </el-col>
            <el-col :span="18">
                <div class="header">
                    <h2>我的旅程</h2>
                    <el-button type="primary" @click="goToCreateJourney">创建新旅程</el-button>
                </div>

                <el-tabs v-model="activeTab">
                    <el-tab-pane label="进行中" name="ongoing">
                        <div class="journey-list">
                            <el-card v-for="journey in ongoingJourneys" :key="journey.id" class="journey-card">
                                <template #header>
                                    <div class="journey-header">
                                        <h3>{{ journey.title }}</h3>
                                        <el-tag type="success">进行中</el-tag>
                                    </div>
                                </template>
                                <div class="journey-content-wrapper">
                                    <div class="journey-content">
                                        <p>{{ journey.description }}</p>
                                        <div class="journey-tags">
                                            <el-tag v-for="tag in journey.tags" :key="tag" size="small" class="journey-tag">
                                                {{ tag }}
                                            </el-tag>
                                        </div>
                                        <div class="journey-info">
                                            <span>开始时间：{{ journey.startDate }}</span>
                                            <span>结束时间：{{ journey.endDate }}</span>
                                            <span class="budget">预算：¥{{ journey.budget }}</span>
                                        </div>
                                        <div class="journey-actions">
                                            <el-button type="primary" @click="manageJourney(journey.id)">管理旅程</el-button>
                                            <el-button @click="viewJourney(journey.id)">查看详情</el-button>
                                        </div>
                                    </div>
                                    <div class="journey-image" v-if="journey.coverImage">
                                        <img :src="journey.coverImage" :alt="journey.title">
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="已发布" name="published">
                        <div class="journey-list">
                            <el-card v-for="journey in publishedJourneys" :key="journey.id" class="journey-card">
                                <template #header>
                                    <div class="journey-header">
                                        <h3>{{ journey.title }}</h3>
                                        <el-tag type="info">招募中</el-tag>
                                    </div>
                                </template>
                                <div class="journey-content-wrapper">
                                    <div class="journey-content">
                                        <p>{{ journey.description }}</p>
                                        <div class="journey-tags">
                                            <el-tag v-for="tag in journey.tags" :key="tag" size="small" class="journey-tag">
                                                {{ tag }}
                                            </el-tag>
                                        </div>
                                        <div class="journey-info">
                                            <span>发布时间：{{ journey.publishDate }}</span>
                                            <span>开始时间：{{ journey.startDate }}</span>
                                            <span>结束时间：{{ journey.endDate }}</span>
                                            <span class="budget">预算：¥{{ journey.budget }}</span>
                                        </div>
                                        <div class="journey-actions">
                                            <el-button type="primary" @click="manageJourney(journey.id)">管理旅程</el-button>
                                            <el-button @click="viewJourney(journey.id)">查看详情</el-button>
                                        </div>
                                    </div>
                                    <div class="journey-image" v-if="journey.coverImage">
                                        <img :src="journey.coverImage" :alt="journey.title">
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const activeTab = ref('ongoing');
const calendarDate = ref(new Date());

const user = ref({
  nickname: '蘑菇',
  avatar: require('@/assets/mogu.jpg'),
  journeyCount: 5,
  checkinCount: 10
});

// 计算用户头像首字母
const userInitials = computed(() => {
    return user.value.nickname ? user.value.nickname.charAt(0).toUpperCase() : '';
});

// 模拟数据
const ongoingJourneys = ref([
  {
    id: 1,
    title: '云南大理之旅',
    description: '探索大理古城，感受白族文化',
    startDate: '2025-05-20',
    endDate: '2025-05-25',
    budget: 2000,
    coverImage: require('@/assets/dali.png'),
    tags: ['文化', '美食', '摄影'],
    status: 'ongoing'
  }
]);

const publishedJourneys = ref([
  {
    id: 2,
    title: '西藏朝圣之旅',
    description: '探索西藏神秘文化，感受高原风光',
    startDate: '2025-06-15',
    endDate: '2025-06-25',
    budget: 5200,
    coverImage: require('@/assets/tibet.png'),
    publishDate: '2025-03-01',
    tags: ['文化', '摄影', '自然'],
    status: 'published'
  }
]);

// 收集所有行程的出行日期（范围内每一天）
const journeyDates = ref([]);
const collectJourneyDates = () => {
    journeyDates.value = [];
    const allJourneys = [...ongoingJourneys.value, ...publishedJourneys.value];
    allJourneys.forEach(journey => {
        if (journey.startDate && journey.endDate) {
            const start = new Date(journey.startDate);
            const end = new Date(journey.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                journeyDates.value.push(d.toISOString().slice(0, 10));
            }
        } else if (journey.startDate) {
            journeyDates.value.push(journey.startDate);
        }
    });
};

// 获取日期样式
const getDateClass = (data) => {
  const date = new Date(data.day);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const hasJourney = getJourneyOnDate(data.day);
  
  return {
    'calendar-day': true,
    'is-today': isToday,
    'has-journey': hasJourney
  };
};

// 检查日期是否有旅程
const getJourneyOnDate = (date) => {
  const allJourneys = [...ongoingJourneys.value, ...publishedJourneys.value];
  return allJourneys.some(journey => {
    const startDate = new Date(journey.startDate);
    const endDate = new Date(journey.endDate);
    const checkDate = new Date(date);
    // 日期比较需要注意时区问题，简单比较 YYYY-MM-DD 字符串更可靠
    const checkDateStr = checkDate.toISOString().slice(0, 10);
    return journeyDates.value.includes(checkDateStr);
  });
};

// 格式化日历头部为中文
const formatCalendarHeader = (date) => {
    // Element Plus 的日历组件传递的是字符串格式的日期
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    return `${year}年${month}月`;
};

// 检查是否是旅程开始日期
const getJourneyStartDate = (date) => {
    const allJourneys = [...ongoingJourneys.value, ...publishedJourneys.value];
    return allJourneys.some(journey => journey.startDate === date);
};

// 获取旅程标题
const getJourneyTitle = (date) => {
    const allJourneys = [...ongoingJourneys.value, ...publishedJourneys.value];
    const journey = allJourneys.find(journey => journey.startDate === date);
    // 截取前两个字作为标签演示
    return journey ? journey.title.slice(0, 2) : '出发'; 
};

// 查看特定日期的旅程
const viewJourneyOnDate = (date) => {
    const allJourneys = [...ongoingJourneys.value, ...publishedJourneys.value];
    const journey = allJourneys.find(journey => journey.startDate === date);
    if (journey) {
        // 点击日历标签跳转到管理页面
        router.push(`/manage/${journey.id}`);
    }
};

// 跳转到创建行程页面
const goToCreateJourney = () => {
    router.push('/journey/create');
};

// 管理旅程
const manageJourney = (journeyId) => {
  console.log('管理旅程:', journeyId);
  // 跳转到管理页面
  router.push(`/manage/${journeyId}`);
};

// 查看旅程详情
const viewJourney = (journeyId) => {
  console.log('查看旅程:', journeyId);
  // "查看详情" 也跳转到管理页面
  router.push(`/manage/${journeyId}`); 
};

onMounted(() => {
    collectJourneyDates();
});

</script>

<style scoped>
.my-journeys-container {
  padding: 20px;
}

.sidebar {
  position: sticky;
  top: 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-meta {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-stats {
  display: flex;
  gap: 15px;
  color: #666;
}

.user-stats b {
  color: #409EFF;
}

.calendar-card {
  margin-bottom: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.journey-list {
  display: grid;
  gap: 20px;
}

.journey-card {
  transition: all 0.3s;
}

.journey-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.journey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.journey-header h3 {
  margin: 0;
  font-size: 18px;
}

.journey-content-wrapper {
  display: flex;
  gap: 20px;
}

.journey-content {
  flex: 1;
  color: #666;
}

.journey-image {
  width: 200px;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
}

.journey-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.journey-info {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.journey-info .budget {
  color: #f56c6c;
  font-weight: bold;
}

.journey-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.journey-tags {
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.journey-tag {
  margin-right: 5px;
}

.calendar-header {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
}

.calendar-day {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
  min-height: 60px;
}

.date-number {
    margin: 0;
    font-size: 14px;
    line-height: 1;
    text-align: center;
}

.is-today {
  background-color: #ecf5ff;
  border-radius: 4px;
}

.has-journey .journey-dot {
  width: 6px;
  height: 6px;
  background-color: #409EFF;
  border-radius: 50%;
  position: absolute;
  /* 调整点的位置，避免与标签重叠 */
  top: 2px;
  right: 2px;
}

.journey-start-tag {
    position: absolute;
    bottom: 2px;
    cursor: pointer;
    z-index: 1;
}

.journey-start-tag:hover {
    transform: scale(1.1);
    transition: transform 0.2s;
}

:deep(.el-calendar-table td) {
    border: none;
    padding: 4px;
}

:deep(.el-calendar-table tr) {
    border-top: 1px solid #ebeef5;
}

:deep(.el-calendar-table thead th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 500;
    padding: 8px;
    text-align: center;
}

:deep(.el-calendar__header) {
    padding: 12px 20px;
}

:deep(.el-calendar__body) {
    padding: 12px 20px;
}

.journey-cover-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 200px;
    height: 150px;
}

.journey-cover-uploader:hover {
    border-color: #409EFF;
}

.cover-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 200px;
    height: 150px;
    line-height: 150px;
    text-align: center;
}

.cover-image {
    width: 200px;
    height: 150px;
    display: block;
    object-fit: cover;
}
</style> 