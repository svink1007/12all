const getDisplayMedia = async () => {
  const constraints = {
    audio: {
        echoCancellation: true,  // Remove echo
        noiseSuppression: true,  // Reduce background noise
        autoGainControl: true,   // Automatic gain adjustment
    },
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { max: 15},
    },
  };

  let shareScreenStream = await navigator.mediaDevices.getDisplayMedia(constraints);

  if (!shareScreenStream.getAudioTracks().length) {
    const audioContext = new AudioContext();
    const audioDestination = audioContext.createMediaStreamDestination();

    shareScreenStream = new MediaStream([
      audioDestination.stream.getAudioTracks()[0],
      shareScreenStream.getVideoTracks()[0]
    ]);
  }



  return shareScreenStream;
};

export default getDisplayMedia;
