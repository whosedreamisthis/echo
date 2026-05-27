// components/navigation.tsx
"use client";

import { useState } from "react";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import { CreateEchoModal } from "@/components/create-echo-modal";
import Link from "next/link";
import Logo from "@/components/logo"; // Your modal component
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
  { id: "create", label: "Create", icon: PlusSquare, type: "button" }, // 1. Removed href, added type
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    type: "link",
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: User,
    type: "link",
  },
];

export default function Navigation({ profileImage }: { profileImage: string }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const pathname = usePathname();
  const initialActive = pathname.split("/")[1] || "home";

  const [active, setActive] = useState(initialActive);

  return (
    <>
      <nav
        className="
        /* Mobile: Bottom fixed bar */
        fixed bottom-0 left-0 right-0 h-16   flex justify-around items-center px-4 z-40

        /* Desktop (md and up): Left Sidebar */
        md:sticky md:top-0 md:left-0 md:h-screen md:flex-col md:justify-start md:items-start  md:p-6 md:gap-6
       z-100"
        style={{ backgroundColor: "#f8f8f8" }}
      >
        <div className="hidden md:block text-2xl font-bold mb-4 tracking-wider">
          <Logo />
        </div>

        {/* Loop through your items in your JSX */}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.type === "button") {
            return (
              <button
                key={item.label}
                onClick={() => {
                  setIsCreateOpen(true);
                }}
                className={`flex items-center gap-4 ${active === item.id ? "text-primary" : "text-muted-foreground"}  hover:text-foreground`}
              >
                <Icon className="h-6 w-6" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          } else {
            return (
              <Link
                key={item.label}
                href={item.href ?? "/"}
                className={`flex items-center gap-4 ${active === item.id ? "text-primary" : "text-muted-foreground"} hover:text-foreground`}
                onClick={() => setActive(item.id)}
              >
                <Icon className="h-6 w-6" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          }

          // Standard <Link href={item.href}> goes here for 'link' types...
        })}

        {/* 3. Render your modal overlay */}
        <CreateEchoModal
          profileImage={profileImage}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </nav>
    </>
  );
}
