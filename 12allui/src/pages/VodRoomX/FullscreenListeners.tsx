import React, {FC, useEffect, useRef} from 'react';

const ALERT_WILL_PRESENT = 'ionAlertWillPresent';
const MODAL_WILL_PRESENT = 'ionModalWillPresent';
const POPOVER_WILL_PRESENT = 'ionPopoverWillPresent';

type Props = {
  isInFullscreen: boolean;
};

const FullscreenListeners: FC<Props> = ({isInFullscreen}: Props) => {
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alertListener: EventListenerOrEventListenerObject;
    let modalListener: EventListenerOrEventListenerObject;
    let popoverListener: EventListenerOrEventListenerObject;

    if (isInFullscreen) {
      // ALERT
      alertListener = (e: Event) => {
        fullscreenContainerRef.current?.append(e.target as HTMLIonAlertElement);
      };

      window.addEventListener(ALERT_WILL_PRESENT, alertListener);

      // MODAL
      modalListener = (e: Event) => {
        fullscreenContainerRef.current?.append(e.target as HTMLIonModalElement);
      };

      window.addEventListener(MODAL_WILL_PRESENT, modalListener);

      // POPOVER
      popoverListener = (e: Event) => {
        fullscreenContainerRef.current?.append(e.target as HTMLIonPopoverElement);
      };

      window.addEventListener(POPOVER_WILL_PRESENT, popoverListener);
    }

    return () => {
      alertListener && window.removeEventListener(ALERT_WILL_PRESENT, alertListener);
      modalListener && window.removeEventListener(MODAL_WILL_PRESENT, modalListener);
      popoverListener && window.removeEventListener(POPOVER_WILL_PRESENT, popoverListener);
    };
  }, [isInFullscreen]);

  return (
    <div ref={fullscreenContainerRef}/>
  );
};

export default FullscreenListeners;
