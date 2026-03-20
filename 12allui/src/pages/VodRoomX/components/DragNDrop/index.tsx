import React, {FC} from 'react';
import './styles.scss';
import {useDropzone} from 'react-dropzone';
import {IonText} from '@ionic/react';

interface DragNDropProps {
  accept: string;
  onDrop: (files: File[]) => void;
  text: string;
  validate?: JSX.Element;
  cssClass?: string;
}

const DragNDrop: FC<DragNDropProps> = ({accept, onDrop, text, validate, cssClass}: DragNDropProps) => {
  const cClass = cssClass ? `dropzone-container ${cssClass}` : 'dropzone-container';

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept,
    onDrop: (files: File[]) => {
      if (files.length) {
        onDrop(files);
      }
    }
  });

  return (
    <section className={cClass}>
      <div {...getRootProps({className: isDragActive ? 'dropzone active' : 'dropzone'})}>
        <input {...getInputProps()} />
        <IonText className="drop-text">{text}</IonText>
        {validate}
      </div>
    </section>
  )
};

export default DragNDrop;
