import { useEffect, useState } from 'react';

import { Project } from './api';
import { CardView, Sidebar } from './components';
function App() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const projectsQuery = Project.useFindAll();
    const projects = projectsQuery.data;

    useEffect(() => {
        if (projects) {
            const initialProjectId = projects[0]._id;
            setSelectedProject(() => initialProjectId);
        }
    }, [projects]);

    const handleClickedProject = (projectId: string) => {
        setSelectedProject(() => projectId);
    };

    return (
        <div className="grid grid-cols-5 py-5">
            <Sidebar
                className="col-span-1"
                projects={projects}
                handleClickedProject={handleClickedProject}
            />
            {selectedProject && (
                <CardView className="col-span-4" projectId={selectedProject} />
            )}
        </div>
    );
}

export default App;
