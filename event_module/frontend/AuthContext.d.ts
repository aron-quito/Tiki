import React, { type ReactNode } from 'react';
interface User {
    id: number;
    email: string;
    role: string;
    name: string;
}
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
export declare const AuthProvider: React.FC<{
    children: ReactNode;
}>;
export declare const useAuth: () => AuthContextType;
export {};
//# sourceMappingURL=AuthContext.d.ts.map