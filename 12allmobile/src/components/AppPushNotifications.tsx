import { useEffect, useState } from "react";
import {
  ActionPerformed,
  PushNotifications,
  Token,
} from "@capacitor/push-notifications";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../redux/types";
import { useHistory } from "react-router-dom";
import { Routes } from "../shared/routes";
import { ChannelService } from "../services";
import PushNotificationsService from "../services/PushNotificationsService";

const AppPushNotifications = () => {
  const history = useHistory();
  const { token, phoneNumber } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );
  const [registrationToken, setRegistrationToken] = useState<string>();

  useEffect(() => {
    PushNotifications.createChannel({
      description: "General Notifications",
      id: "fcm_default_channel",
      importance: 5,
      lights: true,
      name: "My notification channel",
      sound: "doorbell.mp3",
      vibration: true,
      visibility: 1,
    })
      .then(() => {
        console.log("push channel created");
      })
      .catch((error) => {
        console.error("push channel error: ", error);
      });

    const register = async () => {
      const checkPermissions = await PushNotifications.checkPermissions();
      if (checkPermissions.receive === "granted") {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
      } else if (checkPermissions.receive !== "denied") {
        // Request permission to use push notifications
        // iOS will prompt user and return if they granted permission or not
        // Android will just grant without prompting
        const requestPermissions = await PushNotifications.requestPermissions();
        if (requestPermissions.receive === "granted") {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
        }
      }

      // if (isPlatform('ios')) {
      //   const localPermission = await LocalNotifications.checkPermissions();
      //   if (localPermission.display !== 'granted' && localPermission.display !== 'denied') {
      //     await LocalNotifications.requestPermissions();
      //   }
      // }
    };

    register().catch((e) =>
      console.error("Error on push notifications registration " + e.message)
    );
  }, []);

  useEffect(() => {
    // On success, we should be able to receive notifications
    PushNotifications.addListener("registration", ({ value }: Token) => {
      console.log(`Push notification registration token: ${value}`);
      setRegistrationToken(value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener("registrationError", (error: any) => {
      console.error("Error on registration: " + JSON.stringify(error));
    });

    // PushNotifications.addListener('pushNotificationReceived',
    //   (notification) => {
    //     console.log('Push received: ' + JSON.stringify(notification));
    //
    //     PushNotifications.getDeliveredNotifications().then(({notifications}) => {
    //       notifications.forEach((n) => {
    //         console.log(JSON.stringify(n.data));
    //       });
    //     });
    //   }
    // );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification: ActionPerformed) => {
        console.log("Push action performed: " + JSON.stringify(notification));

        const channelId = notification.notification.data.public_channel_id;
        if (channelId) {
          if (notification.notification.data.is_scheduled) {
            history.push(`${Routes.ProtectedWatchPartyJoin}/${channelId}`);
          } else {
            ChannelService.getChannelByDeepLink(channelId).then(({ data }) => {
              if (data && data.stream_id && !data.is_vlr) {
                history.push(
                  `${Routes.ProtectedStream}/${data.stream_id}/${channelId}`
                );
              } else {
                history.push(`${Routes.ProtectedWatchPartyJoin}/${channelId}`);
              }
            });
          }
        }
      }
    );

    return () => {
      PushNotifications.removeAllListeners().then();
    };
  }, [history]);

  useEffect(() => {
    if (token && phoneNumber && registrationToken) {
      PushNotificationsService.addToken(registrationToken)
        // .then(({data}) => console.log('TOKENS ' + JSON.stringify(data)))
        .catch((err) => console.error(err));
    }
  }, [token, phoneNumber, registrationToken]);

  return null;
};

export default AppPushNotifications;
