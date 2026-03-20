import React, {FC, useState} from 'react';
import {useTranslation} from 'react-i18next';
import './styles.scss';
import {FileStreamSource, FileStreamType, TYPES} from '../../types';
import DragNDrop from '../DragNDrop';
import MediaValidation from '../MediaValidation';

interface FileStreamProps {
  onSrc: (value: FileStreamSource[]) => void;
  onValid: (isValid: boolean) => void;
}

const ACCEPT = TYPES.map(t => t.value).join(', ');

const FileShare: FC<FileStreamProps> = ({onSrc, onValid}: FileStreamProps) => {
  const {t} = useTranslation();

  const [files, setFiles] = useState<FileStreamSource[] | null>(null);

  const onDrop = (droppedFiles: File[]) => {
    const filesMapped: FileStreamSource[] = droppedFiles.map((file, index) => ({
      id: index,
      fileName: file.name,
      src: URL.createObjectURL(file),
      type: file.type as FileStreamType
    }));

    setFiles(filesMapped);
    onSrc(filesMapped);
  };

  return (
    <DragNDrop
      accept={ACCEPT}
      onDrop={onDrop}
      cssClass="drop-file"
      text={t(`watchPartyFile.${files ? 'dropNew' : 'drop'}`)}
      validate={
        <MediaValidation
          files={files}
          onValid={onValid}
          cssClass="file-validation"
        />
      }
    />
  );
};

export default FileShare;
