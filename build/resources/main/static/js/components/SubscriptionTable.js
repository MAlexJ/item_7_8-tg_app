function SubscriptionTable({subscriptions, loading, onEdit}) {
    return (<div className="row">
        <div className="col-12">
            <div className="row center">
                <div className="col-6">
                    <h4>Subscriptions</h4>
                </div>
            </div>
        </div>
        <div className="col-12">
            <table className="item-table">
                <thead>
                <tr>
                    <th className="message-cell" style={{textAlign: 'center'}}>Subscription</th>
                    <th className="message-cell" style={{textAlign: 'center'}}>Vendor</th>
                    <th className="message-cell" style={{textAlign: 'center'}}>Type</th>
                    <th className="message-cell" style={{textAlign: 'center'}}>Scheduler</th>
                    <th className="message-cell" style={{textAlign: 'center'}}>Chat Id</th>
                    <th className="message-cell" style={{textAlign: 'center'}}>Telegram bot token</th>
                    <th className="message-cell" style={{textAlign: 'center'}}>Active</th>
                    <th className="message-cell"></th>
                </tr>
                </thead>
                <tbody>
                {subscriptions.length > 0 ? (subscriptions.map((subscription, index) => (<tr key={index}>
                    <td className="message-cell" style={{textAlign: 'center'}}>{subscription.id}</td>
                    <td className="message-cell" style={{textAlign: 'center'}}>{subscription.vendor}</td>
                    <td className="message-cell" style={{textAlign: 'center'}}>{subscription.type}</td>
                    <td className="message-cell" style={{textAlign: 'center'}}>{subscription.interval} min</td>
                    <td className="message-cell" style={{textAlign: 'center'}}>{subscription.chatId}</td>
                    <td className="message-cell" style={{textAlign: 'center'}}>{subscription.token}</td>
                    <td className="message-cell" style={{textAlign: 'center'}}> {subscription.active ? "✅" : "❌"}</td>
                    <td className="message-cell">
                        <button className="btn"
                                style={{width: '44px', height: '34px', marginTop: '0px', marginBottom: '0px'}}
                                onClick={() => onEdit(subscription)}>
                            Edit
                        </button>
                    </td>
                </tr>))) : (<tr>
                    <td colSpan="2" className="center">
                        {loading ? 'Loading items...' : 'No items found'}
                    </td>
                </tr>)}
                </tbody>
            </table>
        </div>
    </div>);
}