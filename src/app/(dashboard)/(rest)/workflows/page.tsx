import { requireAuth } from "@/lib/auth-utils";

const Page = async() => {
  await requireAuth();
  
  return (
    <p>Balle Balle</p>
  )
}

export default Page;