import { Vlr as VlrType } from "../../../shared/types";
import { FC, useEffect, useRef, useState } from "react";
import Vlr from "./Vlr";
import VlrStream from "./VlrStream";
import { useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/types";
import { StreamSnapshotService } from "../../../services";
import ControlChannel from "./ControlChannel";

type Props = {
  vlrs: VlrType[];
};

const Vlrs: FC<Props> = ({ vlrs }: Props) => {
  const [mappedVlrs, setMappedVlrs] = useState<VlrType[]>([]);
  const [snapshots, setSnapshots] = useState<{
    [id: number]: string | undefined;
  }>({});
  const [selectedModalVlr, setSelectedModalVlr] = useState<any>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onCollapseClick = (key: VlrType, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedModalVlr(key);
    setIsOpen(true);
  };

  const onModalClose = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  const { updateStreamSnapshotsInterval } = useSelector(
    ({ appConfig }: ReduxSelectors) => appConfig
  );
  const snapshotsRef = useRef<{ [id: number]: string }>({});
  const requestSnapshotsInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestSnapshotsInterval.current = setInterval(() => {
      StreamSnapshotService.getSnapshots(
        vlrs.map((vlr) => {
          return vlr.channel.stream_id as number;
        })
      ).then(({ data }) => {
        data.forEach(
          ({ id, snapshot }) => (snapshotsRef.current[id] = snapshot)
        );
        setSnapshots({ ...snapshotsRef.current });
      });
    }, updateStreamSnapshotsInterval * 100000); // 1min = 60000ms
    return () => {
      requestSnapshotsInterval.current &&
        clearInterval(requestSnapshotsInterval.current);
    };
  }, [updateStreamSnapshotsInterval]);

  useEffect(() => {
    const mappedChannels = vlrs.map((vlr) => {
      vlr.channel.https_preview_high =
        vlr.channel.https_preview_high &&
        !vlr.channel.https_preview_high.split("?").slice(-1)[0].includes("hash")
          ? `${vlr.channel.https_preview_high}?hash=${Date.now()}`
          : vlr.channel.https_preview_high;
      return vlr;
    });

    setMappedVlrs(mappedChannels);
  }, [vlrs]);

  return (
    <>
      {isOpen && (
        <ControlChannel
          vlr={selectedModalVlr}
          onModalClose={onModalClose}
          snapshots={snapshots}
        />
      )}
      {mappedVlrs.map((vlr: VlrType, index) =>
        vlr.channel.is_vlr ? (
          <Vlr
            vlr={vlr}
            key={vlr.id + "vlr" + index}
            snapShots={snapshots}
            onCollapseClick={onCollapseClick}
          />
        ) : (
          <VlrStream
            vlr={vlr}
            key={vlr.id + "vlrStream" + index}
            snapShots={snapshots}
            onCollapseClick={onCollapseClick}
          />
        )
      )}
    </>
  );
};

export default Vlrs;
