# Project

Project Name：ALine

Start Date：2022.11

# Introduction
![Logo](./docs/Logo.png)
For this hackathon, we have chosen the following tracks:
- Blockchain Tools
- Bounty-Gear

## Background
Currently:
1. In the current stage of Web3.0, more and more developers turn to Web3.0, and get involved in the development of Web3.0.
2. As more and more Dapps appear and upgrade, Web3.0 projects are becoming more and more complex and engineering-oriented. The development process has become more and more complicated, and developers have many repetitive operations, such as contract deployment, DApp remote deployment, etc.
3. The Web3.0 ecosystem has grown extremely large, but internally closely interconnected. For example, contract developers sometimes need the help of chain developers, and chain developers needs support from blockchain infrastructure providers, like libp2p.
4. Frequent deployment will generate a large number of redundant actions. Meanwhile, manual operations will inevitably cause mistakes, which will bring huge security risks and losses, such as the pGALA incident and the leakage of private keys on github.

Many developer tools were released in the past two years to assist developers in completing the their Web3.0 projects development. But at the same time, there is currently a lack of systematic products on the market that provide integrated, one-stop solutions for the overall development and O&M processes.
After completing a comprehensive survey of 49 project teams around the world (as of December 10, 2022, including 15 in the Polkadot ecosystem) with different tracks, we found that such tools are necessary and can reduce costs, and have wide application potentials.

The ALine project was born.

## Project Introduction

ALine is a one-stop developer toolkit, working as the DevOps platform in Web3.0, supporting development and O&M processes. ALine is committed to enabling Web3.0 developers/development teams to build customizable Pipelines to achieve highly automated development and O&M processes, including providing contract templates, code/contract quality and security checks, contract deployment, node services and continuous integration/continuous deployment (CI/CD), etc., thereby greatly improving development efficiency.
ALine supports multiple ecological and contract development languages, integrates multiple contract templates based on ink! and gear, and supports the development and O&M of projects in the Polkadot ecosystem.

## Project Details

ALine provides services in the SaaS mode. Through ALine, users can get all-round, process-oriented, and intelligent assistance from project creation, development, to project O&M, improving their development efficiency by about 30%-40%, saving development costs.
This project integrates the contract templates used in the Polkadot Ecosystem, which can perform code quality and security check on its front-end code and contract code, and provide comprehensive support for the contract deployment of the Polkadot Ecosystem.

Its specific features include:
- Provide the required business (contract) template
- Code security and quality checks
- Rapid deployment
- Digital monitoring
- Intelligent operation and maintenance
- Support team work coordination
- Support the customization of R&D Pipelines
- Automated task flow (automatic Pipeline trigger)
- Developer tools integration

With ALine, the following business scenarios can be realized:

- Templates can quickly help developers create DApp projects
- Perform code quality and code security checks on smart contracts and view reports
- Rapid deployment of DApps
- Complete the transaction of the contracts in the system
- View the transaction information of the deployed contract
- Customized development pipeline
- View the operation and maintenance information of the services it deploys
- Know the corresponding service status and health warnings at any time
- Quickly integrate popular development tools on the page to speed up development

### Technical Solutions

In order to realize our product vision, we use front-end and back-end separation to complete our project, and the design method adopts DDD (Domain-driven Design) domain model design.
The first version of the technical diagram is as follows:

![Technical Architecture Diagram](docs/TechnicalArchitectureDiagram-1.png)  

- User Interface: the user interface layer provides an accessible interface for users/callers. We refer to it as the UI layer for short. Here we also include the front-end interface into the UI layer. The front-end is built using Vue + Ant Design + Vite. In addition to the front end, we will also include DTO and Controller into the UI layer.
- Application Layer: the application layer is the planning of the overall application function, and multiple services are derived according to business needs, including developer tool services, project management services, and operation and maintenance management services.
    - Development Tools：developer tools are a collection of tools to help developers better complete projects, including business templates. Business templates include contract templates and front-end templates. Contract templates provide different templates for mainstream tracks, such as NFT, DeFi, GameFi, and DAO. Solidity, Ink!, Move and other different ecological contract templates are provided. We currently collect mainstream open-source contracts on the market. In the future, we will build a contract template ecosystem so that developers can provide useful contract development templates here. The front-end template integrates the currently available front-end frameworks, such as Vue, React, nuxt.js, etc., and also adds common components such as wallet components on top of it to effectively improve development efficiency. Developer tools are a collection of common development components, such as wallet components, contract ABI interface conversion and other tools, and as an open platform, everyone is encouraged to upload and use components.
    - Project Manage：project management provides the creation of projects through business templates, and downloads the code directly to the developer's Github warehouse, and provides security checks and construction of contracts and front-ends, as well as generation and construction library management. Developers only need to focus on developing their own core components. Submit the code to Github, and the project management will automatically perform a health check on the contract code and complete the construction of the code to generate ABI metadata and store it in Artifactory for version management. Developers can also optimize the development process of their own projects through customized workflows.
    - OPS Manage：operation and maintenance management provides rapid deployment, contract operation, and service operation and maintenance functions. The contract can be deployed with one click from the product library, and the contract operation page will be generated after deployment, and the contract operation can be directly performed online, and the real-time transaction data of the contract can be viewed. For the front-end service, one-click deployment is also available, which quickly deploys the front-end to available resources and provides an accessible address. At the same time, it supports version rollback, service status monitoring and other functions.
- Domain Layer: the domain layer expresses business concepts, business status information, and business rules. The domain model is at this layer and is the core of business software.
    - Core：refers to the core module of this business. Among them, Template is a template creation function, which can add and generate templates. Pipeline is an automated execution tool for building R&D pipelines. It can complete different automation tasks through process configuration, such as automatic construction and automatic deployment. Workflow is a collection of best-practice functions based on Pipeline, such as building code security inspection functions, and can customize automated workflow scenarios for different development scenarios. Deployment is responsible for deploying the core functions of the service, including contract deployment management, front-end deployment management, deployment scheduling and deployment version and other functions.
    - Supporting：support core business functional domains. Artifactory is based on the management of intermediate products in the R&D process, such as the management of binary build packages, code inspection report management, and application environment management. Monitor is used to monitor and alert the resources of the deployed service. When the deployed service is abnormal, it can notify the alarm in time. Project is the support of the project management module to support the developer's research and development process. Developer Tools is a general-purpose development component collection management function.
    - Generic：a common functional subdomain that is used by multiple subdomains at the same time is a common domain. Authentication is based on Github for user authentication, and users only need to have a Github account to log in to the system. Authorization of Authority permission grants the push permission of the product github, which can directly push the code template to the user's github warehouse, and provides the permission management function in the system.
- Infrastructure Layer: Provide public service components
    - Data Assembler：data converter
    - Repository: provides an infrastructure for finding and retrieving persistent objects and encapsulating them
    - Gateway: gateway service component provided to User Interface
    - Exception: provide common exception handling logic
    - Config: the configuration file management function of the system

### Function List

The specific functions included in the currently defined V1 version are

- Template
    - Template creation
    - Template list
    - Template details
- Project
    - Create projects based on templates
    - Generate contract inspection workflow
    - Generate contract construction workflow
    - Generate front-end code inspection workflow
    - Generate front-end code to build workflow
    - Product library management
    - Inspection report management
- Deployment
    - Contract deployment
    - Front-end deployment
    - Contract transaction
    - Contract data query
    - Deployment version management
    - Domain management

### UI
<https://www.figma.com/file/bSiQuWzdHoeSjHn6EZO0ah/ALine?node-id=0%3A1&t=7b7O3nlECA0DF8FE-0>  


## Things Done during the Polkadot Hackathon 2022

The implementation of our overall product functions is relatively complex. At present, we have completed the template addition and rapid deployment sections of the project, provided an operable interface, and open sourced the engine. The functions we have completed include:

- Build a Pipeline engine, which can complete automated pipeline execution through configuration files and provide log viewing
- Complete the automatic deployment of smart contracts and front-end automatic deployment functions based on the Pipeline engine
- Provide front-end pages for visual operations

Among them, the specific implementation list of our above functions is as follows:

- Ink! Contract automation deployment template
- Gear contract automation deployment template
- Solidity contract automation deployment template
- Pipeline
    - Pipeline Engine
        - CLI
        - Stage Analysis
        - Step Execution
        - Pipeline Exec Record
        - Pipeline Workflow
        - Log View
        - Step Plugin
            - Shell
            - Docker Env
    - Pipeline Create
        - Create
        - Process Configuration
    - Pipeline List
    - Pipeline Details
        - Execution History List
        - Execution Process
        - Execution Report
        - Artifacts
    - Set Pipeline
        - Process Configuration
        - Trigger Rule: Manual trigger
- Front End Page
    - Pipeline Create
    - Pipeline Editor
    - Pipeline List
    - Pipeline History List
    - Pipeline Execution Process
    - Pipeline Execution Log


## Team
Abing - Team Lead
- Master degree in Computing Science Direction from Tsinghua University
- 6 years practical experience in Software Development in big Tech Companies

Liam - Head of Tech
- 4+ years’ experience in crypto.
- 8+ years software coding experience in java/Go/Rust and Solidity DApps, DevOps and Cloud Computing.
- https://www.linkedin.com/in/liam-liang-092950245/

Tom- Lead of Dev Team
- over 9 years of software development experience
- being familiar with Go/Rust/Java/Python/JavaScript/Typescript, cloud computing, cloud native, and DevOps.

Linda- PM
- Bachelor of CS from University of Huston
- 5 years in product management, incl. 2 years in blockchain industry

Alvis- Operation & BD
- PhD in Economics and Management & Master in CS from Uni Stuttgart, UC Berkeley and Turiba University.
- Previous Co-Founder of Web3Go (Litentry).
- Previous president of Asto-Telematics (Germany) in the Asia Pacific region.
- https://www.linkedin.com/in/alvis-tsui-69952341/

Nova - Finance & Marketing
- LP of several crypto funds.
- Graduated from Shanghai Jiaotong University.
- https://www.linkedin.com/in/nova-wong-92b48359/

Dev Team:
Jianguo
Zhihui
Qiaoyu
Zhihao
Zexun


## Demo Video
