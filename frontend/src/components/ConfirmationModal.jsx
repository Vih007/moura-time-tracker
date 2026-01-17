import React, { useState, useEffect } from 'react';
import {
    LogOut,
    Utensils,
    Coffee,
    Briefcase,
    Stethoscope, // Ícone Médico
    MoreHorizontal, // Ícone Outros
    AlertCircle
} from 'lucide-react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const [selectedReason, setSelectedReason] = useState(null);
    const [otherDetails, setOtherDetails] = useState('');

    // Reseta estados quando abre/fecha
    useEffect(() => {
        if (isOpen) {
            setSelectedReason(null);
            setOtherDetails('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Lista de Motivos Atualizada
    const reasons = [
        { id: 'end_shift', label: 'Fim de Expediente', icon: LogOut, color: '#ef4444' },
        { id: 'lunch_start', label: 'Almoço', icon: Utensils, color: '#f59e0b' },
        { id: 'break_start', label: 'Pausa / Café', icon: Coffee, color: '#8b5cf6' },
        { id: 'meeting_start', label: 'Reunião', icon: Briefcase, color: '#10b981' },
        { id: 'medical', label: 'Médico', icon: Stethoscope, color: '#3b82f6' }, // Novo
        { id: 'other', label: 'Outros', icon: MoreHorizontal, color: '#64748b' } // Novo
    ];

    // Validação:
    // Se for "Outros", o campo de texto não pode estar vazio.
    // Se for qualquer outro, basta estar selecionado.
    const isValid = () => {
        if (!selectedReason) return false;
        if (selectedReason === 'other' && otherDetails.trim().length < 3) return false;
        return true;
    };

    const handleConfirm = () => {
        if (isValid()) {
            // Retorna objeto completo
            onConfirm({
                reasonId: selectedReason,
                details: selectedReason === 'other' ? otherDetails : null
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <div>
                    <h3 className="modal-title">Registrar Saída</h3>
                    <p className="modal-desc">
                        Selecione o motivo do check-out para o histórico.
                    </p>
                </div>

                {/* GRID DE OPÇÕES (3 Colunas) */}
                <div className="reason-grid">
                    {reasons.map((item) => {
                        const isSelected = selectedReason === item.id;
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.id}
                                className={`reason-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedReason(item.id)}
                            >
                                <Icon
                                    size={24}
                                    className="reason-icon"
                                    color={isSelected ? '#004B8D' : item.color}
                                />
                                <span className="reason-label">{item.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* CAMPO CONDICIONAL PARA "OUTROS" */}
                {selectedReason === 'other' && (
                    <div className="details-input-wrapper">
                        <label className="details-label">Descreva o motivo:</label>
                        <textarea
                            className="details-textarea"
                            placeholder="Ex: Consulta odontológica, Assunto pessoal..."
                            value={otherDetails}
                            onChange={(e) => setOtherDetails(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                <div className="modal-actions">
                    <button className="btn-modal btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn-modal btn-confirm-danger"
                        onClick={handleConfirm}
                        disabled={!isValid()}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;