import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useHistory } from "react-router-dom";
import { URLOpenListenerEvent } from "@capacitor/app/dist/esm/definitions";
import { Routes } from "../shared/routes";
import { checkIfLoggedIn } from "../utils/authUtils";

const AppUrlListener = () => {
  const history = useHistory();

  useEffect(() => {
    App.addListener("appUrlOpen", ({ url }: URLOpenListenerEvent) => {
      try {
        const toURL = new URL(url);
        console.log(toURL);

        const [, wpId] = toURL.pathname.split("/watch-party/");
        if (wpId) {
          history.push(`${Routes.ProtectedWatchPartyJoin}/${wpId}`);
          return;
        }

        const [, stream] = toURL.pathname.split("/stream/");
        if (stream) {
          console.log("APPUrlListener");
          const [streamId, roomId] = stream.split("/");
          let path = `${Routes.ProtectedStream}/${streamId}`;
          if (roomId) {
            path = `${path}/${roomId}`;
          }
          history.push(path);
          return;
        }

        const [, vodId] = toURL.pathname.split("/vod-channel/vod/");
        if (vodId) {
          console.log("APPUrlListener - VOD");
          history.push(`/vod-channel/vod/${vodId}`);
          return;
        }
      } catch (e) {
        console.error(`AppUrlListener error: ${JSON.stringify(e)}`);
      }
    });

    // App.addListener("backButton", async (e) => {
    //   const isLoggedIn = await checkIfLoggedIn();
    //   console.log("history", history);
    //   console.log("pathname", history.location.pathname);
    //   if (isLoggedIn) {
    //     const path = history.location.pathname;
    //     console.log("path", path);
    //     if (path === "/login" || path === "/broadcasts") {
    //       // window.location.href = "/broadcasts";
    //       history.push("/broadcasts");
    //     }
    //   }
    // });

    return () => {
      App.removeAllListeners().then();
    };
  }, [history]);

  return null;
};

export default AppUrlListener;
