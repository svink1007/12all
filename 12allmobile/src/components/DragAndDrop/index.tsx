import { useState, DragEvent, FC, useRef } from "react";
import "./styles.scss"; // Make sure to create a corresponding CSS file
import { IonImg } from "@ionic/react";

import Upload from "../../images/create-room/upload.svg";

type Props = {
  onLogoSelected: (logo: File | null) => void;
};

const DragAndDrop: FC<Props> = ({ onLogoSelected }) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragOver) {
      setDragOver(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    onLogoSelected(e.dataTransfer.files[0]);
    processFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onLogoSelected(files[0]);
      processFiles(files);
    }
  };

  const processFiles = (files: FileList) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="dropzone-container" onClick={handleClick}>
      <div className={`dropzone ${dragOver ? "over" : ""}`}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {previewSrc ? (
            <img src={previewSrc} alt="Preview" className="preview-image" />
          ) : (
            <p>Drag files here to upload</p>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: "none" }} // Hide the file input element
      />
      <div className="upload-img">
        <IonImg src={Upload} />
      </div>
    </div>
  );
};

export default DragAndDrop;
