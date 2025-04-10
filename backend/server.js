const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY || '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';
console.log('Using test API key');

const openai = new OpenAI({
  apiKey: apiKey,
});

const ASSISTANT_ID = process.env.ASSISTANT_ID || 'asst_ZYtRSeYDkSolxRbvS0iJ90AW';

app.post('/api/threads', async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();
    res.json({ threadId: thread.id });
  } catch (error) {
    console.error('Error creating thread:', error);
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

    const threadMessage = await openai.beta.threads.messages.create(
      threadId,
      {
        role: 'user',
        content: message,
      }
    );

    res.json({ messageId: threadMessage.id });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message to thread' });
  }
});

app.post('/api/threads/:threadId/runs', async (req, res) => {
  const { threadId } = req.params;

  try {
    const run = await openai.beta.threads.runs.create(
      threadId,
      {
        assistant_id: ASSISTANT_ID,
        stream: true,
      }
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.beta.threads.runs.stream(
      threadId,
      run.id
    );

    stream.on('textDelta', (delta, snapshot) => {
      res.write(`data: ${JSON.stringify({ type: 'textDelta', delta, snapshot })}\n\n`);
    });

    stream.on('toolCallCreated', (toolCall) => {
      res.write(`data: ${JSON.stringify({ type: 'toolCallCreated', toolCall })}\n\n`);
    });

    stream.on('toolCallDelta', (delta, snapshot) => {
      res.write(`data: ${JSON.stringify({ type: 'toolCallDelta', delta, snapshot })}\n\n`);
    });

    stream.on('messageCreated', (message) => {
      res.write(`data: ${JSON.stringify({ type: 'messageCreated', message })}\n\n`);
    });

    stream.on('messageDelta', (delta, snapshot) => {
      res.write(`data: ${JSON.stringify({ type: 'messageDelta', delta, snapshot })}\n\n`);
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      res.end();
    });

    req.on('close', () => {
      stream.controller.abort();
    });
  } catch (error) {
    console.error('Error running assistant:', error);
    res.status(500).json({ error: 'Failed to run assistant' });
  }
});

app.get('/api/threads/:threadId/messages', async (req, res) => {
  try {
    const { threadId } = req.params;
    const messages = await openai.beta.threads.messages.list(threadId);
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
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
