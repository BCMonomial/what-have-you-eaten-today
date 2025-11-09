import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  try {
    // 查询 meals 表的所有记录
    const allMeals = await db.query.meals.findMany({
      orderBy: (meals, { desc }) => [desc(meals.mealDate)], // orderBy(desc(meals.mealDate)) 让最新的记录排在最前面
    });

    return allMeals;
  }
  catch (e: any) {
    // 如果查询失败，抛出一个带有错误信息的 HTTP 错误
    throw createError({
      statusCode: 500,
      statusMessage: '无法获取用餐记录',
    });
  }
});