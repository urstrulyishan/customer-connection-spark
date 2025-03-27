
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Clock, MessageSquare, Menu, X, Bot, Building, LogOut } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const { currentCompany, setCurrentCompany } = useCompany();
  
  const initials = currentCompany ? currentCompany.companyName.substring(0, 2).toUpperCase() : "CR";
  
  // Check if user is logged in
  useEffect(() => {
    const protectedRoutes = ['/', '/customers', '/leads', '/interactions', '/messages', '/chatbot', '/company-profile'];
    
    // If on a protected route and not logged in, redirect to login
    if (protectedRoutes.includes(location.pathname) && !currentCompany && !localStorage.getItem("currentCompany")) {
      navigate("/company-login");
    }
  }, [location.pathname, currentCompany, navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem("currentCompany");
    setCurrentCompany(null);
    toast.info("Logged out successfully");
    navigate("/company-login");
  };

  return (
    <nav className="fixed left-0 top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-border shadow-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-semibold tracking-tight">CRM</span>
              <span className="text-xs py-0.5 px-1.5 bg-primary/10 text-primary rounded-md">Beta</span>
            </Link>
            
            {currentCompany && (
              <div className="ml-4 border-l pl-4">
                <div className="text-sm font-medium">{currentCompany.companyName}</div>
              </div>
            )}
            
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
          
          <div className="flex items-center space-x-2">
            {currentCompany && (
              <>
                <Link to="/company-profile" className="hidden sm:flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Building className="h-4 w-4" />
                  <span>Company Profile</span>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            )}
            
            <Link to={currentCompany ? "/company-profile" : "/company-login"} className="rounded-full w-8 h-8 bg-accent flex items-center justify-center" aria-label="User menu">
              <span className="text-xs font-medium">{initials}</span>
            </Link>
            
            <button
              type="button"
              className="sm:hidden ml-1 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
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
          
          {currentCompany && (
            <>
              <Link
                to="/company-profile"
                className="group flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building className="h-5 w-5" />
                <span>Company Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full group flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
