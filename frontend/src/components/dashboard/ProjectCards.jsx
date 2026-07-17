import { STATUS_STYLES } from '../../constants/projects';

function isProjectCompleted(project) {
    return (project.durum || '').trim().toLocaleUpperCase('tr-TR') === 'TAMAMLANDI';
}

function ProjectCard({ project, onClick }) {
    const isCompleted = isProjectCompleted(project);
    return (
        <div 
            onClick={onClick}
            className={`p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition ${
                isCompleted
                    ? 'bg-emerald-100 border border-emerald-300 hover:bg-emerald-50'
                    : 'bg-white border border-slate-100 hover:bg-slate-50 hover:border-slate-300'
            }`}>
            <div>
                <div className="flex justify-between items-start gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[project.durum] || STATUS_STYLES.BEKLEMEDE}`}>
                        {project.durum}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-3 tracking-tight">{project.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{project.aksiyon}</p>
            </div>
            <div className={`mt-6 pt-4 border-t flex justify-end ${isCompleted ? 'border-emerald-200' : 'border-slate-200'}`}>
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
