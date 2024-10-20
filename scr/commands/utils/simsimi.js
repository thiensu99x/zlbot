import fetch from 'node-fetch';
import { MessageType } from "zca-js";
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.resolve('./assets/data/simsimi.json');
let { currentApiKey, requestCount, requestLimit } = loadConfig();
const chatStatus = {};

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error("File simsimi.json không tồn tại.");
        return {
            currentApiKey: 'HUNGDEV_z3PqlaPrVG',
            requestCount: 0,
            requestLimit: 200
        };
    }
    
    const jsonData = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(jsonData);
}

function saveConfig() {
    const configData = {
        currentApiKey,
        requestCount,
        requestLimit
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 4));
}

async function fetchNewApiKey() {
    const response = await fetch('http://www.hungdev.id.vn/getApiKey');
    const jsonData = await response.json();
    
    if (jsonData.success) {
        return jsonData.data.key;
    }
    
    console.error("Không thể lấy khóa API mới:", jsonData);
    return null;
}

async function processMessage(api, messageContent, threadId) {
    const simsimiUrl = `http://www.hungdev.id.vn/others/simsimi?text=${encodeURIComponent(messageContent)}&apikey=${currentApiKey}`;
    
    try {
        const response = await fetch(simsimiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Lỗi từ API:", errorText);
            return;
        }

        const jsonData = await response.json();

        if (jsonData.success && jsonData.result) {
            const answer = jsonData.result;

            if (answer) {
                await api.sendMessage({
                    msg: answer,
                    quote: null
                }, threadId, MessageType.GroupMessage);
            }
        } else {
            console.error("Phản hồi không chứa dữ liệu hợp lệ:", jsonData);
        }
    } catch (error) {
        console.error("Lỗi khi gọi API Chat Auto:", error);
    }

    requestCount++;
    if (requestCount >= requestLimit) {
        const newApiKey = await fetchNewApiKey();
        if (newApiKey) {
            currentApiKey = newApiKey;
            requestCount = 0;
            saveConfig();
        }
    } else {
        saveConfig();
    }

    await sleep(2000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isAdmin(userId, botAdmins, groupAdmins) {
    return botAdmins.includes(userId.toString()) || groupAdmins.includes(userId.toString());
}

export async function chatAuto(api, message, botAdmins, groupAdmins) {
    const content = (message.data.content || "").trim();
    const threadId = message.threadId;
    const senderId = message.data.uidFrom;

    if (content.startsWith("/chat")) {
        if (!isAdmin(senderId, botAdmins, groupAdmins)) {
            await api.sendMessage({
                msg: "Bạn không có quyền thực hiện lệnh này.",
                quote: message
            }, threadId, MessageType.GroupMessage);
            return;
        }

        if (content.includes("on")) {
            chatStatus[threadId] = true;
            await api.sendMessage({
                msg: "Đã bật Chat Auto.",
                quote: message
            }, threadId, MessageType.GroupMessage);
            return;
        }

        if (content.includes("off")) {
            chatStatus[threadId] = false;
            await api.sendMessage({
                msg: "Đã tắt Chat Auto.",
                quote: message
            }, threadId, MessageType.GroupMessage);
            return;
        }
    }

    if (chatStatus[threadId]) {
        await processMessage(api, content, threadId);
    }
}
