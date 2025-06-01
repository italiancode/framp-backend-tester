"use client";

import { useState } from "react";

export default function TestAuthPage() {
  const [result, setResult] = useState("");

  const testDirectAuth = async () => {
    setResult("Testing NEW BACKEND with SIGNUP...");

    try {
      // Test SIGNUP with new backend that sets cookies
      const signupResponse = await fetch("https://framp-backend.vercel.app/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-frontend-key": "framp_6565fde02c6f0f3b052cf3b02daaea77cf8bd71247b0dae5939c3f7a9272af6f",
        },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`, // Use unique email
          password: "password123",
        }),
      });

      const signupData = await signupResponse.json();

      setResult(prev => prev + `\n\n📝 Signup Response (${signupResponse.status}):\n${JSON.stringify(signupData, null, 2)}`);
      setResult(prev => prev + `\n\n🍪 Cookies after signup: ${document.cookie}`);
      setResult(prev => prev + `\n\n📡 Signup headers: ${JSON.stringify(Object.fromEntries(signupResponse.headers.entries()), null, 2)}`);

      // Check if there's a token in the response
      const hasToken = signupData.auth?.access_token;
      setResult(prev => prev + `\n\n🔑 Auth tokens in response: ${hasToken ? 'YES' : 'NO'}`);

      if (hasToken) {
        setResult(prev => prev + `\n🔑 Access token: ${hasToken.substring(0, 50)}...`);
      }

      // Wait a moment then test /me endpoint
      setTimeout(async () => {
        try {
          setResult(prev => prev + `\n\n🔍 Testing /me endpoint...`);
          setResult(prev => prev + `\n🍪 Current cookies: ${document.cookie}`);

          // Test 1: With cookies (should work with new backend)
          const meResponse1 = await fetch("https://framp-backend.vercel.app/api/auth/me", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const meData1 = await meResponse1.json().catch(() => ({ error: "No JSON response" }));

          setResult(prev => prev + `\n\n👤 /me with cookies (${meResponse1.status}):\n${JSON.stringify(meData1, null, 2)}`);

          // Test 2: Try with Authorization header if cookies fail
          if (meResponse1.status === 401 && hasToken) {
            setResult(prev => prev + `\n\n🔄 Trying with Authorization header...`);

            const meResponse2 = await fetch("https://framp-backend.vercel.app/api/auth/me", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${hasToken}`,
              },
            });

            const meData2 = await meResponse2.json().catch(() => ({ error: "No JSON response" }));

            setResult(prev => prev + `\n\n👤 /me with Bearer token (${meResponse2.status}):\n${JSON.stringify(meData2, null, 2)}`);
          }

        } catch (error) {
          setResult(prev => prev + `\n\n❌ /me Error: ${error}`);
        }
      }, 1000);

    } catch (error) {
      setResult(prev => prev + `\n\n❌ Signup Error: ${error}`);
    }
  };

  const testManualCookie = async () => {
    setResult("Testing manual cookie approach...");

    // Try to manually set a framp-auth-token cookie (this is just for testing)
    document.cookie = "framp-auth-token=test-token-value; path=/; domain=localhost";

    setResult(prev => prev + `\n\n🍪 Manually set framp-auth-token cookie`);
    setResult(prev => prev + `\n🍪 Current cookies: ${document.cookie}`);

    // Test if /me endpoint accepts it
    try {
      const meResponse = await fetch("https://framp-backend.vercel.app/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const meData = await meResponse.json().catch(() => ({ error: "No JSON response" }));

      setResult(prev => prev + `\n\n👤 /me with manual cookie (${meResponse.status}):\n${JSON.stringify(meData, null, 2)}`);
    } catch (error) {
      setResult(prev => prev + `\n\n❌ Manual cookie test error: ${error}`);
    }
  };

  const clearCookies = () => {
    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    setResult(`Cookies cleared.\n🍪 Current cookies: ${document.cookie}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 FRAMP Authentication Debug</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testDirectAuth}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4"
          >
            🧪 Test Full Auth Flow
          </button>
          
          <button
            onClick={testManualCookie}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 mr-4"
          >
            🍪 Test Manual Cookie
          </button>

          <button
            onClick={() => {
              setResult("Current browser state:\n" +
                `🌐 Location: ${window.location.href}\n` +
                `🍪 All cookies: ${document.cookie}\n` +
                `🔑 Has framp-auth-token: ${document.cookie.includes('framp-auth-token')}\n` +
                `📱 User agent: ${navigator.userAgent}`
              );
            }}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 mr-4"
          >
            📊 Check Browser State
          </button>
          
          <button
            onClick={clearCookies}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 mr-4"
          >
            🗑️ Clear Cookies
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Output:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
            {result || "Click a button to start testing..."}
          </pre>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 What to look for:</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• <strong>Set-Cookie headers</strong> in the signup response</li>
            <li>• <strong>framp-auth-token</strong> cookie in document.cookie</li>
            <li>• <strong>Cookie domain/path</strong> settings</li>
            <li>• <strong>SameSite/Secure</strong> attributes</li>
            <li>• <strong>/me endpoint</strong> success after signup</li>
          </ul>
        </div>

        <div className="mt-4">
          <a 
            href="/signup" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Signup
          </a>
        </div>
      </div>
    </div>
  );
}
