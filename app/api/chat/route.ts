import { NextResponse } from "next/server";
import { generateMomoResponse } from "@/lib/ai-character";
import type { CanvasElement } from "@/types";

export async function POST(request: Request) {
  const { message, locale, elements }: { message: string; locale: "zh" | "en"; elements: CanvasElement[] } =
    await request.json();

  // Momo is a warm, artistic AI companion that guides mood board creation.
  // She responds based on the current board state and user intent.
  const reply = generateMomoResponse(message, locale, elements);

  // Optional: if you add an OPENAI_API_KEY env var, Momo can use GPT for deeper responses.
  // For now, she runs entirely locally with no API keys or costs.
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                locale === "zh"
                  ? `你是 Momo，一个温柔、有艺术感的人工智能伙伴。你正在陪用户一起创作一张心情板（mood board）。\n你的语气要温暖、鼓励、略带诗意，但不要过于冗长。你会根据当前画布上的元素给出具体的建议。当前画布上有 ${elements.length} 个元素。`
                  : `You are Momo, a warm, artistic AI companion. You are helping the user create a mood board.\nYour tone should be encouraging, slightly poetic, but not too long. Give specific advice based on what's currently on the canvas. The canvas currently has ${elements.length} elements.`,
            },
            { role: "user", content: message },
          ],
          temperature: 0.8,
          max_tokens: 200,
        }),
      });
      const data = await openaiRes.json();
      if (data.choices?.[0]?.message?.content) {
        return NextResponse.json({ reply: data.choices[0].message.content });
      }
    } catch {
      // fall back to local Momo
    }
  }

  return NextResponse.json({ reply });
}
