import { CashOutConfig, Channel, PaymentConfig, SharedStreamVlrs, StreamSnapshot } from './types';
import { API_URL, PAYMENT_BACKEND_URL, PAYMENT_URL } from './constants';
import { Routes } from './routes';
import { AxiosResponse } from 'axios';
import { BillingServices, StreamSnapshotService } from '../services';

export const getChannelUrlSuffix = (channel: Channel) => {
  if (!channel.is_vlr && channel.stream_id) {
    return `${Routes.Stream}/${channel.stream_id}/${channel.channel_deep_link}`;
  }

  return `${Routes.WatchParty}/${channel.channel_deep_link}`;
};

export const getCompleteImageUrl = (partialImageUrl: string) => `${API_URL}${partialImageUrl}`;

export const getArticleUrl = (id: number) => `${Routes.News}/${id}`;

export const getCareerUrl = (id: number) => `career/${id}`;

export const parseArticleDate = (dateUtc: string) => {
  const d = new Date(dateUtc);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const parseStreamSnapshots = (streams: SharedStreamVlrs[]) => (
  streams.map(stream => {
    const vlr = stream.vlr
      ?.filter(v => v.channel?.https_preview_high)
      .slice(0, 20)
      .map((v) => {
        v.channel.https_preview_high = `${v.channel.https_preview_high}?hash=${Date.now()}`;
        return v;
      });
    return { ...stream, vlr };
  })
);

export function splitLabel(text: string) {
  const parts = text.split('-');
  if (parts.length === 1) {
    return { prefix: '', label: text };
  }
  const [prefix, ...rest] = parts;
  return {
    prefix,
    label: rest.join('-'),
  };
}


export const updateSnapshotOnInterval = (updatedSnapshotData: (string | number | StreamSnapshot)[], streams: SharedStreamVlrs[]) => {
  const updatedStreams = streams.map((channel: SharedStreamVlrs) => {
    const matchingSnapshot: any = updatedSnapshotData.find((item: any) => item?.id === channel.id && item?.snapshot !== channel.snapshot);
    if (matchingSnapshot?.snapshot) {
      return { ...channel, snapshot: matchingSnapshot.snapshot };
    }
    return channel;
  });

  if (updatedStreams?.length > 0 && streams?.length === updatedStreams?.length) {
    return updatedStreams
  }
  return streams;
}

export const getSnapshotOnInterval = async (allChannelsIds: number[], streams: SharedStreamVlrs[]) => {
  const response: AxiosResponse<StreamSnapshot[], any> = await StreamSnapshotService.getSnapshots(allChannelsIds)
  const getUpdatedSnapshot: StreamSnapshot[] = response.data
  return updateSnapshotOnInterval(getUpdatedSnapshot, streams)
};

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('method did not return a string');
      }
    };
    reader.readAsDataURL(blob);
  });
}

export const getRecordingId=(vertoEvent: any):{recordingId: string,action:string}|null => {
  try {
    if (!vertoEvent?.params?.eventData?.message) {
      return null
    }
    const { eventData } = vertoEvent.params;
    if (eventData.contentType !== "conference-info") {
      return null
    }

    let parsedMessage = JSON.parse(eventData.message);

    const recording = parsedMessage.recording;
    if (!recording) {
      return null
    }

    return {
      recordingId: recording.recording_id,
      action: recording.Action,
    };

  } catch (error) {
    return null
  }
}

export async function base64FromFile(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

export const callPaymentMethod = (config: PaymentConfig) => {

  const modifyConfig = {
    ...config,
    backendUrl: `${PAYMENT_BACKEND_URL}`,
    // backendUrl: `${PAYMENT_BACKEND_URL}/backend`,
    logoUrl: "https://12all.tv/assets/icon/12all-hub-logo.svg",
    itemImgUrl: "https://12all.tv/assets/icon/stars.png",
    cssUrl: "https://12all.tv/assets/css/styles.css",
  }

  console.log("modifyConfig", modifyConfig)

  const jsonString = JSON.stringify(modifyConfig);
  const encodedData = encodeURIComponent(jsonString);
  const url = `${PAYMENT_URL}/payment?config=${encodedData}`;

  console.log("url", url)

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.click();
}

export const callCashoutMethod = (config: CashOutConfig) => {

  const modifyConfig = {
    ...config,
    backendUrl: `${PAYMENT_BACKEND_URL}`,
    logoUrl: "https://12all.tv/assets/icon/12all-hub-logo.svg",
    itemImgUrl: "https://12all.tv/assets/icon/stars.png",
  }

  console.log("modifyConfig cashout", modifyConfig)

  const jsonString = JSON.stringify(modifyConfig);
  const encodedData = encodeURIComponent(jsonString);
  const url = `${PAYMENT_URL}/cash-out?config=${encodedData}`;

  console.log("url", url)

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.click();
}

export const updateStarsBalance = (userId: number) => {
  const result = BillingServices.billingStarBalance(userId).then(({ data }) => {
    return data;
  })

  return result
}

 export const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
        .map((unit) => String(unit).padStart(2, "0"))
        .join(":");
  };