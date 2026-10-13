function EditForm({subscription, onClose, onSaved}) {

    const [chatId, setChatId] = useState(subscription.chatId);
    const [token, setToken] = useState(subscription.token || "");
    const [minutes, setMinutes] = useState(Number(subscription.interval) || 5);
    const [active, setActive] = useState(Boolean(subscription.active));

    const INTERVAL_OPTIONS = [1, 5, 15, 30, 45, 60];

    const save = () => {
        fetch(`/v1/subscriptions/${subscription.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": getCookie("XSRF-TOKEN")
            },
            body: JSON.stringify({chatId, token, active, minutes: Number(minutes)})
        })
            .then(r => {
                if (!r.ok) throw new Error();
                return r.status === 204 ? null : r.json();
            })
            .then(() => onSaved())
            .catch(() => alert("Save error"));
    };


    return (<div className="container" style={{marginTop: "2rem"}}>
        <div className="col-12">
            <div className="row center">
                <div className="col-6">
                    <h4>Edit subscription</h4>
                </div>
            </div>
        </div>
        <div className="col-12">
            <label>Id: {subscription.id}</label>
            <br/>
            <br/>
            <label>Vendor: {subscription.vendor}</label>
            <br/>
            <br/>
            <label>Type: {subscription.type}</label>
            <br/>
            <br/>
            <label>Chat Id</label>
            <br/>
            <input type="text"
                   value={chatId}
                   style={{width: "400px"}}
                   onChange={e => setChatId(Number(e.target.value))}/>
            <br/>
            <br/>
            <label>Telegram Bot Token</label>
            <br/>
            <input type="text"
                   value={token}
                   style={{width: "400px"}}
                   onChange={e => setToken(e.target.value)}/>
            <br/>
            <br/>
            <label>Scheduler</label>
            <br/>
            <select value={minutes}
                    style={{width: "400px"}}
                    onChange={e => setMinutes(Number(e.target.value))}>
                {INTERVAL_OPTIONS.map(m => (
                    <option key={m} value={m}>{m} min</option>
                ))}
            </select>
            <br/>
            <br/>
            <label>Active: </label>
            <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
            />
            <br/>
            <br/>
            <div style={{marginTop: "1rem"}}>
                <button className="button outline" onClick={onClose} style={{marginLeft: "1rem"}}>Cancel</button>
                <button className="button" onClick={save}>Save</button>
            </div>
        </div>
    </div>);
}
