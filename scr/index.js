import { Zalo, MessageType } from "zca-js";
import fs from "fs";
import path from "path";

import { gruopEvents } from "./automations/events.js";
import { sv_giftcode, sv_link } from "./commands/manage/support.js";
import { getGroupAdmins } from "./commands/manage/info-group.js";
import { beeImage } from "./commands/utils/image.js";
import { askGemini } from "./commands/utils/gemini.js";
import { chatAuto } from "./commands/utils/simsimi.js";

function getCurrentTimestamp() {
    return new Date().toISOString();
}
// get admin
const adminFilePath = path.resolve('./assets/data/list_admin.json');
let admins = [];
let botAdmins = [];

try {
    admins = JSON.parse(fs.readFileSync(adminFilePath, 'utf-8'));
    botAdmins = [...admins];
} catch (error) {
    console.error("Lỗi đọc tệp admin.json:", error);
}
// ghi log
const logFilePath = path.resolve('./logs/logging.txt');

function logToFile(data) {
    const timestamp = getCurrentTimestamp();
    const logData = `[${timestamp}]\n${data}`;

    fs.appendFileSync(logFilePath, logData + '\n', 'utf8');
    console.log(data);
}
// config
const configFilePath = path.resolve('./assets/config.json');
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
} catch (error) {
    console.error("Lỗi đọc tệp config.json:", error);
}

const zalo = new Zalo(
    {
        cookie: config.cookie,
        imei: config.imei,
        userAgent: config.userAgent
    },
    {
        selfListen: false,
        checkUpdate: false
    },
);

const api = await zalo.login();

api.listener.on("message", async (message) => {
    const isPlainText = typeof message.data.content === "string";

    switch (message.type) {
        case MessageType.DirectMessage: {
            if (isPlainText) {
                const threadId = message.threadId;
                const content = message.data.content.trim();
                const senderId = message.data.uidFrom;
                const senderName = message.data.dName;
                const logMessage = 
`Có Mesage Riêng tư mới:\n
    - ID Người Gửi: ${threadId}\n
    - Tên Người Gửi: [ ${senderName} ]\n
    - Nội dung: ${content}\n`;
                logToFile(logMessage);
                await askGemini(api, message);
            }
            break;
        }
        case MessageType.GroupMessage: {
            if (isPlainText) {
                const threadId = message.threadId;
                const content = message.data.content.trim();
                const senderId = message.data.uidFrom;
                const senderName = message.data.dName;

                let groupAdmins = [];
                if (threadId) {
                    groupAdmins = await getGroupAdmins(api, threadId);
                }

                const logMessage = 
`Có Mesage nhóm mới:\n
    - Có MSG mới ở nhóm: ${threadId}\n
    - Sender ID: ${senderId}\n
    - Sender Name: ${senderName}\n
    - Nội dung: ${content}\n`;
                logToFile(logMessage);

                await sv_giftcode(api, message, botAdmins, groupAdmins);
                await sv_link(api, message, botAdmins, groupAdmins);
                await beeImage(api, message);
                await askGemini(api, message);
                await chatAuto(api, message, botAdmins, groupAdmins);
            }
            break;
        }
    }
});

api.listener.on("group_event", async (event) => {
    await gruopEvents(api, event);
});

api.listener.start();
