const { idbCon } = require("./db_table");

export class TransferService {

    constructor() {
        this.tableName = "Transfers";

    }

    async getTransfers(address) {
        return await idbCon.select({
            from: this.tableName,
            where:{
                from:address
            }
        })
    }

    async add(transfer) {
        return await idbCon.insert({
            into: this.tableName,
            values: [transfer],
            return: true
        })
    }

    async getById(id) {
        alert('-'+this.tableName+"-");
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
}