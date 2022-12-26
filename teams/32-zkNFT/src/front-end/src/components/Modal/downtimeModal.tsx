// @ts-nocheck
import React from 'react';
import { Header, Modal } from 'semantic-ui-react';
import { ReactComponent as DowntimeImage } from 'resources/images/maintenance.svg';
import { useConfig } from 'contexts/configContext';

function DowntimeModal() {
  const config = useConfig();

  return (
    <Modal
      basic
      centered={false}
      dimmer="blurring"
      open={true}
      size="small"
      className="pt-12"
    >
      <Header className="border-b-0" icon>
        <div className="text-white text-center">
          <DowntimeImage className="w-16 h-16 m-auto mb-2" />
        </div>
        Scheduled Downtime
      </Header>
      <Modal.Content>
        <p className="pl-16">
          A network update is currently in progress. {config.PAGE_TITLE} will be
          back online shortly.
        </p>
      </Modal.Content>
    </Modal>
  );
}

export default DowntimeModal;
