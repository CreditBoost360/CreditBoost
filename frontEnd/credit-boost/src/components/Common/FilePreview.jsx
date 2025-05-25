import React from 'react';
import { Icon } from '@iconify/react';
import { getFileIcon, formatFileSize, getFileExtension } from '@/services/helpers/fileUtils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * Component to preview uploaded files
 */
const FilePreview = ({ file, onRemove, className = '' }) => {
  if (!file) return null;
  
  const fileIcon = getFileIcon(file);
  const fileSize = formatFileSize(file.size);
  const fileExt = getFileExtension(file.name).toUpperCase();
  
  return (
    <div className={`relative flex items-center p-3 bg-muted/50 rounded-lg ${className}`}>
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded">
          <Icon icon={fileIcon} className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex-grow min-w-0">
        <p className="font-medium text-sm truncate" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
          <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium mr-2">
            {fileExt}
          </span>
          <span>{fileSize}</span>
        </div>
      </div>
      
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full flex-shrink-0 ml-2"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove file</span>
        </Button>
      )}
    </div>
  );
};

export default FilePreview;