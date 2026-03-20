import React, {FC, useState} from 'react';
import './styles.scss';
import {IonAlert, IonButton, IonItem, IonList, IonPopover} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {setErrorToast, setInfoToast} from '../../../../redux/actions/toastActions';
import {ReduxSelectors} from '../../../../redux/shared/types';
import {VlrService} from '../../../../services';
import {CreateVlrTemplate, UpdateVlrTemplate} from '../../../../shared/types';
import {addVlrTemplate, setSelectedVlrTemplate} from '../../../../redux/actions/vlrTemplateActions';

const SaveTemplate: FC = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const {
    templates,
    selected: {
      id,
      channelName,
      description,
      genre,
      language,
      useMedia,
      streamId,
      mode,
      customStreamUrl,
      showCustomStream,
      share,
      room,
      logoFile,
      roomResolution,
      logo,
      schedule
    }
  } = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate);

  const [popoverState, setPopoverState] = useState<{ show: boolean; event?: Event }>({show: false});
  const [showTemplateAlert, setShowTemplateAlert] = useState<boolean>(false);

  const buildRequestData = (): UpdateVlrTemplate => ({
    channel_name: channelName,
    description,
    genre,
    language,
    use_media: useMedia,
    stream: streamId,
    mode,
    custom_stream_url: customStreamUrl,
    show_custom_stream: showCustomStream,
    vlr: room.id,
    share,
    room_resolution: roomResolution,
    show_schedule: false,
    schedule_date: schedule.date,
    schedule_participants: schedule.participants.length ? schedule.participants.join(',') : null,
    schedule_duration: schedule.duration
  });

  const onSave = (event: any) => {
    if (!templates.length) {
      setShowTemplateAlert(true);
    } else {
      event.persist();
      setPopoverState({show: true, event});
    }
  };

  const handleOverrideTemplate = () => {
    const template: UpdateVlrTemplate = buildRequestData();

    const formData = new FormData();
    if (logoFile) {
      formData.append('files.logo', logoFile, logoFile.name);
    } else if (logo) {
      template.logo = logo.id;
    } else {
      template.logo = null;
    }
    formData.append('data', JSON.stringify(template));

    VlrService.updateTemplate(formData, id).then(({data}) => {
      dispatch(setSelectedVlrTemplate({...data, show_schedule: schedule.show}));
      dispatch(setInfoToast('watchPartyStart.saved'));
    });
  };

  const handleCreateTemplate = (templateName: string) => {
    const template: CreateVlrTemplate = {
      template_name: templateName,
      ...buildRequestData()
    };

    const formData = new FormData();
    if (logoFile) {
      formData.append('files.logo', logoFile, logoFile.name);
    } else if (logo) {
      template.logo = logo.id;
    } else {
      template.logo = null;
    }
    formData.append('data', JSON.stringify(template));

    VlrService.createTemplate(formData).then(({data}) => {
      dispatch(addVlrTemplate(data));
      dispatch(setSelectedVlrTemplate({...data, show_schedule: schedule.show}));
      dispatch(setInfoToast('watchPartyStart.saved'));
    });
  };

  return (
    <>
      <IonButton
        onClick={onSave}
        color="dark"
        slot="end"
      >
        {t('watchPartyStart.saveTemplate')}
      </IonButton>

      <IonPopover
        isOpen={popoverState.show}
        event={popoverState.event}
        onDidDismiss={() => setPopoverState({show: false})}
      >
        <IonList>
          <IonItem button onClick={() => {
            setShowTemplateAlert(true);
            setPopoverState({show: false});
          }}>
            {t('watchPartyStart.createTemplate')}
          </IonItem>
          <IonItem button onClick={() => {
            handleOverrideTemplate();
            setPopoverState({show: false});
          }}>
            {t('watchPartyStart.overrideCurrentTemplate')}
          </IonItem>
        </IonList>
      </IonPopover>

      <IonAlert
        isOpen={showTemplateAlert}
        header="Create template"
        cssClass="create-template-alert"
        onDidDismiss={() => setShowTemplateAlert(false)}
        inputs={[
          {
            name: 'templateName',
            type: 'text',
            placeholder: t('watchPartyStart.templateName')
          }
        ]}
        buttons={[
          {
            text: t('watchPartyStart.cancel'),
            role: 'cancel',
            handler: () => setShowTemplateAlert(false)
          },
          {
            text: t('watchPartyStart.ok'),
            handler: ({templateName}) => {
              if (!templateName) {
                return false;
              }

              const exist = !!templates.find(t => t.template_name === templateName);
              if (exist) {
                dispatch(setErrorToast('watchPartyStart.templateExist'));
                return false;
              }

              handleCreateTemplate(templateName);
            }
          }
        ]}
      />
    </>
  );
};

export default SaveTemplate;
