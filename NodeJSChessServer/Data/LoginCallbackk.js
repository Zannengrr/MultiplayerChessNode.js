"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginCallback = void 0;
const User_1 = require("../User/User");
const CallbackData_1 = require("./CallbackData");
class LoginCallback {
    constructor(data, username, id) {
        this.Data = new CallbackData_1.CallbackData(false, "");
        this.Data = data;
        this.UserInfo = new User_1.UserInfo(id, username);
    }
}
exports.LoginCallback = LoginCallback;
//# sourceMappingURL=LoginCallbackk.js.map