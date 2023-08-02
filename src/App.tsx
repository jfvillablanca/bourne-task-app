import { useState } from 'react';

import { Project } from './api';
import { CardView, Header, ProjectTitle, Sidebar } from './components';
import { SelectedProjectContext } from './context';

function App() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const projectsQuery = Project.useFindAll();

    const handleClickedProject = (projectId: string) => {
        setSelectedProject(() => projectId);
    };

    return (
        <>
            <SelectedProjectContext.Provider
                value={{ selectedProject, setSelectedProject }}
            >
                <div className="flex flex-col h-screen text-lg bg-base-200">
                    <Header className="border-b border-base-300" />
                    <div className="flex-1 flex">
                        <Sidebar
                            className="w-max px-2 py-4 border-r border-base-300"
                            projectQuery={projectsQuery}
                            handleClickedProject={handleClickedProject}
                        />
                        <div className="flex-1 px-4 bg-base-100 overflow-x-auto">
                            <ProjectTitle
                                className="m-4"
                                projectId={selectedProject}
                            />
                            {selectedProject && (
                                <CardView
                                    className="p-4"
                                    projectId={selectedProject}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </SelectedProjectContext.Provider>
        </>
    );
}

export default App;
