/**
 * Formata segundos para o padrão HH:MM:SS
 * Ex: 3600 -> "01:00:00"
 */
export const formatSecondsToTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

/**
 * Converte minutos totais para uma string legível de horas
 * Ex: 60 -> "1h"
 * Ex: 90 -> "1h 30m"
 */
export const formatMinutesToLabel = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
};

/**
 * Obtém a duração do turno definida no .env ou usa padrão (8h)
 * Retorna objeto com: minutos totais e segundos totais
 */
export const getShiftConfig = () => {
    const minutes = Number(import.meta.env.VITE_SHIFT_MINUTES) || 480; // Padrão 480 (8h)
    return {
        minutes: minutes,
        seconds: minutes * 60
    };
};

// ... (mantenha as funções existentes getShiftConfig, formatSecondsToTime, etc.)

/**
 * Calcula a diferença segura entre uma data/hora UTC do servidor e agora.
 * Usado para inicializar os contadores.
 */
export const calculateSecondsSince = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return 0;

    // Parsing Manual Seguro (UTC)
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);

    const startTimeMs = Date.UTC(year, month - 1, day, hours, minutes, seconds);
    const now = new Date();

    const diff = Math.floor((now.getTime() - startTimeMs) / 1000);
    return diff >= 0 ? diff : 0;
};

/**
 * Formata o saldo de horas (Ex: "+00:15:00" ou "-01:30:00")
 */
export const formatTimeBalance = (currentSeconds, targetSeconds) => {
    const diff = currentSeconds - targetSeconds;
    const isNegative = diff < 0;
    const absDiff = Math.abs(diff);

    // Reutiliza sua função de formatação existente
    // Supondo que formatSecondsToTime retorna "HH:MM:SS"
    const timeStr = new Date(absDiff * 1000).toISOString().substr(11, 8);

    return `${isNegative ? '-' : '+'}${timeStr}`;
};