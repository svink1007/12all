// import React, { FC, useEffect, useMemo, useState } from "react";
// import {
//   IonButton,
//   IonCardHeader,
//   IonCardTitle,
//   IonImg,
//   IonLabel,
//   IonModal,
// } from "@ionic/react";
// import "./styles.scss";
// import sharpStar from "../../../images/icons/star-sharp.svg";
// import crossIcon from "../../../images/icons/cross.svg";
// import {useDispatch, useSelector} from "react-redux";
// import { ReduxSelectors } from "../../../redux/shared/types";
// import {
//   avatarBillingDescription,
//   channelCostDescription,
//   firstFavoriteBillingDescription,
//   loginBillingDescription,
//   paidRoomDescription,
//   signupBillingDescription,
// } from "../Utils/billingDescriptions";
// import { BillingDescription } from "../Utils/types";
// import { Routes } from "../../../shared/routes";
// import { useHistory } from "react-router";
// import { RewardPopup } from "../../../shared/types";
// import { BillingServices } from "../../../services";
// import { setErrorToast, setSuccessToast } from "../../../redux/actions/toastActions";
// import {setTotalStarBalance} from "../../../redux/actions/billingRewardActions";
//
// type Props = {
//   closeRewardModal: () => void;
// };
//
// const BillingPopup: FC<Props> = ({ closeRewardModal }: Props) => {
//   const history = useHistory();
//
//   const dispatch = useDispatch();
//
//   const billingRewards = useSelector(
//       ({ billingRewards }: ReduxSelectors) => billingRewards
//   );
//   const { isAnonymous, id: userId } = useSelector(
//       ({ profile }: ReduxSelectors) => profile
//   );
//
//   const [openModal, setOpenModal] = useState<boolean>(false);
//   const [billingDescription, setBillingDescription] = useState<BillingDescription>({
//     title: "",
//     label1: "",
//     label2: "",
//     label3: "",
//     buttonName: "",
//     cancelButtonName: "",
//     billingAwardName: "",
//   });
//   const [creditedStars, setCreditedStars] = useState<number | undefined>(undefined);
//   const [isDataReady, setIsDataReady] = useState<boolean>(false);
//
//   const rewardKeys: Array<keyof RewardPopup> = useMemo(
//       () => [
//         "signupReward",
//         "dailyVisitReward",
//         "isFirstAvatarUploaded",
//         "firstFavoriteAward",
//         "openChannelDirectStream",
//         "openPaidStreamGuest",
//       ],
//       []
//   );
//
//   useEffect(() => {
//     const { enablePopup } = billingRewards;
//     let foundReward: boolean = false;
//
//     for (const reward of rewardKeys) {
//       if (enablePopup[reward]) {
//         switch (reward) {
//           case "signupReward":
//             setBillingDescription(signupBillingDescription);
//             break;
//           case "dailyVisitReward":
//             setBillingDescription(loginBillingDescription);
//             break;
//           case "isFirstAvatarUploaded":
//             setBillingDescription(avatarBillingDescription);
//             break;
//           case "firstFavoriteAward":
//             setBillingDescription(firstFavoriteBillingDescription);
//             break;
//           case "openChannelDirectStream":
//             setBillingDescription(channelCostDescription);
//             break;
//           case "openPaidStreamGuest":
//             setBillingDescription(paidRoomDescription);
//             break;
//           default:
//             setOpenModal(false);
//             setIsDataReady(false);
//             return;
//         }
//
//         foundReward = true;
//         break;
//       }
//     }
//
//     if (foundReward) {
//       // Setting flag to indicate we need to wait for stars data
//       setIsDataReady(false);
//     } else {
//       setOpenModal(false);
//       setIsDataReady(false);
//     }
//   }, [billingRewards, rewardKeys]);
//
//   // Effect to get credited stars when billing description changes
//   useEffect(() => {
//     if (billingDescription.billingAwardName) {
//       const stars = getCreditedStars(billingDescription.billingAwardName);
//       setCreditedStars(stars as number);
//
//       // Only open the modal when we have confirmed the stars value is available
//       if (stars !== undefined) {
//         setIsDataReady(true);
//         setOpenModal(true);
//       } else {
//         setIsDataReady(false);
//         setOpenModal(false);
//       }
//     }
//   }, [billingDescription, billingRewards]);
//
//   const handleButton = (billingAwardName: string, isCross: boolean) => {
//     switch (billingAwardName) {
//       case "SIGNUP_BILLING_AWARD":
//       case "DAILY_VISIT_AWARD":
//       case "FIRST_AVATAR_AWARD":
//       case "FIRST_FAVORITE_AWARD":
//         setOpenModal(false);
//         break;
//       case "CHANNEL_COST":
//         if (isCross) {
//           setOpenModal(false);
//           break;
//         } else if (isAnonymous) {
//           return history.push(Routes.Login, {
//             streamId: billingRewards.channelCostDescription.streamId,
//             from: "anonymousStream",
//           });
//         } else {
//           // call an api to deduct the paid channel
//           console.log(
//               "bill streamId",
//               billingRewards.channelCostDescription.streamId
//           );
//
//           BillingServices.payRoomPrice(
//               userId,
//               billingRewards.channelCostDescription.streamId.toString()
//           ).then(({ data }) => {
//             if (data.status === "ok" && data.result.status === "SUCCESS") {
//               console.log("pay room price", data.result);
//               dispatch(setTotalStarBalance({
//                 status: data.status,
//                 starsBalance: data.result.newUserBalance
//               }));
//               setSuccessToast("You have successfully paid for this room");
//               // history.push(
//               //   `${Routes.Stream}/${billingRewards.channelCostDescription.streamId}`
//               // );
//             } else {
//               setErrorToast("Error occurred while paying for the channel");
//             }
//           });
//
//           setOpenModal(false);
//           break;
//         }
//
//       case "ROOM_COST":
//         if (isCross) {
//           setOpenModal(false);
//           // also add route to Home page is cross or cancel button clicked
//         }
//         break;
//
//       default:
//         setOpenModal(false);
//         break;
//     }
//   };
//
//   const handleCancelButton = (billingAwardName: string) => {
//     switch (billingAwardName) {
//       case "CHANNEL_COST":
//       case "ROOM_COST":
//         setOpenModal(false);
//         break;
//       default:
//         break;
//     }
//   };
//
//   const getCreditedStars = (billingAwardName: string) => {
//     switch (billingAwardName) {
//       case "SIGNUP_BILLING_AWARD":
//       case "DAILY_VISIT_AWARD":
//         return billingRewards.billingReward.creditedStars;
//       case "FIRST_AVATAR_AWARD":
//       case "FIRST_FAVORITE_AWARD":
//         return billingRewards.billingReward.creditedStars;
//       case "CHANNEL_COST":
//         return billingRewards?.channelCostDescription.channelCost;
//       default:
//         return undefined;
//     }
//   };
//
//   return (
//       <>
//         <IonModal
//             isOpen={openModal}
//             onDidDismiss={closeRewardModal}
//             className="billing-popup-ion-reward-modal"
//             backdropDismiss={false}
//         >
//           <div className="card-content">
//             {isDataReady}
//              =
//             {creditedStars}
//           </div>
//         </IonModal>
//         {isDataReady && creditedStars !== undefined && (
//             <IonModal
//                 isOpen={openModal}
//                 onDidDismiss={closeRewardModal}
//                 className="billing-popup-ion-reward-modal"
//                 backdropDismiss={false}
//             >
//               <IonImg
//                   src={crossIcon}
//                   className="reward-cross"
//                   onClick={() =>
//                       handleButton(billingDescription.billingAwardName, true)
//                   }
//               />
//               <IonCardHeader>
//                 <IonCardTitle>{billingDescription.title}</IonCardTitle>
//               </IonCardHeader>
//
//               <div className="card-content">
//                 {!["ROOM_COST"].includes(billingDescription.billingAwardName) && (
//                     <IonImg src={sharpStar} className="sharp-star" />
//                 )}
//                 <div className="card-label">
//                   <IonLabel position="floating">
//                     {`
//                   ${billingDescription.label1}
//                   ${creditedStars}
//                   ${billingDescription.label2}
//                 `}
//                   </IonLabel>
//                   {billingDescription.label3 && (
//                       <IonLabel position="floating">{`${billingDescription.label3}`}</IonLabel>
//                   )}
//                 </div>
//
//                 <div
//                     className={`${
//                         billingDescription.cancelButtonName
//                             ? "popup-buttons"
//                             : "popup-buttons cancel-button-active"
//                     }`}
//                 >
//                   <IonButton
//                       onClick={() =>
//                           handleButton(billingDescription.billingAwardName, false)
//                       }
//                   >
//                     {billingDescription.buttonName}
//                   </IonButton>
//                   {billingDescription.cancelButtonName && (
//                       <IonButton
//                           className="cancel-button"
//                           onClick={() =>
//                               handleCancelButton(billingDescription.billingAwardName)
//                           }
//                       >
//                         {billingDescription.cancelButtonName}
//                       </IonButton>
//                   )}
//                 </div>
//               </div>
//             </IonModal>
//         )}
//       </>
//   );
// };
//
// export default BillingPopup;




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
import sharpStar from "../../../images/icons/star-sharp.svg";
import crossIcon from "../../../images/icons/cross.svg";
import {useDispatch, useSelector} from "react-redux";
import { ReduxSelectors } from "../../../redux/shared/types";
import {
  avatarBillingDescription,
  channelCostDescription,
  firstFavoriteBillingDescription,
  loginBillingDescription,
  paidRoomDescription,
  signupBillingDescription,
} from "../Utils/billingDescriptions";
import { BillingDescription } from "../Utils/types";
import { Routes } from "../../../shared/routes";
import { useHistory } from "react-router";
import { RewardPopup } from "../../../shared/types";
import { BillingServices } from "../../../services";
import { setErrorToast, setSuccessToast } from "../../../redux/actions/toastActions";
import {setTotalStarBalance} from "../../../redux/actions/billingRewardActions";

type Props = {
  closeRewardModal: () => void;
};

const BillingPopup: FC<Props> = ({ closeRewardModal }: Props) => {
  const history = useHistory();

  const dispatch = useDispatch();

  const billingRewards = useSelector(
    ({ billingRewards }: ReduxSelectors) => billingRewards
  );
  const { isAnonymous, id: userId } = useSelector(
    ({ profile }: ReduxSelectors) => profile
  );

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [billingDescription, setBillingDescription] =
    useState<BillingDescription>({
      title: "",
      label1: "",
      label2: "",
      label3: "",
      buttonName: "",
      cancelButtonName: "",
      billingAwardName: "",
    });

  const rewardKeys: Array<keyof RewardPopup> = useMemo(
    () => [
      "signupReward",
      "dailyVisitReward",
      "isFirstAvatarUploaded",
      "firstFavoriteAward",
      "openChannelDirectStream",
      "openPaidStreamGuest",
    ],
    []
  );

  useEffect(() => {
    const { enablePopup } = billingRewards;
    let foundReward: boolean = false;

    for (const reward of rewardKeys) {
      if (enablePopup[reward]) {
        switch (reward) {
          case "signupReward":
            setBillingDescription(signupBillingDescription);
            break;
          case "dailyVisitReward":
            setBillingDescription(loginBillingDescription);
            break;
          case "isFirstAvatarUploaded":
            setBillingDescription(avatarBillingDescription);
            break;
          case "firstFavoriteAward":
            setBillingDescription(firstFavoriteBillingDescription);
            break;
          case "openChannelDirectStream":
            setBillingDescription(channelCostDescription);
            break;
          case "openPaidStreamGuest":
            setBillingDescription(paidRoomDescription);
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
      case "SIGNUP_BILLING_AWARD":
      case "DAILY_VISIT_AWARD":
      case "FIRST_AVATAR_AWARD":
      case "FIRST_FAVORITE_AWARD":
        setOpenModal(false);

        break;
      case "CHANNEL_COST":
        if (isCross) {
          setOpenModal(false);
          break;
        } else if (isAnonymous) {
          return history.push(Routes.Login, {
            streamId: billingRewards.channelCostDescription.streamId,
            from: "anonymousStream",
          });
        } else {
          // call an api to deduct the paid channel


          // BillingServices.payRoomPrice(id, "").then(({data: {result}}) => {
          //   console.log("pay room price", result)

          // })()
          let BillingStreamId = billingRewards.channelCostDescription.streamId.toString();
          if (billingRewards.channelCostDescription.vodId && billingRewards.channelCostDescription.vodId > 0 && billingRewards.channelCostDescription.streamId ===0)  {
            BillingStreamId = billingRewards.channelCostDescription.vodId.toString() + '_vod';
          }
          BillingServices.payRoomPrice(
            userId,
            BillingStreamId
          ).then(({ data }) => {
            if (data.status === "ok" && data.result.status === "SUCCESS") {
              dispatch(setTotalStarBalance({
                status: data.status,
                starsBalance: data.result.newUserBalance
              }));
              setSuccessToast("You have successfully paid for this room");
              if(BillingStreamId.includes('_vod')){
                setTimeout(() => {
                  history.push(`${Routes.VodChannel}/vod/${billingRewards.channelCostDescription.vodId}`);// the time out is to make sure that the popup dissappear before we navigate
                }, 500);
              }
            } else {
              setErrorToast("Error occurred while paying for the channel");
            }
          });

          setOpenModal(false);
          break;
        }

      case "ROOM_COST":
        if (isCross) {
          setOpenModal(false);
          // also add route to Home page is cross or cancel button clicked
        }
        break;

      default:
        setOpenModal(false);
        // closeRewardModal();
        break;
    }
    // closeRewardModal();
  };

  const handleCancelButton = (billingAwardName: string) => {
    switch (billingAwardName) {
      case "CHANNEL_COST":
      case "ROOM_COST":
        setOpenModal(false);
        // closeRewardModal();
        break;
      default:
        break;
    }
  };

  const getCreditedStars = (billingAwardName: string) => {
    switch (billingAwardName) {
      case "SIGNUP_BILLING_AWARD":
      case "DAILY_VISIT_AWARD":
        return billingRewards.billingReward.creditedStars;
      case "FIRST_AVATAR_AWARD":
      case "FIRST_FAVORITE_AWARD":
        return billingRewards.billingReward.creditedStars;
      case "CHANNEL_COST":
        return billingRewards?.channelCostDescription.channelCost;
      default:
        break;
    }
  };

  return (
    <>
      { getCreditedStars(billingDescription.billingAwardName) &&
        <IonModal
          isOpen={openModal}
          // onDidDismiss={closeRewardModal}
          onWillDismiss={() => {
            setOpenModal(false);
            setTimeout(() => closeRewardModal(), 100); // defer unmounting
          }}
          className="billing-popup-ion-reward-modal"
          backdropDismiss={false}
        >

          <IonImg
            src={crossIcon}
            className="reward-cross"
            onClick={() =>
              handleButton(billingDescription.billingAwardName, true)
            }
          />
          <IonCardHeader>
            <IonCardTitle>{billingDescription.title}</IonCardTitle>
          </IonCardHeader>

          <div className="card-content">
            {!["ROOM_COST"].includes(billingDescription.billingAwardName) && (
              <IonImg src={sharpStar} className="sharp-star" />
            )}
            <div className="card-label">
              <IonLabel position="floating">
                {`
                  ${billingDescription.label1}
                  ${getCreditedStars(billingDescription.billingAwardName)}
                  ${billingDescription.label2}
                `}
              </IonLabel>
              {billingDescription.label3 && (
                <IonLabel position="floating">{`${billingDescription.label3}`}</IonLabel>
              )}
            </div>

            <div
              className={`${
                billingDescription.cancelButtonName
                  ? "popup-buttons"
                  : "popup-buttons cancel-button-active"
              }`}
            >
              <IonButton
                onClick={() =>
                  handleButton(billingDescription.billingAwardName, false)
                }
              >
                {billingDescription.buttonName}
              </IonButton>
              {billingDescription.cancelButtonName && (
                <IonButton
                  className="cancel-button"
                  onClick={() =>
                    handleCancelButton(billingDescription.billingAwardName)
                  }
                >
                  {billingDescription.cancelButtonName}
                </IonButton>
              )}
            </div>
          </div>
        </IonModal>
      }
    </>
  );
};

export default BillingPopup;
