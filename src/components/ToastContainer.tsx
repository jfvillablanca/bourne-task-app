import { X } from 'lucide-react';
import {
    CloseButtonProps,
    ToastContainer as ToastContainerWrapped,
} from 'react-toastify';

import { cn } from '../lib/utils';

import 'react-toastify/dist/ReactToastify.css';

function ToastContainer() {
    const className = 'p-2 rounded-lg border bg-base-200 text-base-content';
    return (
        <ToastContainerWrapped
            toastClassName={cn(className)}
            closeButton={XButton}
        />
    );
}

const XButton: React.FC<CloseButtonProps> = ({ closeToast }) => {
    return (
        <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={closeToast}
        >
            <X className="text-sm" />
        </button>
    );
};

export default ToastContainer;
