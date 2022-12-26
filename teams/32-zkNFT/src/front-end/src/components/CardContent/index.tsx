// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const CardContent = ({ className, leftIcon = null, cardTitle, onClick, isShowAll = true }) => {
  return (
    <div className={classNames('flex justify-between items-center', className)}>
      <div className="flex items-center">
        {leftIcon}
        <span className="text-xl px-3 font-semibold text-thirdry">{cardTitle}</span>
      </div>
      {isShowAll && (
        <span
          onClick={onClick}
          className="px-4 py-2 cursor-pointer btn-hover rounded-lg btn-primary"
        >
          All
        </span>
      )}
    </div>
  );
};

CardContent.propTypes = {
  className: PropTypes.string,
  leftIcon: PropTypes.element,
  cardTitle: PropTypes.string,
  onClick: PropTypes.func,
  isShowAll: PropTypes.bool
};

export default CardContent;
