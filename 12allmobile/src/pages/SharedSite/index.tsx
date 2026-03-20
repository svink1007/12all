import React, { FC, useEffect } from "react";
import "./styles.scss";
import { RouteComponentProps } from "react-router";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { MOBILE_VIEW } from "../../shared/constants";
import useShowAdmobInterstitial from "../../admob/useShowAdmobInterstitial";
import Layout from "../../components/Layout";
import Iframe from "react-iframe";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../redux/types";

const SharedSitePage: FC<RouteComponentProps> = () => {
  const { adInterval } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const { url } = useSelector(({ sharedSite }: ReduxSelectors) => sharedSite);

  useShowAdmobInterstitial();

  useEffect(() => {
    MOBILE_VIEW &&
      KeepAwake.keepAwake().catch((err: any) => console.error(err));

    return () => {
      MOBILE_VIEW &&
        KeepAwake.allowSleep().catch((err: any) => console.error(err));
    };
  }, [adInterval]);

  return (
    <Layout showGoBack showMenuBtn cssContent="channels-page">
      {url && (
        <Iframe
          url={url}
          allowFullScreen
          width="100%"
          height="100%"
          frameBorder={0}
        />
      )}
    </Layout>
  );
};

export default SharedSitePage;
