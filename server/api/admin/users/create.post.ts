import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // 1. Admin 权限校验
    const adminId = getUserFromSession(event)
    const admin = await db.select().from(users).where(eq(users.id, adminId)).get()
    if (admin?.role !== 'admin') throw createError({ statusCode: 403, statusMessage: '无权操作' })

    const body = await readBody(event)
    const { username, password, email, role } = body

    if (!username || !password) throw createError({ statusCode: 400, statusMessage: '用户名密码必填' })

    // 2. 查重
    const exist = await db.select().from(users).where(eq(users.username, username)).get()
    if (exist) throw createError({ statusCode: 400, statusMessage: '用户名已存在' })

    // 3. 创建
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.insert(users).values({
        username,
        password: hashedPassword,
        email: email || null,
        role: role || 'user'
    })

    return { success: true }
})