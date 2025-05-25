import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from 'lucide-react';

const PhotoUpload = ({ currentPhoto, onPhotoChange }) => {
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      onPhotoChange(file);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      onPhotoChange(file);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
  };
  
  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Profile Preview" 
            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-md"
          />
          <button
            onClick={handleRemovePhoto}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Camera className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your photo here, or click to select
          </p>
        </div>
      )}
      
      <div className="flex justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current.click()}
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          {previewUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>
      </div>
    </div>
  );
};

export default PhotoUpload;