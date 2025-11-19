import { db } from '../db';
import { users } from '../db/schema';

export default defineNitroPlugin(async (nitroApp) => {
    console.log('初始化数据库...');

    try {
        // 检查是否有用户
        const existingUsers = await db.select().from(users);

        if (existingUsers.length === 0) {
            // 创建默认用户
            await db.insert(users).values({
                username: 'default_user'
            });

            console.log('已创建默认用户');
        } else {
            console.log('数据库已初始化');
        }
    } catch (e) {
        console.error('数据库初始化失败:', e);
    }
});