"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationCallback = void 0;
const CallbackData_1 = require("./CallbackData");
class InvitationCallback {
    constructor(data, gameId) {
        this.Data = new CallbackData_1.CallbackData(false, "");
        this.Data = data;
        this.GameId = gameId;
    }
}
exports.InvitationCallback = InvitationCallback;
//# sourceMappingURL=InvitationCallback.js.map