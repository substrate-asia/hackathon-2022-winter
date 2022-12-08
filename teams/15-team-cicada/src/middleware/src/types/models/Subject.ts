// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type SubjectProps = Omit<Subject, NonNullable<FunctionPropertyNames<Subject>>>;

export class Subject implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockHash: string;

    public name: string;

    public categoryId: string;

    public lastAuthor?: string;

    public lastDate?: Date;

    public flag?: boolean;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Subject entity without an ID");
        await store.set('Subject', id.toString(), this);
    }

    async update(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot upate Subject entity without an ID");
        await store.bulkUpdate('Subject', [this]);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Subject entity without an ID");
        await store.remove('Subject', id.toString());
    }

    static async get(id:string): Promise<Subject | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Subject entity without an ID");
        const record = await store.get('Subject', id.toString());
        if (record){
            return this.create(record as SubjectProps);
        }else{
            return;
        }
    }


    static async getByCategoryId(categoryId: string): Promise<Subject[] | undefined>{
      
      const records = await store.getByField('Subject', 'categoryId', categoryId);
      return records.map(record => this.create(record as SubjectProps));
      
    }


    static create(record: SubjectProps): Subject {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
