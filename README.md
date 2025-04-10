# Catalog Chatbot Prototype

A frontend-only implementation of a university catalog chatbot with a floating bubble UI that expands into a chat window.

## Features

- Floating chat bubble in the bottom right corner (dark green with light green icon)
- Expandable chat window with header, message area, and input section
- Placeholder AI response system (always responds with "That sounds great!")
- Session-based conversation history (no persistence between page navigations)
- Basic accessibility support

## File Structure

```
/catalog-chatbot-prototype/
├── index.html          # Demo page with chatbot integration
├── css/
│   ├── styles.css      # Main stylesheet for demo page
│   └── chatbot.css     # Chatbot-specific styles
├── js/
│   └── chatbot.js      # Main chatbot functionality
└── assets/
    └── icons/          # SVG icons for chat bubble and UI elements
```

## Usage

1. Clone the repository
2. Open `index.html` in a web browser
3. Click on the chat bubble in the bottom right corner to open the chat window
4. Type a message and press Enter or click the send button
5. The AI will respond with "That sounds great!"

## Integration

To integrate the chatbot into a university website:

1. Include the CSS and JavaScript files in the HTML head:
```html
<link rel="stylesheet" href="css/chatbot.css">
<script src="js/chatbot.js" defer></script>
```

2. Add the chatbot HTML structure at the end of the body:
```html
<!-- Chat Bubble Component -->
<div class="chat-bubble" id="chatBubble" aria-label="Open chat support">
    <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        <path d="M7 9h10M7 12h7" stroke="#a5d6a7" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
</div>

<!-- Chat Window Component -->
<div class="chat-window" id="chatWindow">
    <div class="chat-header">
        <div class="chat-title">University Catalog Assistant</div>
        <button class="close-button" id="closeButton" aria-label="Close chat">×</button>
    </div>
    <div class="chat-messages" id="chatMessages">
        <!-- Messages will be added here dynamically -->
    </div>
    <div class="chat-input">
        <input type="text" class="message-input" id="messageInput" placeholder="Type your message here...">
        <button class="send-button" id="sendButton" aria-label="Send message">
            <svg class="send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
        </button>
    </div>
</div>
```

## Color Scheme

- Dark green: #2e7d32 (for chat bubble background and AI message background)
- Light green: #a5d6a7 (for icons and user message background)

## Future Enhancements

The following features are not included in the current scope but are recommended for future iterations:

1. Backend integration for real AI responses
2. Conversation history persistence between page navigations
3. Mobile responsiveness
4. Enhanced UI features (typing indicators, timestamps, etc.)
5. User feedback options
