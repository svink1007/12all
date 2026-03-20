import { FC, FormEvent, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.scss';
import { IonButton, IonList, IonLabel, IonCheckbox, IonModal, IonItem, IonInput, IonCol, IonRow, IonImg, IonText, IonSelect, IonSelectOption } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../../../redux/shared/types';
import starSharp from "../../../../../images/icons/star-sharp.svg";
import { BetGameObj, CHAT_MESSAGE_GAME_ADD_WINNER, messageType } from '../../../../../shared/types';
import { addGame, manageGames } from '../../../../../redux/actions/gamesActions';
import { GamesService } from '../../../../../services/GamesService';
import { profile } from 'console';

interface ManageBetModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onSelect: (game: BetGameObj, type: messageType) => void;
  roomId: number | null;
}

const ManageBetModal: FC<ManageBetModalProps> = ({show, setShow, onSelect, roomId}: ManageBetModalProps) => {
  const {t} = useTranslation();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const BACKGROUND_COLOR = "secondary-new";   
  const [amount, setAmounField] = useState<string>("");  
  const [selectedGame, setSelectedGame] = useState<number>(-1);
  const [step, setStep] = useState<number>(1);
  const [selectedGameObj, setSelectedGameObj] = useState<BetGameObj>();
  const [v1, setV1Field] = useState<string>("");  
  const [selectedChoiceText, setSelectedChoiceText] = useState<string>("");
  const [seconds, setSeconds] = useState(0)
  const [minutes, setMinutes] = useState(0)

  const { starsBalance } = useSelector(
      ({ billingRewards }: ReduxSelectors) => billingRewards
  );
  const gamesList = useSelector(({ betGames }: ReduxSelectors) => betGames.games);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const customPopoverOptions: any = {
    cssClass: 'select-popover-bets',
  };

  const dispatch = useDispatch();

  const onDismiss = () => {
    if (show) {
      setStep(1);
      setSelectedGame(-1);
      setShow(false);
    }
  };

  const onSend = (button: string) => {
    if (button === "save") {
      if (selectedGameObj?.id) {
        selectedGameObj.winner = {
          choice: selectedChoiceText,
          value: v1
        }

        GamesService.endGame(selectedGameObj.id, v1, selectedChoiceText).then(({data}) => {
            console.log("response", data);
            if (data.status == "ok") {
              selectedGameObj.status = "ENDED";              
              dispatch(manageGames(selectedGameObj));
              onSelect(selectedGameObj, CHAT_MESSAGE_GAME_ADD_WINNER);
              onDismiss();
            }
          }
        ).catch((err) => console.error(err));  
      }
    }

    if (button === "post-in-chat") {
      if (selectedGameObj) {
        selectedGameObj.winner = {
          choice: selectedChoiceText,
          value: v1
        }
        selectedGameObj.status = "ENDED";
        dispatch(manageGames(selectedGameObj));

        onSelect(selectedGameObj, CHAT_MESSAGE_GAME_ADD_WINNER);
        onDismiss();
      }
    }

    if (button === "stop-game") {
      if (selectedGameObj?.id) {
        GamesService.abortGame(selectedGameObj.id).then(({data}) => {
            console.log("response", data);
            if (data.status == "ok") {
              selectedGameObj.status = "ABORTED";

              dispatch(manageGames(selectedGameObj));  
              onDismiss();
            }
          }
        ).catch((err) => console.error(err));
      }
    }
  };

  const selectGame = (id: number) => {    
    setSelectedGame(id);
    setSelectedChoiceText("");
    setV1Field("");

    gamesList.map((game, gameIndex) => {
      if (id === game.id) {
        console.log(game);
        setSelectedGameObj(game);
        if (game.winner && game.winner.choice) {
          setSelectedChoiceText(game.winner.choice);
        }
        
        if (game.winner && game.winner.value) {
          setV1Field(game.winner.value);
        }

        if (game.end) {
          let now:Date = new Date();
          let diffMs: number = (new Date(game.end + "Z").getTime() - now.getTime()) / 60000;
          let diffMins = Math.trunc(diffMs);
          let diffSecs = Math.round((diffMs - diffMins) * 60);

          if (diffMins < 1) {
            diffMins = 0;
            diffSecs = 0;
          }

          setMinutes(diffMins);
          setSeconds(diffSecs);

          if (game.end != undefined && minutes == 0 && seconds == 0 && game.status == 'ACTIVE' && selectedGameObj) {
            selectedGameObj.status = "LOCKED";
            dispatch(manageGames(selectedGameObj));  
          }
        }
      }

      return true;
    })
  };

  const step2 = () => {
    setStep(2);
  };

  const updateTime = () => {
    if (minutes == 0 && seconds == 0) {
      //reset
      setSeconds(0);
      setMinutes(0);      
      if (selectedGameObj && selectedGameObj.end != undefined && selectedGameObj.status == 'ACTIVE') {
        selectedGameObj.status = "LOCKED";
        dispatch(manageGames(selectedGameObj));  
      }
    } else {
      if (seconds == 0) {
        setMinutes(minutes => minutes - 1);
        setSeconds(59);
      } else {
        setSeconds(seconds => seconds - 1);
      }
    }
  }

  useEffect(() => {    
    const token = setTimeout(updateTime, 1000)

    return function cleanUp() {
      clearTimeout(token);
    }
  })

  return (
    <IonModal
      isOpen={show}
      ref={modalRef}
      className="bets-modal"
      onDidDismiss={onDismiss}
    >
      <div className='bets-manage-modal-container'>
        <div className='user-stars-balance'> 
        Your Star balance: <IonImg src={starSharp} style={{ width: "22px", height: "22px", display: "inline-block", margin: "0 10px", verticalAlign: "sub" }} ></IonImg> { starsBalance }
        </div>
        { step === 1 &&         
          <div className='form-container'>
              MANAGE AVAILABLE GAMES<br/><br/> 
            <IonList className="bet-games-list" key="bet-games-list">
             {gamesList.filter((game) => {
                let now:Date = new Date();
               // let diffInDays: number = (now.getTime() - new Date(game.end + "Z").getTime()) / (1000 * 60 * 60 * 24);
                let createdToday = (now.setHours(0,0,0,0) == new Date(game.createdAt + "Z").setHours(0,0,0,0));
                return game.hostId === profile.id && createdToday;
              })             
              .map(      
                ({ content, betAmount, id, status}, index: number) => (   
                  <>  
                    {id && status !== "ENDED" && status !== "ABORTED" &&                   
                    <IonItem 
                      onClick={() => selectGame(id)}  
                      key={`join-game-list-${index}`}                 
                      >
                        <div className={`games-stars-balance${selectedGame === id ? " active" : ""}`}>
                          <div className='game-index'>{index + 1}. {content} </div>
                          <div>{ betAmount } <IonImg src={starSharp} style={{ width: "22px", height: "22px", display: "inline-block", margin: "0 10px", verticalAlign: "sub" }} ></IonImg> </div>               
                        </div>
                    </IonItem>                         
                    }     
                  </>           
                )                
              )}
            </IonList>
              <IonButton type="button" onClick={step2} disabled={selectedGame == -1}>{t('watchPartyStart.next')} </IonButton>  &nbsp;  
              <IonButton type="button" color="light" onClick={onDismiss}>{t('common.cancel')} </IonButton>
          </div>          
        }       
        { step === 2 &&                             
          <div className='form-container'>
            MANAGE GAME <br/>REQUEST AMOUNT<br/>
            {/* <form noValidate onSubmit={onSend} ref={myForm}> */}
              <div className='field-star-container'>
                <IonItem>
                  <IonInput 
                    type="text"
                    inputMode="text"
                    name={selectedGameObj?.betAmount}
                    autocomplete="off"
                    value={selectedGameObj?.betAmount}
                    onIonChange={({ detail: { value } }) =>
                      setAmounField(value ? value.trim() : "")
                    }
                    required readonly/>
                </IonItem>
              </div>
              <div className='game-name'>
                EVENT YOU BET<br/>
                <IonRow >
                  <IonCol sizeXl="12" className="remember-me-col">                
                    <IonText>{selectedGameObj?.content}</IonText>
                  </IonCol>
                </IonRow>                       
              </div>
              <div>
                <IonRow className="rem-forget-col">
                  <IonCol sizeXl="9" className="">
                    <IonItem
                      color={BACKGROUND_COLOR}
                      className="remember-me"
                      lines="none"
                    >
                      <IonCheckbox
                        color="primary"
                        name="multipleChoices"
                        checked={selectedGameObj?.multipleChoice}
                        disabled/>
                      <IonLabel>Multiple choices</IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol sizeXl="3" className="">
                    <IonItem
                      button
                      color={BACKGROUND_COLOR}
                      className="forgot-password"
                      lines="none"    
                    >
                      <IonCheckbox
                        color="primary"
                        name="betsValue"
                        checked={(selectedGameObj?.betsValue || selectedGameObj?.valueDescription != "")}
                        disabled
                      />
                      <IonLabel>Value</IonLabel>
                    </IonItem>
                  
                  </IonCol>
                </IonRow>      

                <IonRow className="rem-forget-col add-choice">
                  <IonCol sizeXl="6" className="remember-me-col">
                    {
                      <>
                        {
                          selectedGameObj?.choices.map((choice: string, index: number) => (
                          <IonText key={index}>{choice}</IonText>
                          ))
                        }
                      </>       
                    }
                  </IonCol>
                  <IonCol sizeXl="6" className="forgot-password-col">
                    { 
                      (selectedGameObj?.betsValue || selectedGameObj?.valueDescription !== "") && 
                      <IonText>{selectedGameObj?.valueDescription}</IonText>   
                    }               
                  </IonCol>
                </IonRow>     
                <IonRow className="rem-forget-col add-choice">
                  <IonCol sizeXl="12" className='lock-game'>
                    {
                      selectedGameObj?.status !== "ACTIVE" ?
                      <IonText>The game is {selectedGameObj?.status}</IonText> : 
                      <IonText>Lock Game in &nbsp; &nbsp; &nbsp; {minutes}:{seconds.toString().padStart(2, "0")}</IonText>
                    }
                  </IonCol>
                </IonRow>    
           
                <IonRow className='winner-container'>
                  <IonCol sizeXl="12" className="winner">Winner</IonCol>  
                </IonRow>     
                <IonRow className="rem-forget-col add-choice mb-20">
                  <IonCol sizeXl="6" className="remember-me-col">  
                    <IonSelect
                        value={selectedChoiceText}                        
                        // selectedText={language.initial}
                        onIonChange={({ detail: { value } }) =>
                          setSelectedChoiceText(value ? value.trim() : "")
                        }
                        interfaceOptions={customPopoverOptions}
                        interface="popover"
                        data-id="choice"
                    >
                      {selectedGameObj?.choices.map((value: string) => (
                          <IonSelectOption key={value} value={value}>
                            {value}
                          </IonSelectOption>
                      ))}

                    </IonSelect>          
                  </IonCol>
                  <IonCol sizeXl="6">
                  {(selectedGameObj?.betsValue || selectedGameObj?.valueDescription !== "") && 
                    <IonItem>
                      <IonInput type="text"
                        inputMode="text"
                        name="v1"
                        autocomplete="off"
                        value={v1}
                        placeholder='Value description'
                        onIonChange={({ detail: { value } }) =>
                          setV1Field(value ? value.trim() : "")
                        }
                        />
                    </IonItem>
                  }
                  </IonCol>
                </IonRow>   
                <IonRow>
                <IonCol sizeSm="5" sizeXs="12">
                  <IonButton type="button" id="save" onClick={() => onSend("save")}>{t('common.save')} </IonButton>&nbsp;&nbsp;
                  <IonButton type="button" color="light" onClick={onDismiss}>{t('common.cancel')} </IonButton>&nbsp; &nbsp;   
                </IonCol>
                <IonCol sizeSm="7" sizeXs="12">
                  <IonButton type="submit" color="danger" onClick={() => onSend("stop-game")} disabled={selectedGameObj?.status === 'ABORTED' || selectedGameObj?.status === 'ENDED'}>STOP GAME </IonButton>&nbsp;   &nbsp; 
                  {/* <IonButton type="submit" color="dark"  onClick={() => onSend("post-in-chat")} disabled={selectedGameObj?.status === 'ENDED'}>POST IN CHAT </IonButton>                             */}
                </IonCol>                
              </IonRow>                                                              
              </div>

            {/* </form> */}
          </div>
    
        }         
      </div>
    </IonModal>
  );
};

export default ManageBetModal;
