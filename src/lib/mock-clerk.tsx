"use client";
// Mock Clerk components for screenshot/preview mode
import React from "react";

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SignedIn = ({ children }: { children: React.ReactNode }) => null;
export const SignedOut = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SignUpButton = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SignInButton = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const UserButton = () => null;
export const useUser = () => ({ isSignedIn: false, isLoaded: true, user: null });
export const useAuth = () => ({ isSignedIn: false, isLoaded: true, userId: null });
export const useClerk = () => ({});
export const clerkMiddleware = (fn: any) => fn;
export const createRouteMatcher = (routes: string[]) => (req: any) => true;
export const auth = async () => ({ userId: null, protect: () => {} });
