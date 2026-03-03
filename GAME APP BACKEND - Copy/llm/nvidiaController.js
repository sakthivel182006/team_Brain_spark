// controllers/nvidiaController.js
const fetch = require("node-fetch");

exports.generateResponse = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
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
    
    // Ensure the response maintains formatting
    reply = reply
      .replace(/\n/g, '\n') // Preserve line breaks
      .replace(/\*\*/g, '**') // Keep markdown bold
      .trim();

    res.status(200).json({
      success: true,
      reply: reply
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