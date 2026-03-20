import {RefObject, useEffect, useState} from 'react';

const useAdSenseGuard = (el: RefObject<HTMLElement>, width: number) => {
  const [loadAd, setLoadAd] = useState<boolean>(false);

  useEffect(() => {
    if (!el.current) {
      return;
    }

    const parentObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (entries[0].contentRect.width >= width) {
        setLoadAd(true);
      }
    });

    parentObserver.observe(el.current);
  }, [el, width]);

  return loadAd;
};

export default useAdSenseGuard;
