import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Key, Ban } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-users">
                  {stats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <UserCheck className="text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-users">
                  {stats?.activeUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Key className="text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Generated Keys</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-keys">
                  {stats?.totalKeys || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Ban className="text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Blocked Users</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-blocked-users">
                  {stats?.blockedUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">User Registration</p>
                <p className="text-sm text-muted-foreground">
                  New users can register and request access keys
                </p>
              </div>
              <div className="text-sm text-green-500 font-medium">Active</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Key Validation</p>
                <p className="text-sm text-muted-foreground">
                  Desktop app authentication is functioning
                </p>
              </div>
              <div className="text-sm text-green-500 font-medium">Active</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">IP Tracking</p>
                <p className="text-sm text-muted-foreground">
                  User IP addresses are being tracked for security
                </p>
              </div>
              <div className="text-sm text-green-500 font-medium">Active</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
