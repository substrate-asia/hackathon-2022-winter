// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const MenuSvg = ({ className, fill, onClick }) => {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 27 27"
      onClick={onClick}
      className={className}
      fill={fill}
    >
      <path d="M22.5562 12.375H4.44375C3.8535 12.375 3.375 12.8535 3.375 13.4437V13.5562C3.375 14.1465 3.8535 14.625 4.44375 14.625H22.5562C23.1465 14.625 23.625 14.1465 23.625 13.5562V13.4437C23.625 12.8535 23.1465 12.375 22.5562 12.375Z" />
      <path d="M22.5562 18H4.44375C3.8535 18 3.375 18.4785 3.375 19.0687V19.1812C3.375 19.7715 3.8535 20.25 4.44375 20.25H22.5562C23.1465 20.25 23.625 19.7715 23.625 19.1812V19.0687C23.625 18.4785 23.1465 18 22.5562 18Z" />
      <path d="M22.5562 6.75H4.44375C3.8535 6.75 3.375 7.2285 3.375 7.81875V7.93125C3.375 8.5215 3.8535 9 4.44375 9H22.5562C23.1465 9 23.625 8.5215 23.625 7.93125V7.81875C23.625 7.2285 23.1465 6.75 22.5562 6.75Z" />
    </svg>
  );
};

MenuSvg.propTypes = {
  className: PropTypes.string,
  fill: PropTypes.string,
  onClick: PropTypes.func,
};

export default MenuSvg;
