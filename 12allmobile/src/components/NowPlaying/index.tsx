import React, { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonText } from "@ionic/react";
import { EpgEntry } from "../../shared/types";
import { useTranslation } from "react-i18next";
import StreamSchedule from "../StreamSchedule";

type Props = {
  inPipMode: boolean;
  epgEntries: EpgEntry[];
  streamName?: string | null;
};

const NowPlaying: FC<Props> = ({
  inPipMode,
  epgEntries,
  streamName,
}: Props) => {
  const { t } = useTranslation();
  const [nowPlaying, setNowPlaying] = useState<string>("");
  const [openSchedule, setOpenSchedule] = useState<boolean>(false);

  useEffect(() => {
    let nextPlayTimeout: NodeJS.Timeout;

    const findNowPlaying = () => {
      const now = new Date();
      const nowPlaying = epgEntries.find((epg) => {
        const start = new Date(epg.start_date);
        const end = new Date(epg.stop_date);
        return now >= start && now <= end;
      });
      if (nowPlaying) {
        const padWithZero = (value: number) =>
          value.toString().padStart(2, "0");
        const parseDate = (date: Date) =>
          `${padWithZero(date.getHours())}:${padWithZero(date.getMinutes())}`;
        const start = new Date(nowPlaying.start_date);
        const end = new Date(nowPlaying.stop_date);
        setNowPlaying(
          `${parseDate(start)} - ${parseDate(end)} - ${nowPlaying.title}`
        );
        nextPlayTimeout = setTimeout(
          () => findNowPlaying(),
          end.getTime() - Date.now()
        );
      }
    };

    findNowPlaying();

    return () => {
      nextPlayTimeout && clearTimeout(nextPlayTimeout);
    };
  }, [epgEntries]);

  return (
    <>
      {nowPlaying ? (
        <IonText
          className="now-playing-schedule"
          onClick={() => setOpenSchedule(true)}
        >
          {nowPlaying}
        </IonText>
      ) : null}

      <StreamSchedule
        show={openSchedule && !inPipMode}
        onClose={() => setOpenSchedule(false)}
        streamName={streamName || t("nowPLaying.schedule")}
        epgEntries={epgEntries}
        loading={false}
      />
    </>
  );
};

export default NowPlaying;
