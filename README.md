# Home Assistant 国家电网 Token 过期自动重新登录

使用 [hass-box/state-grid](https://github.com/hass-box/state-grid) 时刷新 Token 经常一天就过期了，于是结合 [pppscn/SmsForwarder](https://github.com/pppscn/SmsForwarder) 实现自动重新登录

## 用法

根据 </src/env.ts> 设置环境变量

创建自动化通知 Token 过期状态

![image](https://github.com/user-attachments/assets/803495e9-3b9c-41c6-baed-9c98f686e606)

然后给 Sms Forwarder 增加一个 Socket 类型的转发目标，子类型使用 mqtt
