<script setup>
import { ref } from 'vue'

const { user, logout } = useUser()

// 功能按钮列表
const functionButtons = [
    { id: 'home', icon: 'mdi:home', label: '首页', path: '/' },
    { id: 'add', icon: 'mdi:plus-circle', label: '添加记录', path: '/meals/new' },
    { id: 'search', icon: 'mdi:magnify', label: '搜索', path: '/search' }
]

// 个人状态按钮，动态计算
const userButtons = computed(() => {
    if (user.value) {
        // 已登录
        const btns = [
            { id: 'logout', icon: 'mdi:logout', label: '退出登录', action: 'logout' }
        ]
        // 如果是管理员，在前面插入管理按钮
        if (user.value.role === 'admin') {
            btns.unshift({ 
                id: 'admin', 
                icon: 'mdi:shield-account', 
                label: '系统管理', 
                path: '/admin' 
            })
        }    
        return btns
    } else {
        // 未登录
        return [
            { id: 'login', icon: 'mdi:login', label: '登录', path: '/login' }
        ]
    }
})

// 当前悬浮的按钮
const hoveredButton = ref(null)

// 处理按钮点击
function handleClick(button) {
    if (button.action === 'logout') {
        if (confirm('确定要退出登录吗？')) {
            logout()
        }
    } else if (button.path) {
        navigateTo(button.path)
    }
}
</script>

<template>
    <aside class="sidebar">
        <!-- 上方功能按钮区域 -->
        <div class="button-group">
            <button v-for="btn in functionButtons" :key="btn.id" class="sidebar-button" @click="handleClick(btn)"
                @mouseenter="hoveredButton = btn.id" @mouseleave="hoveredButton = null">
                <Icon :name="btn.icon" class="icon" />

                <!-- 悬浮时显示的文字提示 -->
                <span v-show="hoveredButton === btn.id" class="tooltip">
                    {{ btn.label }}
                </span>
            </button>
        </div>

        <!-- 下方个人管理按钮区域 -->
        <div class="button-group bottom">
            <button v-for="btn in userButtons" :key="btn.id" class="sidebar-button" @click="handleClick(btn)"
                @mouseenter="hoveredButton = btn.id" @mouseleave="hoveredButton = null">
                <Icon :name="btn.icon" class="icon" />

                <span v-show="hoveredButton === btn.id" class="tooltip">
                    {{ btn.label }}
                </span>
            </button>
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    width: 64px;
    height: 100vh;
    background: #2c3e50;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.button-group {
    display: flex;
    flex-direction: column;
    padding: 12px 0;
}

.button-group.bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-button {
    width: 64px;
    height: 64px;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    color: #ecf0f1; 
}

.sidebar-button:hover {
    background: rgba(255, 255, 255, 0.1);
}

.icon {
    font-size: 24px;
    transition: transform 0.3s;
}

.sidebar-button:hover .icon {
    transform: scale(1.1);
    color: #3498db; 
}

/* 悬浮提示框 */
.tooltip {
    position: absolute;
    left: 72px;
    background: #34495e;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    animation: fadeIn 0.2s;
}

/* 提示框小三角 */
.tooltip::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #34495e;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>