import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Copy, Trash2 } from "lucide-react";
import { AccessKey } from "@shared/schema";

export default function KeysPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userKeys, isLoading } = useQuery<AccessKey[]>({
    queryKey: ["/api/keys"],
    enabled: !!user,
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiRequest("DELETE", `/api/keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "Key deleted",
        description: "The access key has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "Key has been copied to clipboard",
      });
    });
  };

  const getKeyStatus = (key: any) => {
    if (!key.isActive) return { label: "Inactive", variant: "secondary" as const };
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return { label: "Expired", variant: "destructive" as const };
    }
    if (key.usedAt) return { label: "Active", variant: "default" as const };
    return { label: "Unused", variant: "secondary" as const };
  };

  const handleDeleteKey = (keyId: string) => {
    if (confirm("Are you sure you want to delete this key? This action cannot be undone.")) {
      deleteKeyMutation.mutate(keyId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading keys...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Access Keys</CardTitle>
          <Button data-testid="button-request-key">
            <Plus className="h-4 w-4 mr-2" />
            Request New Key
          </Button>
        </CardHeader>
        <CardContent>
          {userKeys && userKeys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Key ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Expires
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {userKeys.map((key: any, index: number) => {
                    const status = getKeyStatus(key);
                    return (
                      <tr key={key.id} data-testid={`key-row-${index}`}>
                        <td className="py-3 px-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded text-primary">
                            {key.keyValue}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={status.variant} data-testid={`key-status-${index}`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {key.expiresAt 
                            ? new Date(key.expiresAt).toLocaleDateString()
                            : "Never"
                          }
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-copy-key-${index}`}
                              onClick={() => copyToClipboard(key.keyValue)}
                              disabled={!key.isActive}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-delete-key-${index}`}
                              onClick={() => handleDeleteKey(key.id)}
                              disabled={deleteKeyMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12" data-testid="no-keys-message">
              <div className="text-muted-foreground mb-4">
                <p className="text-lg">No access keys found</p>
                <p className="text-sm">Request a new key to get started with Prime UI</p>
              </div>
              <Button data-testid="button-request-first-key">
                <Plus className="h-4 w-4 mr-2" />
                Request Your First Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
