"use client";

import { useState } from "react";
import { Home, Search, PlusSquare, Bookmark, User } from "lucide-react";
import { CreateEchoModal } from "@/components/create-echo-modal";
import Logo from "@/components/nav/logo";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/", icon: Home, type: "link" },
  {
    id: "search",
    label: "Search",
    href: "/search",
    icon: Search,
    type: "link",
  },
  { id: "create", label: "Create", icon: PlusSquare, type: "button" },
  {
    id: "saved",
    label: "Saved",
    href: "/saved",
    icon: Bookmark,
    type: "link",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    type: "link",
  },
];

export default function Navigation({
  profileImage,
  username,
}: {
  profileImage: string;
  username: string;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ⚡ FIX: Accurate segment isolation
  const currentSegments = pathname.split("/").filter(Boolean);
  const currentBaseSegment = currentSegments[0] || "";

  let activeId = "home";

  if (currentBaseSegment === "search") {
    activeId = "search";
  } else if (currentBaseSegment === "saved") {
    activeId = "saved";
  } else if (
    currentBaseSegment.startsWith("@") ||
    currentBaseSegment.startsWith("%40")
  ) {
    // If the path starts with @username, map it strictly to the profile tab!
    activeId = "profile";
  } else if (pathname !== "/") {
    // Captures fallback pages or deep routes while keeping pure "/" dedicated to home
    activeId = currentBaseSegment;
  }

  return (
    <>
      <nav
        className="
        fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center px-4 z-40
        md:sticky md:top-0 md:left-0 md:h-screen md:flex-col md:justify-start md:items-start md:p-6 md:gap-6
        z-40"
        style={{ backgroundColor: "#f8f8f8" }}
      >
        <div className="hidden md:block text-2xl font-bold mb-4 tracking-wider">
          <Logo />
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          // 1. Action Modals
          if (item.type === "button") {
            return (
              <button
                key={item.label}
                onClick={() => setIsCreateOpen(true)}
                className={`flex items-center gap-4 ${isActive ? "text-primary font-semibold" : "text-muted-foreground"} hover:text-foreground`}
              >
                <Icon className="h-6 w-6" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          }

          // 2. Profile Destination Router Links
          if (item.id === "profile") {
            const profileHref = `/@${username}`;
            return (
              <button
                key={item.label}
                onClick={() => {
                  router.push(profileHref);
                }}
                className={`flex items-center gap-4 w-full justify-start ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                } hover:text-foreground`}
              >
                <Icon className="h-6 w-6" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          }

          // 3. Regular Links (Home, Search, Saved)
          return (
            <button
              key={item.label}
              onClick={() => {
                router.push(item.href ?? "/");
              }}
              className={`flex items-center gap-4 w-full justify-start ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              } hover:text-foreground`}
            >
              <Icon className="h-6 w-6" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}

        <CreateEchoModal
          profileImage={profileImage}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </nav>
    </>
  );
}
