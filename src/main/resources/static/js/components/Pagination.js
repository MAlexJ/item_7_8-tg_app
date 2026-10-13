function Pagination({currentPage, totalPages, onPageChange}) {
    return (<div className="row center">
        <div className="col">
            <div className="pagination">
                <button
                    className="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {Array.from({length: totalPages}, (_, i) => (<button
                    style={{
                        margin: '0 3px'
                    }}
                    key={i}
                    className={`button ${currentPage === i + 1 ? 'button-primary' : ''}`}
                    onClick={() => onPageChange(i + 1)}>
                    {i + 1}
                </button>))}

                <button
                    className="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    </div>);
}