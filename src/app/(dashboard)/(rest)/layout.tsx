import { AppHeader } from "@/components/app-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-full w-full">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
