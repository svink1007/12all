export class IncomingMessage {
  toId: string;
  fromName: string;
  message: string;
  me: boolean;
  date: string;
  avatar: string;

  constructor(
    to: string,
    from: string,
    message: string,
    me: boolean,
    date = new Date()
  ) {
    this.toId = to;
    this.fromName = from;
    this.message = message;
    this.me = me;
    const zeroPad = (value: number) => value.toString().padStart(2, "0");
    const timeString = `${date.getHours()}:${zeroPad(date.getMinutes())}`;
    const dateString = `${zeroPad(date.getDate())}/${zeroPad(date.getMonth() + 1)}`;
    this.date = `${timeString} ${dateString}`;
    this.avatar = from.charAt(0);
  }
}
