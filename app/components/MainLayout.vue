<script setup>
// 接收 props
const props = defineProps({
    title: {
        type: String,
        default: '页面标题'
    }
})
</script>

<template>
    <div class="main-layout">
        <!-- 页面标题区域 -->
        <header class="page-header">
            <h1 class="page-title">{{ title }}</h1>
        </header>

        <!-- 内容区域 -->
        <main class="page-content">
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
.main-layout {
    margin-left: 64px;
    /* 为侧边栏留出空间 */
    min-height: 100vh;
    background: #f5f7fa;
}

.page-header {
    background: white;
    padding: 24px 32px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
}

.page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
}

.page-content {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
}
</style>