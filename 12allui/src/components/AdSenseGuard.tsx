import React, {FC, ReactNode, useRef} from 'react';
import useAdSenseGuard from '../hooks/useAdSenseGuard';

const MIN_PARENT_WIDTH = 172;

type Props = {
  className?: string;
  children: ReactNode;
};

const AdSenseGuard: FC<Props> = ({children, className}) => {
  const guardRef = useRef<HTMLDivElement>(null);
  const loadAd = useAdSenseGuard(guardRef, MIN_PARENT_WIDTH);

  return (
    <div className={className} ref={guardRef}>
      {loadAd && children}
    </div>
  )
};

export default AdSenseGuard;
