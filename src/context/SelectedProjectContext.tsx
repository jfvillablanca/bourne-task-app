import { createContext } from 'react';

export const SelectedProjectContext = createContext<{
    selectedProject: string | null;
    setSelectedProject: React.Dispatch<React.SetStateAction<string | null>>;
}>({
    selectedProject: null,
    setSelectedProject: () => {},
});
