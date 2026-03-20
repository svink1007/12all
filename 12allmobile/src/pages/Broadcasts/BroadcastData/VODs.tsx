import React, { FC } from "react";
import { SharedStreamVlrs } from "../../../shared/types";
import VOD from "./VOD";

type Props = {
  vods: SharedStreamVlrs[];
  onCollapseClick?: any;
};

const VODs: FC<Props> = ({ vods, onCollapseClick }: Props) => {
  return (
    <>
      {vods.map((vod: SharedStreamVlrs) => (
        <VOD
          key={`vod-id-${vod.id}`}
          vod={vod}
          onCollapseClick={onCollapseClick}
        />
      ))}
    </>
  );
};

export default VODs;
