import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { findMonthTool } from "@/tools/findMonth";
import { createPresenceTool } from "@/tools/createPresence";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import fs from "fs/promises"
export const maxDuration = 30;

const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const readPrompt = await fs.readFile('./prompt.txt', 'utf-8');
    const result = streamText({
        model: googleProvider("gemini-flash-lite-latest"),
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
        system: readPrompt,
        tools: {
            findMonth: findMonthTool,
            createPresence: createPresenceTool,
        },
    });

    return result.toUIMessageStreamResponse();
}