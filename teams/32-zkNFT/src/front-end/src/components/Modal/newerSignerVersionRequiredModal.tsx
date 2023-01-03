// @ts-nocheck
import React, { useState } from 'react';
import { Header, Icon, Modal } from 'semantic-ui-react';


function NewerSignerVersionRequiredModal() {
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
      <Header icon style={{'borderBottom': '0px'}}>
        <Icon name="download" size="small"/>
        Signer update required
      </Header>
      <Modal.Content>
        <p className="pl-16">
          You must uninstall Signer and download{' '}
          <a
            href="https://signer.manta.network/"
            className="link-text"
            target="_blank"
            rel="noopener noreferrer"
          >
            the latest version
          </a>.
        </p>
        <p className="pl-16 pt-6">
        Signer does not store your private keys. It is safe to reinstall.
        </p>
      </Modal.Content>
    </Modal>
  );
}

export default NewerSignerVersionRequiredModal;





