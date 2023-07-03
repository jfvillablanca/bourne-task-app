import { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { Project } from './api';
import {
    CardView,
    Header,
    ProjectTitle,
    Sidebar,
    ToastContainer,
} from './components';

function App() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const projectsQuery = Project.useFindAll();
    const projects = projectsQuery.data;

    useEffectOnce(() => {
        if (projects) {
            const initialProjectId = projects[0]._id;
            setSelectedProject(() => initialProjectId);
        }
    });

    const handleClickedProject = (projectId: string) => {
        setSelectedProject(() => projectId);
    };

    return (
        <>
            <ToastContainer />
            <div className="grid auto-rows-min h-screen text-lg bg-base-200">
                <Header className="row-start-1 col-span-2 border-b border-base-300" />
                <Sidebar
                    className="row-start-2 row-span-1 w-max px-2 py-4 border-r border-base-300"
                    projectQuery={projectsQuery}
                    handleClickedProject={handleClickedProject}
                />
                <div className="row-start-2 col-start-2 bg-base-100 overflow-x-auto">
                    <ProjectTitle className="m-4" projectId={selectedProject} />
                    {selectedProject && (
                        <CardView className="p-4" projectId={selectedProject} />
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
