import { requireAuth } from "@/lib/auth-utils";

const Page = async() => {
    await requireAuth();
  return (
    <p>Balle Balle 5 😏🙄</p>
  )
}

export default Page;