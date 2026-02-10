import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/files", label: "File Browser", icon: FolderOpen },
  { to: "/translate", label: "Translation", icon: Languages },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Languages className="h-6 w-6" />
          <span>SRT Translator</span>
        </div>

        <Separator orientation="vertical" className="mx-6 h-8" />

        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
