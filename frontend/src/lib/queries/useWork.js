import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/apiFetch';
import { toast } from 'sonner';

export const WORK_KEYS = {
    history: ['work', 'history'],
    stats: ['work', 'stats'],
};

export const useWorkHistory = ({ employeeId, page = 0, size = 10, date = '' }) => {
    return useQuery({
        queryKey: [...WORK_KEYS.history, employeeId, page, size, date],

        queryFn: async () => {
            if (!employeeId) return { content: [], totalPages: 0 };

            const params = new URLSearchParams();
            params.append('employeeId', employeeId);
            params.append('page', page.toString());
            params.append('size', size.toString());

            if (date) {
                params.append('date', date);
            }

            return await apiFetch(`/work/list?${params.toString()}`);
        },

        enabled: !!employeeId,
        keepPreviousData: true,
        staleTime: 1000 * 30,
    });
};

export const useCheckIn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (employeeId) => {
            return await apiFetch(`/work/checkin?employeeId=${employeeId}`, {
                method: 'POST'
            });
        },
        onSuccess: () => {
            toast.success('Ponto iniciado com sucesso!');
            queryClient.invalidateQueries({ queryKey: WORK_KEYS.history });
        },
        onError: (error) => {
            toast.error(error.message || 'Erro ao iniciar ponto');
        }
    });
};

// --- HOOK: Fazer Check-out ---
export const useCheckOut = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ employeeId, reason_id, details }) => {
            return await apiFetch(`/work/checkout?employeeId=${employeeId}`, {
                method: 'POST',
                body: JSON.stringify({ reason_id, details })
            });
        },
        onSuccess: () => {
            toast.success('Expediente finalizado!');
            queryClient.invalidateQueries({ queryKey: WORK_KEYS.history });
        },
        onError: (error) => {
            toast.error(error.message || 'Erro ao finalizar ponto');
        }
    });
};