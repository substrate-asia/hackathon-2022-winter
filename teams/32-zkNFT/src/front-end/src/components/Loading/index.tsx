// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Loading } from 'element-react';

const MantaLoading = ({ className, loading }) => {
  return (
    <div className={classNames('pt-7 pb-6 pr-8', className)}>
      <Loading
        style={{ alignSelf: 'center' }}
        loading={loading}
        text="Processing..."
      ></Loading>
    </div>
  );
};

MantaLoading.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
};

export default MantaLoading;
