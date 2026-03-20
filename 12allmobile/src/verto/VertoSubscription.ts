import VertoNotification from "./VertoNotification";

type ProcessReply = {
  subscribedChannels?: string[];
  unauthorizedChannels?: string[];
};

export default class VertoSubscription {
  private readonly subscriptions: {
    [id: string]: { eventChannel: string; ready: boolean };
  } = {};
  private readonly notification: VertoNotification;

  constructor(notification: VertoNotification) {
    this.notification = notification;
  }

  subscribe(eventChannel: string) {
    if (this.subscriptions[eventChannel]) {
      console.warn("Overwriting an already subscribed channel", eventChannel);
    }

    this.subscriptions[eventChannel] = {
      eventChannel,
      ready: false,
    };
    this.broadcastMethod("verto.subscribe", { eventChannel });
  }

  unsubscribe(eventChannel: string | number) {
    delete this.subscriptions[eventChannel];
    this.broadcastMethod("verto.unsubscribe", { eventChannel });
  }

  broadcast(eventChannel: string, data: any) {
    this.broadcastMethod("verto.broadcast", { eventChannel, data });
  }

  private setDroppedSubscription(channel: string) {
    console.error("Unauthorized", channel);
    delete this.subscriptions[channel];
  }

  private setReadySubscription(channel: string) {
    const subscription = this.subscriptions[channel];
    if (subscription) {
      subscription.ready = true;
    }
  }

  private processReply(
    method: string,
    { subscribedChannels, unauthorizedChannels }: ProcessReply
  ) {
    if (method !== "verto.subscribe") {
      return;
    }

    subscribedChannels?.forEach((channel) =>
      this.setReadySubscription(channel)
    );
    unauthorizedChannels?.forEach((channel) =>
      this.setDroppedSubscription(channel)
    );
  }

  private broadcastMethod(method: string, params: any) {
    const reply = (event: any) => this.processReply(method, event);
    this.notification.sendWebSocketRequest.notify({
      method,
      params,
      onSuccess: reply,
      onError: reply,
    });
  }
}
