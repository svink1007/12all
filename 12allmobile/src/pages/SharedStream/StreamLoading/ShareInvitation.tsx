import React, { FC } from "react";
import { IonText } from "@ionic/react";
import { useTranslation } from "react-i18next";
import SocialNetworks from "../../../components/SocialNetworks";

type Props = {
  invitationUrl: string;
};

const ShareInvitation: FC<Props> = ({ invitationUrl }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="share-invitation-container">
      <IonText color="dark">{t("sharedStream.firstHost")}</IonText>
      <IonText color="dark">{t("sharedStream.inviteYourFriends")}</IonText>

      <SocialNetworks url={invitationUrl} />
    </div>
  );
};

export default ShareInvitation;
