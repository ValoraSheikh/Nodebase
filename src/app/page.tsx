import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import React from "react";
import { LogOut } from "./LogOut";

const Page = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col ">
      <h1 className="text-3xl font-extrabold">Nothing to write </h1>
      <p>{JSON.stringify(data)}</p>
      <LogOut/>
    </div>
  );
};

export default Page;
