'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
}

interface Organization {
    id: string;
    name: string;
    plan: string;
    balance: number;
}

interface AuthContextType {
    user: User | null;
    organization: Organization | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name?: string; organizationName: string; referralCode?: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            api.me()
                .then((data) => {
                    setUser(data.user);
                    setOrganization(data.organization);
                })
                .catch(() => {
                    localStorage.removeItem('auth_token');
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await api.login(email, password);
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setOrganization(data.organization);
    };

    const register = async (regData: { email: string; password: string; name?: string; organizationName: string; referralCode?: string }) => {
        const data = await api.register(regData);
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setOrganization(data.organization);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        setOrganization(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, organization, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
