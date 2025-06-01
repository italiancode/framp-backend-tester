"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: string;
  profile?: object;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("https://framp-backend.vercel.app/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push("/signup");
        }
      } catch (error) {
        router.push("/signup");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("https://framp-backend.vercel.app/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("framp_user");
      router.push("/signup");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">FRAMP Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Here's your account information and dashboard overview.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-blue-700 mb-1">
                User ID
              </label>
              <p className="text-blue-900 font-mono text-sm break-all">
                {user.id}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-green-700 mb-1">
                Email Address
              </label>
              <p className="text-green-900 font-medium">
                {user.email}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Role
              </label>
              <p className="text-purple-900 font-medium capitalize">
                {user.role}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Status
              </label>
              <p className="text-gray-900 font-medium">
                ✅ Active
              </p>
            </div>

            {user.profile && (
              <div className="bg-yellow-50 p-4 rounded-lg md:col-span-2">
                <label className="block text-sm font-medium text-yellow-700 mb-1">
                  Profile Data
                </label>
                <pre className="text-yellow-900 text-xs bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(user.profile, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left transition duration-200">
              <div className="text-lg font-semibold mb-1">View Profile</div>
              <div className="text-blue-100 text-sm">Manage your account settings</div>
            </button>

            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left transition duration-200">
              <div className="text-lg font-semibold mb-1">API Access</div>
              <div className="text-green-100 text-sm">Manage API keys and access</div>
            </button>

            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-left transition duration-200">
              <div className="text-lg font-semibold mb-1">Support</div>
              <div className="text-purple-100 text-sm">Get help and documentation</div>
            </button>
          </div>
        </div>

        {/* Raw User Data (for debugging) */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Raw User Data (Debug Info)
          </h4>
          <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}