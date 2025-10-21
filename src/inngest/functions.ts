import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", retries: 5,  },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Simulate a wait
    await step.sleep("wait-a-moment", "10s");

    // Simulate another wait
    await step.sleep("proccessing", "10s");

    // Return a greeting message
    await step.sleep("creating final result", "10s");

    await step.run("createo-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "inngest workflow testing... ",
        },
      });
    });
  }
);
