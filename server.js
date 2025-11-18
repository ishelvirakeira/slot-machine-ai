require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai").OpenAI;

const path=require("path");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));//backend serves HTML

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
//home route
app.get("/", (req, res)=>{
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
// AI Betting Recommendation
app.post("/ai/bet", async (req, res) => {
  try {
    const { balance, bet, lastMessage } = req.body;

    const prompt = `
    You are an assistant that gives gambling advice.
    Based on this info:
    - Balance: $${balance}
    - Bet: $${bet}
    - Result: "${lastMessage}"
    Give short, helpful advice about what the player should bet next.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You give smart betting advice." },
        { role: "user", content: prompt },
      ],
      max_tokens: 80,
      temperature: 0.3,
    });

    res.json({ advice: completion.choices[0].message.content });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "AI failed" });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`server running on port ${process.env.PORT}`)
);
