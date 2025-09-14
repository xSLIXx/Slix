import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Sidebar } from "@/components/sidebar";

import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProfilePage from "@/pages/profile-page";
import KeysPage from "@/pages/keys-page";
import DownloadsPage from "@/pages/downloads-page";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import UserManagement from "@/pages/admin/user-management";
import KeyGeneration from "@/pages/admin/key-generation";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <header className="bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                  Dashboard
                </h1>
                <p className="text-muted-foreground" data-testid="text-page-subtitle">
                  Welcome back to Prime UI
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground" data-testid="text-connection-status">
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={() => (
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/profile" component={() => (
        <AppLayout>
          <ProfilePage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/keys" component={() => (
        <AppLayout>
          <KeysPage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/downloads" component={() => (
        <AppLayout>
          <DownloadsPage />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/admin" adminOnly component={() => (
        <AppLayout>
          <AdminDashboard />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/admin/users" adminOnly component={() => (
        <AppLayout>
          <UserManagement />
        </AppLayout>
      )} />
      
      <ProtectedRoute path="/admin/keys" adminOnly component={() => (
        <AppLayout>
          <KeyGeneration />
        </AppLayout>
      )} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
