/**
 * Catalog Chatbot Functionality
 * 
 * This script implements the functionality for the university catalog chatbot,
 * including toggling the chat window, sending messages, and displaying responses.
 */

document.addEventListener('DOMContentLoaded', initChatbot);

function initChatbot() {
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
        isExpanded: false
    };
    
    chatBubble.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', handleKeyPress);
    
    closeButtonExpanded.addEventListener('click', toggleChat);
    sendButtonExpanded.addEventListener('click', sendExpandedMessage);
    messageInputExpanded.addEventListener('keypress', handleExpandedKeyPress);
    
    addMessage('Hello! I\'m your catalog assistant. How can I help you today?', 'ai');
    
    /**
     * Toggle chat window visibility
     */
    function toggleChat() {
        state.isOpen = !state.isOpen;
        
        if (state.isOpen) {
            const hasLongMessage = state.messages.some(msg => msg.text.length > 100);
            
            if (hasLongMessage) {
                document.getElementById('chatWindowExpanded').style.display = 'flex';
                document.getElementById('chatWindow').style.display = 'none';
                document.getElementById('chatMessagesExpanded').innerHTML = chatMessages.innerHTML;
                document.getElementById('messageInputExpanded').focus();
                console.log('Showing expanded chat window');
            } else {
                document.getElementById('chatWindow').style.display = 'flex';
                document.getElementById('chatWindowExpanded').style.display = 'none';
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
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;
        
        addMessage(text, 'user');
        messageInput.value = '';
        
        setTimeout(() => {
            addMessage('That sounds great!', 'ai');
        }, 500);
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
        
        if (hasLongMessage) {
            regularChatWindow.style.display = 'none';
            expandedChatWindow.style.display = 'flex';
            
            const expandedMessages = document.getElementById('chatMessagesExpanded');
            expandedMessages.innerHTML = chatMessages.innerHTML;
            
            console.log('Chat window expanded due to long message');
        } else {
            regularChatWindow.style.display = 'flex';
            expandedChatWindow.style.display = 'none';
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
    function sendExpandedMessage() {
        const text = document.getElementById('messageInputExpanded').value.trim();
        if (text === '') return;
        
        addMessage(text, 'user');
        document.getElementById('messageInputExpanded').value = '';
        
        setTimeout(() => {
            addMessage('That sounds great!', 'ai');
        }, 500);
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
