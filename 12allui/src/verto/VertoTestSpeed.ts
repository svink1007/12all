import {Notification} from './VertoNotification';

export class VertoTestSpeed {
  static test(websocket: WebSocket, onMessage: Notification<MessageEvent>): Promise<{upKps: number, downKps: number}> {
    const bytes = 1024 * 256;
    websocket.send(`#SPU ${bytes}`);

    const loops = bytes / 1024;
    const rem = bytes % 1024;
    const data = new Array(1024).join('.');
    for (let i = 0; i < loops; i++) {
      websocket.send(`#SPB ${data}`);
    }

    if (rem) {
      websocket.send(`#SPB ${data}`);
    }

    websocket.send('#SPE');

    return new Promise((resolve) => {
      let upDuration = 0;

      const messageId = onMessage.subscribe(({data}) => {
        if (data[3] === 'U') {
          upDuration = parseInt(data.substring(4));
        } else if (data[3] === 'D') {
          const downDuration = parseInt(data.substring(4));
          const upKps = Math.round(((bytes * 8) / (upDuration / 1000)) / 1024);
          const downKps = Math.round(((bytes * 8) / (downDuration / 1000)) / 1024);

          console.info('Speed Test: Up:', upKps, 'Down:', downKps);

          onMessage.unsubscribe(messageId);

          resolve({
            upKps,
            downKps
          });
        }
      });
    });
  }
}
