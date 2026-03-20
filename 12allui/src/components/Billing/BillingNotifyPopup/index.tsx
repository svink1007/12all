import React, { FC, useEffect, useMemo, useState } from "react";
import {
  IonButton,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonLabel,
  IonModal,
} from "@ionic/react";
import "./styles.scss";
import crossIcon from "../../../images/icons/cross.svg";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import { openPaidStreamAnonDescription, openRoomAnonDescription } from "../Utils/billingDescriptions";
import { BillingNotify } from "../Utils/types";
import { Routes } from "../../../shared/routes";
import { useHistory } from "react-router";
import { RewardPopup } from "../../../shared/types";

type Props = {
  closeNotifyModal: () => void;
};

const BillingNotifyPopup: FC<Props> = ({ closeNotifyModal }: Props) => {
  const history = useHistory()

  const billingRewards = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards);
  // const { isAnonymous, id } = useSelector(({ profile }: ReduxSelectors) => profile)
  const modalKey = useMemo(() => `modal-${Math.random().toString(36).substr(2, 9)}`, []);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [billingDescription, setBillingDescription] = useState<BillingNotify>({
    title: "",
    label: "",
    buttonName: "",
    cancelButtonName: "",
    billingAwardName: "",
  });

  const rewardKeys: Array<keyof RewardPopup> = useMemo(() => [
    'openPaidStreamAnon',
    'openRoomAnon'
  ], []);

  console.log("bill rew", billingRewards.enablePopup)

  useEffect(() => {
    const { enablePopup } = billingRewards
    let foundReward: boolean = false

    for (const reward of rewardKeys) {
      if (enablePopup[reward]) {
        switch (reward) {
          case 'openPaidStreamAnon':
            setBillingDescription(openPaidStreamAnonDescription);
            break;
          case 'openRoomAnon':
            setBillingDescription(openRoomAnonDescription);
            break;
          default:
            setOpenModal(false);
            return;
        }

        foundReward = true;
        break;
      }
    }

    setOpenModal(foundReward);
  }, [billingRewards, rewardKeys]);

  const handleButton = (billingAwardName: string, isCross: boolean) => {
    switch (billingAwardName) {
      case "OPEN_PAID_STREAM_ANON":
      case "OPEN_ROOM_ANON":
      case "ADD_GAME_ANON":
        setOpenModal(false);
        history.push(Routes.Login)
        return;

      default:
        setOpenModal(false);
        // closeNotifyModal();
        return;
    }
    // closeNotifyModal();
  };

  const handleCancelButton = (billingAwardName: string) => {
    switch (billingAwardName) {
      // case "CHANNEL_COST":
      //   setOpenModal(false);
      //   return;
      default:
        return;
    }
  }

  return (
    <>
      {
        billingRewards?.enablePopup && (
          <IonModal
              key={modalKey}
            // isOpen={openModal}
            // onDidDismiss={closeNotifyModal}
            // className="ion-reward-notify-modal"
            // backdropDismiss={false}
              isOpen={openModal}
              onDidDismiss={closeNotifyModal}
              onWillDismiss={() => setOpenModal(false)}
              backdropDismiss={false}
              className="ion-reward-notify-modal"
          >
            <IonImg
              src={crossIcon}
              className="reward-cross"
              onClick={() => setOpenModal(false)}
            />
            <IonCardHeader>
              <IonCardTitle>{billingDescription.title}</IonCardTitle>
            </IonCardHeader>

            <div className="card-content">
              <div className="card-label">
                <IonLabel position="floating">{`${billingDescription.label}`}</IonLabel>
              </div>

              <div className={`${billingDescription.cancelButtonName ? 'popup-buttons' : 'popup-buttons cancel-button-active'}`}>
                <IonButton
                  onClick={() => handleButton(billingDescription.billingAwardName, false)}
                >
                  {billingDescription.buttonName}
                </IonButton>
                {billingDescription.cancelButtonName &&
                  <IonButton
                    className="cancel-button"
                    onClick={() => handleCancelButton(billingDescription.billingAwardName)}
                  >
                    {billingDescription.cancelButtonName}
                  </IonButton>
                }
              </div>
            </div>
          </IonModal>
          )
      }
    </>
  );
};

export default BillingNotifyPopup;
