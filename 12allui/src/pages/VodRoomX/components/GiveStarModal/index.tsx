import React, { FormEvent, useEffect, useRef, useState } from 'react';
import './style.scss';
import { IonButton, IonImg, IonInput, IonItem, IonLabel, IonModal, IonSpinner, IonText } from '@ionic/react';
import starSharp  from "../../../../images/icons/star-sharp.svg";
import giveRewards  from "../../../../images/icons/ask-reward.svg";
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from 'src/redux/shared/types';
import { useTranslation } from 'react-i18next';
import { BillingServices } from 'src/services';
import { setDailyVisitReward } from 'src/redux/actions/billingRewardActions';
import { setInfoToast } from 'src/redux/actions/toastActions';
import crossIcon from "../../../../images/icons/cross.svg";


interface GiveStarModalProps {
  show: boolean;
  hostId: number ;
  setShow: (value: boolean) => void;
}

const GiveStarModal = ({show, setShow,hostId}: GiveStarModalProps) => {
    const {t} = useTranslation();
    const modalRef = useRef<HTMLIonModalElement>(null);
    const [amount, setAmounField] = useState<string>("");
    const [amountError, setAmountError] = useState<boolean>(false);
    const profile = useSelector(({ profile }: ReduxSelectors) => profile);
    const billingRewards= useSelector(({ billingRewards }: ReduxSelectors) => billingRewards);
    const { starsBalance } = billingRewards;
    const [isLoading,setIsLoading]=useState<boolean>(false)
    const dispatch = useDispatch();
    
    const onDismiss = () => {
        if (show) {
            setShow(false);
        }
    };

    const onSend = (e: FormEvent) => {
        e.preventDefault();
    };

    useEffect(() => {
        if (!show) {
          setAmounField("");      
          setAmountError(false);
        }
    }, [show]);

    const disableSend = () => {    
        if (isLoading || amount == "" || parseInt(amount)===0 || Number(amount) > starsBalance) {
          return true;
        }
        return false;
    }


    const sendGift=async()=>{
      setIsLoading(true);
      try {
        let giftSent = await BillingServices.giftUsers(profile.id,hostId,parseInt(amount));
        setIsLoading(false);
        const updatedStarsBalance= starsBalance - parseInt(amount);
        dispatch(setDailyVisitReward({...billingRewards,starsBalance:updatedStarsBalance}));
        dispatch(
          setInfoToast("gift sent to the host...")
        );
        setShow(false);
      } catch (error) {
        console.log('Error to send gift: ',error);
      }
      
    }

    return (
      <IonModal
        isOpen={show}
        ref={modalRef}
        className="give-star-modal"
        onDidDismiss={onDismiss}
      >
        <IonImg
          src={crossIcon}
          className="reward-cross"
          onClick={() =>
            setShow(false)
          }
        />
        <div className='give-star-modal-container'>
          {
            isLoading && <IonSpinner className='request-loader' name="lines"></IonSpinner>
          }
          <IonLabel className='ion-no-padding ion-no-margin'>GIVE STARTS</IonLabel>  

          <div className='user-stars-balance'> 
              Your Star balance: <IonImg src={starSharp} style={{ width: "22px", height: "22px", display: "inline-block", margin: "0 10px", verticalAlign: "sub" }} ></IonImg> { starsBalance }
          </div>
          <IonLabel className='text-xs text-white/75 my-4'>
              How many do you like to reward to your host ?
          </IonLabel>
          <div className='form-container'>
            <form noValidate onSubmit={onSend}>
              <div className='field-star-container'>
                  <IonItem>
                      <IonInput 
                      type="number"
                      inputMode="text"
                      name="amount"
                      autocomplete="off"
                      value={amount}
                      max={starsBalance}
                      min="0"
                      onIonChange={({ detail: { value } }) => {
                          //console.log(value, starsBalance, Number(value), amountError);
                          if (Number(value) > starsBalance) {
                          setAmountError(true);
                          } else {
                          setAmountError(false);
                          }

                          setAmounField(value ? value.trim() : "")
                          }
                      }
                      required/>
                  </IonItem>
              </div>
              <div className='amountError'>
                  {amountError &&
                      <IonText color="danger" className="invalid-message">
                          insufficient balance               
                      </IonText> 
                  }
              </div>
              <IonButton 
                disabled={disableSend()} 
                onClick={() => sendGift()}
                className="send-button">{t('contactUs.send')} </IonButton>
            </form>
          </div>
        </div>
        <IonImg src={giveRewards} className="give-rewards-icon" ></IonImg> 
      </IonModal>
    );
}

export default GiveStarModal