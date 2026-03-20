import React, { FC, useState } from "react";
import "./styles.scss";
import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { informationCircleOutline, shareSocialOutline } from "ionicons/icons";
import BroadcastInfo from "./BroadcastInfo";
import Invite from "../../../../components/Invite";
import { Channel } from "../../../../shared/types";

interface Props {
  channel: Channel;
  shareLink: string;
}

const VlrToolbar: FC<Props> = ({ channel, shareLink }: Props) => {
  const [openChannelInfo, setOpenChannelInfo] = useState<boolean>(false);
  const [openChannelShare, setOpenChannelShare] = useState<boolean>(false);

  return (
    <>
      <div className="broadcast-toolbar">
        <IonButtons>
          {!channel.stream_camera && (
            <IonButton onClick={() => setOpenChannelInfo(true)} color="dark">
              <IonIcon icon={informationCircleOutline} slot="icon-only" />
            </IonButton>
          )}
          <IonButton onClick={() => setOpenChannelShare(true)} color="dark">
            <IonIcon icon={shareSocialOutline} slot="icon-only" />
          </IonButton>
        </IonButtons>
      </div>

      <BroadcastInfo
        show={openChannelInfo}
        name={channel.name}
        language={channel.language}
        genre={channel.genre}
        description={channel.description}
        country={channel.country_of_origin}
        onClose={() => setOpenChannelInfo(false)}
      />

      <Invite
        show={openChannelShare}
        onClose={() => setOpenChannelShare(false)}
        url={shareLink}
      />
    </>
  );
};

export default VlrToolbar;
