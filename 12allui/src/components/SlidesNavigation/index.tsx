import React, {FC, useRef, useState} from 'react';
import './styles.scss';
import {IonButton, IonButtons, IonIcon, IonSlides} from '@ionic/react';
import {chevronBack, chevronForward} from 'ionicons/icons';

interface SlidesNavigationProps {
  children: JSX.Element[],
  onSlideDidChange?: (activeSlide: number) => void;
}

const SlidesNavigation: FC<SlidesNavigationProps> = ({children, onSlideDidChange}: SlidesNavigationProps) => {
  const slidesRef = useRef<HTMLIonSlidesElement>(null);
  const [disableFirstSlide, setDisableFirstSlide] = useState<boolean>(true);
  const [disableLastSlide, setDisableLastSlide] = useState<boolean>(false);

  const slidePrev = async () => {
    if (slidesRef.current) {
      await slidesRef.current.slidePrev();
    }
  };

  const slideNext = async () => {
    if (slidesRef.current) {
      await slidesRef.current.slideNext();
    }
  };

  const manageSlideChange = async () => {
    if (slidesRef.current && onSlideDidChange) {
      const slideIndex = await slidesRef.current.getActiveIndex();
      setDisableFirstSlide(slideIndex === 0);
      const isEnd = await slidesRef.current.isEnd();
      setDisableLastSlide(isEnd);
      onSlideDidChange(slideIndex);
    }
  };

  if (!children.length) {
    return null;
  }

  return (
    <>
      <IonSlides
        ref={slidesRef}
        options={
          {
            initialSlide: 0,
            spaceBetween: 4,
            autoplay: {
              delay: 10000
            }
          }
        }
        onIonSlideWillChange={manageSlideChange}
      >
        {children}
      </IonSlides>

      <div className="slides-navigation-controllers" hidden={children.length <= 1}>
        <IonButtons>
          <IonButton onClick={slidePrev} disabled={disableFirstSlide}>
            <IonIcon icon={chevronBack} slot="icon-only"/>
          </IonButton>
        </IonButtons>

        <IonButtons>
          <IonButton onClick={slideNext} disabled={disableLastSlide}>
            <IonIcon icon={chevronForward} slot="icon-only"/>
          </IonButton>
        </IonButtons>
      </div>
    </>
  );
};

export default SlidesNavigation;
