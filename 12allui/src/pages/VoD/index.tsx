import React, {useEffect, useRef, useState} from 'react';
import './styles.scss';
import {
    IonBreadcrumb,
    IonBreadcrumbs, IonButton, 
    
    IonCheckbox,
    IonCol, 
    IonGrid, IonIcon,
    
    
    IonRow} from '@ionic/react';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
    add,
    chevronForward,
    grid,
    reorderFourSharp} from "ionicons/icons";
import SidebarVoD from "../../components/SidebarVOD";

import {VodList, VodGrid} from "../../components/VodItems";
import {useForm} from "react-hook-form";

import {useDispatch, useSelector} from "react-redux";
import {setErrorToast, setInfoToast, setSuccessToast} from "../../redux/actions/toastActions";
import {VodService} from "../../services/VodService";
import { loadVods} from "../../redux/actions/vodActions";
import {VodState} from "../../redux/reducers/vodReducers";
import {ReduxSelectors} from "../../redux/shared/types";
import AddVideoModal from './AddVideoModal';
import { formatDuration } from 'src/shared/helpers';
import AddRecordedVod from './AddRecordedRoom';

export type VideoFormValues = {
    title: string
    description: string
    thumbnail: FileList | null
    videoFile: FileList | null
    genre: string
    language: string
    restriction: string
    ageRestriction: boolean
    sharingMode: "public" | "private" | "paid"
    rewardAmount: number
}

export type FileItem = {
    name?: string | undefined,
    thumb?: string | undefined,
} 

export const MyVoD: React.FC = () => {

    const dispatch = useDispatch();

    const voData = useSelector(({vod}: ReduxSelectors) => vod);

    useEffect(() => {
        async function loadAllVods() {
            const response = await VodService.getAllVod("own");
            if (response.status === 200) {
                dispatch(loadVods(response.data))
            } else {
                dispatch(setErrorToast("Failed to load VODs"));
            }
        }
        loadAllVods();
    }, []);

    const [layout, setLayout] = useState<"LIST" | "GRID">("LIST")
    const [all, checkAll] = useState<boolean>(false)

    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleCheckboxChange = (value: string, checked: boolean) => {
        checkAll(false);
        setSelectedItems((prev) =>
            checked ? [...prev, value] : prev.filter((item) => item !== value)
        );
    };

    const toggleCheckAll = () => {
        const allVodIds = voData.userVODs.map((vod) => `${vod.id}`);

        const isChecked = selectedItems.length === allVodIds.length;

        if (!isChecked) {
            setSelectedItems([...allVodIds]);
        } else {
            setSelectedItems([]);
        }
    };


    const [videoLength, setVideoLength] = useState("00:00")
    const [duration, setDuration] = useState(0)
    const [videoLink, setVideoLink] = useState("")
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        control, // This is critical for Controller components
        watch,
        reset,
        setValue,
        formState: {errors},
    } = useForm<VideoFormValues>({
        defaultValues: {
            sharingMode: "public",
            rewardAmount: 100,
            language: "",
            genre: "",
            ageRestriction: false
        },
    })

    const sharingMode = watch("sharingMode")



   



    const [loading, setLoading] = useState<number | null>(null)

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [fileData, setFileData] = useState<FileItem | null>({
        name: "", thumb: ""
    });


    



    const updateVod = (data: VodState) => {
        setThumbnailPreview(data.logo)
        setFileData({
            name: data.url,
            thumb: data.logo
        } as FileItem)
        setVideoLength(formatDuration(data.duration))
        setVideoLink(`${window.location.origin}/vod-channel/vod/` + data.id)
        setEditData(data.id)
        reset({
            sharingMode: data.starsAmount !== null && data.starsAmount > 0 ? "paid" : data.isPrivate ? "private" : "public",
            rewardAmount: data.starsAmount as number ?? 0,
            language: data.language,
            genre: data.genre,
            ageRestriction: data.is_adult_content,
            restriction: `${data.restrictions}`,
            description: data.description,
            title: data.title
        });
        setOpenModal(true)
    }

    const initForm = () => {
        setThumbnailPreview(null)
        setEditData(null)
        setFileData({
            name: "", thumb: ""
        })
        setVideoLink("")
        setVideoLength('0')
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

    const [editData, setEditData] = useState<number | null>(null)

    const createVideo = async () => {
        initForm()
        setOpenModal(true)
    }




    return (
        <Layout className="vod-page !overflow-hidden">
            <IonGrid className={'!p-0 !m-0'}>
                <IonRow className={'!p-0 !m-0'}>
                    <SidebarVoD/>

                    <IonCol sizeXs="12" sizeSm="12" sizeMd="12" sizeLg="10" sizeXl="10"
                            className={'p-5 !max-h-[90dvh]'}>
                        <PerfectScrollbar options={{}} className="h-full">
                            <div className={'md:p-5'}>
                                <div className={'flex justify-between items-center'}>
                                    <div className={'flex'}>
                                        <svg width="24" height="24" viewBox="0 0 717 717" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M358.333 691.667C542.428 691.667 691.667 542.428 691.667 358.333C691.667 174.238 542.428 25 358.333 25C174.238 25 25 174.238 25 358.333C25 542.428 174.238 691.667 358.333 691.667Z"
                                                stroke="white" strokeWidth="50"/>
                                            <path
                                                d="M544.123 323.033C570.18 338.42 570.18 378.247 544.123 393.633L386.783 486.527C361.457 501.48 330.333 482.017 330.333 451.227V265.439C330.333 234.649 361.457 215.187 386.783 230.14L544.123 323.033Z"
                                                stroke="white" strokeWidth="50"/>
                                            <path
                                                d="M153 358.666C153 377.963 168.703 393.666 188 393.666C207.297 393.666 223 377.963 223 358.666C223 339.37 207.297 323.667 188 323.667C168.703 323.667 153 339.37 153 358.666Z"
                                                fill="white"/>
                                            <path
                                                d="M153 475.333C153 494.63 168.703 510.333 188 510.333C207.297 510.333 223 494.63 223 475.333C223 456.037 207.297 440.333 188 440.333C168.703 440.333 153 456.037 153 475.333Z"
                                                fill="white"/>
                                            <path
                                                d="M153 242C153 261.297 168.703 277 188 277C207.297 277 223 261.297 223 242C223 222.703 207.297 207 188 207C168.703 207 153 222.703 153 242Z"
                                                fill="white"/>
                                        </svg>
                                        &nbsp;&nbsp;
                                        MY VIDEOS
                                    </div>

                                    <IonButton onClick={() => createVideo()} color="transparent">
                                        <IonIcon icon={add} size={"32"} slot="start"/>
                                        Add Video
                                    </IonButton>
                                </div>

                                <div className={'flex mt-3 justify-between items-center'}>
                                    <IonBreadcrumbs className={''}>
                                        <IonBreadcrumb href="#">
                                            My Videos
                                            <IonIcon slot="separator" icon={chevronForward}></IonIcon>
                                        </IonBreadcrumb>
                                        <IonBreadcrumb href="#">Media</IonBreadcrumb>
                                    </IonBreadcrumbs>

                                    <div className={'flex justify-end gap-3 items-center'}>
                                        <IonButton shape="round" size="small"
                                                   color={layout === "LIST" ? 'primary' : 'transparent'}
                                                   onClick={() => setLayout("LIST")}>
                                            <IonIcon slot="icon-only" ios={reorderFourSharp}
                                                     md={reorderFourSharp}></IonIcon>
                                        </IonButton>
                                        <IonButton shape="round" size="small"
                                                   color={layout === "GRID" ? 'primary' : 'transparent'}
                                                   onClick={() => setLayout("GRID")}>
                                            <IonIcon slot="icon-only" ios={grid} md={grid}></IonIcon>
                                        </IonButton>
                                    </div>
                                </div>
                            </div>

                            <div className="md:!px-7 vod-table">

                                {
                                    layout === "LIST" ?
                                        <table className="w-[100%]">
                                            <thead className={"!border-t-[#5B2B45]"} style={{borderTopWidth: "1px"}}>
                                            <tr className={"!text-[#D4D4D4]"}>
                                                <th className={"!w-[5%]"} scope="col">
                                                    <IonCheckbox onIonChange={() => toggleCheckAll()}/>
                                                </th>
                                                <th className={"!w-[25%]"} scope="col">Content</th>
                                                <th className={"!w-[10%]"} scope="col">Visibility</th>
                                                <th className={"!w-[10%]"} scope="col">Status</th>
                                                <th className={"!w-[10%]"} scope="col">Type</th>
                                                <th className={"!w-[15%]"} scope="col">Channels</th>
                                                <th className={"!w-[10%]"} scope="col">Length</th>
                                                <th className={"!w-[20%]"} scope="col">Date</th>
                                                <th className={"!w-[5%]"} scope="col"></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                voData.userVODs.map((vod, index) => (
                                                    <VodList openModal={updateVod} loading={loading}
                                                             handleLoading={setLoading} vod={vod as VodState}
                                                             selection={selectedItems} key={"vod-list-" + index}
                                                             handleCheckboxChange={handleCheckboxChange}/>
                                                ))
                                            }
                                            </tbody>
                                        </table>
                                        :
                                        <>
                                            <hr className={"!border-t-[#5B2B45]"} style={{borderTopWidth: "1px"}}/>
                                            <div className="grid grid-cols-6 gap-4">
                                                {
                                                    voData.userVODs.map((vod, index) => (
                                                        <VodGrid openModal={updateVod} loading={loading}
                                                                 handleLoading={setLoading} vod={vod as VodState}
                                                                 selection={selectedItems} key={"vod-grid-" + index}
                                                                 handleCheckboxChange={handleCheckboxChange}/>
                                                    ))
                                                }
                                            </div>
                                        </>
                                }
                            </div>

                        </PerfectScrollbar>

                    </IonCol>
                </IonRow>
            </IonGrid>

            <AddVideoModal
                openModal={openModal}
                initForm={initForm}
                duration={duration}
                videoLink={videoLink}
                editData={editData}
                thumbnailPreview={thumbnailPreview}
                fileData={fileData}
                setFileData={setFileData}
                videoLength={videoLength}
                setVideoLength={setVideoLength}
                setThumbnailPreview={setThumbnailPreview}
                setEditData={setEditData}
                setOpenModal={setOpenModal}
                setDuration={setDuration}
                control={control}
                register={register}
                setValue={setValue}
                errors={errors}
                handleSubmit={handleSubmit}
                sharingMode={sharingMode}
                reset={reset}
            />
            <AddRecordedVod/>
        </Layout>
    );
};

export default MyVoD;
