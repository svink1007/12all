import {FC, useState, useEffect} from 'react';
import './styles.scss';
import {  
  IonButton,
  IonButtons,
  IonToolbar,
  IonImg
} from '@ionic/react';

import AddBetModal from '../AddBetModal';
import JoinBetModal from '../JoinBetModal'
import ManageBetModal from '../ManageBetModal';

import {useTranslation} from 'react-i18next';
import addGame from "../../../../../images/icons/bets/add_game.png";
import joinGame from "../../../../../images/icons/bets/join-game.png";
import manageGame from "../../../../../images/icons/bets/manage-game.png";

import VertoSession from '../../../../../verto/VertoSession';
import { BetGameObj, messageType } from '../../../../../shared/types';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from '../../../../../redux/shared/types';
import { setEnableRewardPopup } from '../../../../../redux/actions/billingRewardActions';
import {ChatHistoryService} from '../../../../../services';

type Props = {
  isFullscreen: boolean;
  session: VertoSession;
  isRoomOwner: boolean | null;
  roomId: number | null;
  show: boolean;
};

const BetsBar: FC<Props> = (({isFullscreen, session, isRoomOwner, roomId, show}: Props) => {
  const {t} = useTranslation();

  const [showAddBetsModal, setShowAddBetsModal] = useState<boolean>(false);
  const [showJoinBetsModal, setShowJoinBetsModal] = useState<boolean>(false);
  const [showManageBetsModal, setShowManageBetsModal] = useState<boolean>(false);
  const [hasActiveGames, setHasActiveGames] = useState<boolean>(false);
  const [hasGamesForManage, setHasGamesForManage] = useState<boolean>(false);

  const gamesList = useSelector(({ betGames }: ReduxSelectors) => betGames.games);
  const profile = useSelector(({ profile }: ReduxSelectors) => profile);
  const dispatch = useDispatch();
  
  
 useEffect(() => {          
    setHasActiveGames(false);
    setHasGamesForManage(false);
    let now:Date = new Date();

    gamesList.map(({status, hostId, participants, end}) => {
        if (status === "ACTIVE" && hostId != profile.id && !participants.includes(profile.id)) {
            setHasActiveGames(true);
        }

        //let diffInDays: number = (now.getTime() - new Date(end + "Z").getTime()) / (1000 * 60 * 60 * 24);
        let createdToday = (now.setHours(0,0,0,0) == new Date(end + "Z").setHours(0,0,0,0));
        if (hostId === profile.id && createdToday) {
            setHasGamesForManage(true);
        }
      });
 }, [gamesList]);

   const handleOpenGameModal = (modal: string) => {
     if (!profile.jwt) {
       dispatch(setEnableRewardPopup({ openRoomAnon: true }))
       return
     } else {
        switch (modal) {
          case "add":
            setShowAddBetsModal(true);
            break;
        case "join":
            setShowJoinBetsModal(true);
            break;
        case "manage":
            setShowManageBetsModal(true);
            break;                            
        }        
     }
   }
   
   const sendMessage = (type: messageType, gameId: number | null) => {
    let message = JSON.stringify({type, gameId});

    console.log("sendMessage", JSON.stringify(message));

    session.sendMessage.toEveryone(message);    
    ChatHistoryService.sendMessage({
        date: new Date().toISOString(),
        message,
        sender: session.callerName,
        vlrId: roomId ? roomId : 0
    }).then();    
   }

  return (
    <IonToolbar className="living-room-bets-bar" style={{display: show ? 'flex' : 'none'}} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        <div className="betsButtons">
            <IonButtons placeholder={undefined} onPointerEnterCapture={undefined}> 
                {
                    gamesList.length > 0 &&  hasActiveGames &&    
                    <>
                        <div>
                            <IonButton
                                onClick={() => handleOpenGameModal("join")}
                                className="bets-add-game" 
                                title={"Star"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                                        
                                >
                                <IonImg src={joinGame} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />                       
                            </IonButton>
                            <div >{t('Join GAME')}</div>
                        </div>
                    </> 
                }
                {
                    gamesList.length > 0 && hasGamesForManage &&
                    <>            
                        <div>
                            <IonButton
                                onClick={() => handleOpenGameModal("manage")}
                                className="bets-add-game" 
                                title={"Star"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                                       
                                >
                                <IonImg src={manageGame} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />                       
                            </IonButton>
                            <div >{t('Manage GAME')}</div>
                        </div>    
                    </>                             
                }
                {
                    <div>
                        <IonButton
                            onClick={() => handleOpenGameModal("add")}
                            className="bets-add-game" 
                            title={"Star"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                                        
                            >
                            <IonImg src={addGame} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />                        
                        </IonButton>
                        <div >{t('New GAME')}</div>
                    </div>                                   
                }

            </IonButtons>
         </div>
         <AddBetModal           
            show={showAddBetsModal}
            setShow={setShowAddBetsModal}
            roomId={roomId}
            onSelect={(game: BetGameObj, type: messageType) => sendMessage(type, game.id)}
        />

        <ManageBetModal           
            show={showManageBetsModal}
            setShow={setShowManageBetsModal}
            roomId={roomId} 
            onSelect={(game: BetGameObj, type: messageType) => sendMessage(type, game.id)}
        />


        <JoinBetModal
            show={showJoinBetsModal}
            setShow={setShowJoinBetsModal}
            onSelect={(game: BetGameObj, type: messageType) => sendMessage(type, game.id)}
            gameId={null}
        />

        </IonToolbar>
  );
});

export default BetsBar;
