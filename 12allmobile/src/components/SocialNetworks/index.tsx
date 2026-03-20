import React, { FC } from "react";
import "./styles.scss";
import { IonButton, IonButtons, IonIcon, IonItem } from "@ionic/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { copyOutline, logoTwitter, logoVk, logoWhatsapp } from "ionicons/icons";
import {
  TwitterShareButton,
  VKShareButton,
  WhatsappShareButton,
} from "react-share";
import { useDispatch } from "react-redux";
import { setInfoToast } from "../../redux/actions/toastActions";

type Props = {
  url: string;
};

const SocialNetworks: FC<Props> = ({ url }) => {
  const dispatch = useDispatch();

  return (
    <IonItem className="social-networks" lines="none">
      <IonButtons>
        <CopyToClipboard
          text={url}
          onCopy={() => dispatch(setInfoToast("invite.copied"))}
        >
          <IonButton shape="round">
            <IonIcon icon={copyOutline} />
          </IonButton>
        </CopyToClipboard>
        <IonButton shape="round">
          <WhatsappShareButton url={url}>
            <IonIcon icon={logoWhatsapp} />
          </WhatsappShareButton>
        </IonButton>
        <IonButton shape="round">
          <TwitterShareButton url={url}>
            <IonIcon icon={logoTwitter} />
          </TwitterShareButton>
        </IonButton>
        <IonButton shape="round">
          <VKShareButton url={url}>
            <IonIcon icon={logoVk} />
          </VKShareButton>
        </IonButton>
      </IonButtons>
    </IonItem>
  );
};

export default SocialNetworks;
