const getMicParams = (mic: string): boolean | MediaTrackConstraints => (mic === 'any' ? true : {deviceId: mic});

export default getMicParams;
