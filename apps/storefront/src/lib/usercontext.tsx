// apps/storefront/src/lib/user-context.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

type UserContextType = {
  customer: Customer | null;
  login: (customer: Customer) => void;
  logout: () => void;
  isLoggedIn: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("customer");
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("customer");
      }
    }
  }, []);

  const login = (cust: Customer) => {
    setCustomer(cust);
    localStorage.setItem("customer", JSON.stringify(cust));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("customer");
  };

  return (
    <UserContext.Provider
      value={{
        customer,
        login,
        logout,
        isLoggedIn: !!customer,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}