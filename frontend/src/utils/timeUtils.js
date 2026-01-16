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