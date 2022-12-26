// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

const NewsletterSvg = ({ className, fill }) => {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 18 12"
      className={className}
      fill={fill}
    >
      <path d="M0.00375011 1.88355L8.99994 5.88186L17.9962 1.8835C17.9284 0.833152 16.9486 0 15.75 0H2.25C1.05133 0 0.0715891 0.833179 0.00375011 1.88355Z" />
      <path d="M18 4.1179L8.99994 8.11793L0 4.11796V10C0 11.1046 1.00736 12 2.25 12H15.75C16.9926 12 18 11.1046 18 10V4.1179Z" />
    </svg>
  );
};

NewsletterSvg.propTypes = {
  className: PropTypes.string,
  fill: PropTypes.string,
};

export default NewsletterSvg;