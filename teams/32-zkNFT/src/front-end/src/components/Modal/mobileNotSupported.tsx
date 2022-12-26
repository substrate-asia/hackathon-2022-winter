// @ts-nocheck
import React, { useState } from 'react';
import { Header, Icon, Modal } from 'semantic-ui-react';

function MobileNotSupportedModal() {
  const [modalIsOpen, setModalIsOpen] = useState(true);

  return (
    <Modal
      basic
      centered={false}
      dimmer="blurring"
      open={modalIsOpen}
      onClose={() => setModalIsOpen(false)}
      size="small"
      className="pt-12"
    >
      <Header icon style={{ borderBottom: '0px' }}>
        <Icon name="mobile alternate" size="small" />
        Mobiles are not supported yet. <br />
        Try on a computer.
      </Header>
    </Modal>
  );
}

export default MobileNotSupportedModal;
