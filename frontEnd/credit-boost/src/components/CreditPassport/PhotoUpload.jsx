import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Camera, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

const PhotoUpload = ({ currentPhoto, onPhotoChange, className = "" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentPhoto || null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process the selected file
  const handleFile = (file) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file (jpg, png, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Simulate upload process
    setUploading(true);
    
    // In a real app, you would upload the file to your server here
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
      
      // Call the parent component's callback with the file
      if (onPhotoChange) {
        onPhotoChange(file);
      }
    }, 1500);
  };

  // Trigger file input click
  const onButtonClick = () => {
    inputRef.current.click();
  };

  // Remove current photo
  const removePhoto = () => {
    setPreviewUrl(null);
    if (onPhotoChange) {
      onPhotoChange(null);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="mb-2 flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Passport Photo</label>
        {previewUrl && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={removePhoto}
            className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X size={16} className="mr-1" />
            Remove
          </Button>
        )}
      </div>
      
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={previewUrl} 
            alt="User photo" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
            <p className="text-white text-xs">Click Remove to change your photo</p>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-blue-100">
              <Camera size={24} className="text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Drag and drop your photo here</p>
              <p className="text-xs text-gray-500 mt-1">or</p>
            </div>
            <Button 
              type="button"
              onClick={onButtonClick}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Upload size={16} />
                  </motion.div>
                  Uploading...
                </>
              ) : uploadSuccess ? (
                <>
                  <Check size={16} className="mr-2 text-green-500" />
                  Uploaded!
                </>
              ) : (
                <>
                  <ImageIcon size={16} className="mr-2" />
                  Browse Files
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max. 5MB)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;