export class CallbackData {
    public Success: boolean;
    public Message: string;

    public constructor(success: boolean, message: string) {
        this.Success = success;
        this.Message = message;
    }
}