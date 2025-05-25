import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Icon } from '@iconify/react';
import { AlertCircle, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SimpleProgress from '@/components/Common/SimpleProgress';

/**
 * Enhanced file uploader component with drag and drop, progress, and validation
 */
const FileUploader = ({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  onFileSelect,
  onFileRemove,
  error,
  value,
  disabled = false,
  uploading = false,
  progress = 0,
  allowedFormats = [],
  className = '',
  ...props
}) => {
  const [fileError, setFileError] = useState(null);
  
  const validateFile = useCallback((file) => {
    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
    }
    
    // Check file type if accept is provided
    if (accept) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Check if the file type is in the accept list
      const acceptedTypes = Object.keys(accept).flatMap(type => 
        accept[type].map(ext => ext.toLowerCase().replace('.', ''))
      );
      
      if (!acceptedTypes.includes(fileExtension) && !Object.keys(accept).includes(fileType)) {
        throw new Error(`Invalid file type. Allowed formats: ${allowedFormats.join(', ')}`);
      }
    }
    
    return true;
  }, [accept, maxSize, allowedFormats]);
  
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length) {
      try {
        const file = acceptedFiles[0];
        validateFile(file);
        setFileError(null);
        onFileSelect(file);
      } catch (error) {
        setFileError(error.message);
      }
    }
  }, [onFileSelect, validateFile]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled,
    maxSize,
  });
  
  const handleRemove = (e) => {
    e.stopPropagation();
    onFileRemove();
    setFileError(null);
  };
  
  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${value ? 'bg-primary/5' : 'hover:bg-accent'}
          ${error || fileError ? 'border-red-500' : ''}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          touch:hover:bg-transparent
          touch:active:bg-accent/50
          touch:transition-none
          ${className}
        `}
        role="button"
        tabIndex="0"
        aria-label="Upload file"
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          {uploading ? (
            <div className="space-y-4">
              <Icon
                icon="mdi:loading"
                className="w-12 h-12 mx-auto mb-4 text-primary animate-spin"
              />
              <p className="text-sm font-medium">Uploading file...</p>
              <SimpleProgress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          ) : value ? (
            <div className="relative">
              <div className="flex items-center justify-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-6 w-6 rounded-full bg-muted"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
              <p className="text-sm font-medium">{value.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(value.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <Icon
                icon={isDragReject ? "mdi:alert-circle" : "mdi:upload"}
                className={`w-12 h-12 mx-auto mb-4 
                  ${isDragReject || error || fileError ? 'text-red-500' : 'text-muted-foreground'}
                `}
              />
              <p className="text-sm font-medium">
                <span className="hover-device:inline touch:hidden">Drop your file here, or </span>
                click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {allowedFormats.length > 0 ? (
                  <>Accepts {allowedFormats.join(', ')} files</>
                ) : (
                  <>Upload your file</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {(error || fileError) && (
        <div className="flex items-center text-red-500 text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{error || fileError}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;