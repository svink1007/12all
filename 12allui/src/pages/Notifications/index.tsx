import React, {FC, useEffect, useState} from 'react';
import './styles.scss';
import axios from 'axios';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonText,
  IonToggle
} from '@ionic/react';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import {API_URL, PUBLIC_VAPID_KEY} from '../../shared/constants';

type Notifications =
  'offers'
  | 'subscriptionPlan'
  | 'newSeries'
  | 'liveTvEvents'
  | 'upcomingOffers'
  | 'reminders'
  | 'all';
const SERVICE_WORKER_URL = 'sw-12all.js';
const CAN_USE_NOTIFICATIONS = 'Notification' in window;
const setAllowed = (permission: string) => permission === 'granted';

const NotificationsPage: FC = () => {
  const {t} = useTranslation();

  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(setAllowed(Notification.permission));
  const [notifyOffers, setNotifyOffers] = useState<boolean>(false);
  const [notifySubscriptionPlan, setNotifySubscriptionPlan] = useState<boolean>(false);
  const [notifyNewSeries, setNotifyNewSeries] = useState<boolean>(false);
  const [notifyLiveTvEvents, setNotifyLiveTvEvents] = useState<boolean>(false);
  const [notifyUpcomingOffers, setNotifyUpcomingOffers] = useState<boolean>(false);
  const [notifyReminders, setNotifyReminders] = useState<boolean>(false);

  const setNotification = (type: Notifications, value: boolean) => {
    switch (type) {
      case 'offers':
        setNotifyOffers(value);
        break;
      case 'subscriptionPlan':
        setNotifySubscriptionPlan(value);
        break;
      case 'newSeries':
        setNotifyNewSeries(value);
        break;
      case 'liveTvEvents':
        setNotifyLiveTvEvents(value);
        break;
      case 'upcomingOffers':
        setNotifyUpcomingOffers(value);
        break;
      case 'reminders':
        setNotifyReminders(value);
        break;
      case 'all':
        setNotifyOffers(value);
        setNotifySubscriptionPlan(value);
        setNotifyNewSeries(value);
        setNotifyLiveTvEvents(value);
        setNotifyUpcomingOffers(value);
        setNotifyReminders(value);
        break;
    }
  }

  useEffect(() => {
    if (Notification.permission === 'granted') {
      axios.get<[Notifications]>(`${API_URL}/notifications/subscriptions`)
        .then(({data}) => {
          data.forEach(notification => setNotification(notification, true))
        })
        .catch(err => console.error(err));
    }
  }, []);

  const onAllowNotifications = () => {
    Notification.requestPermission()
      .then((permission) => {
        const allow = setAllowed(permission);
        setNotificationsAllowed(allow);

        if (allow) {
          new Notification(t('notifications.welcomeTitle'), {
            body: t('notifications.welcomeBody'),
            icon: `${window.location.origin}/assets/icon/favicon.png`
          });

          subscribeForNotification('all');
        } else {
          const unregister = async () => {
            const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);

            if (registration) {
              await axios.post(`${API_URL}/notifications/unsubscribe`, {type: 'all'})
              await registration.unregister();
            }
          };

          unregister().catch(err => console.error(err));
        }
      });
  };

  const subscribeForNotification = (type: Notifications) => {
    const urlBase64ToUint8Array = (base64String: string) => {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    const send = async () => {
      setNotification(type, true);

      let registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);

      if (!registration) {
        registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);

        // Await for registration to be done
        await navigator.serviceWorker.ready;
      }

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });
      }

      await axios.post(`${API_URL}/notifications/subscribe`, {subscription, type});
    };

    send().catch(err => {
      setNotification(type, false);
      console.error(err);
    });
  };

  const unsubscribeFromNotification = (type: Notifications) => {
    axios.post(`${API_URL}/notifications/unsubscribe`, {type})
      .catch(err => {
        setNotification(type, true);
        console.log(err);
      });
  };

  const onToggleNotification = (checked: boolean, type: Notifications) => {
    if (checked) {
      subscribeForNotification(type);
    } else {
      unsubscribeFromNotification(type);
    }
  };

  // const subscribeToAll = () => {
  //   subscribeForNotification('all');
  // };

  return (
    <Layout className="center">
      <IonCard className="notifications-page">
        <IonCardHeader>
          <IonCardTitle>{t('notifications.header')}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {CAN_USE_NOTIFICATIONS ?
            (notificationsAllowed ?
              (
                <>
                  {/*<IonItem>*/}
                  {/*  <IonLabel>Subscribe to all</IonLabel>*/}
                  {/*  <IonButton onClick={subscribeToAll}>Subscribe</IonButton>*/}
                  {/*</IonItem>*/}
                  <IonItem>
                    <IonLabel>{t('notifications.offers')}</IonLabel>
                    <IonToggle checked={notifyOffers}
                               onIonChange={e => onToggleNotification(e.detail.checked, 'offers')}/>
                  </IonItem>
                  <IonItem>
                    <IonLabel>{t('notifications.subscriptionPlan')}</IonLabel>
                    <IonToggle checked={notifySubscriptionPlan}
                               onIonChange={e => onToggleNotification(e.detail.checked, 'subscriptionPlan')}/>
                  </IonItem>
                  <IonItem>
                    <IonLabel>{t('notifications.newSeries')}</IonLabel>
                    <IonToggle checked={notifyNewSeries}
                               onIonChange={e => onToggleNotification(e.detail.checked, 'newSeries')}/>
                  </IonItem>
                  <IonItem>
                    <IonLabel>{t('notifications.liveTvEvents')}</IonLabel>
                    <IonToggle checked={notifyLiveTvEvents}
                               onIonChange={e => onToggleNotification(e.detail.checked, 'liveTvEvents')}/>
                  </IonItem>
                  <IonItem>
                    <IonLabel>{t('notifications.upcomingOffers')}</IonLabel>
                    <IonToggle checked={notifyUpcomingOffers}
                               onIonChange={e => onToggleNotification(e.detail.checked, 'upcomingOffers')}/>
                  </IonItem>
                  <IonItem>
                    <IonLabel>{t('notifications.reminders')}</IonLabel>
                    <IonToggle checked={notifyReminders}
                               onIonChange={e => onToggleNotification(e.detail.checked, 'reminders')}/>
                  </IonItem>
                </>
              ) :
              <IonItem className="allow-notifications" lines="none">
                <IonLabel>
                  <div>{t('notifications.allowTitle')}</div>
                  <div className="subtitle">{t('notifications.allowSubtitle')}</div>
                </IonLabel>
                <IonButton onClick={onAllowNotifications}>{t('notifications.allowButton')}</IonButton>
              </IonItem>) :
            <IonText className="notifications-not-supported">{t('notifications.noSupport')}</IonText>
          }
        </IonCardContent>
      </IonCard>
    </Layout>
  )
};

export default NotificationsPage;
