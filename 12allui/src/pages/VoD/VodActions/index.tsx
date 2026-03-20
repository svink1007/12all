import React, { useState } from "react";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { EpgEntry, SharedStream } from "../../../shared/types";
import {
  heart,
  heartOutline,
  informationCircleOutline,
  readerOutline,
  shareSocialOutline,
} from "ionicons/icons";
import Invite from "../../../components/Invite";
import BroadcastInfo from "../../Home/BroadcastInfo";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { UserManagementService } from "../../../services";
import { StreamService } from "../../../services/StreamService";
import {
  addFavoriteVod,
  removeFavoriteVod,
  toggleVodFavorite,
} from "../../../redux/actions/vodActions";
import {
  setEnableRewardPopup,
  setFirstFavoriteReward,
  setTotalStarBalance,
} from "../../../redux/actions/billingRewardActions";
import { BillingServices } from "../../../services";
import { updateStarsBalance } from "../../../shared/helpers";
import {VodState} from "../../../redux/reducers/vodReducers";

type Props = {
  vod: VodState;
};

const VodActions: React.FC<Props> = ({ vod }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { jwt, isAnonymous, id, email } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const [openChannelInfo, setOpenChannelInfo] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteUrl, setInviteUrl] = useState<string>("");

  const handleShare = (vod: VodState) => {
    setInviteUrl(`${window.location.origin}/vod/${vod.id}`);
    setShowInviteModal(true);
  };

  const onInviteClose = () => {
    setShowInviteModal(false);
  };

  const handleChannelInfo = () => {
    setOpenChannelInfo(true);
  };

  const handleFavoriteClick = () => {
    return; // this is no yet stable...
     const updateVod = () => {
       vod.is_favorite = !vod.is_favorite;
       dispatch(toggleVodFavorite(vod));
       dispatch(
         vod.is_favorite
           ? addFavoriteVod(vod)
           : removeFavoriteVod(vod)
       );
     };
    
     if (vod.is_favorite) {
       UserManagementService.removeFavoriteVoD(vod.id)
         .then(updateVod)
         .catch((err) => console.error(err));
     } else {
       UserManagementService.addFavoriteVoD(vod.id)
         .then(updateVod)
         .then((response) => {
           // console.log("response fav",response)
           /* const favStreamEvent = "entry.favorite_stream";
           if (!stream.is_favorite) {
             BillingServices.billingFavorite(id, favStreamEvent).then(
               async ({ data: { result } }) => {
                 console.log("response", result);
                 if (
                   result.billingReward.creditedStars &&
                   result.billingReward.creditedStars > 0
                 ) {
                   const starsBalance = await updateStarsBalance(id);
                   dispatch(setTotalStarBalance(starsBalance));
                   dispatch(setFirstFavoriteReward(result));
                   dispatch(setEnableRewardPopup({ firstFavoriteAward: true }));
                 }
               }
             );
           } */
         })
         .catch((err) => console.error(err));
     }
  };

  return (
    <>
      <IonButtons className="stream-actions-buttons">

        <IonButton onClick={handleChannelInfo}>
          <IonIcon
            slot="icon-only"
            icon={informationCircleOutline}
            color={openChannelInfo ? "success" : "dark"}
          />
        </IonButton>

        <IonButton onClick={() => handleShare(vod)}>
          <IonIcon
            slot="icon-only"
            icon={shareSocialOutline}
            color={showInviteModal ? "success" : "dark"}
          />
        </IonButton>

        {(jwt &&
            !isAnonymous &&
            ((!!email && !email.includes("@skiplogin.com")) || email === null)) && (
          <IonButton onClick={handleFavoriteClick}>
            <IonIcon
              slot="icon-only"
              icon={vod.is_favorite ? heart : heartOutline}
              color={"primary"}
            />
          </IonButton>
        )}
      </IonButtons>

      <Invite
        title={t("home.share")}
        show={showInviteModal}
        onClose={() => onInviteClose()}
        url={inviteUrl}
      />

      <BroadcastInfo
        show={openChannelInfo}
        name={vod.title ?? ""}
        language={vod.language ?? ""}
        genre={vod.genre ?? ""}
        country={vod.country ?? ""}
        starsAmount={vod.starsAmount ? `${vod.starsAmount}` : ""}
        onClose={() => setOpenChannelInfo(false)}
      />

    </>
  );
};

export default VodActions;
