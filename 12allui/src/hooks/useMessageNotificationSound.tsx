import { useRef, useCallback, useEffect, useState } from 'react';

interface NotificationSoundOptions {
  volume?: number;
  preload?: boolean;
  autoReset?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

const useNotificationSound = (customSoundUrl = null, options: NotificationSoundOptions = {}) => {

const DEFAULT_NOTIFICATION_URL = (() => {
    try {
      return require('../audio/msg_notif.mp3');
    } catch {
      return process.env.PUBLIC_URL + '/audio/msg_notif.mp3';
    }
  })();

  const {
    volume = 0.5,
    preload = true,
    autoReset = true,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef(null);
  
  const soundUrl = customSoundUrl || DEFAULT_NOTIFICATION_URL;

  useEffect(() => {
    if (preload) {
      initializeAudio();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl, preload]);

  const initializeAudio = useCallback(() => {
    try {
        audioRef.current = new Audio(soundUrl);
        const audio = audioRef.current;
        audio.volume = volume;
        audio.preload = 'auto';
       
      
        const handleCanPlayThrough = () => {
            setIsLoaded(true);
            setError(null);
            retryCountRef.current = 0;
        };
      
        const handleError = (e: ErrorEvent) => {
            //console.error('Erreur de chargement audio:', e);
            setIsLoaded(false);
            
            if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setTimeout(() => {
                initializeAudio();
            }, retryDelay);
            }
        };
      
        const handlePlay = () => setIsPlaying(true);
        const handleEnded = () => {
            setIsPlaying(false);
            if (autoReset) {
            audio.currentTime = 0;
            }
        };
        const handlePause = () => setIsPlaying(false);
      
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleError);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        
        // Nettoyage des écouteurs
        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlayThrough);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
        };
        } catch (err) {
        //console.error('Error to initialize audio:', err);
        }
  }, [soundUrl, volume, maxRetries, retryDelay, autoReset]);

  const playNotification = useCallback(async () => {
    try {
      if (!audioRef.current && !preload) {
        initializeAudio();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!audioRef.current) {
        throw new Error('Audio not initialized');
      }
      
      const audio = audioRef.current;
      
      //Stop playing if required
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      // play sound
      await audio.play();
      
    } catch (err) {
      //console.error('error to play sound:', err);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
      }
    }
  }, [preload, initializeAudio, maxRetries]);

  const playMessageSound = useCallback(() => {
    playNotification();
  }, [playNotification]);

  const setVolume = useCallback((newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  //fonction for test sound
  const testSound = useCallback(() => {
    playNotification();
  }, [playNotification]);

  // functions to force reload
  const reload = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
    initializeAudio();
  }, [initializeAudio]);

  return {
    // main functions
    playMessageSound,
    playNotification,
    
    // utilities Functions 
    testSound,
    setVolume,
    reload,
    
    // states
    isLoaded,
    isPlaying,
    error,
    
    // Infos
    soundUrl,
    volume: audioRef.current?.volume || volume
  };
};
export default useNotificationSound;

export const useSimpleNotificationSound = (customSoundUrl = null) => {
  const { playMessageSound, isLoaded, error } = useNotificationSound(customSoundUrl, {
    volume: 1,
    preload: true,
    autoReset: true
  });
  
  return { playMessageSound, isLoaded, error };
};