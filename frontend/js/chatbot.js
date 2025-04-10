/**
 * Catalog Chatbot Functionality
 * 
 * This script implements the functionality for the university catalog chatbot,
 * including toggling the chat window, sending messages, and displaying responses
 * from the OpenAI Assistants API.
 */

document.addEventListener('DOMContentLoaded', initChatbot);

function initChatbot() {
    const API_URL = 'http://localhost:3000/api';
    
    const chatBubble = document.getElementById('chatBubble');
    const chatWindow = document.getElementById('chatWindow');
    const chatWindowExpanded = document.getElementById('chatWindowExpanded');
    const closeButton = document.getElementById('closeButton');
    const closeButtonExpanded = document.getElementById('closeButtonExpanded');
    const messageInput = document.getElementById('messageInput');
    const messageInputExpanded = document.getElementById('messageInputExpanded');
    const sendButton = document.getElementById('sendButton');
    const sendButtonExpanded = document.getElementById('sendButtonExpanded');
    const chatMessages = document.getElementById('chatMessages');
    const chatMessagesExpanded = document.getElementById('chatMessagesExpanded');
    
    const state = {
        messages: [],
        isOpen: false,
        isExpanded: false,
        threadId: null,
        isTyping: false
    };
    
    chatBubble.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', handleKeyPress);
    
    closeButtonExpanded.addEventListener('click', toggleChat);
    sendButtonExpanded.addEventListener('click', sendExpandedMessage);
    messageInputExpanded.addEventListener('keypress', handleExpandedKeyPress);
    
    createThread().then(() => {
        addMessage('Hello! I\'m your catalog assistant. How can I help you today?', 'ai');
    }).catch(error => {
        console.error('Error initializing chatbot:', error);
        addMessage('Sorry, I\'m having trouble connecting to the assistant. Please try again later.', 'ai');
    });
    
    /**
     * Create a new thread for the conversation
     * @returns {Promise} Promise that resolves when the thread is created
     */
    async function createThread() {
        try {
            const response = await fetch(`${API_URL}/threads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to create thread: ${response.status}`);
            }
            
            const data = await response.json();
            state.threadId = data.threadId;
            console.log('Thread created:', state.threadId);
            
            sessionStorage.setItem('chatThreadId', state.threadId);
            
            return state.threadId;
        } catch (error) {
            console.error('Error creating thread:', error);
            throw error;
        }
    }
    
    /**
     * Toggle chat window visibility
     */
    function toggleChat() {
        state.isOpen = !state.isOpen;
        
        if (state.isOpen) {
            const hasLongMessage = state.messages.some(msg => msg.text.length > 100);
            
            if (hasLongMessage) {
                const expandedWindow = document.getElementById('chatWindowExpanded');
                expandedWindow.setAttribute('style', 'display: flex !important');
                document.getElementById('chatWindow').style.display = 'none';
                document.getElementById('chatMessagesExpanded').innerHTML = chatMessages.innerHTML;
                document.getElementById('messageInputExpanded').focus();
                console.log('Showing expanded chat window');
            } else {
                document.getElementById('chatWindow').style.display = 'flex';
                const expandedWindow = document.getElementById('chatWindowExpanded');
                expandedWindow.setAttribute('style', 'display: none !important');
                document.getElementById('messageInput').focus();
                console.log('Showing regular chat window');
            }
            
            chatBubble.style.display = 'none';
        } else {
            document.getElementById('chatWindow').style.display = 'none';
            document.getElementById('chatWindowExpanded').style.display = 'none';
            chatBubble.style.display = 'flex';
        }
    }
    
    /**
     * Send a message from the user and get AI response
     */
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '' || state.isTyping) return;
        
        addMessage(text, 'user');
        messageInput.value = '';
        
        await sendMessageToAPI(text);
    }
    
    /**
     * Send a message to the API and process the response
     * @param {string} text - Message content
     */
    async function sendMessageToAPI(text) {
        if (!state.threadId) {
            console.error('No thread ID available');
            addMessage('Sorry, I\'m having trouble connecting to the assistant. Please try again later.', 'ai');
            return;
        }
        
        try {
            showTypingIndicator();
            
            const messageResponse = await fetch(`${API_URL}/threads/${state.threadId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });
            
            if (!messageResponse.ok) {
                throw new Error(`Failed to add message: ${messageResponse.status}`);
            }
            
            const runResponse = await fetch(`${API_URL}/threads/${state.threadId}/runs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!runResponse.ok) {
                throw new Error(`Failed to run assistant: ${runResponse.status}`);
            }
            
            const reader = runResponse.body.getReader();
            const decoder = new TextDecoder();
            let responseText = '';
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const eventData = JSON.parse(line.substring(6));
                            
                            if (eventData.type === 'textDelta' && eventData.delta.value) {
                                responseText += eventData.delta.value;
                                updateTypingIndicator(responseText);
                            } else if (eventData.type === 'end') {
                                hideTypingIndicator();
                                if (responseText) {
                                    addMessage(responseText, 'ai');
                                }
                            } else if (eventData.type === 'error') {
                                console.error('Stream error:', eventData.error);
                                hideTypingIndicator();
                                addMessage('Sorry, I encountered an error while processing your request.', 'ai');
                            }
                        } catch (e) {
                            console.error('Error parsing event data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            addMessage('Sorry, I encountered an error while processing your request.', 'ai');
        }
    }
    
    /**
     * Show typing indicator in the chat
     */
    function showTypingIndicator() {
        state.isTyping = true;
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai-message typing-indicator';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        
        chatMessages.appendChild(typingIndicator);
        
        const expandedMessages = document.getElementById('chatMessagesExpanded');
        if (expandedMessages) {
            const expandedTypingIndicator = typingIndicator.cloneNode(true);
            expandedTypingIndicator.id = 'typingIndicatorExpanded';
            expandedMessages.appendChild(expandedTypingIndicator);
        }
        
        scrollToBottom();
    }
    
    /**
     * Update typing indicator with partial response
     * @param {string} text - Partial response text
     */
    function updateTypingIndicator(text) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.textContent = text;
            typingIndicator.className = 'message ai-message';
        }
        
        const expandedTypingIndicator = document.getElementById('typingIndicatorExpanded');
        if (expandedTypingIndicator) {
            expandedTypingIndicator.textContent = text;
            expandedTypingIndicator.className = 'message ai-message';
        }
        
        scrollToBottom();
    }
    
    /**
     * Hide typing indicator
     */
    function hideTypingIndicator() {
        state.isTyping = false;
        
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const expandedTypingIndicator = document.getElementById('typingIndicatorExpanded');
        if (expandedTypingIndicator) {
            expandedTypingIndicator.remove();
        }
    }
    
    /**
     * Add a message to the conversation
     * @param {string} text - Message content
     * @param {string} type - Message type ('user' or 'ai')
     */
    function addMessage(text, type) {
        const messageObj = {
            type: type,
            text: text,
            timestamp: Date.now()
        };
        
        state.messages.push(messageObj);
        
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        chatMessages.appendChild(message);
        
        const expandedMessages = document.getElementById('chatMessagesExpanded');
        if (expandedMessages) {
            const expandedMessage = message.cloneNode(true);
            expandedMessages.appendChild(expandedMessage);
        }
        
        checkForLongMessages();
        
        scrollToBottom();
    }
    
    /**
     * Check if any message in the conversation exceeds 100 characters
     * If so, switch to the expanded chat window
     */
    function checkForLongMessages() {
        const hasLongMessage = state.messages.some(msg => msg.text.length > 100);
        const regularChatWindow = document.getElementById('chatWindow');
        const expandedChatWindow = document.getElementById('chatWindowExpanded');
        
        if (hasLongMessage && state.isOpen) {
            regularChatWindow.style.display = 'none';
            expandedChatWindow.setAttribute('style', 'display: flex !important');
            
            const expandedMessages = document.getElementById('chatMessagesExpanded');
            expandedMessages.innerHTML = chatMessages.innerHTML;
            
            console.log('Chat window expanded due to long message');
        } else if (state.isOpen) {
            regularChatWindow.style.display = 'flex';
            expandedChatWindow.setAttribute('style', 'display: none !important');
            console.log('Chat window normal size');
        }
    }
    
    /**
     * Handle Enter key press in input field
     * @param {Event} e - Keypress event
     */
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }
    
    /**
     * Handle Enter key press in expanded window input field
     * @param {Event} e - Keypress event
     */
    function handleExpandedKeyPress(e) {
        if (e.key === 'Enter') {
            sendExpandedMessage();
        }
    }
    
    /**
     * Send a message from the expanded chat window
     */
    async function sendExpandedMessage() {
        const text = document.getElementById('messageInputExpanded').value.trim();
        if (text === '' || state.isTyping) return;
        
        addMessage(text, 'user');
        document.getElementById('messageInputExpanded').value = '';
        
        await sendMessageToAPI(text);
    }
    
    /**
     * Scroll chat messages to the bottom
     */
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        const expandedMessages = document.getElementById('chatMessagesExpanded');
        if (expandedMessages) {
            expandedMessages.scrollTop = expandedMessages.scrollHeight;
        }
    }
}
