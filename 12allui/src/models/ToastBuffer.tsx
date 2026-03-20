export class ToastBuffer {
  private message: string | null = null;
  private buffer: NodeJS.Timeout | null = null;

  addMessage(message: string) {
    if (this.message) {
      this.message = `${this.message}, ${message}`;
    } else {
      this.message = message;
    }
  }

  beginBuffer(cb: (message: string) => void) {
    if (this.buffer) {
      return;
    }

    this.buffer = setTimeout(() => {
      if (!this.message) {
        throw new Error('Add message');
      }

      cb(this.message);
      this.message = null;
      this.buffer = null;
    }, 2000);
  }

  clearBuffer() {
    this.buffer && clearTimeout(this.buffer);
  }
}
