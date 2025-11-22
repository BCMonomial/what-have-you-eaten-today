import { db } from '~~/server/db'
import { settings } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
    const registerSetting = await db.select().from(settings).where(eq(settings.key, 'allow_register')).get()
    return {
        allowRegister: registerSetting ? registerSetting.value === 'true' : true
    }
})