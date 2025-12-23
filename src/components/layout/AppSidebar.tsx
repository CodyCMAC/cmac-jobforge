import { 
  Home, 
  Briefcase, 
  Calendar, 
  BarChart3, 
  Calculator, 
  Ruler, 
  FileText, 
  Package, 
  ClipboardList, 
  Receipt, 
  DollarSign, 
  Users, 
  FolderOpen, 
  Tag, 
  Zap, 
  MessageSquare,
  ChevronLeft,
  ChevronDown,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import cmacLogo from "@/assets/cmac-logo.png";
import cmacIcon from "@/assets/cmac-icon.png";

interface NavSection {
  label?: string;
  items: NavItem[];
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navigation: NavSection[] = [
  {
    items: [
      { icon: Home, label: "Home", href: "/" },
      { icon: Briefcase, label: "Jobs", href: "/jobs" },
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: BarChart3, label: "Performance", href: "/performance" },
    ],
  },
  {
    label: "Tools",
    items: [
      { icon: Calculator, label: "Instant Estimator", href: "/instant-estimator" },
      { icon: Ruler, label: "Measurements", href: "/measurements" },
      { icon: FileText, label: "Proposals", href: "/proposals" },
      { icon: Package, label: "Material Orders", href: "/material-orders" },
      { icon: ClipboardList, label: "Work Orders", href: "/work-orders" },
      { icon: Receipt, label: "Invoices", href: "/invoices" },
      { icon: DollarSign, label: "Payments", href: "/payments" },
    ],
  },
  {
    label: "Manage",
    items: [
      { icon: Users, label: "Contacts", href: "/contacts" },
      { icon: FolderOpen, label: "File Manager", href: "/files" },
      { icon: Tag, label: "Catalog", href: "/catalog" },
      { icon: Zap, label: "Automations", href: "/automations" },
      { icon: MessageSquare, label: "Communications", href: "/communications" },
    ],
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed = false, onCollapse }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 w-full group">
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-primary/10 transition-all duration-200 group-hover:bg-primary/20",
            collapsed ? "w-8 h-8" : "w-8 h-8"
          )}>
            <img 
              src={cmacIcon} 
              alt="CMAC" 
              className="h-5 w-5 object-contain invert"
            />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">
              JobForge
            </span>
          )}
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 w-full hover:bg-sidebar-accent rounded-lg p-2 transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-primary-foreground font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-xs text-sidebar-foreground truncate">{user.email}</p>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-sidebar-foreground transition-transform duration-200",
                  userMenuOpen && "rotate-180"
                )} />
              </>
            )}
          </button>
          {userMenuOpen && !collapsed && (
            <div className="mt-2 space-y-1 animate-fade-in">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {navigation.map((section, sectionIdx) => (
          <div key={sectionIdx} className={cn(sectionIdx > 0 && "mt-6")}>
            {section.label && !collapsed && (
              <p className="px-3 mb-3 text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest">
                {section.label}
              </p>
            )}
            {collapsed && sectionIdx > 0 && (
              <div className="mx-3 mb-3 border-t border-sidebar-border" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "nav-item group",
                      isActive && "nav-item-active",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "group-hover:text-primary"
                    )} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme Toggle & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
            collapsed && "justify-center"
          )}
          title={collapsed ? (theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode") : undefined}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
          {!collapsed && (
            <span className="font-medium">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => onCollapse?.(!collapsed)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <ChevronLeft className={cn(
            "w-5 h-5 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
