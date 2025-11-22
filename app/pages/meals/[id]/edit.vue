<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route = useRoute()
const mealId = parseInt(route.params.id as string)

useHead({
    title: '编辑用餐记录'
})

// 状态
const initialData = ref<any>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')

// 加载数据
onMounted(async () => {
    try {
        const meal = await $fetch(`/api/meals/${mealId}`)
        initialData.value = meal
    } catch (error) {
        console.error('加载失败:', error)
        loadError.value = '加载记录失败'
    } finally {
        isLoading.value = false
    }
})

// 更新逻辑
async function updateMeal(formData: any) {
    isSubmitting.value = true
    try {
        await $fetch(`/api/meals/${mealId}`, {
            method: 'PUT',
            body: formData
        })
        navigateTo('/')
    } catch (error: any) {
        console.error('更新失败:', error)
        alert(error.statusMessage || '更新失败，请重试')
    } finally {
        isSubmitting.value = false
    }
}

// 删除逻辑
async function deleteMeal() {
    if (!confirm('确定要删除这条记录吗？此操作无法撤销！')) {
        return
    }
    try {
        await $fetch(`/api/meals/${mealId}`, { method: 'DELETE' })
        navigateTo('/')
    } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败，请重试')
    }
}

function handleCancel() {
    if (confirm('确定要放弃修改吗？')) {
        navigateTo('/')
    }
}
</script>

<template>
    <MainLayout title="编辑用餐记录">
        <div class="form-container">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
                <Icon name="mdi:loading" class="spinning" size="48" />
                <p>加载中...</p>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="loadError" class="error-state">
                <Icon name="mdi:alert-circle" size="64" />
                <h3>{{ loadError }}</h3>
                <button @click="navigateTo('/')" class="btn-back">
                    返回首页
                </button>
            </div>

            <!-- 表单 -->
            <MealForm 
                v-else
                :initial-data="initialData" 
                :is-submitting="isSubmitting" 
                :is-edit-mode="true"
                @submit="updateMeal"
                @cancel="handleCancel"
                @delete="deleteMeal"
            />
        </div>
    </MainLayout>
</template>

<style scoped>
.form-container {
    max-width: 800px;
    margin: 0 auto;
}

.loading-state,
.error-state {
    background: white;
    border-radius: 8px;
    padding: 80px 40px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state p {
    margin-top: 16px;
    color: #6c757d;
}

.error-state h3 {
    margin: 16px 0 24px 0;
    color: #e74c3c;
}

.btn-back {
    padding: 8px 16px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>