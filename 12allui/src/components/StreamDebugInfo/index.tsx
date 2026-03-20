import {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import {HTMLVideoStreamElement} from '../../pages/WatchParty/types';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonList,
  IonListHeader,
  IonText
} from '@ionic/react';

const StreamDebugInfo: FC = () => {
  const {
    hlsErrors,
    videoElement,
    sentStream,
    receivedStream,
    vertoSession
  } = useSelector(({streamDebug}: ReduxSelectors) => streamDebug);
  const sourceRef = useRef<HTMLDivElement>(null);
  const sentStreamVideoRef = useRef<HTMLVideoStreamElement>(null);
  const receivedStreamVideoRef = useRef<HTMLVideoStreamElement>(null);

  const [sourceInfo, setSourceInfo] = useState<string>('');
  const [sentStreamInfo, setSentStreamInfo] = useState<string>('');
  const [receivedStreamInfo, setReceivedStreamInfo] = useState<string>('');
  const [rtcStats, setRTCStats] = useState<string>('');
  const [rtcCodec, setRTCCodec] = useState<string>('');

  useEffect(() => {
    const getStats = () => {
      if (videoElement) {
        const sourceData = {
          video: {
            height: videoElement.videoHeight,
            width: videoElement.videoWidth
          }
        };
        setSourceInfo(JSON.stringify(sourceData, null, 2));
      } else {
        setSourceInfo('');
      }

      if (sentStream) {
        const sentData = {
          video: sentStream.getVideoTracks().length ? sentStream.getVideoTracks()[0].getSettings() : 'No video track',
          audio: sentStream.getAudioTracks().length ? sentStream.getAudioTracks()[0].getSettings() : 'No audio track'
        };

        setSentStreamInfo(JSON.stringify(sentData, null, 2));
      } else {
        setSentStreamInfo('');
      }

      if (receivedStream) {
        const receivedData = {
          video: receivedStream.getVideoTracks().length ? receivedStream.getVideoTracks()[0].getSettings() : 'No video track',
          audio: receivedStream.getAudioTracks().length ? receivedStream.getAudioTracks()[0].getSettings() : 'No audio track'
        };

        setReceivedStreamInfo(JSON.stringify(receivedData, null, 2));
      } else {
        setReceivedStreamInfo('');
      }

      if (vertoSession) {
        vertoSession.getRTCVideoTrackStats()?.then(stats => {
          stats.forEach(report => {
            switch (report.type) {
              case 'outbound-rtp':
                setRTCStats(JSON.stringify(report, null, 2));
                break;
              case 'codec':
                setRTCCodec(JSON.stringify(report, null, 2));
                break;
            }
          });
        });
      }
    };
    getStats();

    const interval = setInterval(getStats, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [videoElement, sentStream, receivedStream, vertoSession]);

  useEffect(() => {
    if (videoElement && sourceRef.current) {
      sourceRef.current.append(videoElement);
    }
  }, [videoElement]);

  useEffect(() => {
    if (sentStreamVideoRef.current) {
      sentStreamVideoRef.current.srcObject = sentStream;
    }
  }, [sentStream]);

  useEffect(() => {
    if (receivedStreamVideoRef.current) {
      receivedStreamVideoRef.current.srcObject = receivedStream;
    }
  }, [receivedStream]);

  const [command, setCommand] = useState<string>('');
  const [argument, setArgument] = useState<string>('');
  const [application, setApplication] = useState<string>('');

  return (
      <div className="stream-debug" style={{ paddingBottom: '50px' }}>
        <h1>Stream info</h1>

        <IonCard hidden={!videoElement}>
          <IonCardHeader>
            <IonCardTitle>Source</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div ref={sourceRef}/>
            <pre>{sourceInfo}</pre>
            {
                hlsErrors.length > 0 &&
                <IonList className="hls-errors-list">
                  <IonListHeader>Errors ({hlsErrors.length})</IonListHeader>
                  {
                    hlsErrors.map(({date, message}, index) =>
                        <IonText key={index} color="danger">[{date}] {message}</IonText>
                    )
                  }
                </IonList>
            }
          </IonCardContent>
        </IonCard>

        <IonCard hidden={!sentStream}>
          <IonCardHeader>
            <IonCardTitle>Sent stream</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <video ref={sentStreamVideoRef} autoPlay muted/>
            <pre>{sentStreamInfo}</pre>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Received stream</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <video ref={receivedStreamVideoRef} autoPlay muted/>
            <pre>{receivedStreamInfo}</pre>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>RTC statistics</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <pre>{rtcStats}</pre>
            <pre>{rtcCodec}</pre>
          </IonCardContent>
        </IonCard>

        {/*<IonCard>*/}
        {/*  <IonCardHeader>*/}
        {/*    <IonCardTitle>RTC statistics</IonCardTitle>*/}
        {/*  </IonCardHeader>*/}
        {/*  <IonCardContent>*/}
        {/*    <pre>{rtcStats}</pre>*/}
        {/*    <pre>{rtcCodec}</pre>*/}
        {/*  </IonCardContent>*/}
        {/*</IonCard>*/}

        <IonCard>
          <IonCardHeader>
            {/*<IonCardTitle>Debug Controls</IonCardTitle>*/}
          </IonCardHeader>
          <IonCardContent className={"flex flex-col gap-y-4"}>
            <IonInput
                type="text"
                className={"bg-white"}
                name="command"
                onIonChange={({detail: {value}}) =>
                    setCommand(value ? value.trim() : '')
                }
                value={command}
                placeholder={"Command"}
            />

            <IonInput
                className={"bg-white"}
                type="text"
                name="argument"
                onIonChange={({detail: {value}}) =>
                    setArgument(value ? value.trim() : '')
                }
                value={argument}
                placeholder={"Argument"}
            />

            <IonInput
                className={"bg-white"}
                type="text"
                name="application"
                onIonChange={({detail: {value}}) =>
                    setApplication(value ? value.trim() : '')
                }
                value={application}
                placeholder={"Application"}
            />

            <IonButton
                type="submit"
                onClick={() => {
                  vertoSession?.sendDebugAction(command, argument, application)
                }}
                style={{ width: '100%', height: '50px', marginBottom: '5px' }}
            >
              Execute
            </IonButton>
          </IonCardContent>
        </IonCard>
      </div>
  );
};

export default StreamDebugInfo;

