import { FC, useEffect, useState } from "react";
import "./styles.scss";
import { IonImg, IonItem, IonText } from "@ionic/react";
import { Routes } from "../../../../shared/routes";
import { SharedSiteResponse } from "../../../../shared/types";
import { SharedSitesService } from "../../../../services";
import { useDispatch } from "react-redux";
import setSharedSiteData from "../../../../redux/actions/sharedSiteActions";
import { useHistory } from "react-router-dom";
import { API_URL } from "../../../../shared/constants";

const SharedSites: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [sites, setSites] = useState<SharedSiteResponse[]>([]);

  useEffect(() => {
    SharedSitesService.getSharedSites().then(({ data }) => setSites(data));
  }, []);

  const manageSiteSelection = (url: string) => {
    dispatch(setSharedSiteData({ url }));
    history.push(Routes.ProtectedSharedSites);
  };

  return (
    <div className="shared-sites-component">
      {sites.map(({ id, url, name, logo, logo_image }: SharedSiteResponse) => (
        <IonItem
          button
          lines="none"
          detail={false}
          onClick={() => manageSiteSelection(url)}
          key={id}
        >
          <IonImg src={logo_image ? `${API_URL}${logo_image.url}` : logo} />
          <IonText>{name}</IonText>
        </IonItem>
      ))}
    </div>
  );
};

export default SharedSites;
