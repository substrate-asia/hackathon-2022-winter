// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type DimensionProps = Omit<Dimension, NonNullable<FunctionPropertyNames<Dimension>>>;

export class Dimension implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockHash: string;

    public name: string;

    public subjectId: string;

    public creator?: string;

    public createDate?: Date;

    public flag?: boolean;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Dimension entity without an ID");
        await store.set('Dimension', id.toString(), this);
    }

    async update(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot update Dimension entity without an ID");
        await store.bulkUpdate('Dimension', [this]);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Dimension entity without an ID");
        await store.remove('Dimension', id.toString());
    }

    static async get(id:string): Promise<Dimension | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Dimension entity without an ID");
        const record = await store.get('Dimension', id.toString());
        if (record){
            return this.create(record as DimensionProps);
        }else{
            return;
        }
    }


    static async getBySubjectId(subjectId: string): Promise<Dimension[] | undefined>{
      
      const records = await store.getByField('Dimension', 'subjectId', subjectId);
      return records.map(record => this.create(record as DimensionProps));
      
    }


    static create(record: DimensionProps): Dimension {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
