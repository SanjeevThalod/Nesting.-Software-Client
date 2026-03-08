import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

function FileUpload({ onFileSelect, file }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.name.toLowerCase().endsWith('.dxf')) {
        onFileSelect(selectedFile);
      } else {
        alert('Please upload a .dxf file');
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dxf': ['.dxf'],
      'application/x-dxf': ['.dxf'],
      'image/vnd.dxf': ['.dxf']
    },
    multiple: false
  });

  return (
    <div className="file-upload-container">
      <h2>📁 Upload DXF File</h2>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="file-info">
            <div className="file-icon">✓</div>
            <div className="file-details">
              <strong>{file.name}</strong>
              <span>{(file.size / 1024).toFixed(2)} KB</span>
            </div>
            <button
              className="remove-button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="upload-icon">📤</div>
            <p>
              {isDragActive
                ? 'Drop the DXF file here...'
                : 'Drag & drop a DXF file here, or click to select'}
            </p>
            <span className="hint">Supports .dxf files only</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
