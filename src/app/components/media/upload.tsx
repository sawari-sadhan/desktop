"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, X, Image as ImageIcon, File as FileIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface MediaUploaderProps {
  onUpload?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function MediaUploader({ 
  onUpload, 
  maxFiles = 5, 
  maxSizeMB = 10, 
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"] 
}: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (newFiles: File[]): File[] => {
    setError(null);
    const validFiles: File[] = [];
    let hasError = false;

    if (files.length + newFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`);
      hasError = true;
    }

    const isFileTypeAccepted = (file: File): boolean => {
      if (acceptedTypes.length === 0) return true;
      if (file.type && acceptedTypes.includes(file.type)) return true;
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext) {
        if (ext === "avif" && (acceptedTypes.includes("image/avif") || acceptedTypes.includes(".avif"))) return true;
        if ((ext === "jpg" || ext === "jpeg") && (acceptedTypes.includes("image/jpeg") || acceptedTypes.includes(".jpg") || acceptedTypes.includes(".jpeg"))) return true;
        if (ext === "png" && (acceptedTypes.includes("image/png") || acceptedTypes.includes(".png"))) return true;
        if (ext === "webp" && (acceptedTypes.includes("image/webp") || acceptedTypes.includes(".webp"))) return true;
        if (ext === "gif" && (acceptedTypes.includes("image/gif") || acceptedTypes.includes(".gif"))) return true;
        if (ext === "svg" && (acceptedTypes.includes("image/svg+xml") || acceptedTypes.includes(".svg"))) return true;
      }
      return false;
    };

    for (const file of newFiles) {
      if (!isFileTypeAccepted(file)) {
        setError(`Invalid file type: ${file.name}. Accepted types: ${acceptedTypes.join(", ")}`);
        hasError = true;
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`);
        hasError = true;
        continue;
      }
      validFiles.push(file);
    }

    if (hasError && validFiles.length === 0) return [];
    return validFiles.slice(0, maxFiles - files.length);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(newFiles);
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    }
  }, [files.length, maxFiles, maxSizeMB, acceptedTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      const validFiles = validateFiles(newFiles);
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length > 0 && onUpload) {
      onUpload(files);
      // Optional: Clear files after upload if desired
      // setFiles([]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      <div 
        className={`relative w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center ${
          dragActive 
            ? "border-blue-500 bg-blue-50 scale-[1.02]" 
            : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          multiple
          accept={[...acceptedTypes, ".avif"].join(",")}
          className="hidden" 
          onChange={handleChange} 
        />
        
        <div className="w-16 h-16 mb-4 rounded-full bg-white flex items-center justify-center border border-slate-200">
          <UploadCloud className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
        </div>
        
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Click or drag files to upload
        </h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
          {acceptedTypes.length > 0 ? "Images & Media" : "Any files"} • up to {maxSizeMB}MB
        </p>

        {dragActive && (
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <p className="text-xl font-black text-blue-600 uppercase tracking-widest">Drop here</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-700 leading-tight">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                Selected Files ({files.length}/{maxFiles})
              </h4>
              {files.length > 0 && (
                <button 
                  onClick={() => setFiles([])}
                  className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {files.map((file, idx) => {
                const isImage = file.type.startsWith('image/');
                const objectUrl = isImage ? URL.createObjectURL(file) : null;
                
                return (
                  <motion.div 
                    key={`${file.name}-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {objectUrl ? (
                        <img src={objectUrl} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        {formatSize(file.size)}
                      </p>
                    </div>

                    <button 
                      onClick={() => removeFile(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="pt-4">
              <button 
                onClick={handleUpload}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
