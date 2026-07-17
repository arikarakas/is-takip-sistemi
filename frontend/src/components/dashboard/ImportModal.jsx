import { LABEL_CLASS_NAME, INPUT_CLASS_NAME } from '../../constants/projects';

export default function ImportModal({
    isOpen,
    onClose,
    onImport,
    isImporting,
    result,
    error,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-6 pb-4 shrink-0 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Excel / CSV İçe Aktar</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Başlık satırı otomatik bulunur; farklı dosyalarda numarayı elle girebilirsiniz.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
                        aria-label="Kapat"
                    >
                        ×
                    </button>
                </header>

                <form
                    className="p-6 overflow-y-auto flex-1"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        onImport(formData);
                    }}
                >
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-sm space-y-1">
                            <p><strong>{result.imported}</strong> satır içe aktarıldı.</p>
                            {result.failed > 0 && (
                                <p><strong>{result.failed}</strong> satır hata verdi.</p>
                            )}
                            <p className="text-emerald-700">Başlık satırı: <strong>{result.header_row}</strong></p>
                            {result.errors?.length > 0 && (
                                <ul className="mt-2 space-y-1 text-red-600 list-disc list-inside">
                                    {result.errors.map((item) => (
                                        <li key={`${item.row}-${item.reason}`}>
                                            Satır {item.row}: {item.reason}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className={LABEL_CLASS_NAME}>Dosya (.xlsx, .xls, .csv)</label>
                            <input
                                name="file"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                required
                                className={`${INPUT_CLASS_NAME} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700`}
                            />
                        </div>

                        <div>
                            <label className={LABEL_CLASS_NAME}>
                                Başlık satırı <span className="font-normal normal-case">(isteğe bağlı)</span>
                            </label>
                            <input
                                name="header_row"
                                type="number"
                                min="1"
                                max="100"
                                placeholder="Örn: 4 — boş bırakılırsa otomatik"
                                className={INPUT_CLASS_NAME}
                            />
                            <p className="text-xs text-slate-400 mt-1.5">
                                Üstte boş satırlar varsa (ör. 3. satır başlıksa) buraya 3 yazın.
                                Bilmiyorsanız boş bırakın; sistem kolon başlıklarını otomatik arar.
                            </p>
                        </div>
                    </div>

                    <footer className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
                        >
                            Kapat
                        </button>
                        <button
                            type="submit"
                            disabled={isImporting}
                            className="flex-1 rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                        >
                            {isImporting ? 'Aktarılıyor...' : 'İçe Aktar'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
