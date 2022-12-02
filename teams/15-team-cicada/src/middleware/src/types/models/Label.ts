// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type LabelProps = Omit<Label, NonNullable<FunctionPropertyNames<Label>>>;

export class Label implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockHash: string;

    public name: string;

    public categoryId: string;

    public creator?: string;

    public createDate?: Date;

    public lastModifier?: string;

    public lastmodifyDate?: Date;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Label entity without an ID");
        const record = await Label.get(id.toString());
        if (record){
            this.creator = record.creator;
            this.createDate = record.createDate;
            await store.bulkUpdate('Label', [this]);
        }else{
            this.creator = this.lastModifier;
            this.createDate = this.lastmodifyDate;
            await store.set('Label', id.toString(), this);
        }
    }
    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Label entity without an ID");
        await store.remove('Label', id.toString());
    }

    static async get(id:string): Promise<Label | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Label entity without an ID");
        const record = await store.get('Label', id.toString());
        if (record){
            return this.create(record as LabelProps);
        }else{
            return;
        }
    }


    static async getByCategoryId(categoryId: string): Promise<Label[] | undefined>{
      
      const records = await store.getByField('Label', 'categoryId', categoryId);
      return records.map(record => this.create(record as LabelProps));
      
    }


    static create(record: LabelProps): Label {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
