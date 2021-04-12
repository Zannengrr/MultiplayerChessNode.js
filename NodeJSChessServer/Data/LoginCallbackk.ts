import { UserInfo } from "../User/User";
import { CallbackData } from "./CallbackData";

export class LoginCallback {
    public Data: CallbackData = new CallbackData(false, "");
    public UserInfo: UserInfo;

    public constructor(data: CallbackData, username: string, id: string) {
        this.Data = data;
        this.UserInfo = new UserInfo(id, username);
    }
}