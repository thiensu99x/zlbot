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

export async function getGroupAdmins(api, threadId) {
    try {
        const groupInfoResponse = await api.getGroupInfo(threadId);
        const groupInfo = groupInfoResponse.gridInfoMap[threadId];
        const admins = groupInfo.adminIds || [];
        const creatorId = groupInfo.creatorId;

        if (creatorId && !admins.includes(creatorId)) {
            admins.push(creatorId);
        }

        return admins;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách quản trị viên nhóm:", error);
        return [];
    }
}