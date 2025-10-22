import { requireAuth } from "@/lib/auth-utils";
import React from "react";

const Page = async () => {
  await requireAuth();
  return <div>Page Soda man 🥤</div>;
};

export default Page;
