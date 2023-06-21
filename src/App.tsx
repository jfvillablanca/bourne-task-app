import { useState } from 'react';

import { Project } from './api';
import { CardView, Sidebar } from './components';
function App() {
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const projectsQuery = Project.useFindAll();
    const projects = projectsQuery.data;

    const handleClickedProject = (projectId: string) => {
        setSelectedProject(() => projectId);
    };

    return (
        <div className="">
            <Sidebar
                projects={projects}
                handleClickedProject={handleClickedProject}
            />
            {selectedProject && <CardView projectId={selectedProject} />}
        </div>
    );
}

export default App;
