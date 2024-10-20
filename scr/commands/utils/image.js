import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { MessageType } from 'zca-js';

const IMAGE_DIR = path.normalize('./assets/resources');
const lastCommandTime = {};
const IMAGE_FILES = {
    girl: path.resolve('./assets/data/image/girl.txt'),
    cos: path.resolve('./assets/data/image/cosplay.txt')
};
const TEXT_FILE = path.resolve('./assets/data/text/thinh.txt');

if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

async function downloadImage(url, filePath) {
    try {
        const response = await axios({ url, method: 'GET', responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Lỗi tải ảnh:', error);
        throw error;
    }
}

function getRandomLine(filePath) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
    return lines[Math.floor(Math.random() * lines.length)];
}

async function sendImageTypes(api, threadId) {
    const imageTypes = Object.keys(IMAGE_FILES).map(type => `!${type}`).join('\n');
    await api.sendMessage(`Danh sách các lệnh IMAGE\nHãy sử dụng để biết chi tiết :D\n${imageTypes}`, threadId, MessageType.GroupMessage);
}

async function sendRandomImage(api, threadId, senderName, imageFile) {
    try {
        const imageUrl = getRandomLine(imageFile);
        const fileName = path.basename(imageUrl);
        const filePath = path.join(IMAGE_DIR, fileName);

        await downloadImage(imageUrl, filePath);

        const randomText = getRandomLine(TEXT_FILE).replace(/\\n/g, '\n');

        await api.sendMessage({
            msg: `[ ${senderName} ]\n${randomText}`,
            attachments: [filePath]
        }, threadId, MessageType.GroupMessage);

        fs.unlink(filePath, err => {
            if (err) console.error('Lỗi khi xóa ảnh tạm:', err);
        });
    } catch (error) {
        console.error('Không thể tải hoặc gửi ảnh:', error);
        await api.sendMessage('Data lỗi hoặc mạng yếu khiến bot không gửi được ảnh, vui lòng thử lại sau.', threadId, MessageType.GroupMessage);
    }
}

export async function beeImage(api, message) {
    const content = message.data.content;
    const threadId = message.threadId;
    const senderName = message.data.dName;
    const currentTime = Date.now();

    if (lastCommandTime[threadId] && currentTime - lastCommandTime[threadId] < 5000) {
        return;
    }
    lastCommandTime[threadId] = currentTime;

    if (content.startsWith('/girl')) {
        await sendRandomImage(api, threadId, senderName, IMAGE_FILES.girl);
        return;
    }

    if (content.startsWith('/cos')) {
        await sendRandomImage(api, threadId, senderName, IMAGE_FILES.cos);
        return;
    }

    if (content.startsWith('/image')) {
        await sendImageTypes(api, threadId);
        return;
    }
}
