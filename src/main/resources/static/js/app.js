const {useState, useEffect, useCallback, useMemo} = React;

// Reads a cookie value (used to echo the XSRF-TOKEN cookie as the X-XSRF-TOKEN header for
// CSRF-protected state-changing requests).
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

const EVENTS_PER_PAGE = 10;
const API_URL = '/v1/subscriptions';

function App() {

    const [subscriptions, setSubscriptions] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [editing, setEditing] = useState(null);

    const fetchSubscriptions = useCallback(() => {
        setLoading(true);
        setError(null);

        const controller = new AbortController();

        fetch(`${API_URL}?page=${page}&size=${EVENTS_PER_PAGE}`, {signal: controller.signal})
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP_${res.status}`);
                }
                return res.json();
            })
            .then(json => {
                const content = json.content;
                setSubscriptions(Array.isArray(content) ? content : []);

                const totalElements = json.page ? json.page.totalElements : 0;
                setTotalElements(typeof totalElements === "number" ? totalElements : 0);
            })
            .catch(err => {
                if (err.name === "AbortError") {
                    return;
                }

                console.error("[Subscriptions] Load error:", err.message);
                setError("Unable to fetch subscription data.");
            })
            .finally(() => {
                setLoading(false);
            });

        return () => controller.abort();
    }, [page]);

    useEffect(() => {
        const cleanup = fetchSubscriptions();
        return () => cleanup && cleanup();
    }, [fetchSubscriptions]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(totalElements / EVENTS_PER_PAGE));
    }, [totalElements]);

    const handlePageChange = useCallback((nextPage) => {
        const pageZeroBased = nextPage - 1;
        setPage((prev) => Math.min(Math.max(0, pageZeroBased), totalPages - 1));
    }, [totalPages]);

    if (editing) {
        return (<EditForm
            subscription={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
                setEditing(null);
                fetchSubscriptions();
            }}
        />);
    }


    return (<div>
        {error && (<div className="alert error" style={{marginBottom: "1rem"}}>
            {error}
        </div>)}

        <SubscriptionTable subscriptions={subscriptions}
                           loading={loading}
                           onEdit={setEditing}
        />

        <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
        />
    </div>);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
