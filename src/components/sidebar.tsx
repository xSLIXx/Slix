import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Home, 
  User, 
  Key, 
  Download, 
  Settings, 
  Users, 
  Plus,
  LogOut 
} from "lucide-react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "My Keys", href: "/keys", icon: Key },
    { name: "Downloads", href: "/downloads", icon: Download },
  ];

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: Settings },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Generate Keys", href: "/admin/keys", icon: Plus },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-primary-foreground h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-foreground" data-testid="text-app-title">
              Prime UI
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Button
                key={item.name}
                variant="ghost"
                data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}

          {/* Admin Section */}
          {user?.isAdmin && (
            <div className="pt-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administration
                </h3>
              </div>
              {adminNavigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    data-testid={`nav-link-admin-${item.name.toLowerCase().replace(' ', '-').replace(' ', '-')}`}
                    onClick={() => setLocation(item.href)}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Info */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium" data-testid="text-user-initials">
                {user ? getUserInitials(user.username) : "??"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" data-testid="text-username">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
                {user?.isAdmin ? "Administrator" : "Standard User"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-logout"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
