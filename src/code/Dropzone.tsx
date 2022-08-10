import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import JSZip from 'jszip';

import './Dropzone.css';
import useStore from '../store';

export default function Dropzone() {
  const ctoModified = useStore(state => state.ctoModified);
  const ctoTextLoaded = useStore(state => state.ctoTextLoaded);
  const onDrop = useCallback((acceptedFiles: any[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onabort = () => alert('file reading was aborted')
      reader.onerror = () => alert('file reading has failed')
      reader.onload = async () => {
        const binaryStr = reader.result;
        if (file.name.endsWith('.cto')) {
          const dataView = new DataView(binaryStr as ArrayBuffer);
          const decoder = new TextDecoder('utf-8');
          const decodedString = decoder.decode(dataView);
          ctoModified(decodedString);
        }
        else {
          var new_zip = new JSZip();
          const zip = await new_zip.loadAsync(binaryStr as ArrayBuffer)
          let matchedFiles = zip.file(/.*\.cto$/);
          const ctoTexts = [];
          // do not use forEach, because we need to call an async function!
          for (let n = 0; n < matchedFiles.length; n++) {
            const filePath = matchedFiles[n].name;
            const cto = await zip.files[filePath].async('string');
            ctoTexts.push(cto);
          }
          ctoTextLoaded(ctoTexts);
        }
      }
      reader.readAsArrayBuffer(file)
    })

  }, [ctoModified, ctoTextLoaded])
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'text/plain': ['.cto'], 'application/zip': [] } })

  return (
    <div className='dropzone' {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drop a single CTO file or a ZIP file containing multiple CTO files here, or click to select files</p>
    </div>
  )
}