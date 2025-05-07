import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Icon } from '@iconify/react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { creditDataService } from '@/services/creditData.service';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
// import './uploadData.css'

const STEPS = [
    { id: 'upload', label: 'Upload File', icon: 'mdi:upload' },
    { id: 'complete', label: 'Complete', icon: 'mdi:check-circle' }
];

const StepProgress = ({ currentStep }) => {
    return (
        <div className="w-full mb-8 px-4">
            <div className="hidden md:flex justify-center gap-24"> {/* Changed to center alignment */}
                {STEPS.map((step, index) => {
                    const isActive = index <= STEPS.findIndex(s => s.id === currentStep);
                    const isCompleted = index < STEPS.findIndex(s => s.id === currentStep);
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative">
                            <div className="relative flex items-center justify-center w-full">
                                {/* Step Circle with centered number */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`relative w-12 h-12 rounded-full flex items-center justify-center z-10
                                        ${isActive ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-muted'}
                                        ${isCurrent ? 'ring-4 ring-primary/30' : ''}
                                        ${isActive ? 'glow-border' : ''}
                                        transition-all duration-300`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6 text-white" />
                                    ) : (
                                        <div className={`w-6 h-6 ${isActive ? 'text-white' : 'text-muted-foreground'} flex items-center justify-center`}>
                                            {index + 1}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Connecting Line */}
                                {index < STEPS.length - 1 && (
                                    <div className="absolute w-full h-1 left-1/2 top-1/2 -translate-y-1/2 z-0">
                                        <div className="h-full bg-muted relative overflow-hidden">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: isCompleted ? '100%' : '0%' }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute top-0 left-0 h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="mt-4 text-center"
                            >
                                <span className={`text-sm font-medium
                                    ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </span>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-4">
                {STEPS.map((step, index) => {
                    const isActive = index <= STEPS.findIndex(s => s.id === currentStep);
                    const isCompleted = index < STEPS.findIndex(s => s.id === currentStep);
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex items-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10
                                    ${isActive ? 'bg-primary shadow-md shadow-primary/20' : 'bg-muted'}
                                    ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                                    transition-all duration-300`}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-white" />
                                ) : (
                                    <div className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'} flex items-center justify-center`}>
                                        {index + 1}
                                    </div>
                                )}
                            </motion.div>

                            <span className={`ml-4 text-sm font-medium
                                ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>

                            {isCurrent && (
                                <div className="ml-auto flex items-center text-primary">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Current</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const UploadData = () => {
    const navigate = useNavigate();
    const [selectedSource, setSelectedSource] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentStep, setCurrentStep] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploadId, setUploadId] = useState('');

    const sources = [
        {
            id: 'mpesa',
            name: 'MPESA Statement',
            supportedFormats: ['.csv', '.xlsx', '.xls'],
            description: 'Upload your M-PESA statement to analyze your transactions'
        }
    ];

    // Add file validation for Mpesa
    const validateMpesaFile = (file) => {
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload a CSV or Excel file.');
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('File size too large. Maximum size is 5MB.');
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length) {
            try {
                const file = acceptedFiles[0];
                if (selectedSource === 'mpesa') {
                    validateMpesaFile(file);
                }
                setFile(file);
                setErrors(prev => ({ ...prev, file: null }));
            } catch (error) {
                setErrors(prev => ({ ...prev, file: error.message }));
            }
        }
    }, [selectedSource]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        maxFiles: 1
    });

    // Add processing status messages
    const getStepMessage = (step) => {
        switch (step) {
            case 'upload':
                return 'Uploading your statement...';
            case 'complete':
                return 'Completing the upload...';
            default:
                return '';
        }
    };


    const handleSourceChange = (value) => {
        setSelectedSource(value);
        setErrors(prev => ({ ...prev, source: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            console.log("Starting submission process");
            setIsUploading(true);
            setCurrentStep('upload');

            const result = await creditDataService.uploadAndTrack(
                file,
                selectedSource,
                ({ status, step, error }) => {
                    console.log("Status update:", { status, step, error });
                    if (error) {
                        throw new Error(error);
                    }
                    setCurrentStep(status === 'completed' ? 'complete' : step);
                }
            );
            console.log(result);


            setUploadId(result.fieldId);

            console.log("Upload completed successfully");
            toast.success("Statement uploaded successfully!");
            setTimeout(() => navigate(`/credit-score/transactions/${result.fieldId}`), 1500);
        } catch (error) {
            console.error('Submission error:', error);

            if (error.status === 400 && error.details?.length > 0) {
                const newErrors = {};
                error.details.forEach(detail => {
                    if (detail.toLowerCase().includes('source')) {
                        newErrors.source = detail;
                    } else if (detail.toLowerCase().includes('file')) {
                        newErrors.file = detail;
                    } else {
                        toast.error(detail);
                    }
                });
                setErrors(newErrors);
            } else {
                toast.error(error.message || "Failed to upload statement. Please try again.");
            }

            setCurrentStep(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto max-w-2xl p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Upload M-PESA Statement</CardTitle>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/transactions')}
                                className="text-muted-foreground"
                            >
                                <Icon icon="mdi:close" className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {currentStep && (
                            <>
                                <StepProgress currentStep={currentStep} />
                                <p className="text-sm text-center text-muted-foreground mb-6">
                                    {getStepMessage(currentStep)}
                                </p>
                            </>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Source Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Statement Type
                                </label>
                                <Select
                                    value={selectedSource}
                                    onValueChange={handleSourceChange}
                                >
                                    <SelectTrigger className={errors.source ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select statement type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sources.map((source) => (
                                            <SelectItem
                                                key={source.id}
                                                value={source.id}
                                            >
                                                {source.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedSource && (
                                    <p className="text-sm text-muted-foreground">
                                        {sources.find(s => s.id === selectedSource)?.description}
                                    </p>
                                )}
                                {errors.source && (
                                    <p className="text-sm text-red-500 mt-1">{errors.source}</p>
                                )}
                            </div>

                            {/* File Dropzone */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Upload File
                                </label>
                                <div
                                    {...getRootProps()}
                                    className={`
                                        relative cursor-pointer
                                        border-2 border-dashed rounded-lg p-8
                                        transition-colors duration-200 ease-in-out
                                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
                                        ${file ? 'bg-primary/5' : 'hover:bg-accent'}
                                        ${errors.file ? 'border-red-500' : ''}
                                        touch:hover:bg-transparent
                                        touch:active:bg-accent/50
                                        touch:transition-none
                                    `}
                                    role="button"
                                    tabIndex="0"
                                    aria-label="Upload file"
                                >
                                    <input {...getInputProps()} accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                                    <div className="text-center">
                                        <Icon
                                            icon={file ? "mdi:file-check" : "mdi:upload"}
                                            className={`w-12 h-12 mx-auto mb-4 
                                                ${file ? 'text-primary' : 'text-muted-foreground'}
                                                ${errors.file ? 'text-red-500' : ''}
                                            `}
                                        />
                                        {file ? (
                                            <div>
                                                <p className="text-sm font-medium">{file.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Tap to replace
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-medium">
                                                    <span className="hover-device:inline touch:hidden">Drop your file here, or </span>
                                                    click to upload
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Accepts CSV and Excel files
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {errors.file && (
                                    <p className="text-sm text-red-500 mt-1">{errors.file}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/credit-score')}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!selectedSource || !file || isUploading}
                                    className="min-w-[100px]"
                                >
                                    {isUploading ? (
                                        <>
                                            <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default UploadData;