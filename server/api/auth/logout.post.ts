export default defineEventHandler((event) => {
    deleteCookie(event, 'user_id')
    return { success: true }
})