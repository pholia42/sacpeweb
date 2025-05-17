import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/views/Layout.vue';
import Profile from '@/views/Profile.vue';
import ProfileEdit from '@/views/ProfileEdit.vue';

const routes = [
    {
        path: '/',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    },
    {
        path: '/reg',
        name: 'Register',
        component: () => import('@/views/Register.vue')
    },
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: 'plaza',
                name: 'Plaza',
                component: () => import('@/views/Plaza.vue')
            },
            {
                path: 'my-journeys',
                name: 'MyJourneys',
                component: () => import('@/views/MyJourneys.vue')
            },
            {
                path: 'travel-records',
                name: 'TravelRecords',
                component: () => import('@/views/TravelRecords.vue')
            },
            {
                path: 'profile',
                name: 'Profile',
                component: Profile
            },
            {
                path: 'profile/edit',
                name: 'ProfileEdit',
                component: ProfileEdit
            },
            {
                path: 'journey/create',
                name: 'CreateJourney',
                component: () => import('../views/CreateJourney.vue')
            },
            {
                path: 'journey/:id',
                name: 'JourneyDetailPublic',
                component: () => import('../views/JourneyDetailPublic.vue')
            },
            {
                path: 'manage/:id',
                name: 'JourneyManage',
                component: () => import('../views/JourneyManage.vue')
            },

            {
                path: 'journey/:id/progress',
                name: 'JourneyInProgress',
                component: () => import('@/views/JourneyInProgressView.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    
    // 如果访问登录或注册页面，直接放行
    if (to.path === '/' || to.path === '/reg') {
        // 优化：如果用户已登录且尝试访问登录/注册页，可以考虑重定向到主页（例如广场页）
        // if (token && (to.path === '/' || to.path === '/reg')) {
        //    next('/plaza');
        //    return;
        // }
        next();
        return;
    }
    
    // 如果没有登录（即没有token），重定向到登录页
    if (!token) {
        next('/');
        return;
    }
    
    // 其他情况（有token，访问非登录/注册页面），正常放行
    next();
});

export default router;