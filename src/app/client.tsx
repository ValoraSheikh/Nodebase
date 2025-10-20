"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

const Client = () => {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());

  return (
    <div>
      Client Component :{" "}
      <Button variant="link" className="text-4xl font-extrabold">
        {JSON.stringify(users[0].name)}
        {JSON.stringify(users[1].name)}
      </Button>
    </div>
  );
};

export default Client;
