import React, { useState } from 'react';

const BASE_URL = 'http://192.168.1.136:8000';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setProgress(0);
        setUploadStatus('');
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadStatus('');

        try {
            const formData = new FormData();
            formData.append('files', file); // Changed from 'file' to 'files'
            formData.append('collection_name', 'Resume');

            console.log('Uploading file:', file.name);
            console.log('File size:', file.size);
            console.log('File type:', file.type);

            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            console.log('Upload response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log('Upload error response:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                    console.log('Parsed error data:', errorData);
                } catch (e) {
                    console.log('Could not parse error as JSON');
                }
                
                throw new Error(`Upload failed: ${response.status} - ${errorData?.detail || errorText || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log('Upload success:', result);
            
            setProgress(100);
            setUploadStatus('File uploaded successfully!');
            
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus(`Upload failed: ${error.message}`);
            setProgress(0);
        } finally {
            setUploading(false);
        }
    };


    return (
        <div style={{
            maxWidth: 400,
            margin: '40px auto',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: 8,
            background: '#fff'
        }}>
            <h2>Upload File</h2>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ marginBottom: 16 }}
            />
            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{
                    padding: '8px 16px',
                    marginBottom: 16,
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: !file || uploading ? 'not-allowed' : 'pointer'
                }}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <div style={{ height: 24, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                <div
                    style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: '#1976d2',
                        transition: 'width 0.2s'
                    }}
                />
            </div>
            {progress > 0 && <div style={{ marginTop: 8 }}>{progress}%</div>}
            {uploadStatus && (
                <div style={{ 
                    marginTop: 8, 
                    padding: 8, 
                    borderRadius: 4,
                    background: uploadStatus.includes('success') ? '#e8f5e8' : '#ffeaea',
                    color: uploadStatus.includes('success') ? '#2e7d32' : '#c62828',
                    fontSize: 14
                }}>
                    {uploadStatus}
                </div>
            )}
        </div>
    );
};

export default UploadPage;