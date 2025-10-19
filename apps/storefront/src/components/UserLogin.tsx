// apps/storefront/src/components/UserLogin.tsx
import React, { useState } from "react";
import { fetchCustomerByEmail } from "../lib/api";

type Props = {
  onLogin: (customer: any) => void;
};

export default function UserLogin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const customer = await fetchCustomerByEmail(email.trim().toLowerCase());
      onLogin(customer);
    } catch (err) {
      setError("Customer not found. Try: demo@example.com");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Enter your email to continue shopping</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
          }`}
        >
          {loading ? "Loading..." : "Continue"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          <strong>Test Account:</strong> demo@example.com
        </p>
      </div>
    </div>
  );
}