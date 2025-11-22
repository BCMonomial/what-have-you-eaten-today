<script setup lang="ts">

definePageMeta({
    middleware: 'auth' 
})

import { ref } from 'vue'

useHead({
    title: '添加用餐记录'
})

const isSubmitting = ref(false)

// 提交逻辑
async function createMeal(formData: any) {
    isSubmitting.value = true
    try {
        await $fetch('/api/meals', {
            method: 'POST',
            body: formData
        })
        // 提交成功，跳转到首页
        navigateTo('/')
    } catch (error) {
        console.error('提交失败', error)
        alert('提交失败，请重试')
    } finally {
        isSubmitting.value = false
    }
}

// 取消逻辑
function handleCancel() {
    if (confirm('确定要放弃当前编辑吗？')) {
        navigateTo('/')
    }
}
</script>

<template>
    <MainLayout title="添加用餐记录">
        <div class="form-container">
            <MealForm 
                :is-submitting="isSubmitting" 
                @submit="createMeal" 
                @cancel="handleCancel" 
            />
        </div>
    </MainLayout>
</template>

<style scoped>
.form-container {
    max-width: 800px;
    margin: 0 auto;
}
</style>