// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type CategoryProps = Omit<Category, NonNullable<FunctionPropertyNames<Category>>>;

export class Category implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockHash: string;

    public name: string;

    public parent?: string;

    public creator?: string;

    public createDate?: Date;

    public flag?: boolean;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Category entity without an ID");
        await store.set('Category', id.toString(), this);
    }

    async update(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot update Category entity without an ID");
        await store.bulkUpdate('Category', [this]);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Category entity without an ID");
        await store.remove('Category', id.toString());
    }

    static async get(id:string): Promise<Category | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Category entity without an ID");
        const record = await store.get('Category', id.toString());
        if (record){
            return this.create(record as CategoryProps);
        }else{
            return;
        }
    }



    static create(record: CategoryProps): Category {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
