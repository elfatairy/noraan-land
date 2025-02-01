import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import PropTypes from 'prop-types';
import './loading.css';

const Loading = ({ isVisible }) => {
  const [dotLottie, setDotLottie] = useState(null);
  
  const dotLottieRefCallback = (dotLottieInstance) => {
    setDotLottie(dotLottieInstance);
  };

  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <DotLottieReact
        src="/mosque.lottie"
        loop
        autoplay
        dotLottieRefCallback={dotLottieRefCallback}
        background="transparent"
        style={{  width: '600px', height: '600px' }}
      />
    </div>
  );
};
 
Loading.propTypes = {
  isVisible: PropTypes.bool.isRequired
};

export default Loading;