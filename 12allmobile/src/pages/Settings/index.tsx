import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import imageCompression from "browser-image-compression";
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonImg,
  IonItemDivider,
  IonPage,
  IonToggle,
} from "@ionic/react";

import "./styles.scss";

import CropImage from "../../components/CropImage";
import { Routes } from "../../shared/routes";
import { base64FromFile } from "../../utils/imageUploadUtils";
import { ReduxSelectors } from "../../redux/types";

import Close from "../../images/settings/close.svg";
import defaultAvatar from "../../images/default-avatar.png";
import GoldLeague from "../../images/profile-settings/gold.svg";
import Star from "../../images/profile-settings/star.svg";
import SelectLanguage from "../../components/SelectLanguage";
import SafeAreaView from "../../components/SafeAreaView";
import { BillingServices } from "../../services/BillingServices";
import { setErrorToast } from "../../redux/actions/toastActions";
import { useDispatch } from "react-redux";

const compressPhotoOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 520,
};

const InputImg = ({
  onSelect,
  onTouch,
}: {
  onSelect: (img: string) => void;
  onTouch?: () => void;
}) => {
  let timeout: NodeJS.Timeout;

  return (
    <input
      type="file"
      accept="image/*"
      className="img-input"
      onTouchStart={() =>
        onTouch && (timeout = setTimeout(() => onTouch(), 1000))
      }
      onTouchEnd={() => timeout && clearTimeout(timeout)}
      onChange={({ target }) => {
        if (target.files?.length) {
          onSelect(URL.createObjectURL(target.files[0]));
          target.value = "";
        }
      }}
    />
  );
};

const Settings = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(profile.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(
    profile.avatar
  );
  const [balance, setBalance] = useState(0);
  const [language, setLanguage] = useState<string>("");
  const [isLanguageModalOpen, setIsLanguageModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    (async function () {
      const data = await BillingServices.billingStarBalance(profile.id);

      if (data.data.status === "ok" && data.data.starsBalance > 0) {
        setBalance(data.data.starsBalance);
      } else if (data.data.status === "nok") {
        dispatch(
          setErrorToast(
            "Billing Server is unavailable. Please try again later."
          )
        );
      }
    })();
  }, []);

  const onCloseClick = () => {
    history.push(Routes.Broadcasts);
  };

  const handleLogoSelected = async (image: File) => {
    setAvatarFile(image);
    setAvatarImage(URL.createObjectURL(image));
    const compressedPhoto = await imageCompression(image, compressPhotoOptions);
    const base64Image = await base64FromFile(compressedPhoto);
    setAvatarBase64(base64Image);
  };

  const handleRemoveAvatar = () => {
    setAvatarImage(null);
    setAvatarFile(null);
    setAvatarBase64("");
  };

  const onLanguageClick = () => {
    setIsLanguageModalOpen(true);
  };

  const onLanguageModalClose = () => {
    setIsLanguageModalOpen(false);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setIsLanguageModalOpen(false);
  };

  const onStarsTransactionsClick = () => {
    history.push(Routes.ProtectedStarsTransactions);
  };

  const onAccountBalanceClick = () => {
    history.push(Routes.ProtectedAccountBalance);
  };

  const onBillingHistoryClick = () => {
    history.push(Routes.ProtectedBillingHistory);
  };

  const onDeleteAccountClick = () => {
    history.push(Routes.ProtectedDeleteProfile);
  };

  const onBillingInfoClick = () => {
    history.push(Routes.ProtectedBillingInfo);
  };

  return (
    <IonPage>
      <IonContent>
        <SafeAreaView>
          <div className="setting-container">
            <div className="setting-header">
              <IonImg
                src={Close}
                className="setting-close"
                onClick={onCloseClick}
              />
              <div className="setting-header-title">
                <p>{t("settings.settings")}</p>
                <p className="setting-header-meeting-link"></p>
              </div>
            </div>
            <div className="setting-body">
              <div className="setting-basic-profile">
                {avatarBase64 ? (
                  <div className="selected-avatar-wrapper">
                    <IonAvatar className="profile-image">
                      <img src={avatarBase64} alt="img" />
                      <InputImg
                        onSelect={setSelectedAvatar}
                        onTouch={handleRemoveAvatar}
                      />
                    </IonAvatar>
                    <IonButton
                      onClick={handleRemoveAvatar}
                      size="small"
                      fill="clear"
                    >
                      Remove
                    </IonButton>
                  </div>
                ) : (
                  <IonAvatar className="profile-image">
                    <img src={defaultAvatar} alt="img" />
                    <InputImg onSelect={setSelectedAvatar} />
                  </IonAvatar>
                )}

                {selectedAvatar && (
                  <CropImage
                    image={selectedAvatar}
                    onSelect={handleLogoSelected}
                    onDismiss={() => setSelectedAvatar(null)}
                  />
                )}

                <div className="setting-basic-profile-full-name">
                  {profile.firstName ?? "" + profile.lastName ?? ""}
                </div>
                <div className="setting-basic-profile-nickname">
                  @ {profile.nickname}
                </div>
                <div className="account-info-container">
                  <div className="account-balance">
                    <p className="account-balance-title">My account</p>
                    <div className="account-balance-info">
                      <div className="account-league">
                        <img src={GoldLeague} alt="goldLeague" />
                        <p className="gold-league-text">Gold League</p>
                      </div>
                      <div className="account-star-balance">
                        <img src={Star} alt="accountStarBalance" />
                        <p className="star-balance-text">{balance}</p>
                      </div>
                    </div>
                  </div>

                  <div className="account-restrict-invitation">
                    <div className="account-restrict-text">
                      <div className="account-restrict-text-header">
                        Restrict Invitations
                      </div>
                      <div className="account-restrict-text-subscription">
                        Only allow invitations from friends
                      </div>
                    </div>
                    <IonToggle />
                  </div>
                  <div className="account-hide-location">
                    <div className="account-hide-text">
                      <div className="account-hide-text-header">
                        Hide Location
                      </div>
                      <div className="account-hide-text-subscription">
                        You will not appear on the map
                      </div>
                    </div>
                    <IonToggle />
                  </div>
                  <div className="account-language" onClick={onLanguageClick}>
                    <p className="account-language-text">Language</p>
                    <div className="account-language-status">
                      {language === "" ? "English" : language} &gt;
                    </div>
                  </div>
                </div>
                <IonItemDivider />
              </div>
              <div className="account-billing-details">
                <p className="account-billing-title">Account Status</p>
                <div className="account-billing-body">
                  <div
                    className="account-billing-body-item"
                    onClick={onBillingInfoClick}
                  >
                    Billing info / firm details
                  </div>
                  {/* <div className="account-billing-body-item">
                    Payment method
                  </div> */}
                  <div
                    className="account-billing-body-item"
                    onClick={onAccountBalanceClick}
                  >
                    Account balance
                  </div>
                  <div
                    className="account-billing-body-item"
                    onClick={onBillingHistoryClick}
                  >
                    Billing history
                  </div>
                  <div
                    className="account-billing-body-item"
                    onClick={onStarsTransactionsClick}
                  >
                    Stars transactions
                  </div>
                </div>
                <IonItemDivider />
              </div>
              <div className="account-privacy-details">
                <p className="account-privacy-title">Privacy</p>
                <div className="account-privacy-body">
                  <div className="account-privacy-body-item">Help</div>
                  <div className="account-privacy-body-item">
                    Privacy policy
                  </div>
                  <div className="account-privacy-body-item">Terms of use</div>
                  <div className="account-privacy-body-item">About</div>
                </div>
                <IonItemDivider />
              </div>
              <div
                className="delete-account-container"
                onClick={onDeleteAccountClick}
              >
                <p>Delete Account</p>
              </div>
            </div>
          </div>
        </SafeAreaView>

        <SelectLanguage
          language={language}
          onSelect={handleLanguageChange}
          open={isLanguageModalOpen}
          onClose={onLanguageModalClose}
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;
