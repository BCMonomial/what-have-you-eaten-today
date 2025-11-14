<script setup>
// 这个布局会自动应用到所有页面
</script>

<template>
    <div class="app-container">
        <!-- 侧边栏 -->
        <Sidebar />

        <!-- 页面内容 -->
        <div class="page-wrapper">
            <slot />
        </div>
    </div>
</template>

<style>
/* 全局样式重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f7fa;
    color: #2c3e50;
}

.app-container {
    display: flex;
    min-height: 100vh;
}

.page-wrapper {
    flex: 1;
}
</style>