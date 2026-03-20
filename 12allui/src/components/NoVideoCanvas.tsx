
import React, {FC, useEffect, useRef} from 'react';
import {HtmlCanvasStreamEl} from '../pages/WatchParty/types';
import defaultVlrAvatar from '../images/vlr-default-avatar.png';

const DEFAULT_VLR_AVATAR = new Image();
DEFAULT_VLR_AVATAR.src = defaultVlrAvatar;

interface NoVideoCanvasProps {
  onVideoTrack: (track: MediaStreamTrack) => void;
}

const NoVideoCanvas: FC<NoVideoCanvasProps> = ({onVideoTrack}) => {
  const canvasRef = useRef<HtmlCanvasStreamEl>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      throw new Error('No no video canvas ref')
    }

    canvasRef.current.width = DEFAULT_VLR_AVATAR.width;
    canvasRef.current.height = DEFAULT_VLR_AVATAR.height;

    const context = canvasRef.current.getContext('2d');
    context && context.drawImage(DEFAULT_VLR_AVATAR, 0, 0);

    // const interval = setInterval(() => {
    //   context && context.drawImage(DEFAULT_VLR_AVATAR, 0, 0);
    // }, 1000 / 30);
    //
    // setTimeout(() => clearInterval(interval), 5000);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      throw new Error('No no video canvas ref')
    }

    const stream = canvasRef.current.captureStream(1);
    onVideoTrack(stream.getVideoTracks()[0]);
  }, [onVideoTrack]);

  return <canvas ref={canvasRef} hidden/>;
};

export default NoVideoCanvas;
