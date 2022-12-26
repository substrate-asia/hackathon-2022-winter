// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const CloseMenuSvg = ({ className, fill, onClick }) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      onClick={onClick}
      className={className}
      fill={fill}
    >
      <path d="M6.3 0.8L-2.84124e-07 7L6.3 13.2C6.5 13.4 6.8 13.5 7 13.5C7.2 13.5 7.5 13.4 7.7 13.2C7.9 13 8 12.8 8 12.5L8 1.5C8 1.2 7.9 1 7.7 0.8C7.5 0.6 7.3 0.5 7 0.5C6.7 0.5 6.5 0.6 6.3 0.8Z" />
    </svg>
  );
};

CloseMenuSvg.propTypes = {
  className: PropTypes.string,
  fill: PropTypes.string,
  onClick: PropTypes.func,
};

export default CloseMenuSvg;
