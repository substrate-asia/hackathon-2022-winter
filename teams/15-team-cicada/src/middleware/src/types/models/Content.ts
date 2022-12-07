// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames} from "@subql/types";
import assert from 'assert';




export type ContentProps = Omit<Content, NonNullable<FunctionPropertyNames<Content>>>;

export class Content implements Entity {

    constructor(id: string) {
        this.id = id;
    }


    public id: string;

    public blockHash: string;

    public content: string;

    public categoryId: string;

    public label?: string;

    public dimensionId: string;

    public creator?: string;

    public createDate?: Date;

    public flag?: boolean;


    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Content entity without an ID");
        await store.set('Content', id.toString(), this);
    }

    async update(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot update Content entity without an ID");
        await store.bulkUpdate('Content', [this]);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Content entity without an ID");
        await store.remove('Content', id.toString());
    }

    static async get(id:string): Promise<Content | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Content entity without an ID");
        const record = await store.get('Content', id.toString());
        if (record){
            return this.create(record as ContentProps);
        }else{
            return;
        }
    }


    static async getByCategoryId(categoryId: string): Promise<Content[] | undefined>{
      
      const records = await store.getByField('Content', 'categoryId', categoryId);
      return records.map(record => this.create(record as ContentProps));
      
    }

    static async getByDimensionId(dimensionId: string): Promise<Content[] | undefined>{
      
      const records = await store.getByField('Content', 'dimensionId', dimensionId);
      return records.map(record => this.create(record as ContentProps));
      
    }


    static create(record: ContentProps): Content {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(record.id);
        Object.assign(entity,record);
        return entity;
    }
}
