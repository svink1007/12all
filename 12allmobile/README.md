# 12all mobile

## API
[One2All postman workspace](https://app.getpostman.com/join-team?invite_code=c2382af648e3dc5f670ce66f3b83d98e&target_code=b0b799e462f21625171ff9b76e70baea)

## Verto connection

The connection to the freeswitch requires connection via [websocket](#websocket) and [webrtc](#webrtc).

### <a name="websocket"></a> Websocket connection

```typescript
// Get websocket and webrtc params
const {
  data: {
    id,
    fs_url,
    moderator_password,
    moderator_username,
    public_id,
    room_id,
    up_speed_url
  }
} = await axios.post('https://be.12all.tv:1357/vlr-free', {toke: '...', phoneNumner: '...'});

// Initalize websocket connection
const websocket = new WebSocket(fs_url);

// Add a method to send websocket messages
const sendWsMessage = (method: string, params: any) => {
  const requestStringify = JSON.stringify({
    jsonrpc: '2.0',
    method,
    params: {
      sessid: '...', // generate a unique session id
      ...params
    },
    id: 1 // increment the id on every send request
  });
  websocket.send(requestStringify);
};

websocket.onopen = () => {
  // After succesfull connection, send login request
  sendWsMessage('login', {
    login: moderator_password,
    passwd: moderator_username
  });
};
```

### <a name="webrtc"></a> Webrtc connection
