import React, {FC, useEffect, useRef, useState} from 'react';
import {IonItem, IonLabel, IonSelect, IonSelectOption} from '@ionic/react';
import {FsRoomResolutionService} from '../../../services';
import {FsResolution} from '../../../shared/types';
import {ShareStreamOption} from '../enums';
import {useDispatch} from 'react-redux';
import {patchSelectedVlrTemplate} from '../../../redux/actions/vlrTemplateActions';

type Props = {
  initialValue: number | null;
  shareType: ShareStreamOption | null;
  onResolutionChange?: (resolution: number) => void;
};

const SelectFsResolution: FC<Props> = ({initialValue, shareType, onResolutionChange}: Props) => {
  const dispatch = useDispatch();
  const hasResolutions = useRef<boolean>(false);
  const [resolutions, setResolutions] = useState<FsResolution[]>([]);

  useEffect(() => {
    if (shareType === ShareStreamOption.Screen && !hasResolutions.current) {
      FsRoomResolutionService.getResolutions()
        .then(({data}) => {
          hasResolutions.current = true;
          setResolutions(data);
          data.length && dispatch(patchSelectedVlrTemplate({roomResolution: data[0].resolution}));
        });
    }
  }, [dispatch, shareType]);

  const handleOnChange = (resolution: number) => {
    dispatch(patchSelectedVlrTemplate({roomResolution: resolution}));
    onResolutionChange && onResolutionChange(resolution);
  };

  return (
    <IonItem className="fs-room-resolution" hidden={shareType !== ShareStreamOption.Screen && shareType !== ShareStreamOption.Obs}>
      <IonLabel position="stacked">Room resolution</IonLabel>
      <IonSelect
        interface="popover"
        disabled={!resolutions.length}
        value={initialValue}
        onIonChange={(e) => handleOnChange(+e.detail.value)}
      >
        {resolutions.map(({id, name, resolution}) => (
          <IonSelectOption key={id} value={resolution}>
            {name}
          </IonSelectOption>
        ))}
      </IonSelect>
    </IonItem>
  );
};

export default SelectFsResolution;
