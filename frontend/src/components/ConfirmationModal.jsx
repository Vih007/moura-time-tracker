import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon-wrapper">
                    <AlertTriangle size={32} />
                </div>

                <h3 className="modal-title">Finalizar Expediente?</h3>
                <p className="modal-desc">
                    O cronômetro será parado e o registro salvo no histórico. Essa ação não pode ser desfeita.
                </p>

                <div className="modal-actions">
                    <button className="btn-modal btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-modal btn-confirm-danger" onClick={onConfirm}>
                        Sim, Finalizar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;