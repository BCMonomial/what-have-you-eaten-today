<script setup>
const { initUser } = useUser()

// 初始化应用时获取用户信息
await initUser()
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>