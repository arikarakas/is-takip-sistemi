import SplitText from '../../components/dashboard/SplitText';
import RecentChangesTable from '../../components/dashboard/RecentChangesTable';

export default function ActivityView({ changes, isLoading, error }) {
    return (
        <>
            <header className="mb-8">
                <h1 className="text-2xl font-black text-slate-800">
                    <SplitText
                        text="Son Değişiklikler"
                        delay={50}
                        duration={1.25}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="center"
                        showCallback
                    />
                </h1>
                <p className="text-slate-500 mt-1">Sistemdeki son 30 proje hareketi</p>
            </header>
            <RecentChangesTable
                changes={changes}
                isLoading={isLoading}
                error={error}
            />
        </>
    );
}
