import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // 1. 获取当前用户 ID
    const userId = getUserFromSession(event)
    const body = await readBody(event)
    
    // 2. 获取当前用户信息（用于验证密码和查重）
    const currentUser = await db.select().from(users).where(eq(users.id, userId)).get()
    
    if (!currentUser) {
        throw createError({ statusCode: 404, statusMessage: '用户不存在' })
    }

    const updateData: any = {}

    // === 处理邮箱修改 ===
    if (body.email !== undefined) {
        // 如果邮箱变了，检查是否被其他人占用
        if (body.email !== currentUser.email) {
            const existingEmail = await db.select().from(users).where(
                and(
                    eq(users.email, body.email),
                    ne(users.id, userId) // ID 不等于当前用户
                )
            ).get()

            if (existingEmail) {
                throw createError({ statusCode: 400, statusMessage: '该邮箱已被使用' })
            }
        }
        updateData.email = body.email || null
    }

    // === 处理密码修改 ===
    if (body.newPassword) {
        if (!body.currentPassword) {
            throw createError({ statusCode: 400, statusMessage: '修改密码需要提供当前密码' })
        }

        // 验证旧密码
        const isMatch = await bcrypt.compare(body.currentPassword, currentUser.password)
        if (!isMatch) {
            throw createError({ statusCode: 403, statusMessage: '当前密码错误' })
        }

        // 加密新密码
        const hashedPassword = await bcrypt.hash(body.newPassword, 10)
        updateData.password = hashedPassword
    }

    // 3. 执行更新
    if (Object.keys(updateData).length > 0) {
        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId))
    }

    return { success: true, message: '个人资料已更新' }
})