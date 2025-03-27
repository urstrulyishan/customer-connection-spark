
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Clock, MessageSquare, Menu, X, Bot } from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: BarChart3,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    name: "Leads",
    path: "/leads",
    icon: Users,
  },
  {
    name: "Interactions",
    path: "/interactions",
    icon: Clock,
  },
  {
    name: "Messages",
    path: "/messages",
    icon: MessageSquare,
  },
  {
    name: "Chatbot",
    path: "/chatbot",
    icon: Bot,
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-border shadow-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-semibold tracking-tight">CRM</span>
              <span className="text-xs py-0.5 px-1.5 bg-primary/10 text-primary rounded-md">Beta</span>
            </Link>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "group flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === item.path
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="ml-4 rounded-full w-8 h-8 bg-accent flex items-center justify-center" aria-label="User menu">
              <span className="text-xs font-medium">AS</span>
            </button>
            
            <button
              type="button"
              className="sm:hidden ml-4 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="block h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div
        className={cn(
          "sm:hidden absolute w-full bg-white/95 backdrop-blur-md border-b border-border shadow-subtle transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-screen py-2" : "max-h-0 overflow-hidden py-0"
        )}
      >
        <div className="space-y-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "group flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md transition-colors",
                location.pathname === item.path
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
