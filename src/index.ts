import mqtt from "mqtt";
import env from "./env";

let currentFlow: string | null = null;

const onLoginExpired = async () => {
    console.log('开始自动重新登陆');
    // 点击 配置
    const flow = await fetchFlow();
    currentFlow = flow.flow_id;
    console.log('已获取 flow_id', currentFlow);
    // 点击 验证码登陆
    const login = await fetchCodeLogin();
    console.log(login.type === 'form');
    // 输入手机号
    const submit = await submitPhone();
    console.log(submit.type === 'form');
}

const onCodeReceived = async (data: { msg: string }) => {
    // {
    //   "msg": "【网上国网】932324，您申请的网上国网验证码。有效期为10分钟。如有疑问，请致电国网客服中心95598。"
    // }
    if (!currentFlow) return;
    const code = data.msg.match(/\d{6}/)?.[0];
    if (!code) {
        console.error('未找到验证码');
        return;
    }
    const result = await submitCode(code);
    if (result.type === 'create_entry') {
        console.log('登陆成功');
    }
    else {
        console.error('登陆失败', code, result);
    }
    currentFlow = null;
}

const mqttClient = mqtt.connect(env.MQTT_URL, {
    username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD,
});

mqttClient.on("connect", () => {
    mqttClient.subscribe(env.MQTT_SUBJECT_EXPIRE);
    mqttClient.subscribe(env.MQTT_SUBJECT_SMS);
    console.log('已连接到 MQTT 服务器');
});

mqttClient.on("message", (topic, message) => {
    // message is Buffer
    if (topic === env.MQTT_SUBJECT_EXPIRE) {
        onLoginExpired();
    }
    else if (topic === env.MQTT_SUBJECT_SMS) {
        onCodeReceived(JSON.parse(message.toString()));
    }
});

const fetchHass = async (path: string, body: object) => {
    const response = await fetch(env.HASS_URL + path, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.HASS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return await response.json() as any;
}

const fetchFlow = async () => {
    return await fetchHass('/api/config/config_entries/options/flow', {
        handler: env.HASS_HANDLER,
        show_advanced_options: true
    });
}

const fetchCodeLogin = async () => {
    return await fetchHass(`/api/config/config_entries/options/flow/${currentFlow}`, {
        next_step_id: "code_login"
    });
}

const submitPhone = async () => {
    return await fetchHass(`/api/config/config_entries/options/flow/${currentFlow}`, {
        phone: env.PHONE,
    });
}

const submitCode = async (code: string) => {
    return await fetchHass(`/api/config/config_entries/options/flow/${currentFlow}`, {
        code,
    });
}
