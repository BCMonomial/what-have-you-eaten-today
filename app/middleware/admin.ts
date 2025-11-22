export default defineNuxtRouteMiddleware((to, from) => {
    const { user } = useUser()

    // 1. 先检查是否登录
    if (!user.value) {
        return navigateTo('/login')
    }

    // 2. 再检查角色是否为 admin
    if (user.value.role !== 'admin') {
        // 权限不足，跳回首页
        return navigateTo('/')
    }
})