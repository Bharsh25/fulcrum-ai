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
router.get('/threads', verifyToken, async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.userId })
            .sort({ updatedAt: -1 });

        res.status(200).json(threads);

    } catch (error) {
        console.error("Error fetching threads:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get messages of a specific thread
router.get('/threads/:threadId', async (req, res) => {
    const threadId=req.params.threadId;  //to get the threadId from the URL

    try{
        const thread=await Thread.findOne({ threadId, userId: req.userId});
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
        const deletedThread=await Thread.findOneAndDelete({ threadId,
    userId: req.userId});
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
router.post('/chat', verifyToken, async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ message: "threadId and message are required" });
    }

    try {
        // 1️⃣ Find thread ONLY for this user
        let currentThread = await Thread.findOne({
            threadId,
            userId: req.userId
        });

        // 2️⃣ If thread does not exist → create new one
        if (!currentThread) {
            currentThread = new Thread({
                threadId,
                userId: req.userId,
                title: message.substring(0, 20),
                messages: [{ role: "user", content: message }]
            });
        } else {
            // 3️⃣ Add user message to existing thread
            currentThread.messages.push({
                role: "user",
                content: message
            });
        }

        currentThread.updatedAt = Date.now();
        await currentThread.save();

        // 4️⃣ Get AI response
        const aiReply = await getOpenAIResponse(message);

        // 5️⃣ Save AI reply
        currentThread.messages.push({
            role: "assistant",
            content: aiReply
        });

        currentThread.updatedAt = Date.now();
        await currentThread.save();

        res.status(200).json({
            reply: aiReply,
            thread: {
                threadId: currentThread.threadId,
                title: currentThread.title
            }
        });

    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
export default router;