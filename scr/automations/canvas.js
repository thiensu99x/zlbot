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

import { createCanvas, loadImage } from 'canvas';
import fs from "fs";
import path from "path";

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomGradient(ctx, width) {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 1; i += 0.25) {
        gradient.addColorStop(i, getRandomColor());
    }
    return gradient;
}

async function createImage(userAvatarUrl, userName, groupName, message, fileName) {
    const width = 1000;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
    backgroundGradient.addColorStop(0, '#091D45');
    backgroundGradient.addColorStop(1, '#08081A');

    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, width, height);

    if (userAvatarUrl && isValidUrl(userAvatarUrl)) {
        try {
            const avatar = await loadImage(userAvatarUrl);
            ctx.save();
            ctx.beginPath();
            ctx.arc(120, height / 2, 100, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.drawImage(avatar, 20, height / 2 - 100, 200, 200);
            ctx.restore();
        } catch (error) {
            console.error('Lỗi load avatar:', error);
        }
    } else {
        console.error('URL avatar không hợp lệ:', userAvatarUrl);
    }

    ctx.fillStyle = getRandomGradient(ctx, width);
    ctx.font = 'bold 48px Arial';
    ctx.fillText(message.title, 260, 120);

    ctx.fillStyle = getRandomGradient(ctx, width);
    ctx.font = '36px Arial';
    ctx.fillText(message.subtitle, 260, 200);

    const filePath = path.resolve(`./assets/resources/${fileName}`);
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    return new Promise((resolve, reject) => {
        out.on('finish', () => resolve(filePath));
        out.on('error', reject);
    });
}

export async function createWelcomeImage(userAvatarUrl, userName, groupName) {
    return createImage(userAvatarUrl, userName, groupName, {
        title: `Welcome, ${userName}`,
        subtitle: 'Just joined the group'
    }, 'welcome.png');
}

export async function createGoodbyeImage(userAvatarUrl, userName, groupName) {
    return createImage(userAvatarUrl, userName, groupName, {
        title: `Goodbye, ${userName}`,
        subtitle: 'Has left the group'
    }, 'goodbye.png');
}

export async function createKickImage(userAvatarUrl, userName, groupName) {
    return createImage(userAvatarUrl, userName, groupName, {
        title: `Kicked Out, ${userName}`,
        subtitle: 'Was kicked out of the group'
    }, 'kicked.png');
}

export function isValidUrl(urlString) {
    try {
        new URL(urlString);
        return true;
    } catch (error) {
        return false;
    }
}
