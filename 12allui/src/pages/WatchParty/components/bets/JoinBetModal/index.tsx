import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles.scss';
import { IonButton, IonList, IonSelect, IonSelectOption, IonModal, IonItem, IonInput, IonCol, IonRow, IonImg, IonText } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../../../redux/shared/types';
import starSharp  from "../../../../../images/icons/star-sharp.svg";
import { BetGameObj, messageType, CHAT_MESSAGE_JOIN_GAME } from '../../../../../shared/types';
import { GamesService } from '../../../../../services/GamesService';
import { joinGames } from '../../../../../redux/actions/gamesActions';

interface JoinBetsModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  onSelect: (game: BetGameObj, type: messageType) => void;
  gameId: number | null;
}

const JoinBetModal: FC<JoinBetsModalProps> = ({show, setShow, onSelect, gameId}: JoinBetsModalProps) => {
  const {t} = useTranslation();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [selectedGame, setSelectedGame] = useState<number>(-1);
  const [step, setStep] = useState<number>(1);
  const [selectedGameObj, setSelectedGameObj] = useState<BetGameObj>();
  const [selectedChoiceText, setSelectedChoiceText] = useState<string>("");
  const [valueText, setValueText] = useState<string>("");
  
  const { starsBalance } = useSelector(
      ({ billingRewards }: ReduxSelectors) => billingRewards
  );
  const gamesList = useSelector(({ betGames }: ReduxSelectors) => betGames.games);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const joinedGamesList = useSelector(({ betGames }: ReduxSelectors) => betGames.joinedGames);

  const dispatch = useDispatch();
  
  useEffect(() => {
    if (show && gameId && gameId != -1) {
      selectGame(gameId);
      setStep(2);
    }
  }, [show]);

  const onDismiss = () => {
    if (show) {
      setStep(1);
      setSelectedGame(-1);
      setShow(false);
    }
  };

  const customPopoverOptions: any = {
    cssClass: 'select-popover-bets',
  };

  const onSend = (e: FormEvent) => {
    e.preventDefault();

    console.log(selectedGameObj);
    if (selectedGameObj && selectedGameObj.id) {
        onSelect(selectedGameObj, CHAT_MESSAGE_JOIN_GAME);

        GamesService.joinGame(selectedGameObj.id, profile.id, selectedChoiceText, valueText).then(({data}) => {
          console.log("response", data);  
          if (selectedGameObj.id) {
            dispatch(joinGames(selectedGameObj.id));
          }
        }
      ).catch((err) => console.error(err));        
    }

    setSelectedGame(-1);
    setStep(1);
    setShow(false);
  };

  const selectGame = (gameId: number) => {
    setSelectedGame(gameId);
    console.log(gamesList);
    gamesList.map((game) => {
      if (gameId === game.id) {
        setSelectedGameObj(game);
      }
    })

    console.log(selectedGameObj);
  };

  const step2 = () => {
    setStep(2);
  };

  const selectedChoice = (choice: string) => {
    setSelectedChoiceText(choice);
  };

  return (
    <IonModal
      isOpen={show}
      ref={modalRef}
      className="bets-modal"
      onDidDismiss={onDismiss}
    >
      <div className='bets-join-modal-container'>
        <div className='user-stars-balance'> 
        Your Star balance: <IonImg src={starSharp} style={{ width: "22px", height: "22px", display: "inline-block", margin: "0 10px", verticalAlign: "sub" }} ></IonImg> { starsBalance }
        </div>
        { step === 1 &&         
        <div className='form-container'>
              AVAILABLE GAMES<br/><br/>
        <IonList className="bet-games-list-join" key="bet-games-list-join">
          { gamesList.filter((game) => {
                let now:Date = new Date();
               // let diffInDays: number = (now.getTime() - new Date(game.end + "Z").getTime()) / (1000 * 60 * 60 * 24);
                let createdToday = (now.setHours(0,0,0,0) == new Date(game.createdAt + "Z").setHours(0,0,0,0));
                return game.hostId !== profile.id && createdToday && game.status == 'ACTIVE'! && !joinedGamesList.includes(game.id) && !game.participants.includes(profile.id) ;
              })
          .map(
            ({ content, betAmount, id }, index) => (              
             ( 
                <IonItem 
                  onClick={() => selectGame( id? id : -1)}  
                  key={`join-game-list-${index}`}                 
                  >
                    <div className={`games-stars-balance${selectedGame === id ? " ACTIVE" : ""}`}>
                      <div className='game-index'>{index + 1}. {content} </div>
                      <div>{ betAmount } <IonImg src={starSharp} style={{ width: "22px", height: "22px", display: "inline-block", margin: "0 10px", verticalAlign: "sub" }} ></IonImg> </div>               
                    </div>
                </IonItem>                    
              )
            )
          )}
          </IonList>
          <IonButton type="button" onClick={step2} disabled={selectedGame == -1}>{t('watchPartyStart.next')}</IonButton>                      
          {/* </form> */}
          </div>          
        }       

        { step === 2 &&         
        <div className='form-container'>
              {selectedGameObj?.createdByName} GAME<br/>
        <form noValidate onSubmit={onSend} className='join-form'>
          <div>
          <div className='selected-game'>
            <span>{selectedGameObj?.content}</span><br/><br/>
            JOIN WITH<br/>
            <span>{selectedGameObj?.betAmount}</span> <IonImg src={starSharp} style={{ width: "18px", height: "18px", display: "inline-block", margin: "0 10px", verticalAlign: "sub" }} ></IonImg>
          </div>

          <IonRow className="rem-forget-col add-choice">
            <IonCol sizeXl="6" className={`remember-me-col ${selectedGameObj?.betsValue ? '' : 'margin-auto'}`}>
              <div className='value-score text-left'>Select Your answer</div>
              <IonSelect
                  key="jg-select-key"
                  value={selectedChoiceText}                    
                  interface="popover"
                  data-id="choice"
                  interfaceOptions={customPopoverOptions}
                  onIonChange={({ detail: { value } }) =>
                    setSelectedChoiceText(value ? value.trim() : "")
                  } 
              >
                {selectedGameObj?.choices.map((value: string) => (
                  <IonSelectOption key={`jg-key-${value}`} value={value}>
                    {value}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>
            {(selectedGameObj?.betsValue || selectedGameObj?.valueDescription !== "") &&
                <IonCol sizeXl="6" className="forgot-password-col">    
                  <div className='value-score'>{selectedGameObj?.valueDescription} &nbsp;</div>
                  <IonItem>
                    <IonInput type="text"
                      inputMode="text"
                      name="value"
                      autocomplete="off"
                      value={valueText}
                      placeholder='Enter value'
                      onIonChange={({ detail: { value } }) =>
                        setValueText( value ? value.trim() : "")
                      }                      
                      required/>
                  </IonItem>              
                </IonCol>
                  }
              </IonRow> 
              </div>
              <div>
            <IonButton type="submit">JOIN </IonButton>
            <IonButton type="button" color="light"  onClick={onDismiss}>{t('common.cancel')} </IonButton>                    
          </div>
        </form>
        </div>          
        }         
      </div>
    </IonModal>
  );
};

export default JoinBetModal;
