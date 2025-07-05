"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { User, Loader2, Copy, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [userData, setUserData] = useState<{
    username: string;
    profilePicture: string;
    referal: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [senderdata, setSenderdata] = useState<{
    username?: string;
    profilePicture?: string;
  }>({});
  const [usersOfCurrentUser, setUsersOfcurrentUser] = useState([]);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const { users } = await fetch(
        `/api/fetchlinkusers?username=${userData?.username}`,
        { method: "POST" }
      ).then((res) => res.json());
      setUsersOfcurrentUser(users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/profile", { method: "POST" });
        if (response.ok) {
          const { data } = await response.json();
          setUserData(data);
          if (data.referal) {
            const { user } = await fetch(
              `/api/fetchsenderdata?username=${data.referal}`,
              {
                method: "POST",
              }
            ).then((res) => res.json());
            setSenderdata(user);
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

  useEffect(() => {
    fetchUsers();
  }, [userData]);

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
    <div className="container mx-auto py-8 space-y-6">
      {/* Main Profile Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>
                View your account information and settings
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
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32">
              {userData.profilePicture ? (
                <AvatarImage src={userData.profilePicture} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-gray-200">
                  <User className="w-16 h-16 text-gray-500" />
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700">Username</h3>
            <p className="text-sm py-2 px-3 border rounded-md bg-gray-50">
              {userData.username}
            </p>
          </div>

          {/* Referral Field */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700">Referral Link</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm py-2 px-3 border rounded-md break-all bg-gray-50">
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
        </CardContent>
      </Card>

      {/* Sender Information Card */}
      {senderdata && senderdata.username && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Who Invited You</CardTitle>
            <CardDescription>
              Information about the user who invited you to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {senderdata.profilePicture ? (
                  <AvatarImage src={senderdata.profilePicture} alt="Sender" />
                ) : (
                  <AvatarFallback className="bg-gray-200">
                    <User className="w-8 h-8 text-gray-500" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{senderdata.username}</h3>
                <p className="text-sm text-gray-600">
                  Invited you to join the platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users You've Invited Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">People You've Invited</CardTitle>
          <CardDescription>
            Users who joined using your invite link ({usersOfCurrentUser.length}
            )
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersOfCurrentUser.length > 0 ? (
            <div className="space-y-3">
              {usersOfCurrentUser.map((user: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <Avatar className="w-12 h-12">
                    {user.profilePicture ? (
                      <AvatarImage
                        src={user.profilePicture}
                        alt={user.username}
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-200">
                        <User className="w-6 h-6 text-gray-500" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{user.username}</h4>
                    <p className="text-sm text-gray-600">
                      Joined using your invite link
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">
                No one has used your invite link yet
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Share your invite link to start building your network!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
