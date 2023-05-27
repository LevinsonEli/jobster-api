import Wrapper from '../assets/wrappers/ErrorPage';
import img from '../assets/images/not-found.svg';
import { Link } from 'react-router-dom';

const Error = () => {
  return (
    <Wrapper className='full-page'>
      <div>
        <img src={img} alt='not found' />
        <h3>Page not found</h3>
        <p>We can't find page you are lookking for</p>
        <Link to='/' className='btn btn-hero'>
          back home
        </Link>
      </div>
    </Wrapper>
  );
};

export default Error;
