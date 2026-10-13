const {useState, useEffect, useCallback} = React;

const PAGE_SIZE = 20;

const TABS = [
    {key: "members", label: "👥 Участники канала", endpoint: "/v1/members"},
    {key: "survey", label: "📋 Прошли анкетирование", endpoint: "/v1/survey"},
];

function formatDate(value) {
    if (value == null) return "—";
    if (typeof value === "number") return new Date(value * 1000).toLocaleString("ru-RU");
    return new Date(value).toLocaleString("ru-RU");
}

function displayName(u) {
    const parts = [u.firstName, u.lastName].filter(Boolean);
    if (parts.length) return parts.join(" ");
    if (u.username) return "@" + u.username;
    return "id " + u.userId;
}

function initials(u) {
    const parts = [u.firstName, u.lastName].filter(Boolean);
    if (parts.length) return parts.map(p => p[0]).join("").slice(0, 2).toUpperCase();
    if (u.username) return u.username[0].toUpperCase();
    return "?";
}

function StatusBadge({status}) {
    if (!status) return <span className="badge badge-muted">—</span>;
    const map = {
        member: "badge-green",
        creator: "badge-blue",
        administrator: "badge-blue",
        restricted: "badge-orange",
        left: "badge-gray",
        kicked: "badge-red",
    };
    return <span className={"badge " + (map[status] || "badge-muted")}>{status}</span>;
}

function PremiumBadge({premium}) {
    return premium
        ? <span className="badge badge-gold">⭐ Premium</span>
        : <span className="badge badge-muted">—</span>;
}

function UserCell({u}) {
    return (
        <div className="user">
            <div className="avatar">{initials(u)}</div>
            <div>
                <div className="name">{displayName(u)}</div>
                {u.username && <div className="username">@{u.username}</div>}
                {u.isBot && <span className="badge badge-blue">bot</span>}
            </div>
        </div>
    );
}

function MembersTable({rows}) {
    return (
        <table className="table">
            <thead>
            <tr>
                <th>Пользователь</th>
                <th>ID</th>
                <th>Язык</th>
                <th>Premium</th>
                <th>Статус</th>
                <th>Канал</th>
                <th>Обновлён</th>
            </tr>
            </thead>
            <tbody>
            {rows.map(u => (
                <tr key={u.id}>
                    <td><UserCell u={u}/></td>
                    <td className="mono">{u.userId}</td>
                    <td>{u.languageCode || "—"}</td>
                    <td><PremiumBadge premium={u.isPremium}/></td>
                    <td><StatusBadge status={u.status}/></td>
                    <td>{u.chatTitle || "—"}</td>
                    <td className="nowrap">{formatDate(u.lastUpdated)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

function SurveyTable({rows}) {
    return (
        <table className="table">
            <thead>
            <tr>
                <th>Пользователь</th>
                <th>ID</th>
                <th>Телефон</th>
                <th>Оценок</th>
                <th>Premium</th>
                <th>Анкета завершена</th>
            </tr>
            </thead>
            <tbody>
            {rows.map(u => (
                <tr key={u.id}>
                    <td><UserCell u={u}/></td>
                    <td className="mono">{u.userId}</td>
                    <td>{u.phoneNumber ? <span className="phone">📱 {u.phoneNumber}</span> : <span className="muted">—</span>}</td>
                    <td>{u.votes ? u.votes.length : 0}</td>
                    <td><PremiumBadge premium={u.isPremium}/></td>
                    <td className="nowrap">{formatDate(u.completedAt)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

function Pagination({page, totalPages, totalElements, onPageChange}) {
    if (totalPages <= 0) return null;
    return (
        <div className="pagination">
            <span className="count">{totalElements} записей</span>
            <button className="btn" disabled={page === 0} onClick={() => onPageChange(page - 1)}>‹ Назад</button>
            <span className="page-info">{page + 1} / {totalPages}</span>
            <button className="btn" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>Вперёд ›</button>
        </div>
    );
}

function App() {
    const [tab, setTab] = useState("members");
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const current = TABS.find(t => t.key === tab);

    const fetchData = useCallback(() => {
        if (!current) return;
        setLoading(true);
        setError(null);
        const url = current.endpoint + "?page=" + page + "&size=" + PAGE_SIZE;
        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error("HTTP " + r.status);
                return r.json();
            })
            .then(json => {
                setRows(Array.isArray(json.content) ? json.content : []);
                setTotalPages(json.totalPages || 0);
                setTotalElements(json.totalElements || 0);
            })
            .catch(err => setError("Не удалось загрузить данные: " + err.message))
            .finally(() => setLoading(false));
    }, [current, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const switchTab = key => {
        setTab(key);
        setPage(0);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎬 Telegram Admin</h1>
                <p className="subtitle">Участники канала и пользователи, прошедшие анкетирование</p>
            </header>

            <div className="tabs">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={"tab" + (tab === t.key ? " tab-active" : "")}
                        onClick={() => switchTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="panel">
                {error && <div className="alert error">{error}</div>}

                {tab === "members" ? <MembersTable rows={rows}/> : <SurveyTable rows={rows}/>}

                {loading && <div className="loading">Загрузка…</div>}
                {!loading && rows.length === 0 && !error && <div className="empty">Нет данных</div>}

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
