import { IonButton, IonCol, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonModal, IonReorder, IonReorderGroup, IonRow, IonSearchbar, ItemReorderEventDetail } from '@ionic/react';
import './styles.scss';
import { FC, useEffect, useState } from 'react';
import { add, closeOutline as close } from 'ionicons/icons';
import crossIcon from "../../../images/icons/cross.svg";
import imagePlaceholder from "../../../images/12all-logo-128.png";
import reorderThree from "../../../images/icons/treeBars.svg";
import {VodService} from "../../../services/VodService";
import { useDispatch, useSelector } from 'react-redux';
import { ReduxSelectors } from 'src/redux/shared/types';
import { allVods, loadVods } from 'src/redux/actions/vodActions';
import { setErrorToast } from 'src/redux/actions/toastActions';
import { VodState , VodStateClass} from 'src/redux/reducers/vodReducers';
interface AddChannelModalProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  channelVideos: VodState[];
  updateChannelVideo: ( channelVideos: VodState[]) => void;
}

const AddChannel:FC<AddChannelModalProps> = ({openModal,setOpenModal,channelVideos,updateChannelVideo}) => {
   

   
    const dispatch = useDispatch();
    const {allVODs, userVODs}  = useSelector(({vod}: ReduxSelectors) => vod);
    const [videoList, setVideoList]= useState<VodState[]>([]);
    const [selectedList, setSelectedList]= useState<VodState[]>(channelVideos);
    const [isMyVideoListDisplayed, setIsMyVideoListDisplayed] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    useEffect(() => {
        async function getVod(){
            if(allVODs.length===0){
                const response = await VodService.getAllVod('all');
                if (response.status === 200) {
                    dispatch(allVods(response.data));
                    if(!isMyVideoListDisplayed){
                        setVideoList(response.data);
                    }
                } else {
                    dispatch(setErrorToast("Failed to load VODs"));
                }
            }
            if(userVODs.length===0){
                const response = await VodService.getAllVod('own');
                if (response.status === 200) {
                    dispatch(loadVods(response.data));
                } else {
                    dispatch(setErrorToast("Failed to load VODs"));
                }
            }
        }
        getVod();
    },[]);

    useEffect(() => {
        if (searchTerm) {
            const filteredVideos = videoList.filter((video) =>
                video.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setVideoList(filteredVideos);
        } else {
            setVideoList(allVODs);
        }
    }, [searchTerm, allVODs]);

    useEffect(()=>{
        if(isMyVideoListDisplayed){
            setVideoList(userVODs);
        }else{
            setVideoList(allVODs);
        }
    },[isMyVideoListDisplayed])

    const selectVideos=(video:VodState)=>{
        setSelectedList([...selectedList,video]);
    }

    const removeVideo = (index: number) => {
      if (index < 0 || index >= selectedList.length) return;
      
      const newList = [
        ...selectedList.slice(0, index),
        ...selectedList.slice(index + 1)
      ];
      setSelectedList(newList);
    };


    const selectAllVideos=()=>{
      if(isMyVideoListDisplayed){
        const newVideos = userVODs.filter(video => 
          !selectedList.some(selected => selected.id === video.id)
        );
        setSelectedList([...selectedList, ...newVideos]);
      } else {
        const newVideos = allVODs.filter(video => 
          !selectedList.some(selected => selected.id === video.id)
        );
        setSelectedList([...selectedList, ...newVideos]);
      }
    }

    const onDismiss = () => {
        setSelectedList(channelVideos);
        if (openModal) {
            setOpenModal(false);
        }
    };

    const addAdBreak =()=>{
      const adbreak = new VodStateClass();// a break is just a video with the id 0 ;
      adbreak.id=1;
      setSelectedList([...selectedList,adbreak]);
    }

    const handleReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
      const movedItem = selectedList[event.detail.from];
      const newList = [...selectedList];
      newList.splice(event.detail.from, 1);
      newList.splice(event.detail.to, 0, movedItem);
      setSelectedList(newList);
      event.detail.complete();
    }

    const cancelAddVideos = () => {
      setOpenModal(false);
    }

    const saveChannelVideo = () => {
      updateChannelVideo(selectedList);
      setOpenModal(false);
    }
    

    return (
        <IonModal
            isOpen={openModal}
            onDidDismiss={onDismiss}
            onDidPresent={() => {setSelectedList(channelVideos)}}
            backdropDismiss={false}
            keepContentsMounted={false}
            className={`modal-custom ${openModal ? '!flex' : '!hidden'} !items-center !justify-center`}
        >

             <div
                className=" h-[87vh] w-[90vw] max-w-[1200px] rounded-lg overflow-y-auto bg-[#662C4B] p-6 text-white outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-[#707070]">
                <div className="-mt-1.5 mb-1 text-lg font-medium">
                    <div className={'flex flex-row items-center'}>
                        <div className={'flex-1 flex items-center justify-center'}>
                            ADD VIDEO
                        </div>
                        <div className={'flex px-2 items-center'}>
                            <IonIcon slot="icon-only" color="white" size={"default"} icon={crossIcon}
                                className={'cursor-pointer'} onClick={() => {
                                setOpenModal(false)
                            }}/>
                        </div>
                    </div>
                </div>
                <IonGrid className='ion-padding add-video-grid'>
                    <IonRow className='ion-padding add-video-channel'>
                        
                        
                        <IonCol size="12" sizeMd="6">
                            <div className='w-full mb-7'>
                                <IonSearchbar 
                                    className='ion-no-padding' 
                                    debounce={300} 
                                    mode='ios' 
                                    placeholder='Search'
                                    value={searchTerm}
                                    onIonChange={e => setSearchTerm(e.detail.value || '')}
                                />
                            </div>
                            <div className='border-b border-white flex justify-between h-14'>
                                <IonButton 
                                    fill="outline" 
                                    className='btn-select-all'
                                    onClick={()=>selectAllVideos()}
                                >
                                    SELECT ALL
                                </IonButton>
                                <div className='flex gap-0'>
                                    <IonButton 
                                        onClick={() => setIsMyVideoListDisplayed(false)}
                                        className='btn-all-video' 
                                        style={{'--background': !isMyVideoListDisplayed? 'var(--bt-channel-background)' : 'transparent'}}
                                    >
                                        All VIDEOS
                                    </IonButton>
                                    <IonButton 
                                        onClick={() => setIsMyVideoListDisplayed(true)}
                                        className='btn-my-video -ml-0.5' 
                                        style={{'--background': isMyVideoListDisplayed ? 'var(--bt-channel-background)' : 'transparent'}}
                                    >
                                        MY VIDEOS
                                    </IonButton>
                                </div>
                            </div>
                                <IonList>
                                    {videoList.map((video) => (
                                        <IonItem onClick={()=>selectVideos(video)} key={video.id} className='ion-no-padding ion-no-margin video-list-item'>
                                          <div className='w-full flex mt-1 mb-1 px-1 h-20 justify-between items-center'>
                                            <div className='flex'>
                                              <IonImg
                                                src={video.logo && video.logo.length > 0 ? video.logo : imagePlaceholder}
                                                alt={video.title}
                                              />
                                              <IonLabel class='mt-2'>{video.title}</IonLabel>
                                            </div>
                                            
                                            <div className='flex items-center h-full'>
                                                <IonIcon icon={add} slot="end" />
                                            </div>
                                          </div>
                                        </IonItem>
                                    ))}
                                </IonList>
                        </IonCol>
                            
                        <IonCol size="12" sizeMd="6" className='selected-video-row'>
                            <div className='h-14 text-center flex items-center justify-center mt-16'>
                                <IonLabel>Drag videos into my channel</IonLabel>
                            </div>

                            <IonList
                                className='selected-video-list'>
                                <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
                                  {selectedList.map((video,index) => (
                                        <IonItem key={`${video.id}-${index}`} className={`ion-no-padding ion-no-margin ${video.id===1?'channel-ad-break':''}`} >
                                          <div className='w-full flex mt-1 mb-1 px-1 h-20 justify-between items-center'>
                                            {video.id===1?
                                              <>
                                                <IonLabel className='text-left pl-5 '> <span className='text-lg'>AD BREAK</span></IonLabel>
                                                <IonLabel className='text-xs'><span className='text-sm'>Length 0:33'</span></IonLabel>
                                              </>
                                              :
                                              <div className='flex'>
                                                <IonImg
                                                    src={video.logo && video.logo.length > 0 ? video.logo : imagePlaceholder}
                                                    alt={video.title}
                                                />
                                                <IonLabel className='mt-2 '>{video.title}</IonLabel>
                                              </div>  
                                            }
                                          
                                            <div className={`flex items-center ${video.id===1?'pr-5':''}`} >
                                              <IonIcon 
                                                  className='remove-icon'
                                                  icon={close} 
                                                  slot="end" 
                                                  style={{ cursor: 'pointer' }}
                                                  onClick={()=>removeVideo(index)}
                                              />
                                              <IonReorder  >
                                                <div>
                                                  <IonIcon 
                                                    className='ion-no-padding ion-no-margin reoder-icon' 
                                                    icon={reorderThree} 
                                                    slot="end"
                                                  />
                                                </div>
                                              </IonReorder>
                                            </div>

                                          </div>
                                        </IonItem>
                                  ))}
                                </IonReorderGroup>
                                
                            </IonList>
                        </IonCol>
                    </IonRow>
                    <IonRow className='ion-padding  add-video-channel'>
                        <IonCol >
                            <IonButton fill="outline" onClick={()=>addAdBreak()} >ADD AD BREAK</IonButton>
                        </IonCol>
                        <IonCol className='flex justify-center'>
                            <IonButton fill="outline" className='w-[133px]' onClick={()=>cancelAddVideos()} >CANCEL</IonButton>
                            <IonButton fill="outline" className='btn-video-save' onClick={()=>saveChannelVideo()}>SAVE</IonButton>
                        </IonCol>
                    </IonRow>

                </IonGrid>
            </div>
        </IonModal>
        
    );
};

export default AddChannel;