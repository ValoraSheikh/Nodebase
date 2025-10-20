"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export const LogOut = () => {
  const router = useRouter();

  return (
    <Button onClick={() => authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        }
      }
    })} variant="outline">
      Logout
    </Button>
  )
}