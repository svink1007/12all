import React, { FC, FormEvent } from "react";
import { IonButton, IonCardContent, IonIcon, IonLabel, IonRow } from "@ionic/react";
import { Camera, CameraDirection, CameraResultType } from '@capacitor/camera';
import cameraIcon from '../../../images/icons/camera.svg';
import fileIcon from '../../../images/icons/file-icon.svg';
import { useTranslation } from "react-i18next";
import { base64FromFile, base64FromPath } from "../../../shared/helpers";
import imageCompression from "browser-image-compression";

type Props = {
	getAvatarList: [] | undefined,
	avatarInputRef: React.RefObject<HTMLInputElement>,
	setAvatar: Function
};

const ImageCaptureUpload: FC<Props> = ({ getAvatarList, avatarInputRef, setAvatar }: Props) => {

	const API_URL = process.env.REACT_APP_API_URL
	const { t } = useTranslation();

	const photoOptions = {
		quality: 100,
		resultType: CameraResultType.Uri,
		direction: CameraDirection.Front
	}

	const compressPhotoOptions = {
		maxSizeMB: 0.5,
		maxWidthOrHeight: 520,
	};

	const capturePhoto = async () => {
		try {
			const photo = await Camera.getPhoto(photoOptions);
			const response = await fetch(photo.webPath!);
			const blob = await response.blob();
			const file = new File([blob], 'photo.png', { type: 'image/png' });
			const compressedPhoto = await imageCompression(file, compressPhotoOptions);
			const base64Image = await base64FromFile(compressedPhoto);
			setAvatar(base64Image)
		} catch (error) {
			console.error('Failed to capture photo:', error);
		}
	}

	const handleAvatarFromList = async (e: FormEvent<HTMLImageElement>) => {

		try {
			const avatarSrc = (e.target as HTMLImageElement).src;
			if (!avatarSrc.includes('.png')) {
				const response = await fetch(avatarSrc);
				const blob = await response.blob();
				const file = new File([blob], 'avatar.png', { type: 'image/png' });
				const compressedFile = await imageCompression(file, { ...compressPhotoOptions, useWebWorker: true });
				const base64Image = await base64FromFile(compressedFile);
				// const base64Image = await base64FromPath(avatarSrc!);
				setAvatar(base64Image)
			} else {
				const base64Image = await base64FromPath(avatarSrc!);
				setAvatar(base64Image)
			}
		} catch (e) {
			console.error('Failed to handle avatar:', e);
		}
	}

	const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
		try {
			// select the file from input element
			const file = event.target.files?.[0]

			if (file) {
				// Create a new Image object and set its source to the selected file
				const image = new Image()
				image.src = URL.createObjectURL(file);
				image.onload = async () => {
					// Create a new canvas element with dimensions matching the image
					const canvas = document.createElement('canvas');
					canvas.width = image.width;
					canvas.height = image.height;

					const ctx = canvas.getContext('2d');
					if (ctx) {
						ctx.drawImage(image, 0, 0);
					}

					// Convert the image on the canvas to a PNG data URL
					const pngDataUrl = canvas.toDataURL('image/png');
					const byteString = atob(pngDataUrl.split(',')[1])
					const mimeString = pngDataUrl.split(',')[0].split(':')[1].split(';')[0];

					// Create a new ArrayBuffer and Uint8Array to store the binary data
					const arrBuff = new ArrayBuffer(byteString.length);
					const unit8Arr = new Uint8Array(arrBuff);
					for (let i = 0; i < byteString.length; i++) {
						unit8Arr[i] = byteString.charCodeAt(i);
					}

					// Create a Blob object from the binary data with the extracted MIME type
					const finalBlob = new Blob([arrBuff], { type: mimeString });
					const finalPngImage = new File([finalBlob], 'converted_photo.png', { type: 'image/png' });
					const compressedPhoto = await imageCompression(finalPngImage, compressPhotoOptions);
					const base64Image = await base64FromFile(compressedPhoto);
					setAvatar(base64Image)
				}
			}
		} catch (error) {
			console.error('Failed to capture photo:', error);
		}
	};

	return (
		<IonCardContent className="image-capture-upload-container">
			<IonRow className="capture-photo-row">
				<IonButton className="capture-button" onClick={capturePhoto}>
					<div className="button-content-div">
						<IonLabel>{t('myProfile.imageCapture.cameraButton')}</IonLabel>
						<IonIcon className="camera-icon" name="camera" src={cameraIcon}></IonIcon>
					</div>
				</IonButton>
			</IonRow>

			<IonRow className="choose-file-row">
				<input
					ref={avatarInputRef}
					hidden
					type="file"
					accept="image/*"
					onChange={onSelectFile}
				/>
				<IonButton
					className="upload-button"
					onClick={() => {
						avatarInputRef?.current?.click();
					}}
				>
					<div className="button-content-div">
						<IonLabel>{t('myProfile.imageCapture.chooseFile')}</IonLabel>
						<IonIcon className="file-icon" name="camera" src={fileIcon}></IonIcon>
					</div>
				</IonButton>
			</IonRow>

			<IonRow className="container-text">
				<IonLabel>
					{t('myProfile.imageCapture.avatarText')}
				</IonLabel>
			</IonRow>

			<IonRow className="avatar-container">
				<div className="avatar-list">
					{getAvatarList && getAvatarList?.map((item: any, index: number) => {
						return (
							<div key={index} className="avatar">
								<img src={`${API_URL + item.avatar_image.url}`} alt={item.avatar_name} onClick={handleAvatarFromList} />
							</div>
						)
					})}
				</div>
			</IonRow>
		</IonCardContent>
	)
}

export default ImageCaptureUpload