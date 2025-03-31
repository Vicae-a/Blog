const Pagination = ({ currentPage, lastPage, onPageChange }) => {
    const pageNumbers = [];
    
    // Limit the number of pages shown
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Create page number array
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  
    if (lastPage <= 1) return null;
  
    return (
      <div className="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-prev"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)}>1</button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={currentPage === number ? 'pagination-active' : ''}
          >
            {number}
          </button>
        ))}
        
        {endPage < lastPage && (
          <>
            {endPage < lastPage - 1 && <span className="pagination-ellipsis">...</span>}
            <button onClick={() => onPageChange(lastPage)}>{lastPage}</button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="pagination-next"
        >
          Next
        </button>
      </div>
    );
  };
  
  export default Pagination;
  