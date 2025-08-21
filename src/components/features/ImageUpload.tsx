import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Error as ErrorIcon,
  Cancel,
  PhotoCamera
} from '@mui/icons-material';

interface ImageUploadProps {
  onFileSelect?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  preview?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragCounter, setDragCounter] = useState(0);

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        );
      } else {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, progress }
              : f
          )
        );
      }
    }, 300);
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        continue;
      }
      
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        continue;
      }
      
      validFiles.push(file);
      
      if (validFiles.length >= maxFiles) {
        break;
      }
    }

    // Create uploaded file objects
    const newUploadedFiles: UploadedFile[] = await Promise.all(
      validFiles.map(async (file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'uploading' as const,
        progress: 0,
        preview: await createFilePreview(file)
      }))
    );

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    
    // Simulate upload for each file
    newUploadedFiles.forEach(({ id }) => {
      simulateUpload(id);
    });

    onFileSelect?.(validFiles);
  }, [acceptedTypes, maxSize, maxFiles, onFileSelect]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 text-display mb-2">
            Upload DGA Images
          </h1>
          <p className="text-gray-600 text-lg">
            Upload Duval Triangle images for automated gas analysis
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className={`relative h-80 border-2 border-dashed rounded-3xl overflow-hidden transition-all duration-300 ${
              isDragging 
                ? 'border-primary-accent bg-primary-50 scale-105' 
                : 'border-gray-300 bg-white/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Animated Background Pattern */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                background: isDragging 
                  ? "radial-gradient(circle at center, #667eea 0%, transparent 70%)"
                  : "none"
              }}
            />

            {/* Upload Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-8">
              <motion.div
                animate={{ 
                  y: isDragging ? -10 : 0,
                  rotate: isDragging ? 5 : 0,
                  scale: isDragging ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mb-6"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  isDragging 
                    ? 'bg-primary-accent text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <motion.div
                    animate={{ rotate: isDragging ? 360 : 0 }}
                    transition={{ duration: 2, repeat: isDragging ? Infinity : 0 }}
                  >
                    <CloudUpload className="w-10 h-10" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h3
                className="text-2xl font-semibold mb-2"
                animate={{ 
                  color: isDragging ? "#667eea" : "#374151" 
                }}
              >
                {isDragging ? "Drop your Duval Triangle images" : "Upload DGA Images"}
              </motion.h3>

              <p className="text-gray-500 text-center mb-6">
                Drag and drop your images here, or click to browse
                <br />
                <span className="text-sm">
                  Supports PNG, JPG up to {maxSize}MB • Max {maxFiles} files
                </span>
              </p>

              <motion.label
                htmlFor="file-upload"
                className="btn-awwwards cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhotoCamera className="w-5 h-5 mr-2" />
                Choose Files
              </motion.label>

              <input
                id="file-upload"
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* Uploaded Files List */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-glass p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <InsertDriveFile className="w-6 h-6 mr-2 text-primary-accent" />
                Uploaded Files ({uploadedFiles.length})
              </h3>

              <div className="space-y-4">
                {uploadedFiles.map((uploadedFile, index) => (
                  <motion.div
                    key={uploadedFile.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl"
                  >
                    {/* File Preview */}
                    <div className="flex-shrink-0">
                      {uploadedFile.preview ? (
                        <img
                          src={uploadedFile.preview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <InsertDriveFile className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>

                      {/* Progress Bar */}
                      {uploadedFile.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Uploading...</span>
                            <span>{Math.round(uploadedFile.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <motion.div
                              className="bg-primary-accent h-1.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadedFile.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {uploadedFile.status === 'uploading' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-primary-accent border-t-transparent rounded-full"
                        />
                      )}
                      {uploadedFile.status === 'completed' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </motion.div>
                      )}
                      {uploadedFile.status === 'error' && (
                        <ErrorIcon className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Cancel className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <motion.button
                  className="px-6 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUploadedFiles([])}
                >
                  Clear All
                </motion.button>
                <motion.button
                  className="btn-awwwards"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={uploadedFiles.some(f => f.status === 'uploading')}
                >
                  Start Analysis
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageUpload; 