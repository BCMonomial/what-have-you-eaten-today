export const getUserFromSession = (event: any) => {
    const userIdCookie = getCookie(event, 'user_id')
    if (!userIdCookie) {
        throw createError({
            statusCode: 401,
            statusMessage: '未登录，请先登录'
        })
    }
    return parseInt(userIdCookie)
}