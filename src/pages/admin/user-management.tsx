import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, RefreshCw, Eye, Edit, Ban, Unlock } from "lucide-react";

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usersData, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/admin/users", { page: currentPage, search: searchQuery, status: statusFilter }],
    enabled: !!user?.isAdmin,
  });

  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/block`, { blocked });
    },
    onSuccess: (_, { blocked }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: blocked ? "User blocked" : "User unblocked",
        description: `User has been ${blocked ? "blocked" : "unblocked"} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleBlockUser = (userId: string, currentlyBlocked: boolean) => {
    const action = currentlyBlocked ? "unblock" : "block";
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      blockUserMutation.mutate({ userId, blocked: !currentlyBlocked });
    }
  };

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Input
                  data-testid="input-search-users"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRefresh} data-testid="button-refresh-users">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {usersData?.users && usersData.users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                        Last Login
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                        IP Address
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersData.users.map((userItem: any, index: number) => (
                      <tr key={userItem.id} data-testid={`user-row-${index}`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {getUserInitials(userItem.username)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {userItem.username}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {userItem.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant={userItem.isBlocked ? "destructive" : "default"}
                            data-testid={`user-status-${index}`}
                          >
                            {userItem.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">
                          {userItem.lastLogin 
                            ? new Date(userItem.lastLogin).toLocaleDateString()
                            : "Never"
                          }
                        </td>
                        <td className="py-4 px-6">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {userItem.ipAddress || "Unknown"}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-view-user-${index}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-user-${index}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-toggle-block-user-${index}`}
                              onClick={() => handleBlockUser(userItem.id, userItem.isBlocked)}
                              disabled={blockUserMutation.isPending}
                            >
                              {userItem.isBlocked ? (
                                <Unlock className="h-4 w-4 text-green-500" />
                              ) : (
                                <Ban className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground" data-testid="text-users-count">
                  Showing 1-{usersData.users.length} of {usersData.total} users
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-previous-page"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-next-page"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={usersData.users.length < 50}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12" data-testid="no-users-message">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
