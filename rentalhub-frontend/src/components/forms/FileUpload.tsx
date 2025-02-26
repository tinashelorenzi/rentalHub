// src/components/forms/FileUpload.tsx
import React, { useState, useRef } from 'react';
import Button from '../common/Button';

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  error?: string;
  hint?: string;
  onChange?: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  maxSize = 5, // Default 5MB
  error: externalError,
  hint,
  onChange,
}) => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const validateFiles = (fileList: FileList) => {
    const validFiles: File[] = [];
    let errorMsg = '';

    Array.from(fileList).forEach(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errorMsg = `File "${file.name}" exceeds the maximum size of ${maxSize}MB.`;
        return;
      }

      // Check file type if accept is specified
      if (accept) {
        const fileType = file.type;
        const acceptTypes = accept.split(',').map(type => type.trim());
        const isValidType = acceptTypes.some(type => {
          if (type.startsWith('.')) {
            // Check file extension
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          } else {
            // Check MIME type
            return fileType.match(new RegExp(type.replace('*', '.*')));
          }
        });

        // src/components/forms/FileUpload.tsx (continued)
        if (!isValidType) {
          errorMsg = `File "${file.name}" has an invalid file type. Accepted types: ${accept}`;
          return;
        }
      }

      validFiles.push(file);
    });

    return { validFiles, errorMsg };
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = e.dataTransfer.files;
      handleFiles(fileList);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const { validFiles, errorMsg } = validateFiles(fileList);

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setError('');
    
    const newFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(newFiles);
    
    if (onChange) {
      onChange(newFiles);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    if (onChange) {
      onChange(newFiles);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center ${
          dragging ? 'border-primary bg-primary/5' : 'border-gray-300'
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
        />
        
        <div className="py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your {multiple ? 'files' : 'file'} here
          </p>
          
          <p className="text-xs text-gray-500 mb-3">
            {accept ? `Accepted formats: ${accept}` : 'All file types supported'} (Max: {maxSize}MB)
          </p>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBrowseClick}
          >
            Browse Files
          </Button>
        </div>
      </div>
      
      {(error || externalError) && (
        <p className="mt-1 text-sm text-red-600">{error || externalError}</p>
      )}
      
      {hint && !error && !externalError && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
      
      {files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected {multiple ? 'Files' : 'File'}:</p>
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md overflow-hidden">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between px-4 py-2 text-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-gray-500 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;