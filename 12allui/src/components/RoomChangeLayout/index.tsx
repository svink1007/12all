import React, {FC, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPopover,
  IonRadio,
  IonRadioGroup
} from '@ionic/react';
import {gridOutline} from 'ionicons/icons';
import {useTranslation} from 'react-i18next';
import {VertoLayout} from '../../verto/types';
import {useSelector} from 'react-redux';
import {ReduxSelectors} from '../../redux/shared/types';
import {RoomLayoutService} from '../../services';
import {RoomLayout} from '../../shared/types';

type Props = {
  onLayoutChange: (layout: VertoLayout) => void;
};

const RoomChangeLayout: FC<Props> = ({onLayoutChange}) => {
  const {t} = useTranslation();
  const {selected} = useSelector(({roomLayout}: ReduxSelectors) => roomLayout);
  const {roomLayout} = useSelector(({livingRoom}: ReduxSelectors) => livingRoom);
  const popover = useRef<HTMLIonPopoverElement>(null);
  const [layouts, setLayouts] = useState<RoomLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<VertoLayout>(VertoLayout.VideoLeftLarge);
  const [openPopover, setOpenPopover] = useState<boolean>(false);

  useEffect(() => {
    if (!layouts.length) {
      RoomLayoutService.getLayouts().then(({data}) => {
        setLayouts(data);
        if (roomLayout) {
          setSelectedLayout(roomLayout.layout);
        } else {
          const defaultLayout = data.find(l => l.default);
          defaultLayout && setSelectedLayout(defaultLayout.layout);
        }
      });
    }
  }, [roomLayout, layouts]);

  useEffect(() => {
    setSelectedLayout(selected);
  }, [selected]);

  const handleLayoutChange = ({detail: {value}}: CustomEvent) => {
    console.log("onchange layout here", value)
    setSelectedLayout(value);
    popover.current!.dismiss().then()
    onLayoutChange(value);
  };

  const handleOpenLayoutPopover = (e: any) => {
    popover.current!.event = e;
    setOpenPopover(true);
  };

  return (
    <>
      <IonButton
        onClick={handleOpenLayoutPopover}
        title={t('roomSideBar.layouts')}
      >
        <IonIcon slot="icon-only" icon={gridOutline} color={openPopover ? 'success' : 'dark'}/>
      </IonButton>

      <IonPopover
        className="change-layout-popover"
        ref={popover}
        isOpen={openPopover}
        onDidDismiss={() => setOpenPopover(false)}
        alignment="start"
        side="start"
      >
        <IonList>
          <IonListHeader>{t('vertoLayout.changeRoomLayout')}</IonListHeader>
          <IonRadioGroup value={selectedLayout} onIonChange={handleLayoutChange}>
            {
              layouts.map(({layout, key, name}: RoomLayout) => (
                <IonItem key={layout}>
                  <IonRadio slot="start" value={layout}/>
                  <IonLabel>{key ? t(`vertoLayout.${key}`) : name}</IonLabel>
                </IonItem>
              ))
            }
          </IonRadioGroup>
        </IonList>
      </IonPopover>
    </>
  );
};

export default RoomChangeLayout;
