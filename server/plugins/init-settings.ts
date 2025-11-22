import { db } from '~~/server/db'
import { settings } from '~~/server/db/schema'

export default defineNitroPlugin(async () => {
    try {
        // 初始化 'allow_register' 设置，默认为 'true'
        await db.insert(settings).values({
            key: 'allow_register',
            value: 'true',
            description: '是否允许公开注册'
        }).onConflictDoNothing() // 如果存在则不操作
    } catch (e) {
        console.error('初始化设置失败:', e)
    }
})