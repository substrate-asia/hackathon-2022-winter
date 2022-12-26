// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './FormSwitch.css';

const FormSwitch = ({
  checked,
  name,
  onChange,
  disabled = false,
  onLabel,
  offLabel,
  className,
}) => {
  return (
    <label className={classNames('FormSwitch__switch', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        name={name}
        disabled={disabled}
      />
      <span
        className={classNames('FormSwitch__slider round tracking-tight',
          'flex items-center justify-between text-sm border-gray-300 border',
          'text-white px-2 py-1',
          {'public-private-toggle': name == 'PublicPrivateToggle'},
          {'disabled': disabled})
        }
      >
        <span>{onLabel}</span>
        <span className="">{offLabel}</span>
      </span>
    </label>
  );
};

FormSwitch.propTypes = {
  checked: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  onLabel: PropTypes.object,
  offLabel: PropTypes.object,
  className: PropTypes.string,
};

export default FormSwitch;
