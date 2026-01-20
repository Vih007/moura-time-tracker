export const API_BASE_URL = 'https://moura-time-tracker-backend.agreeablesmoke-e6c0870a.brazilsouth.azurecontainerapps.io';

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

/**
 * Wrapper padronizado para fetch.
 * - Adiciona Bearer Token automaticamente.
 * - Lança erro se o status não for 2xx ou se o backend retornar status: "error".
 * - Desloga automaticamente em caso de 401/403.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('moura_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Garante que o endpoint comece com / se não tiver
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    try {
        const response = await fetch(url, { ...options, headers });

        // Tratamento de Auth (Token expirado)
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('moura_token');
            localStorage.removeItem('moura_user');
            window.location.href = '/login'; // Força redirecionamento
            throw new ApiError('Sessão expirada', response.status);
        }

        const json = await response.json();

        if (!response.ok) {
            throw new ApiError(json.message || 'Erro na requisição', response.status);
        }

        if (json.status === 'error') {
            throw new ApiError(json.message, 400);
        }

        return json.data !== undefined ? json.data : json;

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Erro de conexão com o servidor', 500);
    }
};