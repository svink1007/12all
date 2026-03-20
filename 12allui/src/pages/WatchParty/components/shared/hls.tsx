export const WP_HLS = 'wpHls';

export type CapStream = { width: number | null, height: number | null };

export enum TuneType {
  Boolean = 'b',
  Number = 'n'
}

export class Tune {
  name: string;
  type: TuneType;
  isChecked: boolean;
  value: boolean | number | null = null;

  constructor(name: string, type: TuneType, isChecked: boolean = false) {
    this.name = name;
    this.type = type;
    this.isChecked = isChecked;
  }
}

export const TUNES_INITIAL = [
  new Tune('capLevelToPlayerSize', TuneType.Boolean),
  new Tune('capLevelOnFPSDrop', TuneType.Boolean),
  new Tune('debug', TuneType.Boolean),
  new Tune('initialLiveManifestSize', TuneType.Number),
  new Tune('maxBufferLength', TuneType.Number),
  new Tune('backBufferLength', TuneType.Number),
  new Tune('maxBufferSize', TuneType.Number),
  new Tune('maxBufferHole', TuneType.Number),
  new Tune('maxStarvationDelay', TuneType.Number),
  new Tune('maxLoadingDelay', TuneType.Number),
  new Tune('highBufferWatchdogPeriod', TuneType.Number),
  new Tune('nudgeOffset', TuneType.Number),
  new Tune('nudgeMaxRetry', TuneType.Number),
  new Tune('maxFragLookUpTolerance', TuneType.Number),
  new Tune('maxMaxBufferLength', TuneType.Number),
  new Tune('liveSyncDurationCount', TuneType.Number),
  new Tune('liveMaxLatencyDurationCount', TuneType.Number),
  new Tune('liveSyncDuration', TuneType.Number),
  new Tune('liveMaxLatencyDuration', TuneType.Number),
  new Tune('maxLiveSyncPlaybackRate', TuneType.Number),
  new Tune('liveDurationInfinity', TuneType.Boolean),
  new Tune('startLevel', TuneType.Number),
  new Tune('startFragPrefetch', TuneType.Boolean),
  new Tune('testBandwidth', TuneType.Boolean),
  new Tune('progressive', TuneType.Boolean),
  new Tune('lowLatencyMode', TuneType.Boolean),
  new Tune('fpsDroppedMonitoringPeriod', TuneType.Number),
  new Tune('fpsDroppedMonitoringThreshold', TuneType.Number),
  new Tune('appendErrorMaxRetry', TuneType.Boolean),
  new Tune('stretchShortVideoTrack', TuneType.Boolean),
  new Tune('forceKeyFrameOnDiscontinuity', TuneType.Boolean),
  new Tune('abrEwmaFastLive', TuneType.Number),
  new Tune('abrEwmaSlowLive', TuneType.Number),
  new Tune('abrEwmaFastVoD', TuneType.Number),
  new Tune('abrEwmaSlowVoD', TuneType.Number),
  new Tune('abrEwmaDefaultEstimate', TuneType.Number),
  new Tune('abrBandWidthFactor', TuneType.Number),
  new Tune('abrBandWidthUpFactor', TuneType.Number),
  new Tune('abrMaxWithRealBitrate', TuneType.Boolean),
  new Tune('minAutoBitrate', TuneType.Number),
  new Tune('emeEnabled', TuneType.Boolean),
];
// @ts-ignore
export const CHROMIUM = !!window.chrome;
