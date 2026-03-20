import { FC, useCallback, useEffect, useRef, useState } from "react";
import "./styles.scss";
import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import { useDispatch, useSelector } from "react-redux";
import { ReduxSelectors } from "../../../redux/types";
import Vlrs from "./Vlrs";
import SharedSites from "./SharedSites";
import SharedStreams from "./SharedStreams";
import VODs from "./VODs";
import {
  addStreams,
  updateFavorites,
  updateStreams,
  updateVlrs,
  setSharedVodData,
} from "../../../redux/actions/broadcastActions";
import {
  StreamService,
  UserManagementService,
  VlrService,
  SharedVodService,
} from "../../../services";
import { BROADCASTS_PER_SCROLL } from "../../../shared/constants";
import useRoomsSocket from "../../../hooks/useRoomsSocket";
import useStreamsSocket from "../../../hooks/useStreamsSocket";
import { useTranslation } from "react-i18next";
import BaseService from "../../../services/BaseService";
import { RouteComponentProps } from "react-router";

interface Props extends RouteComponentProps {
  genres: string[];
  owners: { id?: number; name: string }[];
  languages: string[];
  countries: string[];
  channelType: string;
}

const BroadcastData: FC<Props> = ({
  genres,
  owners,
  languages,
  countries,
  channelType,
}: Props) => {
  const [loadMedia, setLoadMedia] = useState(false);

  const dispatch = useDispatch();
  const { selectedOption, vlrs, streams, favoriteStreams, sharedVod } =
    useSelector(({ broadcast }: ReduxSelectors) => broadcast);
  const { jwtToken } = useSelector(({ profile }: ReduxSelectors) => profile);

  const { searchText } = useSelector(
    ({ channelsSearch }: ReduxSelectors) => channelsSearch
  );
  const { t } = useTranslation();

  const viewEntered = useRef<boolean>(false);
  const channelsScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);
  const loadedBroadcastsVlrs = useRef<number>(BROADCASTS_PER_SCROLL);
  const loadedBroadcastsStreams = useRef<number>(BROADCASTS_PER_SCROLL);
  const loadedBroadcastsFavorites = useRef<number>(BROADCASTS_PER_SCROLL);
  const urlFilterParams = useRef<string>("");

  useRoomsSocket();
  useStreamsSocket();

  const setSelectedTabData = useCallback(
    (props?: { addToExisting?: boolean; loadAll?: boolean }) => {
      const filterParams = `${
        urlFilterParams.current ? `&${urlFilterParams.current}` : ""
      }`;

      VlrService.getLiveAndUpcoming(
        `limit=${loadedBroadcastsVlrs.current}&start=0${filterParams}`
      ).then(({ data: { live } }) => dispatch(updateVlrs(live)));

      let streamParams = `limit=${BROADCASTS_PER_SCROLL}&start=${
        loadedBroadcastsStreams.current - BROADCASTS_PER_SCROLL
      }${filterParams}&load_snapshots=0`;
      if (props?.loadAll) {
        streamParams = `limit=${loadedBroadcastsStreams.current}&start=0${filterParams}&load_snapshots=0`;
      }
      StreamService.getStreams(streamParams)
        .then(({ data: { data } }) => {
          if (props?.addToExisting) {
            dispatch(addStreams(data));
          } else {
            dispatch(updateStreams(data));
          }
        })
        .finally(() => channelsScrollRef.current?.complete());

      if (!BaseService.isExpired(jwtToken)) {
        UserManagementService.getFavorites(
          `limit=${loadedBroadcastsFavorites.current}&start=0${filterParams}&load_snapshots=0`
        ).then(({ data }) => dispatch(updateFavorites(data)));

        // Fetch shared VOD data for authenticated users
        SharedVodService.getSharedVod("all")
          .then(({ data }: { data: any }) => {
            if (data && Array.isArray(data)) {
              // Transform shared VOD data to match SharedStreams format
              const transformedData = data.map((vod: any) => ({
                id: vod.id,
                name: vod.title,
                description: vod.description,
                logo: vod.logo,
                genre: vod.genre,
                country: vod.country,
                language: vod.language,
                is_approved: vod.is_approved,
                owner: vod.owner_id,
                last_active: vod.last_active,
                is_adult_content: vod.is_adult_content,
                show_till_android_version: vod.show_till_android_version,
                played_successfully: true,
                stream_alive: true,
                last_check_date: null,
                epg_channel: null,
                source: null,
                duration: vod.duration,
                starsAmount: vod.starsAmount.toString(),
                published_at: vod.created_at,
                created_by: vod.created_by,
                updated_by: vod.updated_by,
                created_at: vod.created_at,
                updated_at: vod.updated_at,
                restrictions: vod.restrictions,
                isPrivate: vod.isPrivate,
                logo_image: undefined,
                is_owner: false,
                vlr: [],
                url: vod.url || "",
                premium_status: false,
                httpsPreviewHigh: vod.logo || null,
              }));
              dispatch(setSharedVodData(transformedData));
            }
          })
          .catch((error: any) => {
            console.error("Error fetching shared VOD data:", error);
          });
      }
    },
    [dispatch, selectedOption, jwtToken]
  );

  useIonViewWillEnter(() => {
    viewEntered.current = true;
    setSelectedTabData({ loadAll: true });
  }, [setSelectedTabData]);

  useIonViewWillLeave(() => {
    viewEntered.current = false;
  }, []);

  useEffect(() => {
    viewEntered.current = true;
  }, []);

  useEffect(() => {
    if (viewEntered.current) {
      loadedBroadcastsVlrs.current = BROADCASTS_PER_SCROLL;
      loadedBroadcastsStreams.current = BROADCASTS_PER_SCROLL;
      loadedBroadcastsFavorites.current = BROADCASTS_PER_SCROLL;
      const params: string[] = [];
      languages.length > 0 && params.push(`language=${languages.join(",")}`);
      genres.length > 0 && params.push(`genre=${genres.join(",")}`);
      owners.length > 0 && params.push(`owner=${owners.map(o => o.id).join(",")}`);
      countries.length > 0 &&
        params.push(`country_of_origin=${countries.join(",")}`);
      searchText && params.push(`search_query=${searchText}`);
      urlFilterParams.current = params.join("&");
      console.log('urlFilterParams.current:', urlFilterParams.current);
      setSelectedTabData();
    }
  }, [setSelectedTabData, languages, genres, countries, owners, searchText]);

  const loadMoreChannels = () => {
    if (loadedBroadcastsFavorites.current === favoriteStreams.length) {
      loadedBroadcastsFavorites.current += BROADCASTS_PER_SCROLL;
      setSelectedTabData({ loadAll: false, addToExisting: true });
      console.log("Favorites Called:");
    } else {
      if (loadedBroadcastsVlrs.current === vlrs.length) {
        loadedBroadcastsVlrs.current += BROADCASTS_PER_SCROLL;
        setSelectedTabData({ loadAll: false, addToExisting: true });
        console.log("VLRS Called:");
      } else {
        if (loadedBroadcastsStreams.current === streams.length) {
          loadedBroadcastsStreams.current += BROADCASTS_PER_SCROLL;
          setSelectedTabData({ loadAll: false, addToExisting: true });
          console.log("Streams Called:");
        } else {
          setLoadMedia(true);
          channelsScrollRef.current?.complete();
        }
      }
    }
  };

  const filteredFavoriteStreams = favoriteStreams.filter(stream => {
    return owners.length === 0 || owners.some(owner => owner.id === stream.owner);
  });
 
  return (
    <IonInfiniteScroll
      ref={channelsScrollRef}
      className="channel-list"
      onIonInfinite={loadMoreChannels}
    >
      <IonInfiniteScrollContent className="channel-list-content">
        <div className="tab-screen">
          <SharedStreams streams={filteredFavoriteStreams} didPresent={true} />
          {(!channelType ||
            (channelType &&
              channelType === t("selectFilter.rooms") &&
              vlrs.length > 0)) && <Vlrs vlrs={vlrs} />}
          {(!channelType ||
            (channelType && channelType === t("selectFilter.channels"))) && (
            <SharedStreams streams={streams} didPresent={true} />
          )}
          {(!channelType ||
            (channelType && channelType === t("selectFilter.otherMedia"))) &&
            loadMedia && <SharedSites />}
          {/* Display shared VOD for authenticated users */}
          {jwtToken &&
            !BaseService.isExpired(jwtToken) &&
            sharedVod.length > 0 &&
            (!channelType || (channelType && channelType === "Shared VOD")) && (
              <VODs vods={sharedVod} />
            )}
        </div>
      </IonInfiniteScrollContent>
    </IonInfiniteScroll>
  );
};

export default BroadcastData;
