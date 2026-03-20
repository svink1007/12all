export class SwitchHost {
  readonly username: string;
  readonly password: string;
  readonly callId: string;

  constructor(username: string, password: string, callId: string) {
    this.username = username;
    this.password = password;
    this.callId = callId;
  }
}
