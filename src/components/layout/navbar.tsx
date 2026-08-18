import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { MainNav } from "@/components/layout/main-nav";
import { redirect } from "next/navigation";

export const Navbar = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav className="mr-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};
