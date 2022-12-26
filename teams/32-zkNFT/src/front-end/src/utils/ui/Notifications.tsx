// @ts-nocheck
import React from 'react';
import { Notification } from 'element-react';

import NotificationContent, { TxSuccessNotificationContent } from 'components/NotificationContent';

export const showError = (msg) => {
  Notification.error({
    title: 'Error',
    message: <NotificationContent msg={msg} />,
    duration: 15000,
    pauseOnHover: true
  });
};

export const showWarning = (msg) => {
  Notification({
    title: 'Warning',
    message: <NotificationContent msg={msg} />,
    type: 'warning',
    duration: 15000,
    pauseOnHover: true
  });
};

export const showSuccess = (config, msg, extrinsic = '') => {
  Notification({
    title: 'Success',
    message: <TxSuccessNotificationContent config={config} msg={msg} extrinsic={extrinsic} />,
    type: 'success',
    duration: 15000,
    pauseOnHover: true
  });
};

export const showInfo = (msg) => {
  Notification.info({
    title: 'Info',
    message: <NotificationContent msg={msg} />,
    duration: 7500,
    pauseOnHover: true
  });
};
