import React, { FC, useEffect } from "react";
import "./styles.scss";
import {
  IonImg,
  IonItem,
  isPlatform,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import Layout from "../../components/Layout";
import party from "../../images/home/party.png";
import tv from "../../images/home/tv.png";
import sharedSites from "../../images/home/shared-sites.png";
import favorites from "../../images/home/favorites.png";
import { RouteComponentProps } from "react-router";
import { useDispatch } from "react-redux";
import {
  setBroadcastOption,
  setStreamsAction,
  setVlrsAction,
} from "../../redux/actions/broadcastActions";
import { Routes } from "../../shared/routes";
import { App } from "@capacitor/app";
import { BroadcastOptions } from "../../redux/reducers/broadcastReducers";
import { BROADCASTS_PER_SCROLL } from "../../shared/constants";
import { ChannelService, StreamService } from "../../services";

const listener = () => App.exitApp();

const HomePage: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const params = `limit=${BROADCASTS_PER_SCROLL}&start=0&load_snapshots=0`;
    ChannelService.getAllVlrs(params).then(({ data: { data } }) =>
      dispatch(setVlrsAction(data))
    );
    if (!isPlatform("ios")) {
      StreamService.getStreams(params).then(({ data: { data } }) =>
        dispatch(setStreamsAction(data))
      );
    }
  }, [dispatch]);

  useIonViewWillEnter(() => {
    document.addEventListener("ionBackButton", listener);
  }, []);

  useIonViewWillLeave(() => {
    document.removeEventListener("ionBackButton", listener);
  }, []);

  const redirect = (option: BroadcastOptions) => {
    dispatch(setBroadcastOption(option));
    history.push(Routes.Broadcasts);
  };

  return (
    <Layout showMenuBtn cssContent="home-page">
      <IonItem
        button
        detail={false}
        lines="none"
        onClick={() => redirect(BroadcastOptions.Vlr)}
        color="light"
      >
        <IonImg src={party} />
      </IonItem>
      {!isPlatform("ios") && (
        <>
          <IonItem
            button
            detail={false}
            lines="none"
            onClick={() => redirect(BroadcastOptions.SharedStreams)}
            color="light"
          >
            <IonImg src={tv} />
          </IonItem>
          <IonItem
            button
            detail={false}
            lines="none"
            onClick={() => redirect(BroadcastOptions.SharedSites)}
            color="light"
          >
            <IonImg src={sharedSites} />
          </IonItem>
        </>
      )}
      <IonItem
        button
        detail={false}
        lines="none"
        onClick={() => redirect(BroadcastOptions.Favorites)}
        color="light"
      >
        <IonImg src={favorites} />
      </IonItem>
    </Layout>
  );
};

export default HomePage;
