// API base URL - set via VITE_API_BASE_URL in .env file for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface LoginCredentials {
    email: string;
    password: string;
}

export const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
    }
};

export const checkAuth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/whoami`, {
            method: 'GET',
            credentials: 'include',
        });

        return response.ok;
    } catch {
        return false;
    }
};

/**
 * Checks if an authentication cookie exists by making a lightweight API call.
 * 
 * Note: document.cookie cannot read cross-origin cookies due to browser security.
 * This function uses the API to verify cookie presence, which is the reliable
 * way to check for cross-origin cookies.
 */
export const hasCookie = async (): Promise<boolean> => {
    return await checkAuth();
};
