<template>
  <div class="plaza-container">
    <div class="search-bar">
      <el-input
          v-model="searchQuery"
          placeholder="搜索目的地、关键词"
          class="search-input"
          prefix-icon="el-icon-search"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-button type="primary" @click="goToCreate" class="create-button">
        <el-icon><Plus /></el-icon>创建行程
      </el-button>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="filterType" @change="handleFilter">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="recruiting">招募中</el-radio-button>
        <el-radio-button label="ongoing">进行中</el-radio-button>
      </el-radio-group>
    </div>

    <div class="journey-list">
      <el-row :gutter="20">
        <el-col :span="8" v-for="journey in filteredJourneys" :key="journey.id">
          <el-card class="journey-card" :body-style="{ padding: '0px' }" @click="viewJourneyDetail(journey.id)">
            <img :src="getImage(journey.coverImage)" class="journey-image">
            <div class="journey-info">
              <h3 class="journey-title">{{ journey.title }}</h3>
              <div class="journey-meta">
                <span class="journey-date">
                  <el-icon><Calendar /></el-icon>
                  {{ journey.startDate }} - {{ journey.endDate }}
                </span>
                <span class="journey-location">
                  <el-icon><Location /></el-icon>
                  {{ journey.location }}
                </span>
              </div>
              <div class="journey-stats">
                <div class="journey-tags">
                  <el-tag v-for="keyword in journey.keywords" :key="keyword" size="small" type="info" class="keyword-tag">
                    {{ keyword }}
                  </el-tag>
                </div>
                <div class="journey-budget">
                  <el-icon><Money /></el-icon>
                  {{ journey.budget }}
                </div>
              </div>
              <div class="journey-creator">
                <el-avatar :size="24" :src="journey.creator.avatar"></el-avatar>
                <span>{{ journey.creator.nickname }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Calendar, Location, User, Money } from '@element-plus/icons-vue';

const router = useRouter();
const searchQuery = ref('');
const filterType = ref('all');

// 模拟行程数据
const journeys = ref([
  {
    id: 1,
    title: '云南大理古城之旅',
    coverImage: 'dali.png',
    startDate: '2025-05-01',
    endDate: '2025-05-05',
    location: '云南大理',
    status: 'recruiting',
    keywords: ['纯玩', '全女'],
    budget: '3000-5000',
    creator: {
      nickname: '李野',
      avatar: require('@/assets/avatar1.jpg')
    }
  },
  {
    id: 2,
    title: '三亚阳光沙滩度假',
    coverImage: 'sanya.png',
    startDate: '2025-04-10',
    endDate: '2025-04-15',
    location: '海南三亚',
    status: 'ongoing',
    keywords: ['纯玩', '会拍照'],
    budget: '5000-8000',
    creator: {
      nickname: '栎子星',
      avatar: require('@/assets/avatar2.jpg')
    }
  },
  {
    id: 3,
    title: '北京故宫长城游',
    coverImage: 'gugong.png',
    startDate: '2025-05-01',
    endDate: '2025-05-03',
    location: '北京',
    status: 'recruiting',
    keywords: ['特种兵穷游'],
    budget: '2000-3000',
    creator: {
      nickname: '鱼丸粗面',
      avatar: require('@/assets/avatar3.jpg')
    }
  }
]);

const getImage = (img) => {
  try {
    return require(`@/assets/${img}`);
  } catch {
    return '';
  }
};

// 根据筛选条件过滤行程
const filteredJourneys = computed(() => {
  let result = journeys.value;

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(journey =>
        journey.title.toLowerCase().includes(query) ||
        journey.location.toLowerCase().includes(query)
    );
  }

  // 状态过滤
  if (filterType.value !== 'all') {
    result = result.filter(journey => journey.status === filterType.value);
  }

  return result;
});

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    recruiting: 'success',
    ongoing: 'warning',
    completed: 'info'
  };
  return types[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    recruiting: '招募中',
    ongoing: '进行中',
    completed: '已结束'
  };
  return texts[status] || '未知';
};

// 搜索处理
const handleSearch = () => {
  // 实际项目中这里会调用API
  console.log('搜索:', searchQuery.value);
};

// 筛选处理
const handleFilter = () => {
  // 实际项目中这里会调用API
  console.log('筛选:', filterType.value);
};

// 查看行程详情
const viewJourneyDetail = (id) => {
  router.push(`/journey/${id}`);
};

// 跳转到创建行程页面
const goToCreate = () => {
  router.push('/journey/create');
};
</script>

<style scoped>
.plaza-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-bar {
  margin-bottom: 20px;
}

.journey-list {
  margin-top: 20px;
}

.journey-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.journey-card:hover {
  transform: translateY(-5px);
}

.journey-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.journey-info {
  padding: 15px;
}

.journey-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.journey-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.journey-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.journey-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.journey-tags {
  display: flex;
  gap: 5px;
}

.keyword-tag {
  margin-right: 5px;
}

.journey-budget {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.journey-creator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}
</style>