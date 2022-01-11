import React, { useState, ReactElement, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { FileState, fileuploadAsync } from './fileSlice';

const style = {
  width: 200,
  height: 150,
  border: "1px dotted #888"
};

export const FileDropZone: React.FC = ():ReactElement => {
  const dispatch = useAppDispatch();
  const selector = useAppSelector<FileState>((state) => state.file);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: (acceptedFiles) => {
    // Do something with the files
    dispatch(fileuploadAsync({files: acceptedFiles}));
    console.log('acceptedFiles:', acceptedFiles);
} });

  return (
    <article>
      <h2>ファイルアップロード</h2>
      <div {...getRootProps()} style={style}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
            }
        </div>
    </article>
  );
}