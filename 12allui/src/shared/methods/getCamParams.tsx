const getCamParams = (cam: string, hd: boolean = false): boolean | MediaTrackConstraints => (
  cam === 'none'
    ? false
    : cam === 'any'
      ? {
        deviceId: cam,
        width: { ideal: 640 },
        height: { ideal: 360 },
        frameRate: {max: 15},
        aspectRatio: { ideal: 1.77777777 }
      }
      :
      {
        deviceId: cam,
        width: { ideal: 640 },
        height: { ideal: 360 },
        frameRate: {max: 15},
        aspectRatio: { ideal: 1.77777777 }
      }
  // {
  //   deviceId: cam,
  //   // height: {ideal: hd ? 720 : 360},
  //   height: { ideal: 1080 },
  //   frameRate: 15,
  //   aspectRatio: { ideal: 1.77777777 }
  // }
);

export default getCamParams;
