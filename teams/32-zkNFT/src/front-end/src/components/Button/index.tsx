// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const Button = ({
  className = 'btn-primary',
  type,
  onClick,
  children,
  disabled
}) => {
  return (
    <button
      type={type}
      className={classNames(
        `px-3 py-3 text-center font-medium outline-none focus:outline-none btn-hover rounded-md ${
          disabled ? 'btn-disabled' : ''
        }`,
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.any
};

export default Button;
