import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import Wrapper from '../assets/wrappers/PageBtnContainer';
import { useSelector, useDispatch } from 'react-redux';
import { changePage } from '../features/allJobs/allJobsSlice';

const PageBtnContainer = () => {
  const { numOfPages, page } = useSelector((store) => store.allJobs);
  const dispatch = useDispatch();

  const pages = Array.from({ length: numOfPages }, (_, index) => index + 1);

  const nextPage = () => {
    const newPage = page === numOfPages ? 1 : page + 1;
    dispatch(changePage(newPage));
  };
  const prevPage = () => {
    const newPage = page === 1 ? numOfPages : page - 1;
    dispatch(changePage(newPage));
  };

  return (
    <Wrapper>
      <button className='prev-btn' onClick={prevPage}>
        <HiChevronDoubleLeft /> prev
      </button>
      <div className='btn-container'>
        {pages.map((pageNum) => {
          return (
            <button
              className={pageNum === page ? 'pageBtn active' : 'pageBtn'}
              type='button'
              key={pageNum}
              onClick={() => dispatch(changePage(pageNum))}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <button className='next-btn' onClick={nextPage}>
        <HiChevronDoubleRight /> next
      </button>
    </Wrapper>
  );
};

export default PageBtnContainer;
