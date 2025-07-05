"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { User, Loader2, Upload, Copy, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [userData, setUserData] = useState<{
    username: string;
    profilePicture: string;
    referal: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/profile", { method: "POST" });
        if (response.ok) {
          const { data } = await response.json();
          setUserData(data);
          if (data.profilePicture) {
            setPreview(data.profilePicture);
          }
        } else {
          throw new Error("Failed to fetch profile data");
        }
      } catch (error) {
        toast("Error", {
          description: "Could not load profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(selectedFile.type)) {
        toast("Invalid file type", {
          description: "Please upload a JPEG, PNG, or WEBP image",
        });
        return;
      }

      if (selectedFile.size > maxSize) {
        toast("File too large", {
          description: "Image must be less than 2MB",
        });
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setLoading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("profilePicture", file);
      }
      formData.append("username", userData.username);
      formData.append("referal", userData.referal);

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        toast("Success", {
          description: "Profile updated successfully",
        });
        setEditMode(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast("Error", {
        description: "Could not update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferral = () => {
    if (userData?.referal) {
      navigator.clipboard.writeText(
        `${window.origin}/login?invitelink=${userData.referal}`
      );
      toast("Copied!", { description: "Referral code copied to clipboard." });
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch("/api/token", {
        method: "DELETE",
      });

      if (response.ok) {
        toast("Success", {
          description: "Logged out successfully",
        });
        // Redirect to home page or login page
        router.push("/");
      } else {
        throw new Error("Failed to logout");
      }
    } catch (error) {
      toast("Error", {
        description: "Could not logout. Please try again.",
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load user profile. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>
                Manage your account information and settings
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-2"
            >
              {logoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  {preview ? (
                    <AvatarImage src={preview} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-gray-200">
                      <User className="w-16 h-16 text-gray-500" />
                    </AvatarFallback>
                  )}
                </Avatar>
                {editMode && (
                  <div className="absolute bottom-0 right-0">
                    <Label htmlFor="profilePicture" className="cursor-pointer">
                      <div className="p-2 bg-primary rounded-full text-white">
                        <Upload className="w-5 h-5" />
                      </div>
                      <Input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              {editMode ? (
                <Input
                  id="username"
                  value={userData.username}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm py-2 px-3 border rounded-md">
                  {userData.username}
                </p>
              )}
            </div>

            {/* Referral Field */}
            <div className="space-y-2">
              <Label htmlFor="referal">Referral Link</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm py-2 px-3 border rounded-md break-all">
                  Copy Invite Link
                </p>
                {userData?.username && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const link = `${window.location.origin}/login?invitelink=${userData.username}`;
                      navigator.clipboard.writeText(link);
                      toast("Copied!", {
                        description: "Referral link copied to clipboard.",
                      });
                    }}
                    aria-label="Copy referral link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              {editMode ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      // Reset any unsaved changes
                      fetch("/api/profile")
                        .then((res) => res.json())
                        .then((data) => {
                          setUserData(data);
                          setPreview(data.profilePicture || null);
                        });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setEditMode(true)}
                  variant="default"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
