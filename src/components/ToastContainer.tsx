import {
    CloseButtonProps,
    ToastContainer as ToastContainerWrapped,
} from 'react-toastify';

import { cn } from '../lib/utils';

import { ExitButton } from './ui';

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
    return <ExitButton onClick={closeToast} />;
};

export default ToastContainer;
