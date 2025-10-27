import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-muted  flex items-center min-h-svh justify-center flex-col gap-6 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center self-center gap-2 font-medium"
        >
          <Image alt="Nodebase" src="/logos/logo.svg" height={30} width={30} />
          Nodebase
        </Link>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
