import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { createAnthropic } from "@ai-sdk/anthropic";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai", retries: 5 },
  { event: "execute/ai" },
  async ({ step }) => {

    Sentry.logger.info("User triggered test log", {
      log_source: "sentry_test",
    });

    console.warn("Something is missing")
    
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-test",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "You are a shitty man",
        prompt: "Who are you?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-test",
      generateText,
      {
        model: openai("gpt-4"),
        system: "You are a shitty man",
        prompt: "Who are you?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "claude-generate-test",
      generateText,
      {
        model: anthropic("claude-3-5-haiku-latest"),
        system: "You are a shitty man",
        prompt: "Who are you?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );

    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps,
    };
  }
);
