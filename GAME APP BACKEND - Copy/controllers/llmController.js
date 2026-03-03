const fetch = require("node-fetch");
const ChatHistory = require("../models/ChatHistory");

// @desc    Generate LLM response and store in database
// @route   POST /api/llm/generate
// @access  Private (requires auth token)
exports.generateResponse = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id; // From auth middleware

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    // Call NVIDIA API
    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta/llama3-70b-instruct",
          messages: [
            {
              role: "system",
              content: `You are an AI course advisor for Learn From Sakthi platform. 
              Always format your responses in a clean, human-readable way:
              
              - Use bullet points (•) for lists
              - Use emojis to make it engaging (📚 for courses, 💼 for careers, 🔥 for trending, etc.)
              - Use **bold** for important terms
              - Break information into short paragraphs
              - Add line breaks between sections
              - Be friendly and helpful
              
              Example format:
              📚 **Course Recommendation**
              • Course: Web Development
              • Level: Beginner
              • Duration: 12 weeks
              
              💡 **Key Topics:**
              • HTML, CSS, JavaScript
              • React, Node.js
              • Database basics
              
              Would you like more details about this course?`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data
      });
    }

    let reply = data.choices?.[0]?.message?.content || "No response";
    
    // Format the response
    reply = reply
      .replace(/\n/g, '\n')
      .replace(/\*\*/g, '**')
      .trim();

    // Store in database with user ID
    const chatHistory = new ChatHistory({
      userId: userId,
      prompt: prompt,
      response: reply,
      tokens: data.usage?.total_tokens || 0
    });

    await chatHistory.save();

    res.status(200).json({
      success: true,
      reply: reply,
      chatId: chatHistory._id,
      timestamp: chatHistory.createdAt
    });

  } catch (error) {
    console.error("NVIDIA API Error:", error);
    
    // Friendly error response
    res.status(200).json({ 
      success: true, 
      reply: "😔 I'm having trouble connecting right now. Please try again in a moment.\n\nIn the meantime, you can ask me about:\n• Available courses\n• Career paths\n• Learning recommendations"
    });
  }
};

// @desc    Get user's chat history
// @route   GET /api/llm/history
// @access  Private
exports.getChatHistory = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  try {
    const history = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('prompt response createdAt');

    const total = await ChatHistory.countDocuments({ userId });

    res.status(200).json({
      success: true,
      history,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single chat by ID
// @route   GET /api/llm/history/:id
// @access  Private
exports.getChatById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const chat = await ChatHistory.findOne({ _id: id, userId });
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({
      success: true,
      chat
    });

  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete chat from history
// @route   DELETE /api/llm/history/:id
// @access  Private
exports.deleteChat = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const chat = await ChatHistory.findOneAndDelete({ _id: id, userId });
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Clear all chat history for user
// @route   DELETE /api/llm/history
// @access  Private
exports.clearAllChats = async (req, res) => {
  const userId = req.user.id;

  try {
    await ChatHistory.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "All chats cleared successfully"
    });

  } catch (error) {
    console.error("Error clearing chats:", error);
    res.status(500).json({ message: "Server error" });
  }
};