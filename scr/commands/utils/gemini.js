import fetch from 'node-fetch';
import { MessageType } from "zca-js";

const geminiApiKey = 'AIzaSyBjp8dgOzzURBynbl5RtduaA5HBnDc95f4';

export async function askGemini(api, message) {
    const content = message.data.content;
    const threadId = message.threadId;
    const senderId = message.data.uidFrom;
    const senderName = message.data.dName;

    if (content.startsWith("/gpt")) {
        const question = content.replace("/gpt", "").trim();

        const headers = {
            'Content-Type': 'application/json',
        };

        const data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": question
                        }
                    ]
                }
            ]
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
            });

            const json_data = await response.json();
            let replyText = `${senderName}\n`;
            replyText += json_data.candidates[0].content.parts[0].text;

            if (message.type == 1) {
                try {
                    await api.sendMessage({
                        msg: replyText,
                        quote: message
                    }, threadId, MessageType.GroupMessage);
                } catch (groupError) {
                    console.error("Lỗi khi gửi tin nhắn tới nhóm:", groupError);
                }
            }

            try {
                await api.sendMessage({
                    msg: replyText,
                    quote: message
                }, senderId, MessageType.DirectMessage);
            } catch (dmError) {
                if (dmError.code === 122) {
                    console.warn(`Người dùng ${senderId} đã chặn tin nhắn từ người lạ.`);
                } else {
                    console.error("Lỗi khi gửi tin nhắn trực tiếp:", dmError);
                }
            }

        } catch (error) {
            console.error("Lỗi khi gọi API Gemini:", error);
            try {
                await api.sendMessage({
                    msg: "Xin lỗi, tôi không thể trả lời câu hỏi này ngay bây giờ.",
                    quote: message
                }, senderId, MessageType.DirectMessage);
            } catch (error) {
                console.error("Lỗi khi gửi tin nhắn xin lỗi:", error);
            }
        }
    }
}
