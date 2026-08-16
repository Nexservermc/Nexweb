// ============ Nexserver 官网 站点配置 ============

const serverConfig = {
    // 服务器基础信息
    serverName: "Nexserver",
    serverIP: "nexserver.top",
    serverPort: "25565",
    serverVersion: "Velocity 1.7.2-26.2",
    pageTitle: "Nexserver - 官方网站",

    // 全部可用线路（frp 穿透，前端自动查询每条线路的在线状态）
    servers: [
        { label: "主线路 · 湖北武汉", ip: "nexserver.top", port: "25565", main: true },
        { label: "备线① · 中国上海", ip: "nexmc.nexserver.top", port: "25565" },
        { label: "备线② · 中国北京", ip: "mc.nexserver.top", port: "25565" }
    ],

    // 在线玩家 / 版本 / 状态查询（公网 API，实时刷新）
    statusAPI: "https://motd.minebbs.com/api/status",
    statusInterval: 15000, // 在线人数刷新间隔（毫秒）

    // ===== 主机实时监测（MCSManager Daemon 直连） =====
    // 通过 Socket.IO 连接本机 daemon，实时获取 CPU / 内存 / 实例 / 运行时长等主机数据
    // 如需更换 daemon 密钥，请在 MCSM 面板重新生成后同步更新 apiKey。
    // 主机监测数据由后端 host-api 服务提供（前端不再持有 daemon 密钥）
    mcsm: { enabled: false },

    // 社交链接（修改这里即可全局生效）
    socialLinks: {
        qqGroup: {
            url: "https://qm.qq.com/q/x8kxgKFgQg", // TODO: 替换为真实加群链接
            number: "277897347"
        },
        telegram: {
            url: "https://t.me/nexservermc",
            name: "@nexservermc"
        },
        bilibili: {
            url: "https://space.bilibili.com/3546754060388730", // TODO: 替换为真实视频链接
            name: "Nexserver官方账号"
        },
        email: "nexserver@example.com", // TODO: 替换为真实邮箱
        wiki: "https://github.com/Nexservermc/nexserver/wiki"
    }
};
