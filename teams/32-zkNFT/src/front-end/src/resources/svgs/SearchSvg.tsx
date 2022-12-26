// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const SearchSvg = ({ className, fill }) => {
  return (
    <svg width="21" height="22" viewBox="0 0 21 22" className={className} fill={fill}>
      <path
        d="M13 2.7C15.8719 2.7 18.2 5.11766 18.2 8.1C18.2 11.0823 15.8719 13.5 13 13.5C10.1282 13.5 7.80005 11.0823 7.80005 8.1C7.80005 5.11766 10.1282 2.7 13 2.7ZM20.8 8.1C20.8 3.62649 17.3079 0 13 0C8.69223 0 5.20005 3.62649 5.20005 8.1C5.20005 9.84937 5.73408 11.4692 6.64208 12.7933L0.380812 19.2954C-0.126871 19.8226 -0.126871 20.6774 0.380812 21.2046C0.888493 21.7318 1.71161 21.7318 2.21929 21.2046L8.48055 14.7025C9.75562 15.6454 11.3155 16.2 13 16.2C17.3079 16.2 20.8 12.5735 20.8 8.1Z"
      />
    </svg>
  );
};

SearchSvg.propTypes = {
  className: PropTypes.string,
  fill: PropTypes.string,
};

export default SearchSvg;
