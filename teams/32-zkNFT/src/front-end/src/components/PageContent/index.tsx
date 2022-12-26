// @ts-nocheck
import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

const PageContent = ({ children, className }) => {
  return (
    <section
      className={classNames(
        'page-content lg:flex flex-col flex-grow justify-top',
        className
      )}
    >
      {children}
    </section>
  );
};

PageContent.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string
};

export default PageContent;
