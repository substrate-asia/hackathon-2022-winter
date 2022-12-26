// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const SwitchSvg = ({ className, fill }) => {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" className={className} fill={fill}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.4999 16.0999C12.6973 16.0999 16.0999 12.6973 16.0999 8.4999C16.0999 4.30254 12.6973 0.899902 8.4999 0.899902C4.30254 0.899902 0.899902 4.30254 0.899902 8.4999C0.899902 12.6973 4.30254 16.0999 8.4999 16.0999ZM9.4999 4.6999C9.4999 4.14762 9.05218 3.6999 8.4999 3.6999C7.94761 3.6999 7.4999 4.14762 7.4999 4.6999V8.4999C7.4999 8.76512 7.60525 9.01947 7.79279 9.20701L10.4798 11.894C10.8703 12.2845 11.5035 12.2845 11.894 11.894C12.2845 11.5035 12.2845 10.8703 11.894 10.4798L9.4999 8.08569V4.6999Z"
      />
    </svg>
  );
};

SwitchSvg.propTypes = {
  className: PropTypes.string,
  fill: PropTypes.string,
};

export default SwitchSvg;
