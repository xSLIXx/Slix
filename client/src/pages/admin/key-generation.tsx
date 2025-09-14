import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { keyGenerationSchema } from "@shared/schema";
import { z } from "zod";
import { Key, Copy, Info, X } from "lucide-react";

type KeyGenerationForm = z.infer<typeof keyGenerationSchema>;

export default function KeyGeneration() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: recentKeys, refetch } = useQuery<any>({
    queryKey: ["/api/admin/recent-keys"],
    enabled: !!user?.isAdmin,
  });

  const form = useForm<KeyGenerationForm>({
    resolver: zodResolver(keyGenerationSchema),
    defaultValues: {
      quantity: 1,
      expirationDays: 365,
      prefix: "",
      notes: "",
    },
  });

  const generateKeysMutation = useMutation({
    mutationFn: async (data: KeyGenerationForm) => {
      const res = await apiRequest("POST", "/api/admin/generate-keys", data);
      return await res.json();
    },
    onSuccess: (keys) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/recent-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      form.reset();
      toast({
        title: "Keys generated",
        description: `Successfully generated ${keys.length} access key${keys.length > 1 ? 's' : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiRequest("DELETE", `/api/admin/keys/${keyId}`);
    },
    onSuccess: () => {
      refetch();
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

  const onSubmit = (data: KeyGenerationForm) => {
    generateKeysMutation.mutate(data);
  };

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
    if (key.usedAt) return { label: "Used", variant: "default" as const };
    return { label: "Unused", variant: "secondary" as const };
  };

  const handleDeleteKey = (keyId: string) => {
    if (confirm("Are you sure you want to delete this key? This action cannot be undone.")) {
      deleteKeyMutation.mutate(keyId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Access Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="quantity" className="text-foreground">Number of Keys</Label>
                <Input
                  id="quantity"
                  data-testid="input-key-quantity"
                  type="number"
                  min="1"
                  max="100"
                  {...form.register("quantity", { valueAsNumber: true })}
                  className="mt-2"
                />
                {form.formState.errors.quantity && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.quantity.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="expiration" className="text-foreground">Expiration Period</Label>
                <Select
                  value={form.watch("expirationDays").toString()}
                  onValueChange={(value) => form.setValue("expirationDays", parseInt(value))}
                >
                  <SelectTrigger className="mt-2" data-testid="select-expiration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="0">Never expires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="prefix" className="text-foreground">Key Prefix (Optional)</Label>
              <Input
                id="prefix"
                data-testid="input-key-prefix"
                {...form.register("prefix")}
                placeholder="e.g., PREMIUM, TRIAL, BETA"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-foreground">Notes</Label>
              <Textarea
                id="notes"
                data-testid="textarea-key-notes"
                {...form.register("notes")}
                placeholder="Optional notes about these keys..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                data-testid="button-clear-form"
                onClick={() => form.reset()}
              >
                Clear
              </Button>
              <Button
                type="submit"
                data-testid="button-generate-keys"
                disabled={generateKeysMutation.isPending}
              >
                <Key className="h-4 w-4 mr-2" />
                {generateKeysMutation.isPending ? "Generating..." : "Generate Keys"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recently Generated Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Generated Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {recentKeys && recentKeys.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Key
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
                      Used By
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentKeys.map((key: any, index: number) => {
                    const status = getKeyStatus(key);
                    return (
                      <tr key={key.id} data-testid={`recent-key-row-${index}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded text-primary">
                              {key.keyValue}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-copy-recent-key-${index}`}
                              onClick={() => copyToClipboard(key.keyValue)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={status.variant} data-testid={`recent-key-status-${index}`}>
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
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {key.user?.username || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-key-info-${index}`}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-delete-recent-key-${index}`}
                              onClick={() => handleDeleteKey(key.id)}
                              disabled={deleteKeyMutation.isPending}
                            >
                              <X className="h-4 w-4 text-destructive" />
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
            <div className="text-center py-12" data-testid="no-recent-keys">
              <p className="text-muted-foreground">No keys generated yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
