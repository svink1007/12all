import { IonModal, IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonNote, IonTextarea, IonSelect, IonSelectOption, IonCheckbox, IonButton, IonRadioGroup, IonRadio, IonSpinner, IonAlert } from '@ionic/react'
import { cloudUpload, linkOutline, copy, star } from 'ionicons/icons'
import React, { useRef, useState, useEffect } from 'react'
import {Control, Controller, FieldErrors, UseFormHandleSubmit, UseFormRegister, UseFormReset, UseFormSetValue} from "react-hook-form";
import crossIcon from "../../../images/icons/cross.svg";
import { setErrorToast, setInfoToast, setSuccessToast } from 'src/redux/actions/toastActions';
import {addVod, clearRecordedVodInfo, editVod} from "../../../redux/actions/vodActions";
import { VodService } from 'src/services/VodService';
import {VOD_FILE_HOST} from "../../../shared/constants";
import cameraBtn from './../assets/camra.png'
import { Genre } from 'src/shared/types';
import { Language, languages, } from 'countries-list';
import { FileItem, VideoFormValues } from '..';
import { useDispatch } from 'react-redux';
import './style.scss';
import { formatDuration } from 'src/shared/helpers';
import { GenreService } from 'src/services';
import { useTranslation } from 'react-i18next';
import recordthumbnailPreview from '../../../images/record_placeholder.png';


interface RecordedVideo {
  id: string;
  fileName: string;
  duration: number;
  startDate: string;
}

interface AddVideoModal {
    openModal: boolean;
    initForm: ()=>void;
    duration:number;
    videoLink: string,
    editData?: number | null;
    genre?: string;
    language?: string;
    thumbnailPreview: string | null;
    fileData: FileItem | null;
    setFileData: (fileData: FileItem |null)=>void;
    videoLength:string;
    setVideoLength:(videoLength: string)=>void;
    setThumbnailPreview: (thumbnailPreview: string |null)=>void;
    setEditData?: (isEdit: number |null)=>void;
    setOpenModal: (isOpen: boolean)=>void;
    setDuration:(duration: number)=>void;
    control: Control<VideoFormValues, any, VideoFormValues>;
    register:UseFormRegister<VideoFormValues>;
    setValue:UseFormSetValue<VideoFormValues>;
    errors:FieldErrors<VideoFormValues>;
    reset: UseFormReset<VideoFormValues>;
    handleSubmit:UseFormHandleSubmit<VideoFormValues, VideoFormValues>;
    sharingMode: "public" | "private" | "paid";
    recordedVideoData?: RecordedVideo | null; 
}

const AddVideoModal = ({
    videoLength,
    reset,
    duration,
    setVideoLength,
    fileData,
    setFileData,
    videoLink,
    setDuration,
    thumbnailPreview,
    setThumbnailPreview,
    setValue,
    sharingMode,
    openModal,
    initForm,
    editData,
    setEditData,
    setOpenModal,
    control, 
    register,
    errors,
    handleSubmit,
    genre,
    language,
    recordedVideoData 
}: AddVideoModal) => {
    const dispatch = useDispatch();
    const [pending, setPending] = useState<boolean>(false);
    const [isRecordedVideo, setIsRecordedVideo] = useState<boolean>(false);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
    const thumbnailPreviewRef = useRef<HTMLInputElement | null>(null);
    const allLanguages = useRef<Language[]>([]);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const {t} = useTranslation();
    
    useEffect(() => {
        GenreService.getGenres().then(({data}) => setGenres(data));
        const l = Object.values(languages);
                l.sort((a, b) => a.name.localeCompare(b.name));
                allLanguages.current = l;
                setFilteredLanguages(l);
        GenreService.getGenres().then(({data}) => setGenres(data));
    }, []);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const loadFiles = async () => {
            if (recordedVideoData && openModal) {
                setIsRecordedVideo(true);
                await loadFileFromUrl(videoLink, recordedVideoData.fileName,fileInputRef);
                await loadFileFromUrl(recordthumbnailPreview, 'recorded_video.png',thumbnailPreviewRef);
            } else {
                setIsRecordedVideo(false);
            }
        };
        loadFiles();
    }, [recordedVideoData, openModal]);

    
    const loadFileFromUrl = async (
        url: string, 
        filename: string, 
        inputRef: React.RefObject<HTMLInputElement>,
        onSuccess?: (file: File) => void,
        onError?: (error: Error) => void
    )=> {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: blob.type });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            if (inputRef.current) {
                inputRef.current.files = dataTransfer.files;
                const event = new Event('change', { bubbles: true }) as any;
                //event.target = inputRef.current;
                inputRef.current.dispatchEvent(event);
                onSuccess?.(file);
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('unknown file loading error');
            console.error('Error loading file:', err);
            onError?.(err);
        }
    };

    async function generateFileId(file: File) {
        setPending(true)
        const extension = file.name.split('.').pop()?.toLowerCase();
        try {
            if (isRecordedVideo) {
                setFileData({ thumb: fileData?.thumb, name: videoLink  });
                dispatch(setSuccessToast("File uploaded Successfully"));
                setPending(false)
                return;
            }
            const response = await VodService.getFile();
            if (response.status === 200) {
                const formDataObject = new FormData();
                if (file) {
                    formDataObject.append("file", file);
                }
                const res = await VodService.uploadFile(response.data.name, formDataObject)
                if (res.status === 200 || res.status === 201) {
                    dispatch(setSuccessToast("File uploaded Successfully"))
                    setFileData({ thumb:fileData?.thumb, name: `${VOD_FILE_HOST}/img/uploads/files/${response.data.name}.${extension}` });
                }
            } else {
                setFileData(null);
            }
        } catch (e) {
            dispatch(setErrorToast("File uploaded Failed"))
            setFileData(null);
        }
        setPending(false)
    }
    
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if(isRecordedVideo){
                    setThumbnailPreview(recordthumbnailPreview);
                }else{
                    setThumbnailPreview(e.target?.result as string)
                }
            }
            reader.readAsDataURL(file)
            await generateThumbId(file)
        }
    }
    
    const handleVideoClick = () => {
        if (!isRecordedVideo) {
            fileInputRef.current?.click();
        }
    };
    
   
    async function generateThumbId(file: File) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        setPending(true)
        try {
            const response = await VodService.getFile();
            if (response.status === 200) {
                setFileData({ name:fileData?.name, thumb: `${VOD_FILE_HOST}/img/uploads/files/${response.data.name}.${extension}` });
                const formDataObject = new FormData();
                if (file) {
                    formDataObject.append("file", file);
                }
                const res = await VodService.uploadFile(response.data.name, formDataObject)
                if (res.status === 200 || res.status === 201) {
                    dispatch(setSuccessToast("File uploaded Successfully"))
                }
            } else {
                setFileData(null);
            }
        } catch (e) {
            dispatch(setErrorToast("File uploaded Failed"))
            setFileData(null);
        }
        setPending(false)
    }
    
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const video = document.createElement("video");
            video.preload = "metadata";

            // Convert file to a blob URL
            video.src = URL.createObjectURL(file);

            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src); // Clean up
                const duration = video.duration;
                setDuration(duration)
                const formatted = formatDuration(duration);
                setVideoLength(formatted);
            };
            await generateFileId(file)
        }
    }
    
    const {
        ref: registerRef,
        onChange: registerOnChange,
        ...fileInputProps
    } = register("videoFile");
    
    const onSubmit = async (data: VideoFormValues) => {
        setPending(true)
        const formDataObject = new FormData();
        formDataObject.append("url", fileData?.name || "");
        formDataObject.append("title", data.title);
        formDataObject.append("logo", fileData?.thumb || "");
        formDataObject.append("description", data.description);
        formDataObject.append("genre", data.genre);
        formDataObject.append("language", data.language);
        formDataObject.append("is_adult_content", String(data.ageRestriction)); // convert boolean to string
        formDataObject.append("duration", Number.parseInt(String(duration)).toString());
        formDataObject.append("starsAmount", data.rewardAmount.toString());
        formDataObject.append("isPrivate", data.sharingMode === 'private' ? "true" : "false");
        formDataObject.append("restrictions", data.restriction);
        try {
            const response = editData != null ? await VodService.editVod(formDataObject, editData) : await VodService.saveVod(formDataObject);
            if (response.status === 200 || response.status === 201) {
                dispatch(setSuccessToast("File uploaded Successfully"))
                if(editData !== null){
                    if(response.data.status === "ok"){
                        dispatch(editVod(response.data.updatedVod))
                    }
                    else{
                        dispatch(setErrorToast("Failed to update VOD information"))
                    }
                }
                else{
                    if(response.status === 200 || response.status === 201){
                        try {
                            await VodService.addBillingToChannel(data.sharingMode, data.rewardAmount, response.data.id+'_vod');
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    dispatch(addVod(response.data))
                    
                }
                setOpenModal(false)
            } else {
                dispatch(setErrorToast("Failed to saved VOD"))
            }
        } catch (e) {
            dispatch(setErrorToast("Failed to saved VOD"))
        }
        setPending(false)
    }

    
    const copyLink = () => {
        navigator.clipboard.writeText(videoLink)
        dispatch(setInfoToast("VOD Link Copied"))
    }

    const closeModal = () =>{
        if(!isRecordedVideo){
            reset()
            setEditData?.(null);
            setOpenModal(false)
        }else{
            setShowAlert(true);
        }
    }
    const onClose = ()=>{
        reset();
        setOpenModal(false);
    }

    const resetRecordState = () => {
        if(isRecordedVideo){
            dispatch(clearRecordedVodInfo());
        }
    }
    return (
        <IonModal
            isOpen={openModal}
            onDidDismiss={() => {
                initForm();
                resetRecordState();
            }}
            backdropDismiss={false}
            className={`modal-custom ${openModal ? '!flex' : '!hidden'} !items-center !justify-center`}
        >
            <div
                className=" h-[87vh] w-[90vw] max-w-[1200px] rounded-lg bg-[#662C4B] p-6 text-white overflow-y-auto outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-[#707070]">
                <div className="-mt-1.5 mb-1 text-lg font-medium">
                    <div className={'flex flex-row items-center'}>
                        <div className={'flex-1 flex items-center justify-center'}>
                            {editData !== null ? "EDIT" : "ADD"} VIDEO
                            {isRecordedVideo && <span className="ml-2 text-sm text-pink-600">(Recorded)</span>}
                        </div>
                        <div className={'flex px-2 items-center'}>
                            <IonIcon slot="icon-only" color="white" size={"default"} icon={crossIcon}
                                        className={'cursor-pointer'} onClick={() => {
                                        closeModal()
                            }}/>
                        </div>
                    </div>
                </div>
                <div
                    className="ion-padding !bg-transparent mb-6 text-base text-gray-200 px-4 py-2 !overflow-y-auto !max-h-[1050px] !min-h-[1050px]">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(onSubmit)();
                        }} className={'px-5'}>
                            <IonGrid>
                                <IonRow>
                                    {/* Left Column */}
                                    <IonCol size="12" sizeMd="6">
                                        <div className={'!pe-10'}>
                                            <IonItem lines="none" style={{"--background": "transparent"} as any}>
                                                <IonLabel position="stacked"
                                                            className={'!text-[1.2rem] !mb-3'}>Title</IonLabel>
                                                <Controller
                                                    control={control}
                                                    name="title"
                                                    rules={{required: true}}
                                                    render={({field}) => (
                                                        <IonInput
                                                            value={field.value}
                                                            onIonChange={(e) => field.onChange(e.detail.value)}
                                                            onBlur={field.onBlur}
                                                            placeholder="Video Title"
                                                            style={
                                                                {
                                                                    "--background": "#fff",
                                                                    "--color": "#333",
                                                                    "--padding-start": "10px",
                                                                    "--border-radius": "8px",
                                                                    marginTop: "6px",
                                                                } as any
                                                            }
                                                        />
                                                    )}
                                                />
                                                {errors.title &&
                                                    <IonNote color="danger">Title is required</IonNote>}
                                            </IonItem>

                                            <IonItem lines="none" style={{
                                                "--background": "transparent",
                                                marginTop: "16px"
                                            } as any}>
                                                <IonLabel position="stacked"
                                                            className={'!text-[1.2rem] !mb-3'}>Description</IonLabel>
                                                <Controller
                                                    control={control}
                                                    name="description"
                                                    render={({field}) => (
                                                        <IonTextarea
                                                            value={field.value}
                                                            onIonChange={(e) => field.onChange(e.detail.value)}
                                                            onBlur={field.onBlur}
                                                            placeholder="Video Description"
                                                            rows={4}
                                                            style={
                                                                {
                                                                    "--background": "#fff",
                                                                    "--color": "#333",
                                                                    "--padding-start": "10px",
                                                                    "--border-radius": "8px",
                                                                    marginTop: "6px",
                                                                } as any
                                                            }
                                                        />
                                                    )}
                                                />
                                            </IonItem>

                                            <IonItem lines="none" style={{
                                                "--background": "transparent",
                                                marginTop: "16px"
                                            } as any}>
                                                <IonLabel position="stacked" className={'!text-[1.2rem] !mb-3'}>Thumbnail
                                                    image</IonLabel>
                                                <div
                                                    style={{
                                                        marginTop: "10px",
                                                        position: "relative",
                                                        height: "150px",
                                                        width: "200px",
                                                        backgroundColor: "#FFFFFF33",
                                                        borderRadius: "4px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {thumbnailPreview ? (
                                                        <img
                                                            src={thumbnailPreview || "/placeholder.svg"}
                                                            alt="Thumbnail preview"
                                                            style={{
                                                                height: "100%",
                                                                width: "100%",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                inset: 0,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <img src={cameraBtn} alt={""}/>
                                                        </div>
                                                    )}
                                                    {
                                                        !pending && <input
                                                            type="file"
                                                            id="thumbnail"
                                                            style={{
                                                                position: "absolute",
                                                                inset: 0,
                                                                opacity: 0,
                                                                cursor: "pointer",
                                                            }}
                                                            accept="image/*"
                                                            {...register("thumbnail")}
                                                            ref={thumbnailPreviewRef}

                                                            onChange={handleThumbnailUpload}
                                                        />
                                                    }
                                                </div>
                                                <IonNote style={{marginTop: "6px", display: "block"}}>Upload a file</IonNote>
                                            </IonItem>

                                            <IonItem lines="none"
                                                        style={{marginTop: "16px", "--background": "transparent"}}>
                                                <IonLabel position="stacked" className="!text-[1.2rem] !mb-3">Genre
                                                    (optional)</IonLabel>
                                                <Controller
                                                    control={control}
                                                    name="genre"
                                                    render={({field}) => (
                                                        <IonSelect
                                                            value={genre && genre.length > 0 ? genre : field.value}
                                                            onIonChange={(e) => field.onChange(e.detail.value)}
                                                            onBlur={field.onBlur}
                                                            placeholder="Choice"
                                                            interface="alert"
                                                            style={{
                                                                "--background": "#c9e0f5",
                                                                "--color": "#333",
                                                                "--padding-start": "10px",
                                                                "--border-radius": "4px",
                                                                marginTop: "6px"
                                                            }}
                                                        >
                                                            {
                                                                genres.map(({id, name}) => (
                                                                    <IonSelectOption value={name} key={id} id={`genre-${id}`}>
                                                                        {name}
                                                                    </IonSelectOption>
                                                                ))
                                                            }
                                                        </IonSelect>
                                                    )}
                                                />
                                            </IonItem>

                                            <IonItem lines="none" style={{
                                                "--background": "transparent",
                                                marginTop: "16px"
                                            } as any}>
                                                <IonLabel position="stacked" className={'!text-[1.2rem] !mb-3'}>Language
                                                    (optional)</IonLabel>
                                                <Controller
                                                    control={control}
                                                    name="language"
                                                    render={({field}) => (
                                                        <IonSelect
                                                            value={language && language.length > 0 ? language : field.value}
                                                            onIonChange={(e) => field.onChange(e.detail.value)}
                                                            onBlur={field.onBlur}
                                                            placeholder="Language"
                                                            interface="alert"
                                                            style={{
                                                                "--background": "#c9e0f5", 
                                                                "--color": "#333",
                                                                "--padding-start": "10px",
                                                                "--border-radius": "4px",
                                                                marginTop: "6px"
                                                            }}
                                                        >
                                                            {filteredLanguages.map(({name}) => (
                                                                <IonSelectOption value={name} key={name} id={`language-${name}`}>
                                                                    {name}
                                                                </IonSelectOption>
                                                            ))}
                                                        </IonSelect>
                                                    )}
                                                />
                                            </IonItem>

                                            <IonItem lines="none" style={{
                                                "--background": "transparent",
                                                marginTop: "16px"
                                            } as any}>
                                                <IonLabel position="stacked" className={'!text-[1.2rem] !mb-3'}>Restriction
                                                    (optional)</IonLabel>

                                                <Controller
                                                    control={control}
                                                    name="restriction"
                                                    render={({field}) => (
                                                        <IonTextarea
                                                            value={field.value}
                                                            onIonChange={(e) => field.onChange(e.detail.value)}
                                                            onBlur={field.onBlur}
                                                            rows={2}
                                                            placeholder="Restriction note"
                                                            style={
                                                                {
                                                                    "--background": "#fff",
                                                                    "--color": "#333",
                                                                    "--padding-start": "10px",
                                                                    "--border-radius": "4px",
                                                                    marginTop: "6px",
                                                                } as any
                                                            }
                                                        />
                                                    )}
                                                />
                                            </IonItem>

                                            <IonItem lines="none" style={{
                                                "--background": "transparent",
                                                marginTop: "16px"
                                            } as any}>
                                                <Controller
                                                    control={control}
                                                    name="ageRestriction"
                                                    render={({field: {onChange, value}}) => (
                                                        <IonCheckbox checked={value}
                                                                        onIonChange={(e) => onChange(e.detail.checked)}
                                                                        slot="start"/>
                                                    )}
                                                />
                                                <IonLabel>This content is only for people over 18</IonLabel>
                                            </IonItem>
                                        </div>
                                    </IonCol>

                                    {/* Right Column */}
                                    <IonCol size="12" sizeMd="6">
                                        <div className={'!h-[40px]'}></div>

                                        {
                                            fileData && fileData.name != null && fileData.name != "" ? 
                                            <div className={'!ps-md-10'} style={{ position: "relative" }}>
                                                <video
                                                    src={isRecordedVideo ? videoLink : fileData.name}
                                                    controls={true}
                                                    onClick={handleVideoClick}
                                                    style={{
                                                        width: "100%",
                                                        height: "auto",
                                                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                                                        borderRadius: "4px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        position: "relative",
                                                        cursor: isRecordedVideo ? "default" : "pointer"
                                                    }}
                                                />
                                                
                                                {
                                                    !pending && <input
                                                        type="file"
                                                        accept="video/*"
                                                        style={{ display: "none" }}
                                                        {...fileInputProps}
                                                        ref={(el) => {
                                                            fileInputRef.current = el;
                                                            registerRef(el);
                                                        }}
                                                        onChange={(e) => {
                                                            registerOnChange(e);
                                                            handleVideoUpload(e);
                                                        }}
                                                    />
                                                }
                                            </div>
                                            :
                                            <div
                                                className={'!ps-md-10'}
                                                style={{
                                                    height: "252px",
                                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                                    borderRadius: "4px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    position: "relative",
                                                }}
                                            >
                                                <IonIcon icon={cloudUpload}
                                                            style={{fontSize: "32px", marginBottom: "8px"}}/>
                                                <div>BROWSE VIDEO FILE</div>
                                                <input
                                                    type="file"
                                                    id="videoFile"
                                                    style={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        opacity: 0,
                                                        cursor: "pointer",
                                                    }}
                                                    accept="video/*"
                                                    {...register("videoFile")}
                                                    onChange={handleVideoUpload}
                                                />
                                            </div>
                                        }

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginTop: "16px"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "start",
                                                    alignItems: "center",
                                                    gap: "2rem",
                                                    fontSize: "0.85rem"
                                                }}
                                            >
                                                <IonLabel>Length</IonLabel>
                                                <span>{videoLength}</span>
                                            </div>
                                            <span>
                                                {isRecordedVideo ? "Recorded video" : "Click on video to change"}
                                            </span>
                                        </div>
                                        <div className={'!h-[40px]'}></div>

                                        {
                                            editData ?
                                                <>
                                                    <span style={{marginTop: "1rem", fontSize: "0.8rem"}}>Link to the video</span>
                                                    <IonItem className={'!py-2 !flex !flex-col'} lines="none"
                                                                style={{
                                                                    "--background": "#929292",
                                                                    "background": "#929292",
                                                                    marginTop: "16px",
                                                                    borderRadius: "1rem"
                                                                } as any}>
                                                        <div
                                                            style={{
                                                                position: "relative",
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <IonInput
                                                                value={videoLink}
                                                                readonly
                                                                className={'relative left-[10%]'}
                                                                style={
                                                                    {
                                                                        "--padding-bottom": "0",
                                                                        "--padding-top": "0",
                                                                        "--padding-end": "40px",
                                                                        "--border-radius": "4px",
                                                                    } as any
                                                                }
                                                            />
                                                            <IonNote className={'!p-0 relative left-[10%]'} style={{
                                                                marginTop: "0",
                                                                display: "block",
                                                                color: "#ccc"
                                                            }}>Copy this link to invite anyone</IonNote>
                                                            <IonButton
                                                                fill="clear"
                                                                style={{
                                                                    position: "absolute",
                                                                    left: "0",
                                                                    top: "40%",
                                                                    transform: "translateY(-50%)",
                                                                }}
                                                            >
                                                                <IonIcon icon={linkOutline} color={'dark'}/>
                                                            </IonButton>
                                                            <IonButton
                                                                fill="clear"
                                                                style={{
                                                                    position: "absolute",
                                                                    right: "0",
                                                                    top: "40%",
                                                                    transform: "translateY(-50%)",
                                                                }}
                                                                onClick={copyLink}
                                                            >
                                                                <IonIcon icon={copy} color={'dark'}/>
                                                            </IonButton>
                                                        </div>
                                                    </IonItem>
                                                </>
                                                : <></>
                                        }

                                        <IonItem className={"!ps-0"} lines="none" style={{
                                            "--background": "transparent",
                                            marginTop: "16px",
                                            "--padding-start": "0",
                                        } as any}>
                                            <IonLabel position="stacked">Video sharing mode</IonLabel>
                                            <Controller
                                                control={control}
                                                name="sharingMode"
                                                render={({field: {onChange, value}}) => (
                                                    <IonRadioGroup
                                                        value={value}
                                                        onIonChange={(e) => {
                                                            setValue("rewardAmount", 0)
                                                            onChange(e.detail.value)
                                                        }}
                                                        style={{
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            justifyContent: "space-between",
                                                            marginTop: "10px",
                                                        }}
                                                    >
                                                        <IonItem lines="none"
                                                                    style={{"--background": "transparent"} as any}>
                                                            <IonLabel>Public</IonLabel>
                                                            <IonRadio slot="start" value="public"/>
                                                        </IonItem>
                                                        <IonItem lines="none"
                                                                    style={{"--background": "transparent"} as any}>
                                                            <IonLabel>Private</IonLabel>
                                                            <IonRadio slot="start" value="private"/>
                                                        </IonItem>
                                                        <IonItem lines="none"
                                                                    style={{"--background": "transparent"} as any}>
                                                            <IonLabel>Paid</IonLabel>
                                                            <IonRadio slot="start" value="paid"/>
                                                        </IonItem>
                                                    </IonRadioGroup>
                                                )}
                                            />
                                        </IonItem>

                                        {sharingMode === "paid" && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    backgroundColor: "transparent",
                                                    padding: "12px",
                                                    borderRadius: "4px",
                                                    marginTop: "16px",
                                                    flexWrap: "wrap",
                                                    gap: "8px",
                                                }}
                                            >
                                                <div style={{display: "flex", alignItems: "center"}}>
                                                    <span style={{marginRight: "8px"}}>Paid</span>
                                                    <IonIcon icon={star} size={"md"} style={{color: "#e91e63"}}/>
                                                </div>
                                                <span>You receive</span>
                                                <Controller
                                                    control={control}
                                                    name="rewardAmount"
                                                    render={({field}) => (
                                                        <IonInput
                                                            value={field.value}
                                                            onIonChange={(e) => field.onChange(e.detail.value)}
                                                            onBlur={field.onBlur}
                                                            type="number"
                                                            style={
                                                                {
                                                                    "--background": "#fff",
                                                                    "--color": "#000",
                                                                    "--font-weight": "bold",
                                                                    "--padding-start": "10px",
                                                                    "--border-radius": "4px",
                                                                    width: "20px",
                                                                    "--max-width": "20px"
                                                                } as any
                                                            }
                                                        />
                                                    )}
                                                />
                                                <span>stars for every new <br/>user who joins</span>
                                            </div>
                                        )}
                                    </IonCol>
                                </IonRow>
                            </IonGrid>

                            <div
                                className={'vod-button'}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: "24px",
                                }}
                            >
                                {
                                    pending ? <IonSpinner name="circles"></IonSpinner> : <button
                                        type="submit"
                                        className={'px-4.5 py-3 rounded-3 w-[150px] h-[42px] flex justify-center items-center'}
                                        style={
                                            {
                                                "--color": "white",
                                                maxWidth: "200px",
                                            } as any
                                        }
                                    >
                                        {editData !== null ? "UPDATE" : "ADD"}
                                    </button>
                                }
                            </div>
                        </form>
                </div>
            </div>
            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                message="If you leave now your recording will be lost."
                buttons={[
                    {
                    text: `${t("common.cancel")}`,
                    role: 'cancel'
                    },
                    {
                    text: `${t("common.leave")}`,
                    handler: () => {
                        onClose();
                    }
                    }
                ]}
            />
        </IonModal>
    )
}

export default AddVideoModal