import { db } from '~~/server/db'
import { meals, users } from '~~/server/db/schema'
import { eq, desc, or, and, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 尝试获取当前用户（可能未登录）
    const userIdCookie = getCookie(event, 'user_id')
    const currentUserId = userIdCookie ? parseInt(userIdCookie) : null

    // 构建查询条件
    let whereCondition

    if (currentUserId) {
        // 登录用户：看 (公开 OR 内部) 且 (不是自己的，因为自己的在首页看)
        whereCondition = and(
            inArray(meals.visibility, ['all', 'member']),
        )
    } else {
        // 游客：只看公开
        whereCondition = eq(meals.visibility, 'all')
    }

    // 联表查询 
    const result = await db.select({
        id: meals.id,
        name: meals.name,
        image: meals.image,
        mealDate: meals.mealDate,
        category: meals.category,
        rating: meals.rating,
        visibility: meals.visibility,
        location: meals.location,
        ratingNotes: meals.ratingNotes,
        remarks: meals.remarks,
        username: users.username, 
    })
    .from(meals)
    .leftJoin(users, eq(meals.userId, users.id))
    .where(whereCondition)
    .orderBy(desc(meals.mealDate))
    .limit(50) // 限制数量

    return result
})