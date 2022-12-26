// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type SubscribeProps = Omit<Subscribe, NonNullable<FunctionPropertyNames<Subscribe>>>;

export class Subscribe implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockHash: string;

    public subscriber: string;

    public subscribeDate?: Date;

    public subjectId: string;

    public flag?: boolean;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Subscribe entity without an ID");
        await store.set('Subscribe', id.toString(), this);
    }

    async update(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot update Subscribe entity without an ID");
        await store.bulkUpdate('Subscribe', [this]);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Subscribe entity without an ID");
        await store.remove('Subscribe', id.toString());
    }

    static async get(id:string): Promise<Subscribe | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Subscribe entity without an ID");
        const record = await store.get('Subscribe', id.toString());
        if (record){
            return this.create(record as SubscribeProps);
        }else{
            return;
        }
    }


    static async getBySubjectId(subjectId: string): Promise<Subscribe[] | undefined>{
      
      const records = await store.getByField('Subscribe', 'subjectId', subjectId);
      return records.map(record => this.create(record as SubscribeProps));
      
    }


    static create(record: SubscribeProps): Subscribe {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
