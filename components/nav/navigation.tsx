"use client";

import { useState } from "react";
import { Home, Search, PlusSquare, Bookmark, User } from "lucide-react";
import { CreateEchoModal } from "@/components/create-echo-modal";
import Logo from "@/components/nav/logo";
import Link from "next/link"; // ⚡ Back to native Next.js link prefetching
import { usePathname } from "next/navigation";

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

  // Accurately parse URL segments
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
    activeId = "profile";
  } else if (pathname !== "/") {
    activeId = currentBaseSegment;
  }

  return (
    <>
      <nav
        className="flex justify-between items-center px-4 z-40 fixed bottom-0 left-0 right-0 h-16 md:sticky md:top-0 md:left-0 md:h-screen md:flex-col md:justify-start md:items-start md:p-6 md:gap-6"
        style={{ backgroundColor: "#f8f8f8" }}
      >
        <div className="hidden md:block text-2xl font-bold mb-4 tracking-wider">
          <Logo />
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          const activeStyles = isActive
            ? "text-primary font-semibold"
            : "text-muted-foreground";

          const targetHref =
            item.id === "profile" ? `/@${username}` : (item.href ?? "/");

          // 1. Action Modals (Modals must remain buttons)
          if (item.type === "button") {
            return (
              <button
                key={item.label}
                onClick={() => setIsCreateOpen(true)}
                className={`cursor-pointer flex items-center gap-4 w-full justify-start ${activeStyles} hover:text-foreground`}
              >
                <Icon className="h-6 w-6" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          }

          // Determine the correct destination target cleanly ahead of rendering

          // 2. Real Semantic Navigation Links (Home, Search, Saved, Profile)
          return (
            <Link
              key={item.label}
              href={targetHref}
              className={`cursor-pointer flex items-center gap-4 w-full justify-start ${activeStyles} hover:text-foreground`}
            >
              <Icon className="h-6 w-6" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
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
