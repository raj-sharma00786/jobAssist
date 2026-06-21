"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";
import Image from "next/image";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function UserAvatar({ name, email, image }: UserAvatarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = name || "User";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-on-primary cursor-pointer hover:shadow-[0_0_15px_var(--color-primary)] transition-shadow overflow-hidden"
      >
        {image ? (
          <Image
            src={image}
            alt={userName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-outline-variant">
            <p className="text-sm font-semibold text-display truncate">
              {userName}
            </p>
            <p className="text-xs text-body truncate">{email || ""}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/dashboard/profile");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-body hover:bg-surface-container hover:text-display transition-colors"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#f87171] hover:bg-surface-container transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
