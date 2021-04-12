import { CallbackData } from "./CallbackData";

export class InvitationCallback {
    public Data: CallbackData = new CallbackData(false, "");
    public GameId: string;
    constructor(data: CallbackData, gameId: string) {
        this.Data = data;
        this.GameId = gameId;
    }
}