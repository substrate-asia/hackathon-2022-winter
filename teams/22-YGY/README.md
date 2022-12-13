## Project Background

The scene of contract signing is widespread in all walks of life. Contracts interweaves into our business world, promoting the legitimate and stable development of business.
When signing a contract, both parties usually sign, seal, or fingerprint, which aims to provide the court with a proof of the legal identity of both parties and their willingness to sign the contract when a contract dispute arises.

e-signature is a digital upgrade of the contract signing scene in the era of web2.0. It aims to break the contract signing geographical restrictions and enable two or more parties to realize efficient, low-cost, and environmentally friendly contract signing scenarios across regions.

However, while gaining these advantages, the price is that people lose their most unique value:
1. The certificates and private information that can prove your identity will have to be hosted in a private centralized organization.
2. The signed contract will have to be kept in a private centralized institution.
The user's personal information, identity certificates, and contract documents will be "legally" occupied by a third-party central organization, and the user, as the real owner, can only be accessed under the authorization of such a third-party organization.

What's more serious is that as some large enterprises attach importance to privacy protection, they will often rely on the advantages of social resources to force these third-party centralized institutions to privatize the deployment of e-signature services for them. As a result, the counterparties of these large enterprises (employees, suppliers, customers, partners, etc.) have to entrust their private information, identity certificates, and contract documents to such a "fourth party" centralized organization, causing personal Re-dilution of ownership.

The DeSign e-signature platform aims to realize the vision that users' value assets (identity information, digital certificates, contract documents) belong to users based on the web3.0 ecology and the contract signing scenario, on the basis of the traditional advantages of web2.0, such as efficiency, low cost and environmental protection.

## Project Target
DeSign aims to provide customers with decentralized e-signature and contract management services. As a new generation of e-signature technology, on the basis of retaining the traditional advantages of web2.0 in efficiency, low cost and environmental protection, it realizes the vision that users' value assets (identity information, digital certificates, contract documents) belong to users.

## Tasks to be completed during Hackathon

#### Account Generation
1. Account Generation based on Polkadot.js, 
2. Polkadot.js Connection & Authentication,
3. Email binding 
4. Index Page, Home Page
5. Log out

#### Individual Certificate Acquisition
1. VerifyTask Submission & Individual Identity material stored on Dss,
2. VerifyTask payment & authentication,
4. Individual certificate acquisition from Kilt DID.

#### Personal Signing
1. SignTask creation & initiation & processing & conclusion,
2. SignTask invition & receiving & view & Sign & Payment.
3. SignTask Docs Mgt. in Dss.

## Problems to be solved during Hackathon

####Issues related to certificate application
1. How to safely and reliably store the real name information submitted by users in a decentralized way?
2. After the authentication task submitted by the user is linked, how to audit it through the management background?
3. How to generate DID format digital certificates for users on the Kilt chain based on the real name information submitted by users and approved by the background?

####Issues related to signing tasks
1. A signing task may contain multiple documents to be signed, and there may be multiple signers. Each person who signs a document will generate a new document. When each document is uploaded to the DSS, costs will be incurred. How to minimize user costs and operating costs while meeting the principle of decentralization?
2. After a signing task is initiated, multiple signers will receive a signing notice. When each signer opens the task and completes signing, it will output the corresponding products (new signature documents, signature Hash and other information). How to organize multiple parties on the blockchain to complete signing once and finally complete the signing task?


## Architecture

## Logo
![logo-透明](https://user-images.githubusercontent.com/120092281/207235913-b0bc1641-cab5-4efb-b5ce-551b6f813cb9.png)


## Team
<table>
  <tr>
  <th>Name</th><th>Role</th><th>Responsibility</th>
  </tr>
  <tr>
    <td>Terry</td><td>Team Leader & PO</td><td>Idea Generation, Product Design, Team Mgt.</td>
  </tr>
  <tr>
    <td>Tom</td><td>Backend & Smart Contract Engineer</td><td>Backend API & Smart Contract Dev & R&D Project Mgt.</td>
  </tr>
  <tr>
    <td>Kaiho</td><td>Substrate Chain Engineer</td><td>Chain Infrastructure Dev.</td>
  </tr>
  <tr>
    <td>Xing Ai</td><td>Fronted Engineer</td><td>Frontend & e-Signature Dev.</td>
  </tr>
  <tr>
    <td>Nick</td><td>UI Designer</td><td>UI Design</td>
  </tr>
</table>


