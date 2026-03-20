import { FC, FormEvent, useEffect, useRef, useState } from "react";
import "./styles.scss";
import { RouteComponentProps } from "react-router";
import {
  IonAvatar,
  IonButton,
  IonCheckbox,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTextarea,
  useIonViewWillEnter,
} from "@ionic/react";
import { Browser } from "@capacitor/browser";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import imageCompression from "browser-image-compression";

import defaultAvatar from "../../images/default-avatar.png";
import Close from "../../images/create-room/close.svg";
import { Routes } from "../../shared/routes";
import { resetProfile, setProfile } from "../../redux/actions/profileActions";
import { Profile, ReduxSelectors } from "../../redux/types";
import appStorage, { StorageKey } from "../../shared/appStorage";
import { setErrorToast } from "../../redux/actions/toastActions";
import { UserManagementService } from "../../services";
import CropImage from "../../components/CropImage";
import { Gender } from "../../shared/enums";
import GenreService from "../../services/GenreService";
import SelectCountry from "../../components/SelectCountry";
import SelectLanguage from "../../components/SelectLanguage";
import { setSidebarClose } from "../../redux/actions/sidebarActions";
import { base64FromFile } from "../../utils/imageUploadUtils";
import SafeAreaView from "../../components/SafeAreaView";
import { clearSkipLoginData } from "../../utils/skipLoginUtils";

class Genre {
  name: string;
  isChecked: boolean;

  constructor(name: string, isChecked: boolean = false) {
    this.name = name;
    this.isChecked = isChecked;
  }
}

type FormDataType = {
  firstName: string | null;
  lastName: string | null;
  nickName: string | null;
  email: string | null;
  phoneNumber: string | null;
  gender: Gender;
  nationality: string | null;
  location: string | null;
  preferredLanguage: string | null;
  preferredGenre: Genre[];
  birthday: string | null;
  about_me: string | null;
  country: string | null;
  isOverEighteen: boolean;
  isCondition: boolean;
  social_media_profiles: string | null;
  deleteMyData?: string | null;
  is_private: boolean;
};

type UpdateProfile = {
  nickname: string;
  countryOfResidence: string | null;
  preferredLanguage: string | null;
  gender: Gender;
  preferredGenre: string;
  phoneNumber: string;
  token: string;
  isOverEighteen: boolean;
  avatar_image?: File | null;
  firstName: string | null;
  lastName: string | null;
  about_me: string | null;
  birthday: string | null;
  email: string | null;
  location: string | null;
  is_private: boolean;
};

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
        // try {
        //   // select the file from input element
        //   const file = target.files?.[0];

        //   if (file) {
        //     // Create a new Image object and set its source to the selected file
        //     const image = new Image();
        //     image.src = URL.createObjectURL(file);
        //     image.onload = async () => {
        //       // Create a new canvas element with dimensions matching the image
        //       const canvas = document.createElement("canvas");
        //       canvas.width = image.width;
        //       canvas.height = image.height;

        //       const ctx = canvas.getContext("2d");
        //       if (ctx) {
        //         ctx.drawImage(image, 0, 0);
        //       }

        //       // Convert the image on the canvas to a PNG data URL
        //       const pngDataUrl = canvas.toDataURL("image/png");
        //       const byteString = atob(pngDataUrl.split(",")[1]);
        //       const mimeString = pngDataUrl
        //         .split(",")[0]
        //         .split(":")[1]
        //         .split(";")[0];

        //       // Create a new ArrayBuffer and Uint8Array to store the binary data
        //       const arrBuff = new ArrayBuffer(byteString.length);
        //       const unit8Arr = new Uint8Array(arrBuff);
        //       for (let i = 0; i < byteString.length; i++) {
        //         unit8Arr[i] = byteString.charCodeAt(i);
        //       }

        //       // Create a Blob object from the binary data with the extracted MIME type
        //       const finalBlob = new Blob([arrBuff], { type: mimeString });
        //       const finalPngImage = new File(
        //         [finalBlob],
        //         "converted_photo.png",
        //         { type: "image/png" }
        //       );
        //       const compressedPhoto = await imageCompression(
        //         finalPngImage,
        //         compressPhotoOptions
        //       );
        //       const base64Image = await base64FromFile(compressedPhoto);
        //       setAvatar(base64Image);
        //     };
        //   }
        // } catch (error) {
        //   console.error("Failed to capture photo:", error);
        // }
      }}
    />
  );
};

const ProfilePage: FC<RouteComponentProps> = ({
  history,
}: RouteComponentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const profile = useSelector(({ profile }: ReduxSelectors) => profile);

  const loading = useRef<boolean>(false);
  const init = useRef<boolean>(false);

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(profile.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>();

  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    profile.countryOfResidence
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    profile.preferredLanguage
  );
  const isCondition = localStorage.getItem("isCondition");
  const [formInputValues, setFormInputValues] = useState<FormDataType>({
    firstName: null,
    lastName: null,
    nickName: null,
    email: null,
    phoneNumber: null,
    gender: Gender.Man,
    nationality: null,
    location: null,
    preferredLanguage: null,
    preferredGenre: [],
    birthday: null,
    about_me: null,
    country: null,
    isOverEighteen: false,
    isCondition: false,
    social_media_profiles: null,
    deleteMyData: null,
    is_private: false,
  });

  useEffect(() => {
    GenreService.getGenres().then(({ data }) => {
      const initGenres: Genre[] = [];
      data.forEach((genre) => initGenres.push(new Genre(genre.name)));
      setFormInputValues({ ...formInputValues, preferredGenre: initGenres });
    });
  }, []);

  useEffect(() => {
    if (init.current) {
      return;
    }

    init.current = true;

    if (profile.preferredGenre) {
      const prevGenre = [...formInputValues.preferredGenre];

      prevGenre.forEach((g) => {
        const reg = new RegExp(g.name);
        g.isChecked = reg.test(profile.preferredGenre);
      });

      setFormInputValues({
        ...formInputValues,
        preferredGenre: prevGenre.map((g) => ({ ...g })),
      });
    }

    setFormInputValues({
      ...formInputValues,
      firstName: profile.firstName,
      lastName: profile.lastName,
      nickName: profile.nickname,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      gender: profile.gender,
      country: profile.countryOfResidence,
      preferredLanguage: profile.preferredLanguage,
      birthday: profile.birthday,
      about_me: profile.about_me,
      isOverEighteen: profile.isOverEighteen,
      location: profile.location,
      is_private: profile.is_private,
    });
  }, [profile]);

  useIonViewWillEnter(() => {
    UserManagementService.getUserData()
      .then(({ data }) => {
        if (data.status === "ok") {
          const {
            result: {
              avatar,
              nickname,
              country_of_residence,
              preferred_language,
              gender,
              preferred_genre,
              premium_status,
              has_confirmed_is_over_eighteen,
              show_debug_info,
              first_name,
              last_name,
              email,
              phone_number,
              birthday,
              about_me,
              location,
              is_private,
              id,
              username,
            },
          } = data;

          // const profileAvatar = avatar_image
          //   ? `${API_URL}${avatar_image.url}`
          //   : avatar;
          const profileAvatar = avatar;
          // setAvatarImage(profileAvatar);
          setAvatarBase64(profileAvatar);
          const prevFormValue = { ...formInputValues };
          prevFormValue.preferredGenre.forEach((g) => {
            const reg = new RegExp(g.name);
            g.isChecked = reg.test(preferred_genre as string);
          });

          setFormInputValues({
            ...formInputValues,
            nickName: nickname || username,
            country: country_of_residence || null,
            preferredLanguage: preferred_language || null,
            gender: gender || Gender.Man,
            isOverEighteen: has_confirmed_is_over_eighteen || false,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
            email: email ?? null,
            phoneNumber: phone_number ?? null,
            birthday: birthday ?? null,
            about_me: about_me ?? null,
            location: location ?? null,
            is_private: is_private ?? null,
            preferredGenre: prevFormValue.preferredGenre.map((g) => ({ ...g })),
          });

          dispatch(
            setProfile({
              id,
              avatar: profileAvatar,
              nickname: nickname || username,
              countryOfResidence: country_of_residence,
              preferredLanguage: preferred_language,
              gender,
              preferredGenre: preferred_genre,
              premium: premium_status,
              isOverEighteen: has_confirmed_is_over_eighteen,
              showDebugInfo: show_debug_info || false,
              firstName: first_name,
              lastName: last_name,
              about_me: about_me,
              birthday: birthday,
              location: location,
              is_private: is_private,
              isAnonymous: !email
                ? false
                : email.includes("@skiplogin.com")
                  ? true
                  : false,
            })
          );
        }
      })
      .catch((err) => {
        console.error(JSON.stringify(err));
      });
  }, [dispatch]);

  const handleNavigation = async (url: string) => {
    await Browser.open({ url });
  };

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountry(countryName);
  };

  const handleLogoSelected = async (image: File) => {
    setAvatarFile(image);
    setAvatarImage(URL.createObjectURL(image));
    const compressedPhoto = await imageCompression(image, compressPhotoOptions);
    const base64Image = await base64FromFile(compressedPhoto);
    setAvatarBase64(base64Image);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (loading.current) {
      return;
    }

    if (!formInputValues.nickName) {
      dispatch(setErrorToast("profile.nicknameRequired"));
      return;
    }

    if (!formInputValues.phoneNumber) {
      dispatch(setErrorToast("profile.phoneNumberRequired"));
      return;
    }

    loading.current = true;

    const data: Partial<Profile> = {
      nickname: formInputValues.nickName as string,
      countryOfResidence: selectedCountry as string,
      preferredLanguage: selectedLanguage,
      gender: formInputValues.gender,
      preferredGenre: formInputValues.preferredGenre
        .filter((g) => g.isChecked)
        .map((g) => g.name)
        .join(","),
      phoneNumber: formInputValues.phoneNumber as string,
      token: profile.token,
      isOverEighteen: formInputValues.isOverEighteen,
      firstName: formInputValues.firstName,
      lastName: formInputValues.lastName,
      birthday: formInputValues.birthday,
      about_me: formInputValues.about_me,
      email: formInputValues.email,
      location: formInputValues.location,
      is_private: formInputValues.is_private,
      avatar: avatarBase64,
    };

    if (!avatarImage && !avatarFile && !avatarBase64) {
      // data.avatar_image = null;
      data.avatar = "";
    }

    UserManagementService.updatedUserManagement(data)
      .then(({ data }) => {
        if (data.status === "ok") {
          const {
            result: {
              avatar,
              nickname,
              country_of_residence,
              preferred_language,
              gender,
              preferred_genre,
              premium_status,
              has_confirmed_is_over_eighteen,
              show_debug_info,
              first_name,
              last_name,
              birthday,
              about_me,
              email,
              location,
              is_private,
              id,
              username,
            },
          } = data;

          dispatch(
            setProfile({
              id,
              avatar,
              nickname: nickname || username,
              gender,
              preferredGenre: preferred_genre,
              preferredLanguage: preferred_language,
              countryOfResidence: country_of_residence,
              premium: premium_status,
              isOverEighteen: has_confirmed_is_over_eighteen,
              showDebugInfo: show_debug_info || false,
              firstName: first_name,
              lastName: last_name,
              about_me: about_me,
              email: email,
              birthday: birthday,
              location,
              is_private,
            })
          );

          history.goBack();
        } else if (data.status === "nok_authentication_failed") {
          dispatch(setErrorToast("profile.authFail"));
          appStorage
            .removeItem(StorageKey.Login)
            .then(() => history.push(Routes.Login));
        } else {
          dispatch(setErrorToast("profile.nokSaveProfile"));
        }
      })
      .catch((err) => console.error(JSON.stringify(err)))
      .finally(() => (loading.current = false));
    localStorage.setItem("isCondition", "true");
  };

  const handleRemoveAvatar = () => {
    setAvatarImage(null);
    setAvatarFile(null);
    setAvatarBase64("");
  };

  const onInputChange = (fieldName: string, value: any) => {
    setFormInputValues({ ...formInputValues, [fieldName]: value });
  };

  const redirectToHome = () => {
    history.push(Routes.Broadcasts);
    dispatch(setSidebarClose());
  };

  const onDeleteButtonClick = async () => {
    if (formInputValues.deleteMyData === "DELETEMYDATA") {
      try {
        await UserManagementService.removeProfile();
        await appStorage.removeItem(StorageKey.Login);
        await clearSkipLoginData(); // Explicitly clear skip login data
        dispatch(resetProfile());
        dispatch(setSidebarClose());
        setTimeout(() => history.push("/broadcasts"));
      } catch (error) {
        dispatch(setErrorToast("myProfile.notifications.errorSave"));
      }
    }
  };

  const conditionDisplay = () => {
    return isCondition === null ? (
      <label className="condition">
        {/* <IonCheckbox
          slot="start"
          name="condition"
          checked={formInputValues.isCondition}
          onIonChange={(e) =>
            setFormInputValues({
              ...formInputValues,
              isCondition: e.detail.checked,
            })
          }
          className="condition-checkbox"
        /> */}
        <input
          type="checkbox"
          name="condition"
          checked={formInputValues.isCondition}
          onChange={(e) =>
            setFormInputValues({
              ...formInputValues,
              isCondition: e.target.checked,
            })
          }
          className="condition-checkbox"
        />
        <span className="checkmark">
          {formInputValues.isCondition && (
            <svg viewBox="0 0 24 24" data-part="container">
              <path d="M4,12 9,17 21,6" data-part="mark"></path>
            </svg>
          )}
        </span>
        <IonLabel className="condition-content">
          By checking this box I accept the
          <a
            className="condition-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("https://12all.tv/terms-and-conditions");
            }}
          >
            {t("profile.condition")}
          </a>
        </IonLabel>
      </label>
    ) : (
      ""
    );
  };
  const isSubmitDisabled = () => {
    return !(isCondition !== null
      ? formInputValues.nickName && formInputValues.phoneNumber
      : formInputValues.isCondition &&
        formInputValues.nickName &&
        formInputValues.phoneNumber);
  };

  return (
    <IonPage className="profile-page">
      <IonContent>
        <SafeAreaView>
          <IonImg
            src={Close}
            onClick={redirectToHome}
            className="profile-close-btn"
          />
          {avatarBase64 ? (
            <div className="selected-avatar-wrapper">
              <IonAvatar className="profile-image">
                <img src={avatarBase64} alt="img" />
                <InputImg
                  onSelect={setSelectedAvatar}
                  onTouch={handleRemoveAvatar}
                />
              </IonAvatar>
              <IonButton onClick={handleRemoveAvatar} size="small" fill="clear">
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

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="medium" className="label">
              {`${t("profile.firstname")}`}
            </IonLabel>
            <IonInput
              name="firstName"
              value={formInputValues.firstName}
              onIonChange={(e) => onInputChange("firstName", e.detail.value)}
            />
          </IonItem>

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.lastname")}`}
            </IonLabel>
            <IonInput
              name="lastName"
              value={formInputValues.lastName}
              onIonChange={(e) => onInputChange("lastName", e.detail.value)}
            />
          </IonItem>

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.nickname")} *`}
            </IonLabel>
            <IonInput
              className="nickname-input"
              name="nickName"
              value={formInputValues.nickName}
              onIonChange={(e) => onInputChange("nickName", e.detail.value)}
            />
          </IonItem>

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.email")}`}
            </IonLabel>
            <IonInput
              name="email"
              value={formInputValues.email}
              onIonChange={(e) => onInputChange("email", e.detail.value)}
            />
          </IonItem>

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.phoneNumber")} *`}
            </IonLabel>
            <IonInput
              name="phoneNumber"
              value={formInputValues.phoneNumber}
              onIonChange={(e) => onInputChange("phoneNumber", e.detail.value)}
            />
          </IonItem>

          <IonItem lines="none">
            <IonLabel position="stacked" className="gender-label">
              {t("profile.gender")}
            </IonLabel>
            <IonRadioGroup
              value={formInputValues.gender}
              onIonChange={(e) => onInputChange("gender", e.detail.value)}
              className="radio-group"
            >
              {/* <IonListHeader>
              <IonLabel>{t('profile.gender')}</IonLabel>
            </IonListHeader> */}

              <IonItem lines="none">
                <IonLabel>{t("profile.man")}</IonLabel>
                <IonRadio slot="start" value={Gender.Man} name="gender" />
              </IonItem>

              <IonItem lines="none" className="single">
                <IonLabel>{t("profile.woman")}</IonLabel>
                <IonRadio slot="start" value={Gender.Woman} name="gender" />
              </IonItem>

              <IonItem lines="none">
                <IonLabel>{t("profile.other")}</IonLabel>
                <IonRadio slot="start" value={Gender.Other} name="gender" />
              </IonItem>
            </IonRadioGroup>
          </IonItem>

          <SelectCountry
            country={selectedCountry}
            onSelect={handleCountrySelect}
            hideNone
            showInput
            inputLabel="profile.country"
            inputPlaceholder="profile.selectCountry"
          />

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.location")}`}
            </IonLabel>
            <IonInput
              name="location"
              value={formInputValues.location}
              onIonChange={(e) => onInputChange("location", e.detail.value)}
            />
          </IonItem>

          <SelectLanguage
            language={selectedLanguage}
            onSelect={setSelectedLanguage}
            showInput
            inputLabel="profile.language"
            inputPlaceholder="profile.selectLanguage"
          />

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.birthday")}`}
            </IonLabel>
            <IonInput
              className="nickname-input"
              name="birthday"
              value={formInputValues.birthday}
              onIonChange={(e) => onInputChange("birthday", e.detail.value)}
              type="date"
            />
          </IonItem>

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.social")}`}
            </IonLabel>
            <IonInput
              name="social"
              value={formInputValues.social_media_profiles}
              onIonChange={(e) =>
                onInputChange("social_media_profiles", e.detail.value)
              }
            />
          </IonItem>

          <IonItem className="input-item" lines="none">
            <IonLabel position="stacked" color="dark">
              {`${t("profile.aboutMe")}`}
            </IonLabel>
            <IonTextarea
              name="about_me"
              value={formInputValues.about_me}
              onIonChange={(e) => onInputChange("about_me", e.detail.value)}
            />
          </IonItem>

          <p className="delete-description">{t("profile.deleteDesc")}</p>

          <IonItem className="input-item" lines="none">
            <IonInput
              name="deleteMyData"
              value={formInputValues.deleteMyData}
              onIonChange={(e) => onInputChange("deleteMyData", e.detail.value)}
              placeholder={t("profile.typeDeleteMyData") + ' "DELETEMYDATA"'}
            />
          </IonItem>

          <IonList className="btn-container">
            <IonButton
              className="gradient-btn"
              disabled={
                formInputValues.deleteMyData === t("profile.deleteMyData")
              }
              onClick={onDeleteButtonClick}
            >
              {t("profile.deleteButton")}
            </IonButton>
          </IonList>

          {/* <IonListHeader>
          <IonLabel>{t('profile.genres')}</IonLabel>
        </IonListHeader>

        <div>
          {formInputValues.preferredGenre.map((genre: Genre) => (
            <IonItem key={genre.name} lines="none">
              <IonCheckbox
                slot="start"
                name={genre.name}
                checked={genre.isChecked}
                value={genre.name}
                onIonChange={(e) => genre.isChecked = e.detail.checked}
              />
              <IonLabel>{genre.name}</IonLabel>
            </IonItem>
          ))}

        </div> */}

          <IonItem className="account-container">
            <IonLabel>{t("profile.account")}</IonLabel>
          </IonItem>

          <IonItem>
            <IonRadioGroup
              value={formInputValues.is_private || false}
              onIonChange={(e) => onInputChange("is_private", e.detail.value)}
              className="radio-group-public"
            >
              <IonItem lines="none">
                <IonLabel>{t("profile.public")}</IonLabel>
                <IonRadio slot="start" value={false} name="is_private" />
              </IonItem>

              <IonItem lines="none">
                <IonLabel>{t("profile.private")}</IonLabel>
                <IonRadio slot="start" value={true} name="is_private" />
              </IonItem>
            </IonRadioGroup>
          </IonItem>

          <IonItem lines="none" className="over18">
            <IonCheckbox
              slot="start"
              name="over18"
              checked={formInputValues.isOverEighteen}
              onIonChange={(e) =>
                setFormInputValues({
                  ...formInputValues,
                  isOverEighteen: e.detail.checked,
                })
              }
            />
            <IonLabel>{t("profile.over18")}</IonLabel>
          </IonItem>

          {conditionDisplay()}

          <IonList className="save-btn-container">
            <IonButton
              className="gradient-btn"
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
            >
              {t("profile.save")}
            </IonButton>
          </IonList>
        </SafeAreaView>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
