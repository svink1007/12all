import { IonButton, IonIcon } from '@ionic/react';
import { radioButtonOn, stopCircleOutline } from 'ionicons/icons';
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setInfoToast } from 'src/redux/actions/toastActions';
import { ReduxSelectors } from 'src/redux/shared/types';

type Props ={
    classname: string;
    recordedId: string |null;
}
const RecordButton = ({classname,recordedId}:Props) => {
    const dispatch = useDispatch();
    const [showRecording, setShowRecording] = useState<"idle"|"active"|"pending">("idle");
    const { vertoSession } = useSelector(({streamDebug}: ReduxSelectors) => streamDebug);

    const handleStartRecording = () => {
        setShowRecording("pending");
        if(recordedId){
            dispatch(
                setInfoToast("Recording resumed ...")
            );
            setShowRecording("active");
            vertoSession?.sendDebugAction("a_record", "", "conf-control");
        }else{
            dispatch(
                setInfoToast("Recording will start ...")
            );
            setTimeout(() => {
                setShowRecording("active");
                vertoSession?.sendDebugAction("a_record", "", "conf-control");
            }, 3000)
        }
            
        };
    
        const handleStopRecording = () => {
            setShowRecording("idle");
            vertoSession?.sendDebugAction("a_record_stop", "", "conf-control")
            dispatch(
                setInfoToast("recording paused ...")
            );
        }
  return (
    
    <>
        {
            showRecording === 'idle' && (
                <IonButton
                    className={classname}
                    title={"Record"}
                    onClick={() => handleStartRecording()}
                >
                    <IonIcon slot="icon-only" icon={radioButtonOn} color={"dark"}/>
                </IonButton>
            )
        }

        {
            showRecording === 'pending' && (
                <IonButton
                    className={classname}
                    title={"Start Recording ..."}
                >
                    <IonIcon slot="icon-only" icon={radioButtonOn} color={"primary"}/>
                </IonButton>
            )
        }

        {
            showRecording === 'active' && (
                <IonButton
                    className={classname}
                    title={"Recording"}
                    onClick={() => handleStopRecording()}
                >
                    <IonIcon slot="icon-only" icon={stopCircleOutline} color={"dark"}/>
                </IonButton>
            )
        }
    </>
  )
}

export default RecordButton