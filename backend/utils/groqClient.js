export async function chatWithGroq(
  messages,
  model = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct"
) {

  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    console.error("⚠ GROQ_API_KEY not found in .env");
    return "Error: API key missing";
  }

  console.log("➡️ Calling Groq API...");

  try {

    const cleanedMessages = messages.map(msg => ({
      role: msg.role,
      content: String(msg.content || "")
    }));


    const finalMessages = [
      {
        role: "system",
        content: `
You are CONVOAI, a helpful AI assistant.

Guidelines:
- Be clear and conversational.
- Keep responses natural so they sound good when spoken aloud.
- If a document is provided, use it to answer the user's question.
- Avoid unnecessary formatting unless needed.
`
      },
      ...cleanedMessages
    ];


    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);


    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: finalMessages
        }),
        signal: controller.signal
      }
    );


    clearTimeout(timeout);

    const data = await response.json();

    console.log(" Groq response received");


    if (!response.ok) {
      console.error("❌ Groq API error:", data);
      return `Model Error: ${data?.error?.message || "Unknown error"}`;
    }


    const reply =
      data?.choices?.[0]?.message?.content || "No response from model";


    return reply;


  } catch (error) {

    console.error(" Groq Client Error:", error);

    if (error.name === "AbortError") {
      return "The AI took too long to respond. Please try again.";
    }

    return "Failed to fetch response from Groq";
  }

}