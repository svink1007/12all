import {FC, FormEvent, useRef, useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {IonButton, IonModal, IonItem, IonInput, IonCheckbox, IonCol, IonLabel, IonRow, IonImg, IonText} from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import {ReduxSelectors} from '../../../../../redux/shared/types';
import addChoice  from "../../../../../images/icons/bets/add-choice.png";
import starSharp  from "../../../../../images/icons/star-sharp.svg";
import { BetGameObj, messageType, CHAT_MESSAGE_ADD_GAME } from '../../../../../shared/types';
import { addGame } from '../../../../../redux/actions/gamesActions';
import { GamesService } from '../../../../../services/GamesService';

interface AddGameModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onSelect: (game: BetGameObj, type: messageType) => void;
  roomId: number | null;
  /**
   * type: 
   *    1 - Add Game
   *    2 - Join Game
   *    3 - Win Game
   */
}

const AddBetModal: FC<AddGameModalProps> = ({show, setShow, onSelect, roomId}: AddGameModalProps) => {
  const {t} = useTranslation();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const multipleChoicesRef = useRef<HTMLIonCheckboxElement>(null);
  const BACKGROUND_COLOR = "secondary-new";
  const [multipleChoices, setMultipleChoices] = useState<boolean>(false);
  const [betsValue, setBetsValue] = useState<boolean>(false);
  const [amount, setAmounField] = useState<string>("");
  const [betName, setBetNameField] = useState<string>("");
  const [lockIn, setLockInField] = useState<string>("");
  const [value, setValueField] = useState<string>("");
  const [choices, setChoicesFields] = useState<string[]>([""]);
  const [amountError, setAmountError] = useState<boolean>(false);

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const { starsBalance } = useSelector(({ billingRewards }: ReduxSelectors) => billingRewards);
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (!show) {
      setChoicesFields([""]);
      setAmounField("");      
      setBetsValue(false);
      setBetNameField("");
      setLockInField("");
      setMultipleChoices(false);
    }

  }, [show]);

  const onDismiss = () => {
    if (show) {
      setShow(false);
    }
  };

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    
    let now: Date = new Date();
    let end: Date = new Date(now.getTime() + Number(lockIn) * 60000);

    let game: BetGameObj = {
      id: null,
      hostId: profile.id,
      createdByName: profile.nickname,
      roomId,
      content: betName,
      betAmount: amount, 
      lockIn: lockIn, 
      multipleChoice: multipleChoices,
      betsValue: betsValue,
      choices: choices,
      valueDescription: value,
      createdAt: new Date(),
      end,
      participants: [],
      status: 'ACTIVE',
      winner: {
        choice: "",
        value: ""
      }
    };

    //console.log("BetGameObj", game);
    GamesService.createGame(game).then(({data}) => {
        //console.log("response", data);
        if (data.result.id) {
          dispatch(addGame(data.result));
          onSelect(data.result, CHAT_MESSAGE_ADD_GAME);
          if (show) {
            setShow(false);
           // setChoicesFields([""]);      
          }
        }
      }
    ).catch((err) => console.error(err));
  };

  const onAddChoice = () => {    
    setChoicesFields(prevState => [...prevState, ""]);        
  };

  const disableSave = () => {    
    if (amount == "" || Number(amount) > starsBalance || betName == "" || (betsValue && value == "")) {
      return true;
    }

    return false;
  }

  return (
    <IonModal
      isOpen={show}
      ref={modalRef}
      className="bets-modal"
      onDidDismiss={onDismiss}
    >
      <div className='bets-add-modal-container'>
        <div className='user-stars-balance'> 
        Your Star balance: <IonImg src={starSharp} style={{ width: "22px", height: "22px", display: "inline-block", margin: "0 10px", verticalAlign: "sub" }} ></IonImg> { starsBalance }
        </div>
        CREATE NEW GAME <br/><br/>REQUEST AMOUNT<br/>
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
                  {t("signup.inputError")}                
                </IonText> 
            }
              </div>
            <div className='game-name'>
              NAME OF THE GAME<br/>
              <IonItem>
                <IonInput type="text"
                inputMode="text"
                name="betName"
                autocomplete="off"
                value={betName}
                placeholder='Enter the name of the game'
                onIonChange={({ detail: { value } }) =>
                  setBetNameField(value ? value.trim() : "")
                }
                required/>
              </IonItem>              
            </div>
            <div>
              <IonRow>
                <IonCol sizeXl="9">
                  <IonItem
                    color={BACKGROUND_COLOR}
                    lines="none"
                  >
                    <IonCheckbox
                      ref={multipleChoicesRef}
                      color="primary"
                      name="multipleChoices"                      
                      onIonChange={() => setMultipleChoices((prev) => {
                        setChoicesFields([""]);
                        return !prev;
                      })}
                    />
                    <IonLabel>Multiple choices</IonLabel>
                  </IonItem>
                </IonCol>
                <IonCol sizeXl="3">
                  <IonItem
                    color={BACKGROUND_COLOR}
                    lines="none"    
                  >
                    <IonCheckbox
                      color="primary"
                      name="betsValue"                      
                      onIonChange={() => setBetsValue((prevValue) => {
                        setValueField("");
                        return !prevValue;
                      })}
                        //setBetsValue((prevValue) => !prevValue)}
                    />
                    <IonLabel>Value</IonLabel>
                  </IonItem>
                
                </IonCol>
              </IonRow>  
              <IonRow className="rem-forget-col add-choice">
                <IonCol sizeXl="6" className="remember-me-col">
                  {
                    choices.map((value: string, index) => (
                      <IonItem className='choiceItem' key={index}>
                        <IonInput type="text"
                          inputMode="text"
                          name="choices[]"
                          autocomplete="off"
                          value={value}
                          placeholder='Type of choice'
                          onIonChange={({ detail: { value } }) =>
                            choices[index] = (value ? value.trim() : "")
                          }
                          required/>
                      </IonItem>
                    ))
                  }            
                  { 
                    multipleChoices &&                                        
                    <IonRow className="rem-forget-col add-choice">
                      <IonButton type="button" color="none" class='add-choice-button' onClick={onAddChoice}>
                        <IonImg src={addChoice}></IonImg> &nbsp;&nbsp;Add choice
                      </IonButton>  
                    </IonRow>                                   
                  }
                </IonCol>
                <IonCol sizeXl="6" className="forgot-password-col">
                  { 
                    betsValue &&
                    <IonItem>
                      <IonInput type="text"
                        inputMode="text"
                        name="value"
                        autocomplete="off"
                        value={value}
                        placeholder='Value description'
                        onIonChange={({ detail: { value } }) =>
                          setValueField(value ? value.trim() : "")
                        }
                        required/>
                    </IonItem>
                  }
                </IonCol>
              </IonRow>     
            </div>
            <div className='game-lock'>
              Lock Game in<br/>
              <IonItem>
                <IonInput type="text"
                inputMode="text"
                name="lockIn"
                autocomplete="off"
                value={lockIn}
                placeholder='00 min'
                onIonChange={({ detail: { value } }) =>
                  setLockInField(value ? value.trim() : "")
                }
                required/>
              </IonItem>              
            </div>

            <IonButton type="submit" disabled={disableSave()}>{t('common.save')} </IonButton>
            <IonButton type="button" color="light" onClick={onDismiss}>{t('common.cancel')} </IonButton>                          
          </form>


        </div>
      </div>
    </IonModal>
  );
};

export default AddBetModal;
