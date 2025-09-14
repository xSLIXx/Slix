import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Shield, Clock, Download } from "lucide-react";
import { AccessKey } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: userKeys } = useQuery<AccessKey[]>({
    queryKey: ["/api/keys"],
    enabled: !!user,
  });

  const activeKeysCount = userKeys?.filter((key) => key.isActive && (!key.expiresAt || new Date(key.expiresAt) > new Date())).length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Key className="text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Keys</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-keys">
                  {activeKeysCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Shield className="text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                <p className="text-lg font-semibold text-green-500" data-testid="text-account-status">
                  {user?.isBlocked ? "Blocked" : "Active"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="text-sm font-medium text-foreground" data-testid="text-last-login">
                  {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Download className="text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Keys</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-keys">
                  {userKeys?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userKeys && userKeys.length > 0 ? (
              userKeys.slice(0, 5).map((key: any, index: number) => (
                <div key={key.id} className="flex items-center space-x-4" data-testid={`activity-item-${index}`}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Key {key.keyValue} was {key.usedAt ? 'used' : 'created'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(key.usedAt || key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8" data-testid="no-activity">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
