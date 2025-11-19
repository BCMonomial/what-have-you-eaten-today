<script setup>
import { ref, onMounted } from 'vue'

// 获取路由参数
const route = useRoute()
const mealId = parseInt(route.params.id)

useHead({
    title: '编辑用餐记录'
})

// 表单数据
const formData = ref({
    name: '',
    category: '',
    mealDate: '',
    location: '',
    rating: null,
    ratingNotes: '',
    remarks: ''
})

// 分类选项
const categoryOptions = [
    { label: '早餐', value: '早餐' },
    { label: '午餐', value: '午餐' },
    { label: '晚餐', value: '晚餐' },
    { label: '零食', value: '零食' },
    { label: '其他', value: '其他' }
]

// 状态
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const loadError = ref('')

// 加载数据
onMounted(async () => {
    try {
        console.log('加载记录 ID:', mealId)

        const meal = await $fetch(`/api/meals/${mealId}`)

        console.log('加载成功:', meal)

        // 填充表单数据
        formData.value = {
            name: meal.name,
            category: meal.category || '',
            mealDate: formatDateForInput(meal.mealDate),
            location: meal.location || '',
            rating: meal.rating,
            ratingNotes: meal.ratingNotes || '',
            remarks: meal.remarks || ''
        }
    } catch (error) {
        console.error('加载失败:', error)
        loadError.value = '加载记录失败'
    } finally {
        isLoading.value = false
    }
})

// 格式化日期为 input[type="date"] 需要的格式 (YYYY-MM-DD)
function formatDateForInput(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 表单验证
function validateForm() {
    if (!formData.value.name.trim()) {
        errorMessage.value = '请输入餐食名称'
        return false
    }
    if (!formData.value.mealDate) {
        errorMessage.value = '请选择用餐日期'
        return false
    }
    return true
}

// 提交表单
async function handleSubmit() {
    errorMessage.value = ''

    if (!validateForm()) {
        return
    }

    isSubmitting.value = true

    try {
        console.log('提交更新:', formData.value)

        const response = await $fetch(`/api/meals/${mealId}`, {
            method: 'PUT',
            body: {
                name: formData.value.name,
                category: formData.value.category,
                mealDate: formData.value.mealDate,
                location: formData.value.location,
                rating: formData.value.rating,
                ratingNotes: formData.value.ratingNotes,
                remarks: formData.value.remarks
            }
        })

        console.log('更新成功:', response)

        // 更新成功，跳转到首页
        navigateTo('/')
    } catch (error) {
        console.error('更新失败:', error)
        errorMessage.value = error.statusMessage || '更新失败，请重试'
    } finally {
        isSubmitting.value = false
    }
}

// 取消并返回
function handleCancel() {
    if (confirm('确定要放弃当前编辑吗？')) {
        navigateTo('/')
    }
}

// 删除记录
async function handleDelete() {
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
</script>

<template>
    <MainLayout title="编辑用餐记录">
        <div class="form-container">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
                <Icon name="mdi:loading" class="spinning" size="48" />
                <p>加载中...</p>
            </div>

            <!-- 加载错误 -->
            <div v-else-if="loadError" class="error-state">
                <Icon name="mdi:alert-circle" size="64" />
                <h3>{{ loadError }}</h3>
                <button @click="navigateTo('/')" class="btn btn-primary">
                    返回首页
                </button>
            </div>

            <!-- 表单 -->
            <div v-else class="form-card">
                <!-- 错误提示 -->
                <div v-if="errorMessage" class="error-banner">
                    <Icon name="mdi:alert-circle" size="20" />
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleSubmit" class="meal-form">
                    <!-- 餐食名称 -->
                    <div class="form-group">
                        <label class="form-label required">
                            <Icon name="mdi:food" size="18" />
                            餐食名称
                        </label>
                        <input v-model="formData.name" type="text" class="form-input" placeholder="例如：红烧肉套餐" required />
                    </div>

                    <!-- 用餐类别 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:tag" size="18" />
                            用餐类别
                        </label>
                        <select v-model="formData.category" class="form-select">
                            <option value="">请选择</option>
                            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <!-- 用餐日期 -->
                    <div class="form-group">
                        <label class="form-label required">
                            <Icon name="mdi:calendar" size="18" />
                            用餐日期
                        </label>
                        <input v-model="formData.mealDate" type="date" class="form-input" required />
                    </div>

                    <!-- 用餐地点 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:map-marker" size="18" />
                            用餐地点
                        </label>
                        <input v-model="formData.location" type="text" class="form-input" placeholder="例如：公司食堂" />
                    </div>

                    <!-- 评分 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:star" size="18" />
                            评分 (0-5分)
                        </label>
                        <input v-model.number="formData.rating" type="number" step="0.5" min="0" max="5"
                            class="form-input" placeholder="例如：4.5" />
                    </div>

                    <!-- 评价正文 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:comment-text" size="18" />
                            评价
                        </label>
                        <textarea v-model="formData.ratingNotes" class="form-textarea" rows="3"
                            placeholder="说说你的感受..."></textarea>
                    </div>

                    <!-- 备注 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:note-text" size="18" />
                            备注
                        </label>
                        <textarea v-model="formData.remarks" class="form-textarea" rows="2"
                            placeholder="其他想记录的信息..."></textarea>
                    </div>

                    <!-- 按钮组 -->
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                            <Icon v-if="!isSubmitting" name="mdi:check" />
                            <Icon v-else name="mdi:loading" class="spinning" />
                            {{ isSubmitting ? '保存中...' : '保存修改' }}
                        </button>

                        <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="isSubmitting">
                            <Icon name="mdi:close" />
                            取消
                        </button>

                        <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="isSubmitting">
                            <Icon name="mdi:delete" />
                            删除
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </MainLayout>
</template>

<style scoped>
.form-container {
    max-width: 800px;
    margin: 0 auto;
}

/* 加载状态 */
.loading-state {
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

/* 错误状态 */
.error-state {
    background: white;
    border-radius: 8px;
    padding: 80px 40px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-state h3 {
    margin: 16px 0 24px 0;
    color: #e74c3c;
}

/* 表单卡片 */
.form-card {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-banner {
    background: #ffebee;
    color: #c62828;
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.meal-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.form-label.required::after {
    content: '*';
    color: #e74c3c;
    margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
    padding: 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
    outline: none;
    border-color: #3498db;
}

.form-textarea {
    resize: vertical;
    font-family: inherit;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #3498db;
    color: white;
    flex: 1;
}

.btn-primary:hover:not(:disabled) {
    background: #2980b9;
}

.btn-secondary {
    background: #ecf0f1;
    color: #2c3e50;
}

.btn-secondary:hover:not(:disabled) {
    background: #bdc3c7;
}

.btn-danger {
    background: #e74c3c;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #c0392b;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .form-card {
        padding: 20px;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>