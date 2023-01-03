// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const TransactSvg = ({ className, fill }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      className={className}
      fill={fill}
      height="32"
    >
      <path d="M11.32 15.93C10.63 16.63 10.63 17.77 11.32 18.47C12 19.18 13.12 19.18 13.8 18.47L19.08 13.07C19.77 12.37 19.77 11.23 19.08 10.53L13.8 5.13C13.12 4.42 12 4.42 11.32 5.13C10.63 5.83 10.63 6.97 11.32 7.67L13.59 10L7.28 10L7.28 4.6C7.28 2.61 8.86 1 10.8 1L19.6 1C21.54 1 23.12 2.61 23.12 4.6L23.12 19C23.12 20.99 21.54 22.6 19.6 22.6L10.8 22.6C8.86 22.6 7.28 20.99 7.28 19L7.28 13.6L13.59 13.6L11.32 15.93Z" />
      <path d="M3.76 13.6C2.79 13.6 2 12.79 2 11.8C2 10.81 2.79 10 3.76 10L7.28 10L7.28 13.6L3.76 13.6Z" />
      <path d="M14.32 26.2C14.32 28.19 15.9 29.8 17.84 29.8L26.64 29.8C28.58 29.8 30.16 28.19 30.16 26.2L30.16 11.8C30.16 9.81 28.58 8.2 26.64 8.2L26.64 26.2L14.32 26.2Z" />
    </svg>
  );
};

TransactSvg.propTypes = {
  className: PropTypes.string,
  fill: PropTypes.string,
};

export default TransactSvg;
