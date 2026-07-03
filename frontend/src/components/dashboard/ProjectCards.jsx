import { STATUS_STYLES } from '../../constants/projects';

function ProjectCard({ project, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
            <div>
                <div className="flex justify-between items-start gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[project.durum] || STATUS_STYLES.BEKLEMEDE}`}>
                        {project.durum}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-3 tracking-tight">{project.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{project.notlar}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Detayları Yönet →</button>
            </div>
        </div>
    );
}

function ProjectCards({ projects, onCardClick }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => onCardClick(project)}/>
            ))}
        </div>
    );
}

export default ProjectCards;
