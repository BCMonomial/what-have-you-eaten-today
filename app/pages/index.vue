<script setup>
import { ref, computed, onMounted } from 'vue'

// 引入 user 状态
const { user } = useUser()

// 页面元数据
useHead({
    title: '今天吃什么'
})

// 获取用餐记录数据
const meals = ref([])
const isLoading = ref(true)
const error = ref(null)

onMounted(async () => {
    if (!user.value) {
        isLoading.value = false
        return
    }
    try {
        const data = await $fetch('/api/meals')
        meals.value = data
    } catch (error) {
        console.error('获取数据失败', error)
    } finally {
        isLoading.value = false
    }
})

// 计算统计数据
const stats = computed(() => {
    // 总记录数
    const totalCount = meals.value.length

    // 平均评分
    const ratingsWithValue = meals.value.filter(m => m.rating)
    const averageRating = ratingsWithValue.length > 0
        ? (ratingsWithValue.reduce((sum, m) => sum + m.rating, 0) / ratingsWithValue.length).toFixed(1)
        : 0

    // 本周用餐数
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weeklyCount = meals.value.filter(m => {
        const mealDate = new Date(m.mealDate)
        return mealDate >= weekAgo && mealDate <= now
    }).length

    return {
        totalCount,
        averageRating,
        weeklyCount
    }
})
</script>

<template>
    <MainLayout title="今天吃什么">
        <!-- 统计卡片 -->
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon">
                    <Icon name="mdi:chart-line" size="48" />
                </div>
                <div class="stat-info">
                    <div class="stat-label">总记录数</div>
                    <div class="stat-value">
                        {{ isLoading ? '-' : stats.totalCount }}
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <Icon name="mdi:star" size="48" />
                </div>
                <div class="stat-info">
                    <div class="stat-label">平均评分</div>
                    <div class="stat-value">
                        {{ isLoading ? '-' : stats.averageRating }}
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <Icon name="mdi:calendar-week" size="48" />
                </div>
                <div class="stat-info">
                    <div class="stat-label">本周用餐</div>
                    <div class="stat-value">
                        {{ isLoading ? '-' : stats.weeklyCount }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 用餐记录表格 -->
        <MealTable />
    </MainLayout>
</template>

<style scoped>
.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.stat-card {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-info {
    flex: 1;
}

.stat-label {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
}

.stat-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #667eea;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    color: white;
}

.stat-card:nth-child(2) .stat-icon {
    background: #f093fb 0%;
}

.stat-card:nth-child(3) .stat-icon {
    background: #4facfe 0%;
}
</style>