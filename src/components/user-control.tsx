"use client";

import { useCurrentTheme } from "@/hooks/use-current-theme";
import { UserButton } from '@/lib/mock-clerk';
import { dark } from "@clerk/themes";

interface Props { 
  showName?: boolean;
};

export const UserControl = ({ showName }: Props) => {
  const currentTheme = useCurrentTheme();

  return (
    <UserButton
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: "rounded-md!",
          userButtonAvatarBox: "rounded-md! size-8!",
          userButtonTrigger: "rounded-md!"
        },
        baseTheme: currentTheme === "dark" ? dark : undefined, 
      }}
    />
  );
};
   