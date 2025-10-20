import { getQueryClient, trpc } from "@/trpc/server";
import React, { Suspense } from "react";
import Client from "./client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <h1 className="min-h-screen flex items-center justify-center ">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Opening...</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </h1>
  );
};

export default Page;
