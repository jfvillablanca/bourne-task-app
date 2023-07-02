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
            <div className="grid auto-rows-min h-screen text-lg">
                <Header className="row-start-1 col-span-2 border-b border-base-300 -mb-[1px]" />
                <Sidebar
                    className="row-start-3 row-span-2"
                    projectQuery={projectsQuery}
                    handleClickedProject={handleClickedProject}
                />
                <ProjectTitle
                    className="row-start-2 row-span-1 col-start-2 mb-4"
                    projectId={selectedProject}
                />
                {selectedProject && (
                    <CardView
                        className="row-start-3 row-span-1 h-full"
                        projectId={selectedProject}
                    />
                )}
            </div>
        </>
    );
}

export default App;
