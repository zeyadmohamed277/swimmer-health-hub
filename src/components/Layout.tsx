import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Waves,
  User,
  Activity,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { Sun } from "lucide-react";
import logo from "../assets/Zamalek_SC_logo.svg.png";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [Lang, setLang] = useState(false);


  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = [
    ...(role === "swimmer"
      ? [
          { href: "/profile", label: "My Profile", icon: User },
          { href: "/examinations", label: "In-Body Results", icon: Activity },
        ]
      : []),
    ...(role === "coach"
      ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
  ];

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 ">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={toggleTheme}
              className="
            p-2 rounded-full
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-800" />
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10= h-10 rounded-lg  flex items-center justify-center">
                <img
                  src={logo}
                  alt="Watermark"
                  className="w-12 h-12 text-primary-foreground"
                />
              </div>
              <span className="font-bold text-lg hidden sm:inline">
                SwimHealth
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={
                      location.pathname === item.href ? "secondary" : "ghost"
                    }
                    className="gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Menu */}

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hidden md:flex"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              
              {Lang ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setLang(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    AR
                  </button>
                </div>
              ) : (<div className="flex items-center gap-2">
                  <button onClick={() => setLang(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    EN
                  </button>
                </div>
              )}

              

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={
                        location.pathname === item.href ? "secondary" : "ghost"
                      }
                      className="w-full justify-start gap-2"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
