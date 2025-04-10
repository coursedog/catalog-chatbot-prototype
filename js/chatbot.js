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
    const closeButton = document.getElementById('closeButton');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    
    const state = {
        messages: [],
        isOpen: false
    };
    
    chatBubble.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', handleKeyPress);
    
    addMessage('Hello! I\'m your catalog assistant. How can I help you today?', 'ai');
    
    /**
     * Toggle chat window visibility
     */
    function toggleChat() {
        state.isOpen = !state.isOpen;
        
        if (state.isOpen) {
            chatWindow.style.display = 'flex';
            chatBubble.style.display = 'none';
            messageInput.focus(); // Focus on input field when chat opens
        } else {
            chatWindow.style.display = 'none';
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
     * If so, expand the chat window
     */
    function checkForLongMessages() {
        const hasLongMessage = state.messages.some(msg => msg.text.length > 100);
        
        if (hasLongMessage) {
            chatWindow.style.width = '720px';
            console.log('Chat window expanded due to long message');
        } else {
            chatWindow.style.width = '360px';
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
     * Scroll chat messages to the bottom
     */
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
