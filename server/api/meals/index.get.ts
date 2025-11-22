import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    // 1. 获取当前用户 ID
    const userId = getUserFromSession(event)

    // 2. 只查询该用户的记录
    const allMeals = await db.query.meals.findMany({
      where: eq(meals.userId, userId), // 👈 加上这行
      orderBy: (meals, { desc }) => [desc(meals.mealDate)],
    });

    return allMeals;
  }
  catch (e: any) {
    // 如果是 401 错误，直接抛出
    if (e.statusCode === 401) throw e
    
    throw createError({
      statusCode: 500,
      statusMessage: '无法获取用餐记录',
    });
  }
});