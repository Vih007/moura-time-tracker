import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/apiFetch';
import { toast } from 'sonner';

// --- CHAVES DE CACHE ---
export const WORK_KEYS = {
    myHistory: ['work', 'my-history'],
    stats: ['work', 'stats'],
};

// --- HOOK: Obter Histórico Pessoal (e estado atual) ---
export const useMyHistory = (employeeId) => {
    return useQuery({
        queryKey: [...WORK_KEYS.myHistory, employeeId],
        queryFn: async () => {
            if (!employeeId) return [];
            // O backend retorna ApiResponse, o apiFetch já extrai o .data (que é List<WorkRecordResponseDTO>)
            return await apiFetch(`/work/my-history?employeeId=${employeeId}`);
        },
        enabled: !!employeeId, // Só roda se tiver ID
        staleTime: 1000 * 60, // Cache de 1 minuto
    });
};

// --- HOOK: Fazer Check-in ---
export const useCheckIn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (employeeId) => {
            // POST /work/checkin?employeeId=...
            return await apiFetch(`/work/checkin?employeeId=${employeeId}`, {
                method: 'POST'
            });
        },
        onSuccess: (data) => {
            toast.success('Ponto iniciado com sucesso!');
            // Invalida o histórico para atualizar a lista e o estado na tela imediatamente
            queryClient.invalidateQueries({ queryKey: WORK_KEYS.myHistory });
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
            // POST /work/checkout?employeeId=... body: { reason_id, details }
            return await apiFetch(`/work/checkout?employeeId=${employeeId}`, {
                method: 'POST',
                body: JSON.stringify({ reason_id, details })
            });
        },
        onSuccess: () => {
            toast.success('Expediente finalizado!');
            queryClient.invalidateQueries({ queryKey: WORK_KEYS.myHistory });
        },
        onError: (error) => {
            toast.error(error.message || 'Erro ao finalizar ponto');
        }
    });
};