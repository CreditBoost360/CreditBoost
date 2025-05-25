import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import TransactionUploader from '@/components/Common/TransactionUploader';

const UploadData = () => {
    const navigate = useNavigate();

    const handleSuccess = (uploadId) => {
        navigate(`/transactions/${uploadId}`);
    };

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto max-w-2xl p-6">
                <TransactionUploader 
                    onClose={() => navigate('/transactions')}
                    onSuccess={handleSuccess}
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default UploadData;