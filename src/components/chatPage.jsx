import { useState, useRef, useEffect } from 'react';

const BASE_URL = 'http://192.168.1.136:8000';

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes pulse {
    0%, 60%, 100% {
      transform: scale(1);
      opacity: 0.4;
    }
    30% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);

const styles = {
    container: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ebf8ff 0%, #d1fae5 50%, #bfdbfe 100%)',
    },
    chatBox: {
        position: 'relative',
        width: '100%',
        maxWidth: '32rem',
        height: '90vh',
        margin: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)',
        boxShadow: '0 10px 32px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '1rem 0',
        color: '#2563eb',
        borderBottom: '1px solid #e5e7eb',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        background: '#fff',
        borderRadius: '1rem',
        margin: '1rem',
        border: '1px solid #f3f4f6',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    messageRow: {
        display: 'flex',
    },
    userMsg: {
        maxWidth: '16rem',
        padding: '0.5rem 1rem',
        borderRadius: '1rem 1rem 0 1rem',
        background: '#3b82f6',
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        alignSelf: 'flex-end',
    },
    botMsg: {
        maxWidth: '16rem',
        padding: '0.5rem 1rem',
        borderRadius: '1rem 1rem 1rem 0',
        background: '#34d399',
        color: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        alignSelf: 'flex-start',
    },
    botTyping: {
        maxWidth: '16rem',
        padding: '0.75rem 1rem',
        borderRadius: '1rem 1rem 1rem 0',
        background: '#f3f4f6',
        color: '#6b7280',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        fontStyle: 'italic',
        alignSelf: 'flex-start',
        opacity: 0.8,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    typingDots: {
        display: 'flex',
        gap: '0.25rem',
    },
    dot: {
        width: '0.375rem',
        height: '0.375rem',
        borderRadius: '50%',
        background: '#9ca3af',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    dot1: { animationDelay: '0s' },
    dot2: { animationDelay: '0.5s' },
    dot3: { animationDelay: '1s' },
    form: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '91%',
        padding: '1rem 1.5rem',
        background: 'linear-gradient(90deg, #f0f9ff 0%, #ecfdf5 100%)',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '0.75rem',
    },
    input: {
        flex: 1,
        padding: '0.75rem',
        borderRadius: '1rem',
        border: '1px solid #d1d5db',
        outline: 'none',
        background: '#f9fafb',
        fontSize: '1rem',
    },
    inputFocus: {
        border: '1px solid #2563eb',
        boxShadow: '0 0 0 2px #60a5fa',
    },
    button: {
        padding: '0.75rem 1.5rem',
        borderRadius: '1rem',
        background: 'linear-gradient(90deg, #2563eb 0%, #34d399 100%)',
        color: '#fff',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
};

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const messagesEndRef = useRef(null);

    const handleSend = async (e) => {
        e.preventDefault();
        if (input.trim() === '' || loading) return;

        const userMessage = input.trim();
        const userMsg = { text: userMessage, id: Date.now(), sender: 'user' };
        
        // Add user message immediately
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            console.log('Sending message:', userMessage);
            
            const res = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    query: userMessage,
                    collection_name: "Resume" // Using the correct collection name with capital R
                }),
            });
            
            console.log('Response status:', res.status);
            
            if (!res.ok) {
                const errorText = await res.text();
                console.log('Error response body:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                    console.log('Parsed error data:', errorData);
                } catch (e) {
                    console.log('Could not parse error as JSON');
                }
                
                throw new Error(`Server error: ${res.status} - ${errorData?.detail || errorText || 'Unknown error'}`);
            }
            
            const data = await res.json();
            console.log('Success response:', data);
            
            const botMsg = { 
                text: data.response || data.message || data.reply || data.text || data.answer || 'Sorry, I received an empty response.', 
                id: Date.now() + 1, 
                sender: 'bot' 
            };
            setMessages(prev => [...prev, botMsg]);
            
        } catch (err) {
            console.error('Chat error:', err);
            
            // Show the actual error message for debugging
            const errorMsg = {
                text: `Error: ${err.message}`,
                id: Date.now() + 2,
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    return (
        <div style={styles.container}>
            <div style={styles.chatBox}>
                <h2 style={styles.header}>Chat with Bot</h2>
                <div style={styles.messages}>
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            style={{
                                ...styles.messageRow,
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div style={msg.sender === 'user' ? styles.userMsg : styles.botMsg}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                            <div style={styles.botTyping}>
                                <span>Bot is typing</span>
                                <div style={styles.typingDots}>
                                    <div style={{ ...styles.dot, ...styles.dot1 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot2 }}></div>
                                    <div style={{ ...styles.dot, ...styles.dot3 }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form
                    onSubmit={handleSend}
                    style={styles.form}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        style={{
                            ...styles.input,
                            ...(inputFocused ? styles.inputFocus : {}),
                        }}
                        disabled={loading}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                    />
                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {}),
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;