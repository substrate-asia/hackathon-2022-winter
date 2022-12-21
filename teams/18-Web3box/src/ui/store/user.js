const { idbCon } = require("./db_table");

export class UserService {

    constructor() {
        this.tableName = "Users";

    }

    async getUser(address) {
        return await idbCon.select({
            from: this.tableName,
            where:{
                address:address
            }
        })
    }

    async getUserTokenByChainid(address,chainid) {
        chainid = chainid?chainid:0;
        if(chainid === 0){
            return await idbCon.select({
                from: this.tableName,
                where:{
                    paret:address
                },
                order: {
                    by: 'chainid',
                    type: 'asc', //supprted sort type is - asc,desc
                }
            })
        }
        return await idbCon.select({
            from: this.tableName,
            where:{
                address:address,
                chainid:chainid
            }
        })
    }

    async getUserTokenByAC(address,chainid) {
        return await idbCon.select({
            from: this.tableName,
            where:{
                paret:address,
                chainid:chainid
            },
            order: {
                by: 'chainid',
                type: 'asc', //supprted sort type is - asc,desc
            }
        })
    }

    async add(user) {
        return await idbCon.insert({
            into: this.tableName,
            values: [user],
            return: true
        })
    }

    async getById(id) {
        return await idbCon.select({
            from: this.tableName,
            where: {
                id: id
            }
        })
    }

    async remove(id) {
        return await idbCon.remove({
            from: this.tableName,
            where: {
                id: id
            }
        })
    }

    async updateById(id, updateData) {
        return await idbCon.update({
            in: this.tableName,
            set: updateData,
            where: {
                id: id
            }
        })
    }

    async updateByAddress(address, updateData) {
        return await idbCon.update({
            in: this.tableName,
            set: updateData,
            where: {
                address: address
            }
        })
    }
}