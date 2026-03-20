import React, {FC, Fragment, useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
    IonBreadcrumb,
    IonBreadcrumbs,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle, IonCheckbox,
    IonCol,
    IonGrid, IonIcon, IonImg, IonInput,
    IonItem, IonLabel,
    IonList, IonModal, IonNote, IonRadio, IonRadioGroup,
    IonRow, IonSearchbar, IonSelect, IonSelectOption, IonSpinner, IonTextarea
} from '@ionic/react';
import Layout from '../../components/Layout';
import Careers from '../Careers';
import {useTranslation} from 'react-i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import SidebarVoD from "../../components/SidebarVOD";
import {useDispatch, useSelector} from "react-redux";
import {add, chevronForward, cloudUpload, copy, linkOutline, star} from "ionicons/icons";
import {VodChannel} from "../../components/VodItems";
import {VodChannelItem, VodState} from "../../redux/reducers/vodReducers";
import {VodService} from "../../services/VodService";
import {addChannel, addVod, allVodChannels, editChannel, editVod} from "../../redux/actions/vodActions";
import {setErrorToast, setSuccessToast} from "../../redux/actions/toastActions";
import {ReduxSelectors} from "../../redux/shared/types";
import crossIcon from "../../images/icons/cross.svg";
import {Controller, set, useForm} from "react-hook-form";
import cameraBtn from "../../pages/VoD/assets/camra.png";
import {Language, languages} from "countries-list";
import {CreateChannelData, EditChannelData, Genre} from "../../shared/types";
import {GenreService} from "../../services";
import {VOD_FILE_HOST} from "../../shared/constants";
import AddChannel from './AddChannel';

type ChannelFormValues = {
    title: string
    description: string
    thumbnail: FileList | null
    genre: string
    language: string
    restriction: string
    ageRestriction: boolean
    sharingMode: "public" | "private" | "paid"
    rewardAmount: number
}

const MyChannel: React.FC = () => {
    const {t, i18n} = useTranslation();

    const dispatch = useDispatch();
    const { userChannels } = useSelector(({vod}: ReduxSelectors) => vod);
    const [openModal, setOpenModal] = useState<boolean>(false);

    const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
    const allLanguages = useRef<Language[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [openAddChannelModal, setOpenAddChannelModal] = useState<boolean>(false);
    const [selectedChannelVideo, setSelectedChannelVideo] = useState<VodState []>([]);
    const [channelVideosIds, setChannelVideosIds] = useState<number[]>([]);  

    // Function to display the message based on channelVideosIds
    const getChannelVideosMessage = (channelVideosIds: number[]) => {
        if (channelVideosIds.length === 0) {
            return "Select existing videos you want to add to your channel.";
        }

        const videoCount = channelVideosIds.filter(id => id !== 1).length;
        const adsBreakCount = channelVideosIds.filter(id => id === 1).length;

        let message = "";
        if (videoCount > 0) {
            message += `${videoCount} videos`;
        }
        if (adsBreakCount > 0) {
            message += `${videoCount > 0 ? " and " : ""}${adsBreakCount} ads break`;
        }

        return message;
    };

    useEffect(() => {
        async function loadAllVodChannels() {
            const response = await VodService.getAllVodChannel();
            if (response.status === 200) {
                dispatch(allVodChannels(response.data))
            } else {
                dispatch(setErrorToast("Failed to load VODs"));
            }
        }
        loadAllVodChannels();
        GenreService.getGenres().then(({data}) => setGenres(data));

        const l = Object.values(languages);
        l.sort((a, b) => a.name.localeCompare(b.name));
        allLanguages.current = l;
        setFilteredLanguages(l);
    }, []);

    useEffect(() => {
        let videosIds: number[]=[];
        for(const video of selectedChannelVideo ){
            videosIds.push(video.id)
        }
        setChannelVideosIds(videosIds);
    },[selectedChannelVideo]);

    const updateChannel = (data: VodChannelItem) => {
        setVideoScreen(false)
        setThumbnailPreview(data.logo)
        if(data.id){
            setSelectedChannelVideo(data.shared_vods);
        }
        setFileData({
            thumb: data.logo
        } as FileItem)
        setEditData(data.id)
        reset({
            sharingMode: data.starsAmount !== null && parseInt(`${data.starsAmount ?? 0}`) > 0 ? "paid" : data.isPrivate ? "private" : "public",
            rewardAmount: parseInt(`${data.starsAmount ?? 0}`),
            language: data.language,
            genre: data.genre,
            ageRestriction: data.is_adult_content,
            restriction: `${data.restrictions}`,
            description: data.description,
            title: data.name
        });
        setOpenModal(true)
    }

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

    const createVideo = async () => {
        initForm()
        setOpenModal(true)
    }

    const {
        register,
        handleSubmit,
        control, // This is critical for Controller components
        watch,
        reset,
        setValue,
        formState: {errors},
    } = useForm<ChannelFormValues>({
        defaultValues: {
            sharingMode: "public",
            rewardAmount: 100,
            language: "",
            genre: "",
            ageRestriction: false
        },
    })

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setThumbnailPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            await generateThumbId(file)
        }
    }

    async function generateThumbId(file: File) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        setPending(true)
        try {
            const response = await VodService.getFile();
            if (response.status === 200) {
                setFileData(prev => ({ ...prev, thumb: `${VOD_FILE_HOST}/img/uploads/files/${response.data.name}.${extension}` }));
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

    const sharingMode = watch("sharingMode")

    const [loading, setLoading] = useState<number | null>(null)

    const [pending, setPending] = useState<boolean>(false);

    type FileItem = {
        thumb?: string | undefined,
    }

    const [fileData, setFileData] = useState<FileItem | null>({
        thumb: ""
    });

    const [editData, setEditData] = useState<number | null>(null)

    const [videoScreen, setVideoScreen] = useState<boolean>(false);

    
    

    const initForm = () => {
        setVideoScreen(false)
        setThumbnailPreview(null)
        setEditData(null)
        setSelectedChannelVideo([])
        setOpenModal(false)
        setFileData({
            thumb: ""
        })
        reset({
            sharingMode: "public",
            rewardAmount: 0,
            language: "",
            genre: "",
            ageRestriction: false,
            restriction: "",
            description: "",
            title: ""
        });
    }

    const onSubmit = async (data: ChannelFormValues) => {
        setPending(true)
        const createChannelData:CreateChannelData={
            title: data.title,
            logo: fileData?.thumb || "",
            description: data.description,
            genre: data.genre,
            language: data.language,
            is_adult_content: data.ageRestriction,
            starsAmount: data.rewardAmount.toString(),
            isPrivate: data.sharingMode === 'private',
            restrictions: data.restriction,
            shared_vods: channelVideosIds
        };
        
        const editChannelData : EditChannelData= {
            name: data.title,
            url: data.title,
            logo: fileData?.thumb || "",
            description: data.description,
            genre: data.genre,
            language: data.language,
            is_adult_content: data.ageRestriction,
            starsAmount: data.rewardAmount.toString(),
            isPrivate: data.sharingMode === 'private',
            restrictions: data.restriction,
            shared_vods: channelVideosIds
        };
       
        
        try {
            let response;
            if(editData != null){
                response = await VodService.editChannel(editChannelData, editData);
                               
            }else{
                response = await VodService.saveChannel(createChannelData);
                if(response.status === 200 || response.status === 201){
                    try {
                        await VodService.addBillingToChannel(data.sharingMode, data.rewardAmount, response.data.id);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
 

            if (response.status === 200 || response.status === 201) {
                dispatch(setSuccessToast("File uploaded Successfully"))
                if(editData !== null){
                    if(response.statusText.toLowerCase() === "ok"){
                        dispatch(editChannel(response.data))
                        dispatch(setSuccessToast("Channel updated successfully"))
                    }
                    else{
                        dispatch(setErrorToast("Failed to update Channel information"))
                    }
                }
                else{
                    dispatch(addChannel(response.data))
                    dispatch(setSuccessToast("Channel added successfully"))

                }
                setOpenModal(false)
            } else {
                dispatch(setErrorToast("Failed to saved Channel"))
            }

        } catch (e) {
            dispatch(setErrorToast("Failed to saved Channel"))
        }
        setPending(false)
    }

    return (
        <Layout className="about-page">
            <PerfectScrollbar>
                <IonGrid className={'!p-0 !m-0'}>
                    <IonRow className={'!p-0 !m-0'}>
                        <SidebarVoD/>

                        <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="10" sizeXl="10"
                                className={'p-5 !max-h-[90dvh]'}>
                            <PerfectScrollbar options={{}} className="h-full">
                                <div className={'md:p-5'}>
                                    <div className={'flex justify-between items-center'}>
                                        <div className={'flex justify-center flex-1'}>
                                            <b>CHANNELS</b>
                                        </div>
                                    </div>

                                    <div className={'flex mt-3 justify-between items-center'}>
                                        <IonBreadcrumbs className={''}>
                                            <IonBreadcrumb href="#">
                                                My Videos
                                                <IonIcon slot="separator" icon={chevronForward}></IonIcon>
                                            </IonBreadcrumb>
                                            <IonBreadcrumb href="#">Channels</IonBreadcrumb>
                                        </IonBreadcrumbs>

                                        <div className={'flex justify-end gap-3 items-center'}>
                                            <IonButton onClick={() => createVideo()} color="transparent">
                                                <IonIcon icon={add} size={"32"} slot="start"/>
                                                CREATION
                                            </IonButton>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:!px-7 vod-table">
                                    <hr className={"!border-t-[#5B2B45] mb-4"} style={{borderTopWidth: "1px"}}/>
                                    <div className="grid grid-cols-6 gap-7">
                                        {
                                            userChannels.map((channel, index) => (
                                                <VodChannel key={"channel_" + index}  openModal={updateChannel} channel={channel as VodChannelItem} />
                                            ))
                                        }
                                    </div>
                                </div>

                            </PerfectScrollbar>

                        </IonCol>
                    </IonRow>
                </IonGrid>
            </PerfectScrollbar>

            <IonModal
                isOpen={openModal}
                onDidDismiss={() => {
                    initForm()
                }}
                
                className={`modal-custom ${openModal ? '!flex' : '!hidden'} !items-center !justify-center`}
            >
                <div
                    className="overflow-y-auto h-[87vh] w-[90vw] max-w-[1200px] rounded-lg bg-[#662C4B] p-6 text-white outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-[#707070]">
                    <div className="-mt-1.5 mb-1 text-lg font-medium">
                        <div className={'flex flex-row items-center'}>
                            <div className={'flex-1 flex items-center justify-center'}>
                                {editData !== null ? "EDIT" : "ADD"} CHANNEL
                            </div>
                            <div className={'flex px-2 items-center'}>
                                <IonIcon slot="icon-only" color="white" size={"default"} icon={crossIcon}
                                         className={'cursor-pointer'} onClick={() => {
                                    reset()
                                    setEditData(null);
                                    setOpenModal(false)
                                }}/>
                            </div>
                        </div>
                    </div>
                    <div
                        className="ion-padding !bg-transparent mb-2 text-base text-gray-200 px-4 py-2 !overflow-y-auto !max-h-[1050px] !min-h-[1050px]">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(onSubmit)();
                        }} className={'px-5'}>
                            <IonGrid>
                                {
                                    !videoScreen &&
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

                                                    <IonItem lines="none"
                                                                style={{marginTop: "16px", "--background": "transparent"}}>
                                                        <IonLabel position="stacked" className="!text-[1.2rem] !mb-3">Genre
                                                            (optional)</IonLabel>
                                                        <Controller
                                                            control={control}
                                                            name="genre"
                                                            render={({field}) => (
                                                                <IonSelect
                                                                    value={field.value}
                                                                    onIonChange={(e) => field.onChange(e.detail.value)}
                                                                    onBlur={field.onBlur}
                                                                    placeholder="Choice"
                                                                    interface="alert" // Try this instead of popover
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
                                                                    value={field.value}
                                                                    onIonChange={(e) => field.onChange(e.detail.value)}
                                                                    onBlur={field.onBlur}
                                                                    placeholder="Language"
                                                                    interface="alert" // Try this instead of popover
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

                                                    <IonItem lines="none" style={{"--background": "transparent",
                                                        marginTop: "24px"} as any}>
                                                        <IonLabel position="stacked"
                                                                    className={'!text-[1.15rem] !mb-3'}>Videos</IonLabel>
                                                        <IonNote className={"!text-[0.95rem] mb-4"} style={{marginTop: "6px", display: "block", color: channelVideosIds.length > 0 ? 'white' : undefined}}>
                                                            {getChannelVideosMessage(channelVideosIds)}
                                                        </IonNote>
                                                        <IonButton onClick={() => setOpenAddChannelModal(true)} fill="outline" size="default" color={"dark"}>ADD VIDEOS</IonButton>
                                                    </IonItem>

                                                </div>

                                            </IonCol>

                                            {/* Right Column */}
                                            <IonCol size="12" sizeMd="6">

                                                <IonItem lines="none" style={{
                                                    "--background": "transparent",
                                                    padding: "0px"
                                                } as any}>
                                                    <IonLabel position="stacked" className={'!text-[1.2rem] !mb-3'}>Thumbnail
                                                        image</IonLabel>
                                                    <div
                                                        style={{
                                                            marginTop: "10px",
                                                            position: "relative",
                                                            height: "250px",
                                                            width: "100%",
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
                                                                <div className={'flex flex-col gap-5 items-center justify-center'}>
                                                                    <IonIcon icon={cloudUpload}
                                                                                style={{fontSize: "32px", marginBottom: "8px"}}/>
                                                                    <b>BROWSE FILE</b>
                                                                </div>
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
                                                                onChange={handleThumbnailUpload}
                                                            />
                                                        }
                                                    </div>
                                                    <IonNote style={{marginTop: "6px", display: "block"}}>Upload a file</IonNote>
                                                </IonItem>
                                                <div className={'!h-[60px]'}></div>


                                                <IonItem className={"!ps-0"} lines="none" style={{
                                                    "--background": "transparent",
                                                    marginTop: "16px",
                                                    "--padding-start": "16px",
                                                } as any}>
                                                    <IonLabel position="stacked">Channel sharing mode</IonLabel>
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
                                        
                                        
                                }
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
                                        // expand="block"
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
            </IonModal>

            <AddChannel 
            openModal={openAddChannelModal}
            setOpenModal={setOpenAddChannelModal}
            channelVideos={selectedChannelVideo}
            updateChannelVideo={(videos)=>{setSelectedChannelVideo(videos)}}
            />
            
        </Layout>
    );
};

export default MyChannel;
