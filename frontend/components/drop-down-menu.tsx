"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Building2,
  FileText,
  LogOut,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useTheme, THEMES } from "./providers/theme-provider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Providers", href: "/providers", icon: Building2 },
  { name: "Budgets", href: "/budgets", icon: FileText },
];

export function DropdownAppMenu() {
  const themes = useTheme();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Don't show menu on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {/* User Profile */}
            <DropdownMenuLabel>
              <div className="flex items-center gap-3 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Navigation */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Navigation
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 cursor-pointer ${
                        isActive ? "bg-accent" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>

            {/* Admin Section */}
            {user?.role === "ADMIN" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Administration
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className={`flex items-center gap-3 cursor-pointer ${
                        pathname === "/admin" ? "bg-accent" : ""
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/users"
                      className={`flex items-center gap-3 cursor-pointer ${
                        pathname === "/admin/users" ? "bg-accent" : ""
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <span>Manage Users</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />

            {/* Theme Selection */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Theme
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {THEMES.map((t) => (
                <DropdownMenuItem
                  key={t}
                  onClick={() => themes.setTheme(t)}
                  className="cursor-pointer"
                >
                  <span className="capitalize">{t}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* App Title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Export Management</h1>
        </div>

        {/* User Avatar (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.name || "User"}</span>
        </div>
      </div>
    </div>
  );
}
