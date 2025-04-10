const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

let apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('No API key provided. Please set the OPENAI_API_KEY environment variable.');
} else {
  console.log('Using API key format:', apiKey.substring(0, 5) + '...');
  
  apiKey = apiKey.trim();
  
  if (apiKey.startsWith('sk-proj-')) {
    console.log('Detected project-scoped API key format');
  }
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.openai.com/v1',
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;
if (!ASSISTANT_ID) {
  console.error('No Assistant ID provided. Please set the ASSISTANT_ID environment variable.');
} else {
  console.log('Using Assistant ID:', ASSISTANT_ID);
}

app.post('/api/threads', async (req, res) => {
  try {
    console.log('Attempting to create thread with beta namespace...');
    
    const thread = await openai.beta.threads.create();
    console.log('Thread created successfully:', thread.id);
    res.json({ threadId: thread.id });
  } catch (error) {
    console.error('Error creating thread:', error);
    console.error('Error details:', error.message);
    
    if (error.status === 401) {
      console.log('Authentication error detected. This may be due to:');
      console.log('1. The API key format is incorrect or expired');
      console.log('2. The API key does not have access to the Assistants API');
      console.log('3. The OpenAI account associated with the API key has billing issues');
    }
    
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

app.post('/api/threads/:threadId/messages', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Adding message to thread ${threadId}:`, message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    
    const threadMessage = await openai.beta.threads.messages.create(
      threadId,
      {
        role: 'user',
        content: message,
      }
    );
    
    console.log('Message added:', threadMessage.id);
    res.json({ messageId: threadMessage.id });
  } catch (error) {
    console.error('Error adding message:', error);
    console.error('Error details:', error.message);
    
    if (error.status === 401) {
      console.log('Authentication error detected when adding message');
    }
    
    res.status(500).json({ error: 'Failed to add message to thread' });
  }
});

app.post('/api/threads/:threadId/runs', async (req, res) => {
  const { threadId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    if (!apiKey || !ASSISTANT_ID) {
      console.log('Missing API key or Assistant ID, using local mode');
      return handleLocalMode(res, threadId);
    }

    console.log(`Running assistant ${ASSISTANT_ID} on thread ${threadId}`);
    
    try {
      const run = await openai.beta.threads.runs.create(
        threadId,
        {
          assistant_id: ASSISTANT_ID,
          stream: true,
        }
      );
      
      console.log('Run created successfully:', run.id);
      
      const stream = await openai.beta.threads.runs.stream(
        threadId,
        run.id
      );
      
      stream.on('textDelta', (delta, snapshot) => {
        console.log('Text delta received:', delta.value);
        res.write(`data: ${JSON.stringify({ type: 'textDelta', delta, snapshot })}\n\n`);
      });
  
      stream.on('toolCallCreated', (toolCall) => {
        console.log('Tool call created:', toolCall.type);
        res.write(`data: ${JSON.stringify({ type: 'toolCallCreated', toolCall })}\n\n`);
      });
  
      stream.on('toolCallDelta', (delta, snapshot) => {
        console.log('Tool call delta received');
        res.write(`data: ${JSON.stringify({ type: 'toolCallDelta', delta, snapshot })}\n\n`);
      });
  
      stream.on('messageCreated', (message) => {
        console.log('Message created:', message.id);
        res.write(`data: ${JSON.stringify({ type: 'messageCreated', message })}\n\n`);
      });
  
      stream.on('messageDelta', (delta, snapshot) => {
        console.log('Message delta received');
        res.write(`data: ${JSON.stringify({ type: 'messageDelta', delta, snapshot })}\n\n`);
      });
  
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        
        if (error.status === 401) {
          console.log('Authentication error detected when streaming');
        }
        
        handleLocalMode(res, threadId);
      });
  
      stream.on('end', () => {
        console.log('Stream ended');
        res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
        res.end();
      });
  
      req.on('close', () => {
        console.log('Client disconnected, aborting stream');
        if (stream && stream.controller) {
          stream.controller.abort();
        }
      });
    } catch (error) {
      console.error('Error with API streaming:', error);
      
      if (error.status === 401) {
        console.log('Authentication error detected when creating run');
        console.log('This may be due to:');
        console.log('1. The API key format is incorrect or expired');
        console.log('2. The API key does not have access to the Assistants API');
        console.log('3. The OpenAI account associated with the API key has billing issues');
      }
      
      handleLocalMode(res, threadId);
    }
  } catch (error) {
    console.error('Error running assistant:', error);
    handleLocalMode(res, threadId);
  }
});

function handleLocalMode(res, threadId) {
  console.log('Using local mode for thread:', threadId);
  
  const mockResponses = [
    "I'd be happy to help you with information about university courses and programs!",
    "That's a great question about our catalog. Let me provide some information.",
    "The university offers a variety of programs in that area. Would you like more specific details?",
    "I understand you're looking for course information. Could you tell me which department you're interested in?",
    "Thank you for your question. The registration period for those courses begins next month."
  ];
  
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  console.log('Sending mock response:', randomResponse);
  
  let currentIndex = 0;
  const typingInterval = setInterval(() => {
    if (currentIndex < randomResponse.length) {
      const char = randomResponse[currentIndex];
      res.write(`data: ${JSON.stringify({ 
        type: 'textDelta', 
        delta: { value: char },
        snapshot: { content: randomResponse.substring(0, currentIndex + 1) }
      })}\n\n`);
      currentIndex++;
    } else {
      clearInterval(typingInterval);
      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      res.end();
    }
  }, 50);
  
  return;
}

app.get('/api/threads/:threadId/messages', async (req, res) => {
  try {
    const { threadId } = req.params;
    console.log(`Getting messages for thread ${threadId}`);
    
    const messages = await openai.beta.threads.messages.list(threadId);
    console.log(`Retrieved ${messages.data.length} messages`);
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to get messages from thread' });
  }
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
