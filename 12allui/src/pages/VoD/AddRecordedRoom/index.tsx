import React, { useCallback, useEffect, useState } from 'react';
import './style.scss';
import AddVideoModal from '../AddVideoModal';
import { useSelector } from 'react-redux';
import { VodService } from 'src/services/VodService';
import { useForm } from 'react-hook-form';
import { VideoFormValues, FileItem } from '../';
import {RecordedVideo } from 'src/shared/types';
import { API_URL, VOD_FILE_HOST } from 'src/shared/constants';
import { formatDuration } from 'src/shared/helpers';
import { ReduxSelectors } from 'src/redux/shared/types';


const AddRecordedVod = () => {
  const { recordedVideoId } = useSelector(({ vod }: ReduxSelectors) => vod);
  const { gender, language } = useSelector(({ vod }: ReduxSelectors) => vod.recordedVideoInfo);
  //const recordedVideoId = 'e3514caf-e5ea-477d-b7d3-48a3a79e57e6';
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [videoLink, setVideoLink] = useState<string>("");
  const [editData, setEditData] = useState<number | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string |null >("");
  const [fileData, setFileData] = useState<FileItem | null>(null);
  const [videoLength, setVideoLength] = useState<string>('0');
  const [sharingMode, setSharingMode] = useState<"public" | "private" | "paid">("private");
  const [recordedVideoData, setRecordedVideoData] = useState<RecordedVideo | null>(null);
  // React Hook Form setup
  const { 
    reset,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors } 
  } = useForm<VideoFormValues>({
    defaultValues: {
      title: "Recorded video",
      description: "",
      thumbnail: null,
      videoFile: null,
      genre: "",
      language: "",
      restriction: "",
      ageRestriction: false,
      sharingMode: "private",
      rewardAmount: 0
    }
  });
  
  useEffect(() => {
    if (recordedVideoId === null) {
      return;
    }
    getRecordedVideo();
  }, [recordedVideoId]);

  const getRecordedVideo = useCallback(async () => {
    if (recordedVideoId === null) {
      return;
    }
    try {
      const response = await VodService.getRecordedVideoFile(recordedVideoId);
      if (response.status === 200 && response.data) {
        const videoData: RecordedVideo = response.data;
        setRecordedVideoData(videoData);
        const videoUrl = `${VOD_FILE_HOST}/img/uploads/files/records/${videoData.fileName}`;
        
        setFileData({ 
          name: videoData.fileName, 
          thumb: thumbnailPreview as string
        });
        setVideoLink(videoUrl);
        setDuration(videoData.duration);
        setVideoLength(formatDuration(videoData.duration));
        
        const recordingDateTime = new Date(videoData.startDate);
        const date = recordingDateTime.toLocaleDateString();
        const time = recordingDateTime.toLocaleTimeString();
        setValue("title", `Recorded video - ${date} ${time}`);
        setValue("description",  "Recorded video");
        setOpenModal(true);
      }
    } catch (error) {
      console.error('Error fetching recorded video:', error);
    }
  }, [recordedVideoId, setValue]);

  const initForm = useCallback(() => {
    reset();
    setDuration(0);
    setVideoLength('0');
    setThumbnailPreview("");
    setFileData(null);
    setEditData(null);
    setRecordedVideoData(null);
    setOpenModal(false);
  }, [reset]);

  return (
    <div>
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
        reset={reset}
        handleSubmit={handleSubmit}
        sharingMode={sharingMode}
        genre={gender}
        language={language}
        recordedVideoData={recordedVideoData} // Nouvelle prop
      />
    </div>
  );
};

export default AddRecordedVod;