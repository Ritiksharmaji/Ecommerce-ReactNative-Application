import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import api, { setAuthToken } from "@/constants/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ADMIN_TOKEN_KEY = "admin_token";

type AuthUser = {
    name: string;
    email: string;
    role?: "user" | "admin";
};

type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    isLoaded: boolean;
    isSignedIn: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    // Admin panel uses a separate token from POST /api/user/admin
    adminToken: string | null;
    adminLogin: (email: string, password: string) => Promise<void>;
    adminLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Restore session on app start. The web backend has no `/me` endpoint, so we
    // persist the basic profile (name/email) locally alongside the token.
    useEffect(() => {
        const restore = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
                const storedUser = await SecureStore.getItemAsync(USER_KEY);
                const storedAdmin = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
                if (storedToken) {
                    setAuthToken(storedToken);
                    setToken(storedToken);
                    setUser(storedUser ? JSON.parse(storedUser) : null);
                }
                if (storedAdmin) setAdminToken(storedAdmin);
            } catch {
                // ignore corrupt state
            } finally {
                setIsLoaded(true);
            }
        };
        restore();
    }, []);

    const persist = async (t: string, u: AuthUser) => {
        await SecureStore.setItemAsync(TOKEN_KEY, t);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
        setAuthToken(t);
        setToken(t);
        setUser(u);
    };

    // POST /api/user/login  ->  { success, token }  (errors come back as { success:false, message } with HTTP 200)
    const signIn = async (email: string, password: string) => {
        const { data } = await api.post("/api/user/login", { email, password });
        if (!data?.success) throw new Error(data?.message || "Invalid credentials");
        await persist(data.token, { name: email.split("@")[0], email });
    };

    // POST /api/user/register  ->  { success, token }
    const signUp = async (name: string, email: string, password: string) => {
        const { data } = await api.post("/api/user/register", { name, email, password });
        if (!data?.success) throw new Error(data?.message || "Could not create account");
        await persist(data.token, { name: name || email.split("@")[0], email });
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        setAuthToken(null);
        setToken(null);
        setUser(null);
    };

    // POST /api/user/admin  ->  { success, token }  (admin token differs from user token)
    const adminLogin = async (email: string, password: string) => {
        const { data } = await api.post("/api/user/admin", { email, password });
        if (!data?.success) throw new Error(data?.message || "Invalid admin credentials");
        await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, data.token);
        setAdminToken(data.token);
    };

    const adminLogout = async () => {
        await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
        setAdminToken(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, token, isLoaded, isSignedIn: !!token, signIn, signUp, signOut, adminToken, adminLogin, adminLogout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
