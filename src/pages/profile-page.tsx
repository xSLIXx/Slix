import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const res = await apiRequest("PUT", "/api/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const res = await apiRequest("POST", "/api/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  // Update form when profile data loads
  useEffect(() => {
    if (profile && !profileForm.formState.isDirty) {
      profileForm.reset({
        username: profile?.username || "",
        email: profile?.email || "",
      });
    }
  }, [profile, profileForm]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <Input
                  id="username"
                  data-testid="input-profile-username"
                  {...profileForm.register("username")}
                  className="mt-2"
                />
                {profileForm.formState.errors.username && (
                  <p className="text-destructive text-sm mt-1">
                    {profileForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  data-testid="input-profile-email"
                  type="email"
                  {...profileForm.register("email")}
                  className="mt-2"
                />
                {profileForm.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="hwid" className="text-foreground">Hardware ID (HWID)</Label>
              <Input
                id="hwid"
                data-testid="text-hwid"
                value={profile?.hwid || "Not registered"}
                className="mt-2 bg-muted text-muted-foreground"
                readOnly
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is automatically generated and cannot be changed
              </p>
            </div>

            <div>
              <Label htmlFor="ipAddress" className="text-foreground">Current IP Address</Label>
              <Input
                id="ipAddress"
                data-testid="text-ip-address"
                value={profile?.ipAddress || "Unknown"}
                className="mt-2 bg-muted text-muted-foreground"
                readOnly
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                data-testid="button-cancel-profile"
                onClick={() => profileForm.reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="button-save-profile"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
              <Input
                id="currentPassword"
                data-testid="input-current-password"
                type="password"
                {...passwordForm.register("currentPassword")}
                className="mt-2"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-destructive text-sm mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
              <Input
                id="newPassword"
                data-testid="input-new-password"
                type="password"
                {...passwordForm.register("newPassword")}
                className="mt-2"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-destructive text-sm mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmNewPassword" className="text-foreground">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                data-testid="input-confirm-new-password"
                type="password"
                {...passwordForm.register("confirmPassword")}
                className="mt-2"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                data-testid="button-change-password"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
