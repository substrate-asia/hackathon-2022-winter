# Mail Module  

This module provides users with email sending and receiving functions. When users send Web3 emails, the front-end submits user content to the blockchain, Runtime is responsible for queue caching of emails, and off-chain working machines periodically poll the task queue to execute sending; When using Web2 mail, the off-chain worker machine identifies and stores the user's Web2 mail. The interface of this module is completely open. Users can use PMail to provide clients, or use clients developed by third parties.

## Interface

### Dispatchable Functions
* `bind_address` - A function to bind PMail to current address, the address and email address have a one-to-one relationship and cannot be bound again.  
* `set_alias` - A function to set an alias for one's own contacts, and the alias can be modified again.  
* `send_mail` - A function that sends mail to any type of address.  
* `submit_add_mail` - A function to upload the mail sent by web2 mailbox to pmail to the chain.  
* `submit_update_authority_index` - Mail Gateway Decentralized Polling.  
