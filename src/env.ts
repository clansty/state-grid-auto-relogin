import { env } from 'bun';
import z from 'zod';

const configParsed = z.object({
    HASS_TOKEN: z.string(),
    HASS_HANDLER: z.string(),
    HASS_URL: z.string(),
    PHONE: z.string(),
    MQTT_URL: z.string().url(),
    MQTT_USERNAME: z.string(),
    MQTT_PASSWORD: z.string(),
    MQTT_SUBJECT_EXPIRE: z.string().default('state-grid/expire'),
    MQTT_SUBJECT_SMS: z.string().default('sms'),
}).safeParse(env);

if (!configParsed.success) {
    console.error('环境变量解析错误:', (configParsed as any).error);
    process.exit(1);
}

export default configParsed.data;