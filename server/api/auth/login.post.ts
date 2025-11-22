import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
        throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码' })
    }

    // 1. 查找用户
    const user = await db.select().from(users).where(eq(users.username, username)).get()

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: '用户不存在或密码错误' })
    }

    // 2. 验证密码
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw createError({ statusCode: 401, statusMessage: '用户不存在或密码错误' })
    }

    // 3. 设置 Cookie
    setCookie(event, 'user_id', String(user.id), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    return {
        id: user.id,
        username: user.username,
        role: user.role
    }
})