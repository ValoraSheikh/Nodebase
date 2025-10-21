import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai", retries: 5 },
  { event: "execute/ai" },
  async ({ event, step }) => {

    const { steps: geminiSteps } = await step.ai.wrap("gemini-generate-test", generateText, {
      model: google("gemini-2.5-flash"),
      system: "You are a shitty man",
      prompt: "Who are you?",
    });

    const { steps: openaiSteps } = await step.ai.wrap("openai-generate-test", generateText, {
      model: openai("gpt-4"),
      system: "You are a shitty man",
      prompt: "Who are you?",
    });

    const { steps: anthropicSteps } = await step.ai.wrap("claude-generate-test", generateText, {
      model: anthropic("claude-3-5-haiku-latest"),
      system: "You are a shitty man",
      prompt: "Who are you?",
    });

    return {
      geminiSteps, openaiSteps, anthropicSteps
    };
  }
);
