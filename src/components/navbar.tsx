
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart,
  Settings,
  HelpCircle,
  Power,
  BarChart3
} from "lucide-react"

import { MainNavItem } from "@/types"

interface DocsConfig {
  mainNav: MainNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/customers",
    },
    {
      label: "Leads",
      icon: ShoppingCart,
      href: "/leads",
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
    },
    {
      label: "Sentiment Analysis",
      icon: BarChart3,
      href: "/sentiment-analysis"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      label: "Help",
      icon: HelpCircle,
      href: "/help",
    },
    {
      label: "Logout",
      icon: Power,
      href: "/logout",
    },
  ],
}

export function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold">CRM</span>
      </div>
      <nav className="flex items-center space-x-4">
        {docsConfig.mainNav.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center space-x-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden md:inline-block">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
