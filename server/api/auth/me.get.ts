import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. 从 Cookie 获取 user_id
    const userIdCookie = getCookie(event, 'user_id')

    if (!userIdCookie) {
        return { user: null }
    }

    const userId = parseInt(userIdCookie)

    // 2. 查询数据库
    const user = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
    }).from(users).where(eq(users.id, userId)).get()

    return { user: user || null }
})