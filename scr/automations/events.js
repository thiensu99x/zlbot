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

import { GroupEventType, MessageType } from "zca-js";
import { createWelcomeImage, createGoodbyeImage, createKickImage, isValidUrl } from './canvas.js';
import fs from "fs";
import path from "path";

async function sendGroupMessage(api, threadId, message, imagePath) {
    try {
        await api.sendMessage({
            msg: message.text,
            mentions: message.mentions,
            attachments: imagePath ? [imagePath] : []
        }, threadId, MessageType.GroupMessage);
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn tới group:', error);
    }
}

export async function gruopEvents(api, event) {
    const type = event.type;
    const { updateMembers } = event.data;
    const groupName = event.data.groupName;
    const threadId = event.threadId;

    if (!updateMembers) {
        return;
    }

    if (updateMembers.length === 1) {
        const user = updateMembers[0];
        const userAvatarUrl = user.avatar || '';
        const userName = user.dName;

        if (!isValidUrl(userAvatarUrl)) {
            console.error('URL avt không hợp lệ:', userAvatarUrl);
        }

        let imagePath;
        let messageText;

        switch (type) {
            case GroupEventType.JOIN:
                imagePath = await createWelcomeImage(userAvatarUrl, userName, groupName);
                messageText = `_Hi! [ @${userName} ] vừa tham gia nhóm ${groupName}`;
                break;

            case GroupEventType.LEAVE:
                imagePath = await createGoodbyeImage(userAvatarUrl, userName, groupName);
                messageText = `Bye! [ ${userName} ] vừa rời khỏi nhóm.`;
                break;

            case GroupEventType.REMOVE_MEMBER:
                imagePath = await createKickImage(userAvatarUrl, userName, groupName);
                messageText = `Thằng oắt con [ ${userName} ] vừa bị sút khỏi nhóm...`;
                break;

            default:
                return;
        }

        if (imagePath && messageText) {
            const message = {
                text: messageText,
                mentions: [{ pos: 7, uid: user.id, len: userName.length + 1 }]
            };
            await sendGroupMessage(api, threadId, message, imagePath);
        }
    } else if (type === GroupEventType.JOIN && updateMembers.length > 1) {
        await api.sendMessage(
            "Chào mừng các thành viên mới của chúng ta!",
            [path.resolve("./assets/resources/welcome2.png")],
            threadId,
            MessageType.GroupMessage
        ).catch(console.error);
    }
}
