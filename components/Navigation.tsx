"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Library, BarChart3, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/library", label: "Library", icon: Library },
    { path: "/visualizations", label: "Visualizations", icon: BarChart3 },
    { path: "/upload", label: "Upload", icon: Upload },
  ];

  const isActivePath = (path: string) => pathname === path;

  const handleNavClick = () => setMobileOpen(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/library" className="flex items-center" onClick={handleNavClick}>
              <img
                src="https://images.fillout.com/orgid-106760/flowpublicid-jmz38a9mxq/widgetid-default/gUgCkAZPpkhthrdqm2udhe/pasted-image-1764996320411.png"
                alt="The Agency"
                className="h-10"
              />
            </Link>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link key={item.path} href={item.path} onClick={handleNavClick}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("gap-2", isActive && "bg-secondary")}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 hidden md:inline-flex"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border pb-3">
            <div className="flex flex-col space-y-1 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <Link key={item.path} href={item.path} onClick={handleNavClick} className="w-full">
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("w-full justify-start gap-2 rounded-none px-2", isActive && "bg-secondary")}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 rounded-none px-2 mt-1"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
