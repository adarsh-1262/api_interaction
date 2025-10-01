import React, { useState, useEffect } from 'react';

const BASE_URL = 'http://192.168.1.136:8000';

const CollectionsPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch collections from API
    const fetchCollections = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_URL}/collections`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            let collectionsArray = [];
            if (Array.isArray(data)) {
                collectionsArray = data;
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.collections)) {
                    collectionsArray = data.collections;
                } else if (Array.isArray(data.data)) {
                    collectionsArray = data.data;
                } else {
                    // If it's an object with collection names as keys
                    collectionsArray = Object.keys(data).map(key => ({
                        name: key,
                        ...(typeof data[key] === 'object' ? data[key] : {})
                    }));
                }
            }
            
            console.log('API Response:', data);
            console.log('Processed collections:', collectionsArray);
            setCollections(collectionsArray);
        } catch (err) {
            setError(`Failed to fetch collections: ${err.message}`);
            console.error('Error fetching collections:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete a collection
    const deleteCollection = async (collectionName) => {
        if (!window.confirm(`Are you sure you want to delete the collection "${collectionName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/collections/${encodeURIComponent(collectionName)}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            setCollections(prev => prev.filter(collection => collection.name !== collectionName));
            alert(`Collection "${collectionName}" deleted successfully!`);
        } catch (err) {
            setError(`Failed to delete collection: ${err.message}`);
            console.error('Error deleting collection:', err);
        }
    };

    // Load collections on component mount and set up auto-refresh every 5 seconds
    useEffect(() => {
        fetchCollections();
        
        // Set up auto-refresh every 5 seconds
        const interval = setInterval(() => {
            fetchCollections();
        }, 5000); // 5 seconds
        
        // Cleanup interval on component unmount
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Collections</h1>
            </div>

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {loading && collections.length === 0 ? (
                <div style={styles.loading}>Loading collections...</div>
            ) : (
                <div style={styles.collectionsGrid}>
                    {(!Array.isArray(collections) || collections.length === 0) ? (
                        <div style={styles.noCollections}>
                            No collections found.
                        </div>
                    ) : (
                        collections.map((collection, index) => {
                            // Get collection name from various possible fields
                            const collectionName = collection.name || 
                                                  collection.collection_name || 
                                                  collection.id || 
                                                  collection.title ||
                                                  (typeof collection === 'string' ? collection : `Collection ${index + 1}`);
                            
                            return (
                            <div key={index} style={styles.collectionCard}>
                                <div style={styles.collectionInfo}>
                                    <h3 style={styles.collectionName}>
                                        {collectionName}
                                    </h3>
                                    {collection.document_count !== undefined && (
                                        <p style={styles.documentCount}>
                                            Documents: {collection.document_count}
                                        </p>
                                    )}
                                    {collection.created_at && (
                                        <p style={styles.createdAt}>
                                            Created: {new Date(collection.created_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteCollection(collectionName)}
                                    style={styles.deleteButton}
                                    title="Delete Collection"
                                >
                                    Delete
                                </button>
                            </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #eee',
    },
    title: {
        margin: 0,
        color: '#333',
        fontSize: '2rem',
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid #f5c6cb',
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px',
        color: '#666',
    },
    collectionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    noCollections: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px',
        color: '#666',
        gridColumn: '1 / -1',
    },
    collectionCard: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    collectionInfo: {
        marginBottom: '15px',
    },
    collectionName: {
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '1.2rem',
        wordBreak: 'break-word',
    },
    documentCount: {
        margin: '5px 0',
        color: '#666',
        fontSize: '14px',
    },
    createdAt: {
        margin: '5px 0',
        color: '#666',
        fontSize: '14px',
    },
    deleteButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        alignSelf: 'flex-start',
        transition: 'background-color 0.3s ease',
    },
};

export default CollectionsPage;
