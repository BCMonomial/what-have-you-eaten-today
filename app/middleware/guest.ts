export default defineNuxtRouteMiddleware((to, from) => {
    const { user } = useUser()

    // 如果已登录，重定向到首页
    if (user.value) {
        return navigateTo('/')
    }
})