"use client";

import React from "react";
import { LogOut } from "./LogOut";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Job Queued...");
      },
    })
  );

  const testAI = useMutation(
    trpc.testAi.mutationOptions({
      onSuccess: () => {
        toast.success("Request Processed...");
      },
      onError: () => {
        toast.error("Something went 📛🙅‍♀️🙅‍♂️🦡");
      },
    })
  );

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-5">
      <h1 className="text-3xl font-extrabold">Nothing to write </h1>
      <p>{JSON.stringify(data)}</p>
      <Button onClick={() => testAI.mutate()} disabled={testAI.isPending}>
        Test AI
      </Button>
      <Button onClick={() => create.mutate()} disabled={create.isPending}>
        Create Workflow
      </Button>
      <LogOut />
    </div>
  );
};

export default Page;
