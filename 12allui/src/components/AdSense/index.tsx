import React, {FC, useEffect, useRef} from 'react';
import {AD_SENSE_CLIENT} from "../../shared/constants";
import {LinkProvider, ModifyLinks} from "./LinkProvider";

export enum AdSenseSlot {
  Left = '5642615510',
  Right = '9390288835',
  Down = '3946390465'
}

export enum AdSenseFormat {
  // Auto = 'auto',
  Horizontal = 'horizontal',
  // Vertical = 'vertical',
  // Fluid = 'fluid',
  Rectangle = 'rectangle',
  LargeSquare = '250x250',
  FitToRoom = '1280x720'
}

type Props = {
  slot: AdSenseSlot,
  format?: AdSenseFormat
}

const MIN_AD_WIDTH = 120;

const AdSense: FC<Props> = ({slot, format}: Props) => {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const parentObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const insElement = insRef.current;
      const width = entries[0].contentRect.width;
      if (entries[0].contentRect.width >= MIN_AD_WIDTH && insElement) {
        parentObserver.disconnect();

        switch (format) {
          case undefined:
            insElement.style.height = width >= 992 ? '468px' : '200px';
            break;
          case AdSenseFormat.Rectangle:
            insElement.style.height = '200px';
            break;
          case AdSenseFormat.Horizontal:
            insElement.style.height = '150px';
            break;
          case AdSenseFormat.LargeSquare:
            insElement.style.width = '250px';
            insElement.style.height = '250px';
            break;
          case AdSenseFormat.FitToRoom:
            insElement.style.width = '1280px';
            insElement.style.height = '720px';
            break;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    });
    const insParent = insRef.current?.parentElement;
    insParent && parentObserver.observe(insParent);
  }, [format]);

  return (
      <LinkProvider>
        <ModifyLinks>
            <ins
              className="adsbygoogle"
              ref={insRef}
              style={{display: 'block', margin: '0 auto'}}
              data-ad-client={AD_SENSE_CLIENT}
              data-ad-slot={slot}
              // if you are using data-ad-format be causes, because it injects 'height=auto !important' to each parent
              // data-ad-format={format || AdSenseFormat.Auto}
              // data-full-width-responsive="true"
            />
        </ModifyLinks>
      </LinkProvider>
  );
};

export default AdSense;
