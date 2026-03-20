import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonListHeader,
  IonPopover,
  IonText,
  IonImg
} from '@ionic/react';
import VertoSession from '../../verto/VertoSession';
import {IncomingMessage, Participant, ParticipantParams} from '../../verto/models';
import {chatbubblesOutline, paperPlane, people,volumeHigh ,volumeMute} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {
  setAccumulatorToInitialUnreadMessages,
  setResetUnreadMessages,
  setUnreadMessages
} from '../../redux/actions/unreadMessagesActions';
import {ReduxSelectors} from '../../redux/shared/types';
import {ChatHistoryService} from '../../services';
import joinGameImage from "../../images/icons/bets/join-game.png";
import JoinBetModal from '../../pages/WatchParty/components/bets/JoinBetModal';
import { BetGameObj, messageType } from '../../shared/types';
import { GamesService } from '../../services/GamesService';
import {  setGames } from '../../redux/actions/gamesActions';
import {setupVerto} from "../../redux/actions/vertoActions";
import { useSimpleNotificationSound } from 'src/hooks/useMessageNotificationSound';
import CustomBadge from '../CustomBadge';

type Props = {
  vlrId: number;
  session: VertoSession;
  participants: Participant[];
  show: boolean;
  chatInputRef?: React.RefObject<HTMLIonInputElement>;
};

type CurrentChat = { callId: string; placeholder?: string; newMessageId?: string; avatar?: { text: string; color: string }, left: boolean };
type ChatObj = { [id: string]: { chat: IncomingMessage[], disabled: boolean } };
const EVERYONE = 'everyone';
const CHAT_PARTICIPANTS_POPOVER_ID = 'chat-participants-popover-id';

const DEFAULT_SELECTED_STATE = {callId: EVERYONE, left: false};

const Chat: FC<Props> = (({vlrId, session, participants, show, chatInputRef }: Props) => {
  const { playMessageSound} = useSimpleNotificationSound();
  const {t} = useTranslation();

  const dispatch = useDispatch();

  const didMountRef = useRef<boolean>(false);
  const popRef = useRef<HTMLIonPopoverElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLIonInputElement>(null);
  const inputRef = chatInputRef ?? localInputRef;

  const unreadMessages = useSelector(({unreadMessages}: ReduxSelectors) => unreadMessages);

  // const participantsRef = useRef<HTMLIonRadioGroupElement>(null);

  const [chatObj, setChatObj] = useState<ChatObj>({
    everyone: {
      chat: [],
      disabled: false
    }
  });
  const [current, setCurrent] = useState<CurrentChat>(DEFAULT_SELECTED_STATE);
  const [canPlayMessageNotification, setCanPlayMessageNotification] = useState<boolean>(true)
  const [allIdSubscription,setAllIdSubscription]=useState<number|null>(null);
  const [one2oneIdSubscription,setOne2oneIdSubscription]=useState<number|null>(null);

  
  useEffect(() => {
    if(current){
      dispatch(setupVerto({vlr: current.callId}));
    }
  }, [current.callId]);


  const [chatParticipants, setChatParticipants] = useState<{ unread: number; accumulator: number; participants: Participant[] }>({
    unread: 0,
    accumulator: 0,
    participants: []
  });
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>(participants);
  const [showJoinBetsModal, setShowJoinBetsModal] = useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(-1);
  const gamesList = useSelector(({ betGames }: ReduxSelectors) => betGames.games);
  const joinedGamesList = useSelector(({ betGames }: ReduxSelectors) => betGames.joinedGames);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  useEffect(() => {
    ChatHistoryService.getMessages(vlrId)
      .then(({data}) => {
        const chat = data.map(m => new IncomingMessage(EVERYONE, m.sender, m.message, false, new Date(m.date)));

        setChatObj(prevState => (
          {
            ...prevState,
            everyone: {
              ...prevState.everyone,
              chat: [...chat, ...prevState.everyone.chat]
            }
          }
        ));
      });

    return () => {
      dispatch(setResetUnreadMessages());
    };
  }, [dispatch, vlrId]);

  useEffect(() => {
    setFilteredParticipants(participants.filter(p => p.isPrimaryCall !== undefined ? p.isPrimaryCall : !p.isHostSharedVideo));
  }, [participants]);

  useEffect(() => {
    setChatObj(prevState => (
      filteredParticipants
        .reduce((acc: ChatObj, participant: Participant) => {
          if (!prevState[participant.callId]) {
            acc[participant.callId] = {disabled: false, chat: []};
          }
          return acc;
        }, prevState)
    ));

    setChatParticipants((prev) => {
      const mappedParticipants = filteredParticipants.map(participant => {
        const existingParticipant = prev.participants.find(prevParticipant => prevParticipant.callId === participant.callId);
        if (existingParticipant) {
          participant.unread = existingParticipant.unread;
        }
        return participant;
      });

      const params: ParticipantParams = {
        callId: EVERYONE,
        participantId: EVERYONE,
        participantName: EVERYONE,
        audio: {
          muted: true,
          talking: false
        },
        video: {
          muted: true,
          floor: false,
          floorLocked: false
        }
      };

      const everyoneParticipant = new Participant(params);

      if (prev.participants.length) {
        everyoneParticipant.unread = prev.participants[0].unread;
      }

      mappedParticipants.unshift(everyoneParticipant);

      return {
        ...prev,
        participants: mappedParticipants
      };
    });
  }, [filteredParticipants]);

  useEffect(() => {
    if (current.callId === EVERYONE) {
      return;
    }

    const participantIsInTheRoom = filteredParticipants.find(p => p.callId === current.callId);
    if (!participantIsInTheRoom) {
      setCurrent(prevState => {
        if (!prevState.left && inputRef.current) {
          inputRef.current.value = '';
          return {...prevState, left: true};
        }

        return prevState;
      });
    }
  }, [filteredParticipants, current.callId]);


  const addMessageToList= (im: IncomingMessage, toEveryOne: boolean)=>{
    if(toEveryOne){
      setChatObj(prev => ({
        ...prev,
        everyone: {
          ...prev.everyone,
          chat: [...prev.everyone.chat, im]
        }
      }));
      setCurrent(prev => ({...prev, newMessageId: EVERYONE}));
    }else {
      setChatObj(prev => ({
        ...prev,
        [im.toId]: {
          ...prev[im.toId],
          chat: [...prev[im.toId].chat, im]
        }
      }));
      setCurrent(prev => ({...prev, newMessageId: im.toId}));
    }
   
  }


  useEffect(() => {
    const notification = session.notification;

    if(allIdSubscription !== null && one2oneIdSubscription!==null ){

      const toAllSubscribers = notification.onChatMessageToAll.getSubscribers();
      for (const id in toAllSubscribers) {
        notification.onChatMessageToAll.unsubscribe(parseInt(id));
      }
      
      const toOneSubscribers = notification.onChatMessageOneToOne.getSubscribers();
      for (const id in toOneSubscribers) {
        notification.onChatMessageOneToOne.unsubscribe(parseInt(id));
      }
    }
  

    const handleChatMessageToAll = (im: IncomingMessage) => {
      if (im.fromName !== profile.nickname && (canPlayMessageNotification)) {
        playMessageSound();
      }
      addMessageToList(im,true);
    };

    const handleChatMessageOneToOne = (im: IncomingMessage) => {
      const isMessageReward = im.message.includes('Reward Transferred') && im.fromName===profile.nickname;
      if (( isMessageReward || (im && im.fromName !== profile.nickname )) && canPlayMessageNotification) {
        playMessageSound();
      }
      
      addMessageToList(im,isMessageReward);
    };

    const allIdVal = notification.onChatMessageToAll.subscribe(handleChatMessageToAll);
    const one2oneIdVal = notification.onChatMessageOneToOne.subscribe(handleChatMessageOneToOne);

    setOne2oneIdSubscription(one2oneIdVal);
    setAllIdSubscription(allIdVal); 

    return () => {
      allIdSubscription && notification.onChatMessageToAll.unsubscribe(allIdSubscription);
      one2oneIdSubscription && notification.onChatMessageOneToOne.unsubscribe(one2oneIdSubscription);
    };
  
}, [session.notification, canPlayMessageNotification]);


  

  useEffect(() => {    
    setChatParticipants(prev => {
      const newState = prev.participants.map((p) => {
        if (p.callId === current.newMessageId) {
          p.unread = p.unread + 1;
          if (p.callId === current.callId) {
            p.unread = 0;
          }
        }

        return p;
      });

      const unread = newState.reduce((accumulator: number, {unread}: Participant) => {
        if (unread > 0) {
          accumulator = accumulator + unread;
        }

        return accumulator;
      }, 0);

      return {
        unread,
        participants: newState,
        accumulator: prev.accumulator + 1
      };
    });

    // Scroll when the last el is rendered
    setTimeout(() => messagesRef.current?.scrollIntoView(false));

    if (profile && profile.id != undefined && profile.id != 0) {
      getRoomGames();
    }
  }, [current, dispatch]);

  useEffect(() => {
    if (didMountRef.current) {
      dispatch(setUnreadMessages(chatParticipants.unread));
    } else {
      didMountRef.current = true;
    }

  }, [chatParticipants.accumulator, chatParticipants.unread, dispatch]);

  useEffect(() => {
    if (!show) {
      dispatch(setAccumulatorToInitialUnreadMessages());
    }
  }, [show, dispatch]);


  

  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSend = () => {
    if (!inputRef.current) return;

    const message = inputRef.current.value as string;
    if (message.trim().length) {
      if (current.callId === EVERYONE) {
        session.sendMessage.toEveryone(message);
        ChatHistoryService.sendMessage({
          date: new Date().toISOString(),
          message,
          sender: session.callerName,
          vlrId
        }).then();
      } else {
        session.sendMessage.oneToOne(message, current.callId);
      }


      inputRef.current.value = '';
    }
  };


  const handlePopoverDismiss = () => popRef.current?.dismiss();

  const handleParticipantSelection = (callId: string) => {
    if (callId === EVERYONE) {
      setCurrent(DEFAULT_SELECTED_STATE);
      setChatParticipants(prev => {
        const participants = prev.participants.map(p => {
          if (p.callId === EVERYONE) {
            p.unread = 0;
          }

          return p;
        });

        return {
          ...prev,
          participants
        };
      });
    } else {
      const participantIndex = chatParticipants.participants.findIndex(p => p.callId === callId);
      const participant = chatParticipants.participants[participantIndex];
      setCurrent({callId, placeholder: participant.participantName, avatar: participant.avatar, left: false});
      setChatParticipants(prevState => {
        prevState.participants[participantIndex].unread = 0;
        // Move participant in front
        prevState.participants.splice(1, 0, prevState.participants.splice(participantIndex, 1)[0]);
        return prevState;
      });

    }
  };

  const joinGame = (gameId: number) => {
    setGameId(gameId);
    setShowJoinBetsModal(true)
  }

  const getRoomGames = () => {
    let games: any[] = [];
    Promise.all([
      GamesService.getRoomGames(vlrId, true),
      GamesService.getRoomGames(vlrId, false)
    ]).then((data) => {
      data.map(({data}) => {
          if (data.result) {            
            games = [...games, ...data.result];
          }
      });

      dispatch(setGames({games, profileID: profile.id}));
    });

  }

  
  return (
    <>
      <IonPopover
        className="chat-popover"
        onDidDismiss={handlePopoverDismiss}
        ref={popRef}
        side="top"
        trigger={CHAT_PARTICIPANTS_POPOVER_ID}
        dismissOnSelect
        keepContentsMounted
      >
        <IonList>
          <IonListHeader>{t('chat.chatWith')}</IonListHeader>
          <IonItem
            button
            lines="none"
            onClick={() => handleParticipantSelection('everyone')}
          >
            <IonAvatar color="secondary" slot="start">
              <IonIcon icon={people}/>
            </IonAvatar>
            <IonText>{t('chat.everyone')}</IonText>
            {
              chatParticipants.participants.length && chatParticipants.participants[0].unread > 0 &&
              <IonBadge color="primary" slot="end">{chatParticipants.participants[0].unread}</IonBadge>
            }
          </IonItem>
          {
            chatParticipants.participants
              .filter(p => p.callId !== EVERYONE && !p.me)
              .map(({callId, participantName, avatar, unread}) => (
                <IonItem
                  button
                  key={callId}
                  lines="none"
                  onClick={() => handleParticipantSelection(callId)}
                >
                  <IonAvatar style={{backgroundColor: avatar.color}} slot="start">
                    <IonText>{avatar.text}</IonText>
                  </IonAvatar>
                  <IonText>{participantName}</IonText>
                  {unread > 0 && <IonBadge color="primary" slot="end">{unread}</IonBadge>}
                </IonItem>
              ))
          }
        </IonList>
      </IonPopover>

      <IonCard
        className="chat-card"
        color="light"
        style={{display: show ? 'flex' : 'none'}}
      >
        <IonCardContent className="chat-card-content">
          <div className="messages-container">

            <div className="chat-header">
              <div>
                <IonIcon color="success"  icon={chatbubblesOutline}/>
                <IonText className="ml-1.5 text-white text-sm" >CHAT</IonText> 
              </div>
              <div>
                <IonButtons slot="end" title={canPlayMessageNotification?'mute message sound':'unmute message sound'}>
                    <IonButton  onClick={()=>setCanPlayMessageNotification(!canPlayMessageNotification)} >
                      <IonIcon icon={canPlayMessageNotification? volumeHigh : volumeMute } slot="icon-only"/>
                    </IonButton>
                  </IonButtons>
              </div>
              
            </div>
            <div className="h-8"></div>

            {
              chatObj[current.callId].chat.map(({date, fromName, message,avatar}: IncomingMessage, index: number) => {
                let game: BetGameObj | undefined = undefined;
                let  messageObj = (typeof message === 'string' && message.indexOf('{"type":') !== -1) ? JSON.parse(message) : null;
                if (messageObj) {
                  if (!profile || (profile && profile.id == 0)) {
                    return false;
                  }

                  game = (messageObj.game !== undefined) ?  messageObj.game : gamesList.filter(row => row.id === messageObj.gameId).pop();
                }

                return (
                  <IonCard key={index} className={` chat-message`}>
                    <IonCardContent>
                      <IonCardHeader >
                        <div className="flex items-center gap-2 ">
                          <IonAvatar >
                            <img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                          </IonAvatar> 
                          <IonText className="chat-participant-name" color="dark">{fromName}</IonText>
                        </div>
                        
                        <IonText className="chat-date mb-3.5" color="dark">{date}</IonText>
                      </IonCardHeader>
                      {
                        (game !== undefined) ? 
                        <div className='bets-game'>
                              {(() => {
                                switch (messageObj.type) {
                                  case 1:
                                    return <IonText color="dark"><span>{fromName} opened a GAME</span> <br/> {game.content}</IonText>
                                  case 2:
                                    return <IonText color="dark"><span>{fromName} JOINED a GAME</span> <br/> {game.content}</IonText>
                                  case 3:
                                    return <IonText color="dark"><span>{fromName} POST WINNER OF GAME</span> <br/> {game.content} <br/>{game.winner?.choice} <br/>{game.winner?.value}</IonText>

                                  default:
                                    return null
                                }
                              })()}
                              { messageObj.type !== 3 && game !== undefined && game.id && game.status == "ACTIVE" && !joinedGamesList.includes(game.id) && game.hostId !== profile.id && !game.participants.includes(profile.id) &&
                                <div className="join-game-button">
                                  <IonButton
                                      onClick={() => joinGame(game?.id ? game.id : -1)}
                                      className="bets-add-game" 
                                      title={"Star"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                
                                  >
                                      <IonImg src={joinGameImage} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />                       
                                  </IonButton>
                                  <div >{t('Join GAME')}</div>
                                </div>  
                              }                          
                        </div>
                         :
                        <IonText color="dark">{message}</IonText>
                      }                   
                    </IonCardContent>
                  </IonCard>
              )})
            
            }
            <div ref={messagesRef}/>
          </div>

          <div className="chat-item-input" >
            <IonButtons slot="start">
              <IonButton id={CHAT_PARTICIPANTS_POPOVER_ID} size="small" >
                {
                  current.callId === EVERYONE ?
                      <IonAvatar color="secondary" slot="icon-only">
                        <IonIcon icon={people}/>
                      </IonAvatar> :
                      <IonAvatar style={{backgroundColor: current.avatar?.color}} slot="icon-only">
                      <IonText>{current.avatar?.text}</IonText>
                    </IonAvatar>
                }
                
                <CustomBadge 
                badgeNumber={unreadMessages.initial} 
                isHidden={false}
                badgeColor={'primary'}/>
              </IonButton>
            </IonButtons>

            {
              !current.left ?
                <>
                  <IonInput
                    id="chat-input-message"
                    ref={inputRef}
                    placeholder={t('chat.placeholder')}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <IonButtons slot="end">
                    <IonButton onClick={handleSend} color="primary">
                      <IonIcon icon={paperPlane} slot="icon-only"/>
                    </IonButton>
                  </IonButtons>
                </> :
                <IonText className="chat-name-left">
                  <div className="chat-name">{current.placeholder}</div>
                  <div className="left">{t('chat.left')}</div>
                </IonText>
            }
          </div>

          <JoinBetModal
            show={showJoinBetsModal}
            setShow={setShowJoinBetsModal}
            gameId={gameId}
            onSelect={(game: BetGameObj, type?: messageType) => {
                let message = {
                    type,
                    game
                }
                session.sendMessage.toEveryone(JSON.stringify(message));   
            }}
        />
        </IonCardContent>
      </IonCard>
    </>
  );
});

export default Chat;
