import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import React from "react";

const page = async () => {
  const users = await prisma.user.findMany();

  return (
    <h1 className="min-h-screen flex items-center justify-center">
      <Button variant="link">{JSON.stringify(users)}</Button>
    </h1>
  );
};

export default page;
