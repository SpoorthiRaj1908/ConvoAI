import express from "express";
import Thread from "../models/thread.js";
import { chatWithGroq } from "../utils/groqClient.js";
import { v4 as uuidv4 } from "uuid";
import { getDocumentText } from "../utils/documentstore.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();



router.post("/test", async (req, res) => {
  try {

    const newThread = new Thread({
      threadid: "xyz",
      title: "testing in progress"
    });

    const response = await newThread.save();

    return res.send(response);

  } catch (e) {

    console.log(e);
    return res.status(500).json({ error: "failed to save in db" });

  }
});




router.get("/thread", verifyToken, async (req, res) => {
  try {

    const threads = await Thread.find({
      userId: req.userId
    }).sort({ updatedAt: -1 });

    return res.json(threads);

  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: "failed to fetch threads" });

  }
});




router.get("/thread/:threadid", verifyToken, async (req, res) => {

  const { threadid } = req.params;

  try {

    const thread = await Thread.findOne({
      threadid,
      userId: req.userId
    });

    if (!thread)
      return res.status(404).json({ error: "thread not found" });

    return res.json(thread.messages);

  } catch (error) {

    console.log(error);
    return res.status(500).json({ error: "failed to fetch chat" });

  }

});




router.delete("/thread/:threadid", verifyToken, async (req, res) => {

  const { threadid } = req.params;

  try {

    const deleted = await Thread.findOneAndDelete({
      threadid,
      userId: req.userId
    });

    if (!deleted)
      return res.status(404).json({ error: "thread not found" });

    return res.status(200).json({ success: "thread deleted" });

  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: "failed to delete thread" });

  }

});



router.get("/search/:query", verifyToken, async (req, res) => {

  const { query } = req.params;

  try {

    const threads = await Thread.find({
      userId: req.userId
    });

    let results = [];

    threads.forEach(thread => {

      thread.messages.forEach(msg => {

        if (
          msg.content.toLowerCase().includes(query.toLowerCase())
        ) {

          results.push({
            threadid: thread.threadid,
            message: msg.content,
            role: msg.role
          });

        }

      });

    });

    return res.json(results);

  } catch (err) {

    console.log(err);
    return res.status(500).json({ error: "search failed" });

  }

});




router.post("/chat", verifyToken, async (req, res) => {

  console.log("🔥 CHAT ROUTE HIT", req.body);

  let { threadid, message, messages } = req.body;

  if (messages && Array.isArray(messages) && messages.length > 0) {
    message = messages[messages.length - 1].content;
  }

  if (!message)
    return res.status(400).json({ error: "message required" });

  try {

    let thread;


    if (!threadid) {

      thread = new Thread({
        threadid: uuidv4(),
        userId: req.userId,
        title: message,
        messages: []
      });

    } else {

      thread = await Thread.findOne({
        threadid,
        userId: req.userId
      });

      if (!thread) {

        thread = new Thread({
          threadid,
          userId: req.userId,
          title: message,
          messages: []
        });

      }

    }


    thread.messages.push({
      role: "user",
      content: message
    });



    const previousThreads = await Thread.find({
      userId: req.userId,
      threadid: { $ne: thread.threadid }
    })
      .sort({ updatedAt: -1 })
      .limit(3);

    let previousContext = [];

    previousThreads.forEach(t => {
      previousContext.push(...t.messages.slice(-4));
    });



    const documentText = getDocumentText();

    const docContext = documentText
      ? documentText.slice(0, 8000)
      : "";



    const messagesWithContext = [
      {
        role: "system",
        content: `
You are an AI assistant.

If a document is uploaded, answer questions using the document.

DOCUMENT:
${docContext}

Also use previous conversations if relevant.
`
      },
      ...previousContext,
      ...thread.messages
    ];



    const assreply = await chatWithGroq(messagesWithContext);



    const voiceText = assreply
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*#>-]/g, "")
      .replace(/\n+/g, " ")
      .trim();



    thread.messages.push({
      role: "assistant",
      content: assreply
    });

    thread.updatedAt = new Date();

    await thread.save();



    return res.json({
      reply: assreply,
      voice: voiceText,
      threadid: thread.threadid
    });

  } catch (e) {

    console.log(e);
    return res.status(500).json({ error: "something went wrong" });

  }

});




router.get("/share/:threadid", async (req, res) => {

  const { threadid } = req.params;

  try {

    const thread = await Thread.findOne({ threadid });

    if (!thread) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({
      title: thread.title,
      messages: thread.messages
    });

  } catch (err) {

    console.log(err);
    res.status(500).json({ error: "Failed to fetch shared chat" });

  }

});


export default router;