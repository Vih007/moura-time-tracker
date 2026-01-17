import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/apiFetch';
import { toast } from 'sonner';

// Chaves de Cache
export const ADMIN_KEYS = {
    dashboard: ['admin', 'dashboard'],
    employees: ['admin', 'employees'],
    report: ['admin', 'report'],
    ranking: ['admin', 'ranking']
};

// --- 1. DASHBOARD EM TEMPO REAL ---
export const useTeamStatus = () => {
    return useQuery({
        queryKey: ADMIN_KEYS.dashboard,
        queryFn: async () => apiFetch('/admin/dashboard'),
        refetchInterval: 30000,
        staleTime: 10000,
    });
};

// --- 2. LISTA DE FUNCIONÁRIOS ---
export const useEmployees = () => {
    return useQuery({
        queryKey: ADMIN_KEYS.employees,
        queryFn: async () => apiFetch('/admin/employees'),
        staleTime: 1000 * 60 * 5,
    });
};

// --- 3. ATUALIZAR ESCALA (Mutation) ---
export const useUpdateSchedule = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, start, end }) => {
            return apiFetch(`/admin/employees/${id}/schedule`, {
                method: 'PUT',
                body: JSON.stringify({ workStartTime: start, workEndTime: end })
            });
        },
        onSuccess: () => {
            toast.success("Escala atualizada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.employees });
        },
        onError: () => {
            toast.error("Erro ao atualizar escala.");
        }
    });
};

// --- 4. RELATÓRIOS ---
export const useGenerateReport = () => {
    return useMutation({
        mutationFn: async ({ employeeId, startDate, endDate }) => {
            const query = `?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;
            return apiFetch(`/admin/report${query}`);
        },
        onError: () => {
            toast.error("Erro ao gerar relatório. Verifique os filtros.");
        }
    });
};


// --- 5. RANKING DE PRODUTIVIDADE ---
export const useRanking = () => {
    return useQuery({
        queryKey: ADMIN_KEYS.ranking,
        queryFn: async () => apiFetch('/admin/ranking'),
        staleTime: 1000 * 60 * 15,
    });
};