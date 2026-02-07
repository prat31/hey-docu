import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload as UploadIcon, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Upload({ onUploadComplete }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file) => {
        const validExtensions = ['.txt', '.pdf', '.docx', '.md', '.csv'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setStatus('error');
            setMessage('Unsupported file type. Supported: .txt, .pdf, .docx, .md, .csv');
            return;
        }

        setStatus('uploading');
        setMessage('Uploading...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { task_id } = response.data;
            setStatus('processing');
            setMessage('Processing document...');
            pollTaskStatus(task_id);

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Upload failed. Check backend.');
        }
    };

    const pollTaskStatus = async (taskId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${API_URL}/api/task/${taskId}`);
                const { status } = response.data;

                if (status === 'SUCCESS') {
                    clearInterval(interval);
                    setStatus('success');
                    setMessage('Document ingested successfully!');
                    if (onUploadComplete) onUploadComplete();
                    setTimeout(() => setStatus('idle'), 3000);
                } else if (status === 'FAILURE') {
                    clearInterval(interval);
                    setStatus('error');
                    setMessage('Processing failed.');
                }
            } catch (error) {
                clearInterval(interval);
                setStatus('error');
            }
        }, 1000);
    };

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed transition-all duration-300 backdrop-blur-sm",
                    isDragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50",
                    status === 'error' && "border-destructive/50 bg-destructive/5",
                    status === 'success' && "border-green-500/50 bg-green-500/5"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChange}
                    accept=".txt, .pdf, .docx, .md, .csv"
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {status === 'idle' || status === 'error' ? (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center gap-2 text-muted-foreground"
                        >
                            <UploadIcon className="w-8 h-8 group-hover:text-primary transition-colors" />
                            <p className="text-sm font-medium">Drop PDF, TXT, DOCX, CSV here</p>
                            {status === 'error' && <p className="text-xs text-destructive">{message}</p>}
                        </motion.div>
                    ) : status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-2 text-green-500"
                        >
                            <CheckCircle className="w-8 h-8" />
                            <p className="text-sm font-medium">{message}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-2 text-primary"
                        >
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-medium">{message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
