// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';

export const TxSuccessNotificationContent = ({ msg, extrinsic, config }) => {
  return (
    <div className="bg-secondary">
      <a
        className=""
        href={`${config.SUBSCAN_URL}/extrinsic/${extrinsic}`}
        target="_blank"
        rel="noreferrer"
      >
        <h1 className="text-lg font-semibold text-thirdry">{msg}</h1>
        <p className="text-base mt-2">
          View on explorer&nbsp;
          <FontAwesomeIcon icon={faExternalLink} />
        </p>
      </a>
    </div>
  );
};

TxSuccessNotificationContent.propTypes = {
  msg: PropTypes.string,
  extrinsic: PropTypes.string,
  config: PropTypes.object
};


export const NotificationContent = ({ msg }) => {
  return (
    <div className="bg-secondary pt-2 pb-4 ">
      <h1 className="text-base pt-1 font-semibold text-thirdry">{msg}</h1>
    </div>
  );
};

NotificationContent.propTypes = {
  msg: PropTypes.string,
};


export default NotificationContent;
