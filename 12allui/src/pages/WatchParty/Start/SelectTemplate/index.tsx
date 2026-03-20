import React, {FC, useEffect, useState} from 'react';
import {IonButton, IonButtons, IonIcon, IonItem, IonLabel, IonList, IonPopover} from '@ionic/react';
import {useTranslation} from 'react-i18next';
import {checkmarkCircleOutline, closeOutline} from 'ionicons/icons';
import {setErrorToast, setInfoToast} from '../../../../redux/actions/toastActions';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxSelectors} from '../../../../redux/shared/types';
import {VlrService} from '../../../../services';
import {
  resetSelectedVlrTemplate,
  setSelectedVlrTemplate,
  setVlrTemplates
} from '../../../../redux/actions/vlrTemplateActions';
import {VlrTemplate} from '../../../../shared/types';

const SelectTemplate: FC = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {templates, selected} = useSelector(({vlrTemplate}: ReduxSelectors) => vlrTemplate);

  const [popoverState, setPopoverState] = useState<{ show: boolean; event?: Event }>({show: false});

  useEffect(() => {
    VlrService.getTemplates().then(({data}) => {
      dispatch(setVlrTemplates(data));
      const selectedTemplate = data.find(t => t.selected);
      if (selectedTemplate) {
        dispatch(setSelectedVlrTemplate(selectedTemplate));
      }
    });
  }, [dispatch]);

  const handleOpenTemplates = (event: any) => {
    event.persist();
    setPopoverState(prevState => ({...prevState, event, show: true}));
  };

  const handleTemplateSelection = (template?: VlrTemplate) => {
    if (template) {
      dispatch(setSelectedVlrTemplate(template));
    } else {
      dispatch(resetSelectedVlrTemplate());
    }

    VlrService.changeSelectedTemplate(template?.id).then();
    setPopoverState({show: false});
  };

  const handleRemoveTemplate = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    VlrService.deleteTemplate(id)
      .then(() => {
        const templatesFiltered = templates.filter(t => t.id !== id);
        dispatch(setVlrTemplates(templatesFiltered));
        const selected = templatesFiltered.find(t => t.selected);
        !selected && dispatch(resetSelectedVlrTemplate());
        dispatch(setInfoToast('watchPartyStart.templateRemoved'));
      })
      .catch(() => dispatch(setErrorToast('watchPartyStart.templateCouldNotRemoved')));
  };

  return (
    <>
      <IonButton
        color="secondary"
        slot="end"
        onClick={handleOpenTemplates}
      >
        {t('watchPartyStart.selectTemplate')}
      </IonButton>

      <IonPopover
        isOpen={popoverState.show}
        event={popoverState.event}
        onDidDismiss={() => setPopoverState({show: false})}
      >
        <IonList>
          <IonItem button onClick={() => handleTemplateSelection()} lines="none">
            <IonIcon
              icon={checkmarkCircleOutline}
              slot="start"
              color={!selected.id ? 'success' : ''}
            />
            <IonLabel>{t('watchPartyStart.none')}</IonLabel>
          </IonItem>

          {templates.map(template => (
            <IonItem button key={template.id} onClick={() => handleTemplateSelection(template)} lines="none">
              <IonIcon
                icon={checkmarkCircleOutline}
                slot="start"
                color={selected.id === template.id ? 'success' : ''}
              />
              <IonLabel>{template.template_name}</IonLabel>
              <IonButtons slot="end">
                <IonButton onClick={(e) => handleRemoveTemplate(e, template.id)} color="danger">
                  <IonIcon icon={closeOutline} slot="icon-only"/>
                </IonButton>
              </IonButtons>
            </IonItem>
          ))}
        </IonList>
      </IonPopover>
    </>
  );
};

export default SelectTemplate;
