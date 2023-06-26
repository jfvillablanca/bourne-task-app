import { useEffect, useState } from 'react';

import { Project } from './api';
import { CardView, ProjectTitle, Sidebar, ToastContainer } from './components';
function App() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const projectsQuery = Project.useFindAll();
    const projects = projectsQuery.data;

    useEffect(() => {
        if (projects) {
            const initialProjectId = projects[0]._id;
            setSelectedProject(() => initialProjectId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClickedProject = (projectId: string) => {
        setSelectedProject(() => projectId);
    };

    return (
        <>
            <ToastContainer />
            <div className="grid grid-cols-5 py-5 h-screen">
                <Sidebar
                    className="col-span-1"
                    projectQuery={projectsQuery}
                    handleClickedProject={handleClickedProject}
                />
                <div className="col-span-4">
                    <ProjectTitle
                        className="mb-4"
                        projectId={selectedProject}
                    />
                    {selectedProject && (
                        <CardView
                            className="h-full"
                            projectId={selectedProject}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
