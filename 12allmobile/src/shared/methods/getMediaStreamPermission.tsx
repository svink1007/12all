import { MOBILE_VIEW } from "../constants";
import { Microphone } from "@mozartec/capacitor-microphone";
import { Camera } from "@capacitor/camera";

const getMediaStreamPermission = async (
  audio: MediaStreamTrack,
  video: MediaStreamTrack
) => {
  let userMedia: MediaStream;

  if (MOBILE_VIEW) {
    const micPermission = await Microphone.checkPermissions();
    if (micPermission.microphone !== "granted") {
      const micRequestPermission = await Microphone.requestPermissions();
      if (micRequestPermission.microphone !== "granted") {
        return;
      }
    }
    const cameraPermission = await Camera.checkPermissions();
    if (cameraPermission.camera !== "granted") {
      const cameraRequestPermission = await Camera.requestPermissions({
        permissions: ["camera"],
      });
      if (cameraRequestPermission.camera !== "granted") {
        return;
      }
    }
    userMedia = new MediaStream([audio, video]);
  } else {
    try {
      userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      userMedia.getAudioTracks().forEach((track) => track.stop());
      userMedia = new MediaStream([audio, video]);
    } catch (e: any) {
      return;
    }
  }

  return userMedia;
};

export default getMediaStreamPermission;
