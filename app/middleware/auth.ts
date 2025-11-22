export default defineNuxtRouteMiddleware((to, from) => {
    const { user } = useUser()

    // 如果未登录，重定向到登录页
    if (!user.value) {
        return navigateTo('/login')
    }
})