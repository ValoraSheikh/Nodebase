import { createTRPCRouter } from "../init";
import { workflowsRouters } from "@/features/workflows/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouters  

});
// export type definition of API
export type AppRouter = typeof appRouter;
