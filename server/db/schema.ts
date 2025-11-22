import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').unique(), 
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    role: text('role', { enum: ['admin', 'user'] }).default('user').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});


export const meals = sqliteTable('meals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id), // 外键关联到 user

    // 基本信息
    name: text('name').notNull(),
    mealDate: integer('meal_date', { mode: 'timestamp' }).notNull(),
    category: text('category', { enum: ['早餐', '午餐', '晚餐', '零食', '其他'] }),
    location: text('location'),

    // 图片
    image: text('image'), // 图片路径

    // 评价
    rating: real('rating'),  // 评价分数，使用 real 类型，支持 4.5 这样的分数
    ratingNotes: text('rating_notes'), // 评价正文

    // 备注
    remarks: text('remarks'), // 总备注

    // 可见性
    // 'all' = 全站公开 (游客可见)
    // 'member' = 仅登录用户可见
    // 'self' = 仅自己可见 (默认)
    visibility: text('visibility', { enum: ['all', 'member', 'self'] }).default('self').notNull(),

    // 创建时间戳
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(), // 例如 'allow_register'
    value: text('value').notNull(), // 存储 JSON 字符串或普通字符串
    description: text('description'), // 设置项描述
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});