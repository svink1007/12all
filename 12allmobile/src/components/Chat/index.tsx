import React, { FC, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonIcon,
  IonItem,
  IonList,
  IonListHeader,
  IonPopover,
  IonText,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import VertoSession from "../../verto/VertoSession";
import {
  appsOutline,
  happyOutline,
  paperPlaneOutline,
  people,
} from "ionicons/icons";
import { useTranslation } from "react-i18next";
import {
  IncomingMessage,
  Participant,
  ParticipantParams,
} from "../../verto/models";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccumulatorToInitialUnreadMessages,
  setResetUnreadMessages,
  setUnreadMessages,
} from "../../redux/actions/unreadMessagesActions";
import { ReduxSelectors } from "../../redux/types";
// import 'emoji-mart/css/emoji-mart.css';
import { Keyboard } from "@capacitor/keyboard";
import { ChatHistoryService } from "../../services";

type Props = {
  vlrId: number;
  session: VertoSession;
  participants: Participant[];
  show: boolean;
  emoji: { show: boolean; selected: string };
  onOpenEmojis: () => void;
  onCloseEmojis: () => void;
  onMessagesClick?: () => void;
  onInputStateChange: (focused: boolean) => void;
};

type ChatObj = { [id: string]: { chat: IncomingMessage[]; disabled: boolean } };

type CurrentChat = {
  callId: string;
  user?: string;
  newMessageId?: string;
  avatar?: { text: string; color: string };
  left: boolean;
};

const EVERYONE = "everyone";

const DEFAULT_SELECTED_STATE = {
  callId: EVERYONE,
  user: EVERYONE,
  left: false,
};

const Chat: FC<Props> = ({
  vlrId,
  session,
  participants,
  show,
  emoji,
  onOpenEmojis,
  onCloseEmojis,
  onMessagesClick,
  onInputStateChange,
}: Props) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const didMountRef = useRef<boolean>(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLIonTextareaElement>(null);
  const setTextareaBlurTimeout = useRef<NodeJS.Timeout | null>(null);

  const unreadMessages = useSelector(
    ({ unreadMessages }: ReduxSelectors) => unreadMessages
  );

  const [message, setMessage] = useState<string>("");
  const [chatObj, setChatObj] = useState<ChatObj>({
    everyone: {
      chat: [],
      disabled: false,
    },
  });
  const [current, setCurrent] = useState<CurrentChat>(DEFAULT_SELECTED_STATE);
  const [chatPopover, setChatPopover] = useState<{
    show: boolean;
    event?: Event;
  }>({ show: false });
  const [chatParticipants, setChatParticipants] = useState<{
    unread: number;
    accumulator: number;
    participants: Participant[];
  }>({
    unread: 0,
    accumulator: 0,
    participants: [],
  });

  useEffect(() => {
    if (emoji.selected) {
      setMessage((prevState) => `${prevState.trim()} ${emoji.selected} `);
    }

    if (emoji.show) {
      textareaRef.current?.setFocus().then();
    }
  }, [emoji.selected, emoji.show]);

  useEffect(() => {
    ChatHistoryService.getMessages(vlrId).then(({ data }) => {
      const chat = data.map(
        (m) =>
          new IncomingMessage(
            EVERYONE,
            m.sender,
            m.message,
            false,
            new Date(m.date)
          )
      );

      setChatObj((prevState) => ({
        ...prevState,
        everyone: {
          ...prevState.everyone,
          chat: [...chat, ...prevState.everyone.chat],
        },
      }));
    });

    return () => {
      dispatch(setResetUnreadMessages());
    };
  }, [dispatch, vlrId]);

  useEffect(() => {
    setChatObj((prevState) =>
      participants.reduce((acc: ChatObj, participant: Participant) => {
        if (!prevState[participant.callId]) {
          acc[participant.callId] = { disabled: false, chat: [] };
        }
        return acc;
      }, prevState)
    );

    setChatParticipants((prev) => {
      const mappedParticipants = participants.map((participant) => {
        const existingParticipant = prev.participants.find(
          (prevParticipant) => prevParticipant.callId === participant.callId
        );
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
          talking: false,
        },
        video: {
          muted: true,
          floor: false,
          floorLocked: false,
        },
      };

      const everyoneParticipant = new Participant(params);

      if (prev.participants.length) {
        everyoneParticipant.unread = prev.participants[0].unread;
      }

      mappedParticipants.unshift(everyoneParticipant);

      return {
        ...prev,
        participants: mappedParticipants,
      };
    });
  }, [participants]);

  useEffect(() => {
    if (current.callId === EVERYONE) {
      return;
    }

    const participantIsInTheRoom = participants.find(
      (p) => p.callId === current.callId
    );
    if (!participantIsInTheRoom) {
      setCurrent((prevState) => {
        if (!prevState.left) {
          setMessage("");
          return { ...prevState, left: true };
        }

        return prevState;
      });
    }
  }, [participants, current.callId]);

  useEffect(() => {
    const { notification } = session;

    const allId = notification.onChatMessageToAll.subscribe(
      (im: IncomingMessage) => {
        setChatObj((prev) => ({
          ...prev,
          everyone: {
            ...prev.everyone,
            chat: [...prev.everyone.chat, im],
          },
        }));

        setCurrent((prev) => ({ ...prev, newMessageId: EVERYONE }));
      }
    );

    const one2oneId = notification.onChatMessageOneToOne.subscribe(
      (im: IncomingMessage) => {
        setChatObj((prev) => ({
          ...prev,
          [im.toId]: {
            ...prev[im.toId],
            chat: [...prev[im.toId].chat, im],
          },
        }));

        setCurrent((prev) => ({ ...prev, newMessageId: im.toId }));
      }
    );

    return () => {
      notification.onChatMessageToAll.unsubscribe(allId);
      notification.onChatMessageToAll.unsubscribe(one2oneId);
    };
  }, [session]);

  useEffect(() => {
    setChatParticipants((prev) => {
      const newState = prev.participants.map((p) => {
        if (p.callId === current.newMessageId) {
          p.unread = p.unread + 1;
          if (p.callId === current.callId) {
            p.unread = 0;
          }
        }

        return p;
      });

      const unread = newState.reduce(
        (accumulator: number, { unread }: Participant) => {
          if (unread > 0) {
            accumulator = accumulator + unread;
          }

          return accumulator;
        },
        0
      );

      return {
        unread,
        participants: newState,
        accumulator: prev.accumulator + 1,
      };
    });

    // Scroll when the last el is rendered
    setTimeout(() => messagesRef.current?.scrollIntoView(false));
  }, [current, dispatch]);

  useEffect(() => {
    if (didMountRef.current) {
      dispatch(setUnreadMessages(chatParticipants.unread));
    } else {
      didMountRef.current = true;
    }
  }, [chatParticipants.accumulator, chatParticipants.unread, dispatch]);

  useEffect(() => {
    if (current.left) {
      Keyboard.hide().then();
      onCloseEmojis();
      setMessage("");
    }
  }, [current, onCloseEmojis]);

  useEffect(() => {
    if (!show) {
      dispatch(setAccumulatorToInitialUnreadMessages());
    }
  }, [show, dispatch]);

  const handleSend = () => {
    if (!message.trim().length) {
      return;
    }

    if (current.callId === EVERYONE) {
      session.sendMessage.toEveryone(message);
      ChatHistoryService.sendMessage({
        date: new Date().toISOString(),
        message,
        sender: session.callerName,
        vlrId,
      }).then();
    } else {
      session.sendMessage.oneToOne(message, current.callId);
    }

    setMessage("");
  };

  const handlePopoverDismiss = () =>
    setChatPopover({ show: false, event: undefined });

  const handleParticipantSelection = (callId: string) => {
    if (callId === EVERYONE) {
      setCurrent(DEFAULT_SELECTED_STATE);
      setChatParticipants((prev) => {
        const participants = prev.participants.map((p) => {
          if (p.callId === EVERYONE) {
            p.unread = 0;
          }

          return p;
        });

        return {
          ...prev,
          participants,
        };
      });
    } else {
      const participantIndex = chatParticipants.participants.findIndex(
        (p) => p.callId === callId
      );
      const participant = chatParticipants.participants[participantIndex];
      setCurrent({
        callId,
        user: participant.participantName,
        avatar: participant.avatar,
        left: false,
      });
      setChatParticipants((prevState) => {
        prevState.participants[participantIndex].unread = 0;
        // Move participant in front
        prevState.participants.splice(
          1,
          0,
          prevState.participants.splice(participantIndex, 1)[0]
        );
        return prevState;
      });
    }

    handlePopoverDismiss();
  };

  const handleSelectChatWith = (e: any) => {
    e.stopPropagation();
    e.persist();
    setChatPopover({ show: true, event: e });
  };

  const handleInputFocus = () => {
    setTextareaBlurTimeout.current &&
      clearTimeout(setTextareaBlurTimeout.current);
    setTextareaBlurTimeout.current = null;
    onInputStateChange(true);
  };

  const handleInputBlur = () => {
    setTextareaBlurTimeout.current = setTimeout(() => onCloseEmojis(), 250);
    onInputStateChange(false);
  };

  return (
    <IonCard
      className="chat-card"
      color="light"
      style={{ display: show ? "flex" : "none" }}
    >
      <IonCardContent className="chat-card-content">
        <div className="messages-container" onClick={onMessagesClick}>
          {chatObj[current.callId].chat.map(
            (
              { me, date, fromName, message }: IncomingMessage,
              index: number
            ) => (
              <IonCard key={index} className="chat-message">
                <IonCardContent>
                  <header className="chat-message-header">
                    <IonText className="chat-participant-name" color="dark">
                      {fromName}
                    </IonText>
                    <IonText className="chat-date" color="dark">
                      {date}
                    </IonText>
                  </header>

                  <main className="chat-message-container">
                    <IonText color="dark">{message}</IonText>
                  </main>
                </IonCardContent>
              </IonCard>
            )
          )}
          <div ref={messagesRef} />
        </div>

        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonButton onClick={handleSelectChatWith}>
              {current.callId === EVERYONE ? (
                <div className="everyone-wrapper">
                  <IonIcon icon={people} slot="icon-only" />
                </div>
              ) : (
                <div
                  className="avatar-wrapper"
                  style={{ backgroundColor: current.avatar?.color }}
                >
                  <IonText>{current.avatar?.text}</IonText>
                </div>
              )}
              <IonBadge
                color="primary"
                className={`chat-unread-all-badge ${unreadMessages.initial === 0 ? "ion-hide" : ""}`}
              >
                {unreadMessages.initial}
              </IonBadge>
            </IonButton>
          </IonButtons>

          {!current.left ? (
            <>
              <IonItem lines="none" className="chat-input">
                <IonTextarea
                  placeholder={t("chat.placeholder")}
                  value={message}
                  onClick={(event) => event.stopPropagation()}
                  onIonBlur={handleInputBlur}
                  onIonFocus={handleInputFocus}
                  ref={textareaRef}
                  onIonChange={(e) =>
                    setMessage(e.detail.value ? e.detail.value.trim() : "")
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  rows={1}
                  readonly={emoji.show}
                />
              </IonItem>

              <IonButtons slot="end">
                <IonButton
                  onClick={(event) => {
                    event.stopPropagation();

                    if (!emoji.show) {
                      Keyboard.hide().then(() =>
                        setTimeout(() => onOpenEmojis())
                      );
                    } else {
                      onOpenEmojis();
                      setTimeout(() => {
                        textareaRef.current?.setFocus().then();
                      }, 250);
                    }
                  }}
                >
                  <IonIcon
                    icon={emoji.show ? appsOutline : happyOutline}
                    slot="icon-only"
                  />
                </IonButton>
                <IonButton
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSend();
                  }}
                  disabled={!message}
                >
                  <IonIcon icon={paperPlaneOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </>
          ) : (
            <IonText className="user-left" color="medium">
              {current.user} {t("chat.left")}
            </IonText>
          )}
        </IonToolbar>
      </IonCardContent>

      <IonPopover
        className="chat-popover"
        event={chatPopover.event}
        isOpen={chatPopover.show}
        onDidDismiss={handlePopoverDismiss}
        keepContentsMounted
      >
        <IonList>
          <IonListHeader>{t("chat.chatWith")}</IonListHeader>

          <IonItem
            button
            lines="none"
            onClick={(event) => {
              event.stopPropagation();
              handleParticipantSelection(EVERYONE);
            }}
          >
            <IonAvatar color="secondary" slot="start">
              <IonIcon icon={people} />
            </IonAvatar>
            <IonText>{t("chat.everyone")}</IonText>
            {chatParticipants.participants.length &&
              chatParticipants.participants[0].unread > 0 && (
                <IonBadge color="primary" slot="end">
                  {chatParticipants.participants[0].unread}
                </IonBadge>
              )}
          </IonItem>
          {chatParticipants.participants
            .filter((p) => p.callId !== EVERYONE && !p.me)
            .map(({ callId, participantName, avatar, unread }) => (
              <IonItem
                button
                key={callId}
                lines="none"
                onClick={() => handleParticipantSelection(callId)}
              >
                <IonAvatar
                  style={{ backgroundColor: avatar.color }}
                  slot="start"
                >
                  <IonText>{avatar.text}</IonText>
                </IonAvatar>
                <IonText>{participantName}</IonText>
                {unread > 0 && (
                  <IonBadge color="primary" slot="end">
                    {unread}
                  </IonBadge>
                )}
              </IonItem>
            ))}
        </IonList>
      </IonPopover>
    </IonCard>
  );
};

export default Chat;
