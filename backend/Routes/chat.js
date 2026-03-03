import express from 'express';
import Thread from '../models/Threads.js';
import getOpenAIResponse from '../utils/openai.js';
import { verifyToken } from "../middleware.js/auth.js";


const router = express.Router();

// Test route to check if the server is working
router.post('/test', async (req, res) => {
    try{
        const thread=new Thread({
            threadId: "abc",
            title: "Thread 2"
        });
        const response=await thread.save();
        res.send(response);

    }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Route to get all threads
router.get('/threads', async (req, res) => {
    try{
        const threads=await Thread.find().sort({ updatedAt: -1 });
        res.json(threads);
    }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Route to get messages of a specific thread
router.get('/threads/:threadId', async (req, res) => {
    const threadId=req.params.threadId;  //to get the threadId from the URL

    try{
        const thread=await Thread.findOne({ threadId});
        if(thread){
            res.json(thread.messages);
        }else{
            res.status(404).json({ error: 'Thread not found' });
        }
    }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Route to delete a thread
router.delete('/threads/:threadId', async (req, res) => {
    const threadId=req.params.threadId;

    try{
        const deletedThread=await Thread.findOneAndDelete({ threadId});
        if(deletedThread){
            res.json({ message: 'Thread deleted successfully' });
        }else{
            res.status(404).json({ error: 'Thread not found' });
        }
    }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Route to handle chat messages
router.post('/chat',verifyToken, async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: 'threadId and message are required' });
    }

    try {
        // 1. Find the thread
        let currentThread = await Thread.findOne({ threadId });

        if (!currentThread) {
            // 2. Create a new thread if it doesn't exist
            currentThread = new Thread({
                threadId,
                title: message.substring(0, 20),
                messages: [{ role: 'user', content: message }]
            });
        } else {
            // 3. Update existing thread
            currentThread.messages.push({ role: 'user', content: message });
            currentThread.updatedAt = Date.now();
        }
        
        // Save the user message first to ensure it's recorded
        await currentThread.save();

        // 4. Get AI Response
        const aiReply = await getOpenAIResponse(message);

        // 5. Update with AI Reply
        currentThread.messages.push({ role: 'assistant', content: aiReply });
        currentThread.updatedAt = Date.now();
        await currentThread.save();

        res.json({ reply: aiReply,
            thread: {
        threadId: currentThread.threadId,
        title: currentThread.title
    }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

export default router;