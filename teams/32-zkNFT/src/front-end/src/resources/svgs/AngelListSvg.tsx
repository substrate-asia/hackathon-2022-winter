// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const AngelListSvg = ({ className, fill }) => {
  return (
    <svg
      width="14"
      height="12"
      viewBox="0 0 14 12"
      className={className}
      fill={fill}
    >
      <path d="M11.9 2H9.8V1.33333C9.8 0.6 9.17 0 8.4 0H5.6C4.83 0 4.2 0.6 4.2 1.33333V2H2.1C0.91 2 0 2.86667 0 4V10C0 11.1333 0.91 12 2.1 12H11.9C13.09 12 14 11.1333 14 10V4C14 2.86667 13.09 2 11.9 2ZM5.6 1.10539H8.4V2H5.6V1.10539ZM12.6 10C12.6 10.4 12.32 10.6667 11.9 10.6667H2.1C1.68 10.6667 1.4 10.4 1.4 10V6.26667C1.4 6.26667 3.35774 7.08651 4.69 7.33333C4.994 7.38965 5.40274 7.45455 5.47274 7.45455H8.52729C8.59729 7.45455 9.00555 7.34448 9.31 7.26667C10.6208 6.93162 12.6 6.2 12.6 6.2V10Z" />
    </svg>
  );
};

AngelListSvg.propTypes = {
  className: PropTypes.string,
  fill: PropTypes.string,
};

export default AngelListSvg;