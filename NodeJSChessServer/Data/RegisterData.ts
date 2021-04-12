export class RegisterData {
    public Email: string;
    public Username: string;
    public Password: string;

    constructor(email: string, username: string, password: string) {
        this.Email = email;
        this.Username = username;
        this.Password = password; //password should be crypted and decrypted
    }
}