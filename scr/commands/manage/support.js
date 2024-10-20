/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                   _ooOoo_
                  o8888888o
                  88" . "88
                  (| -_- |)
                  O\  =  /O
               ____/`---'\____
             .'  \\|     |//  `.
            /  \\|||  :  |||//  \
           /  _||||| -:- |||||-  \
           |   | \\\  -  /// |   |
           | \_|  ''\---/''  |   |
           \  .-\__  `-`  ___/-. /
         ___`. .'  /--.--\  `. . __
      ."" '<  `.___\_<|>_/___.'  >'"".
     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
     \  \ `-.   \_ __\ /__ _/   .-` /  /
======`-.____`-.___\_____/___.-`____.-'======
                   `=---='
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            PHẬT ĐỘ
            CODE KHÔNG LỖI
            TỐI ƯU KHÔNG BUG
            AUTHOR: QUEEN BEE
            UDATED: 0h30 23-9-2024
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/

import { MessageType } from "zca-js";
import fs from 'fs';
import path from 'path';

const giftcodeFilePath = path.resolve('./assets/data/sv_giftcode.json');
const linkFilePath = path.resolve('./assets/data/sv_link.json');

function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Lỗi khi đọc file ${filePath}:`, error);
        return {};
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Lỗi khi ghi file ${filePath}:`, error);
    }
}

const giftcodes = readJsonFile(giftcodeFilePath);
const links = readJsonFile(linkFilePath);

function isAdmin(userId, botAdmins, groupAdmins) {
    return botAdmins.includes(userId.toString()) || groupAdmins.includes(userId.toString());
}

async function handleGiftcode(api, message, senderId, threadId, groupGiftcodes, codes, isAdding) {
    if (isAdding) {
        codes.forEach(code => {
            if (!groupGiftcodes.includes(code)) {
                groupGiftcodes.push(code);
            }
        });
        await api.sendMessage({ msg: `Đã thêm các gift sau: ${codes.join(', ')}`, quote: message }, threadId, MessageType.GroupMessage);
    } else {
        codes.forEach(code => {
            groupGiftcodes = groupGiftcodes.filter(existingCode => existingCode !== code);
        });
        await api.sendMessage({ msg: `Đã xóa các gift sau: ${codes.join(', ')}`, quote: message }, threadId, MessageType.GroupMessage);
    }
    return groupGiftcodes;
}

export async function sv_giftcode(api, message, botAdmins, groupAdmins) {
    const content = (message.data.content || "").trim();
    const threadId = message.threadId;
    const senderId = message.data.uidFrom;

    if (typeof content !== "string") return;

    if (content.startsWith('code') || content.startsWith('git') || content.startsWith('gif')) {
        const groupGiftcodes = giftcodes[threadId] || '';
        if (groupGiftcodes && groupGiftcodes.length > 0) {
            await api.sendMessage({ msg: `CÁC GIFTCODE: ${groupGiftcodes}`, quote: message }, threadId, MessageType.GroupMessage);
        }
        return;
    }

    if (content.startsWith('+gif') || content.startsWith('-gif')) {
        if (!isAdmin(senderId, botAdmins, groupAdmins)) return;

        const isAdding = content.startsWith('+gif');
        const codes = content.slice(4).split(',').map(code => code.trim()).filter(code => code.length > 0);

        if (codes.length === 0) {
            const msg = isAdding ? "Không Có Giftcode Thì Thêm Kiểu Gì 📋" : "Không Có Giftcode Thì Xóa Kiểu Gì 📋";
            await api.sendMessage({ msg, quote: message }, threadId, MessageType.GroupMessage);
            return;
        }

        let groupGiftcodes = giftcodes[threadId] ? giftcodes[threadId].split(', ') : [];
        groupGiftcodes = await handleGiftcode(api, message, senderId, threadId, groupGiftcodes, codes, isAdding);
        giftcodes[threadId] = groupGiftcodes.join(', ');
        writeJsonFile(giftcodeFilePath, giftcodes);
    }
}

const keywordMap = {
    "web": "web", "wed": "web",
    "mod": "mod", "tải": "mod", "download": "mod",
    "apk": "apk", "android": "apk",
    "pc": "pc", "laptop": "pc",
    "ios": "ios", "iphone": "ios", "ipa": "ios",
    "java": "java", "jar": "java"
};

export async function sv_link(api, message, botAdmins, groupAdmins) {
    const content = (message.data.content || "").trim().toLowerCase();
    const threadId = message.threadId;
    const senderId = message.data.uidFrom;

    if (typeof content !== "string") return;

    const matchedKeyword = Object.keys(keywordMap).find(keyword => content.startsWith(keyword));
    const linkType = matchedKeyword ? keywordMap[matchedKeyword] : null;

    if (linkType) {
        const groupLinks = links[threadId] || {};
        const linkInfo = groupLinks[linkType];

        if (linkInfo) {
            const { url } = linkInfo;

            if (linkType === 'web' || linkType === 'mod') {
                await api.sendMessage({
                    msg: `Link ${linkType.toUpperCase()}: ${url}`
                }, threadId, MessageType.GroupMessage);
            } else {
                const { filePath } = linkInfo;
                await api.sendMessage({
                    msg: `Link ${linkType.toUpperCase()}: ${url}`,
                    attachments: [path.resolve(filePath)]
                }, threadId, MessageType.GroupMessage);
            }
        } else {
            //await api.sendMessage({ msg: `Không có link ${linkType.toUpperCase()} cho nhóm này. 🛑`, quote: message }, threadId, MessageType.GroupMessage);
        }
        return;
    }

    if (content.startsWith('-fixlink')) {
        if (!isAdmin(senderId, botAdmins, groupAdmins)) {
            return;
        }

        const args = content.slice(9).split(' ').filter(arg => arg.length > 0);
        if (args.length < 2 || !keywordMap[args[0]]) {
            await api.sendMessage({ msg: "Cú pháp không đúng. Vui lòng sử dụng: -fixlink <loại link> <URL>", quote: message }, threadId, MessageType.GroupMessage);
            return;
        }

        const [inputLinkType, newLink] = args;
        const groupLinks = links[threadId] || {};
        const resolvedLinkType = keywordMap[inputLinkType];

        groupLinks[resolvedLinkType] = { url: newLink, filePath: `./assets/data/files/thongbao.txt` };
        links[threadId] = groupLinks;
        writeJsonFile(linkFilePath, links);

        await api.sendMessage({ msg: `Đã sửa link ${resolvedLinkType.toUpperCase()} thành: ${newLink}`, quote: message }, threadId, MessageType.GroupMessage);
    }
}
