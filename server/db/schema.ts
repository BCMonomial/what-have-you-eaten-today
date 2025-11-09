import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    username: text('username').notNull().unique(),
});


export const meals = sqliteTable('meals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id), // 外键关联到 user

    // 基本信息
    name: text('name').notNull(),
    mealDate: integer('meal_date', { mode: 'timestamp' }).notNull(),
    location: text('location'),

    // 评价
    rating: real('rating'),  // 评价分数，使用 real 类型，支持 4.5 这样的分数
    ratingNotes: text('rating_notes'), // 评价正文

    // 备注
    remarks: text('remarks'), // 总备注

    // 创建时间戳
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});