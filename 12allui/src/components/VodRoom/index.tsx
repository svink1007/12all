import React, { FC } from "react";
import "./styles.scss";
import { VodState } from "../../redux/reducers/vodReducers";
import { IonImg, IonItem, IonRouterLink, IonText } from "@ionic/react";
import sharpStar from "../../images/icons/star-sharp.svg";
import audioOnly from "../../images/audio-only.gif";
import VodActions from "../../pages/VoD/VodActions";
import { useVodNavigation } from "../../hooks/useVodNavigation";

type Props = {
    vod: VodState;
    redirectFrom?: string;
    noRedirection?: boolean;
};



const placeholder = "data:image/png;base64,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"

const VodSlide: FC<Props> = ({ vod, redirectFrom, noRedirection = false }) => {
    const { handleVodRedirection } = useVodNavigation();

    const handleClick = () => {
        if (noRedirection) return;

        handleVodRedirection({
            vodId: vod.id,
            vodStarsAmount: vod.starsAmount ?? 0
        });
    };

    return (
        <IonItem 
            button 
            className="shared-stream-item" 
            lines="none" 
            detail={false} 
            style={{
                "pointerEvents": "auto",
                "cursor": "pointer"
            }}
        >
            <IonRouterLink className="shared-stream-wrapper" onClick={handleClick}>
                <div className={"flex justify-center h-[150px]"}>
                    {vod.audioOnly ? (
                        <IonImg
                            src={audioOnly}
                            alt="audio only"
                            className="stream-snapshot"
                        />
                    ) : (
                        <img
                            src={vod.logo && vod.logo.length>0  ? vod.logo: placeholder}
                            alt={vod.title}
                        />
                    )}
                </div>

                <div className="shared-stream-name-container mt-4">
                    {parseInt(`${vod.starsAmount}`) > 0 && <img src={sharpStar} />}
                    <IonText className="shared-stream-name" color="dark">
                        {vod.title}
                    </IonText>
                    {parseInt(`${vod.starsAmount}`) > 0 && <img src={sharpStar} />}
                </div>
            </IonRouterLink>
            <VodActions vod={vod} />
        </IonItem>
    );
};

export default VodSlide;