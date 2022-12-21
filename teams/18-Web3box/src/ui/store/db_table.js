/* eslint-disable import/no-webpack-loader-syntax */
const  { DATA_TYPE, Connection }  = require('jsstore');

const getWorkerPath = () => {
    if (process.env.NODE_ENV === 'development') {
        return require("file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.js");
    }
    else {
        return require("file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.min.js");
    }
};

// This will ensure that we are using only one instance. 
// Otherwise due to multiple instance multiple worker will be created.
const workerPath = getWorkerPath().default;
export const idbCon = new Connection(new Worker(workerPath));
const dbname = 'web3boxDB';

const getDatabase = () => {
    const tblTransfer  = {
        name: 'Transfers',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            hash:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            from: {
                notNull: true,
                dataType: DATA_TYPE.String
            },
            formatFrom:{
                notNull: false,
                dataType: DATA_TYPE.String
            },
            to: {
                dataType: DATA_TYPE.String,
                notNull: false,
            },
            balance: {
                notNull: false,
                dataType: DATA_TYPE.Number
            },
            symbols :{
                notNull: false,
                dataType: DATA_TYPE.String
            },
            status: {
                dataType: DATA_TYPE.String,
                notNull: false
            },
            desc: {
                dataType: DATA_TYPE.String,
                notNull: false
            },
            createTime :{
                dataType: DATA_TYPE.DateTime,
                notNull: false
            }
        }
    };

    const tblUsers  = {
        name: 'Users',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            address:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            paret:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            network:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            chainid:{
                notNull: true,
                dataType: DATA_TYPE.Number
            },
            symbol:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            rpc:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            decimas:{
                notNull: true,
                dataType: DATA_TYPE.Number
            },
            img: {
                dataType: DATA_TYPE.String,
                notNull: false,
            },
            createTime :{
                dataType: DATA_TYPE.DateTime,
                notNull: false
            }
        }
    };

    const dataBase = {
        name: dbname,
        tables: [tblTransfer,tblUsers]
    };
    return dataBase;
};

export async function  initJsStore(){
    try {
        const dataBase = getDatabase();
        await idbCon.initDb(dataBase);
    }
    catch (ex) {
        console.error(ex);
    }
}

// module.exports = {
//     initJsStore,
//     idbCon
//  }