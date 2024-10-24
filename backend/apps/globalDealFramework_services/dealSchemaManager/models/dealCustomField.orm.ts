import { dealSchemaManager_ormDatabase } from "../encore.service";
import { Model, Schema, HydratedDocument } from "mongoose";
import { ObjectId } from "mongodb";
import {
  MongoOrmBaseFields,
  MongoOrmBaseMethods,
  MongoOrmBaseOption,
  MongoOrmBaseSchema,
} from "../../../../libs/core/databases/mongo/mongo_orm.models";

// Model Content as Interface  -----------------------------------------------------------------------------------------
export interface IDealCustomField extends MongoOrmBaseFields {
  name: string;
  email: string;
}

// Model Methods as Interface ------------------------------------------------------------------------------------------
export interface IDealCustomFieldMethods extends MongoOrmBaseMethods {
  fullName(): string;
}

// Model Static methods ------------------------------------------------------------------------------------------------
interface IDealCustomFieldORMModel extends Model<IDealCustomField, unknown, IDealCustomFieldMethods> {
  remove(name: ObjectId): Promise<HydratedDocument<IDealCustomField, IDealCustomFieldMethods>>;
}

// Model ---------------------------------------------------------------------------------------------------------------
export type IDealCustomFieldModel = IDealCustomField & IDealCustomFieldMethods;

// Schema In Database  -------------------------------------------------------------------------------------------------
const schema = new Schema<IDealCustomField, IDealCustomFieldORMModel, IDealCustomFieldMethods>(
  {
    ...MongoOrmBaseSchema,
    name: String,
    email: {
      type: String,
      required: true,
      minlength: [4, "name is to short"],
      maxLength: [64, "name is too long"],
    },
  },
  MongoOrmBaseOption, // Default Common DB fields
);

// Model dynamic Methods -----------------------------------------------------------------------------------------------
schema.method("fullName", function fullName() {
  return this.name + " " + this.email;
});

// Model static Methods ------------------------------------------------------------------------------------------------
schema.static("remove", function remove(id: ObjectId) {
  return this.deleteOne({ _id: id.toHexString() });
});

// ORM Model -----------------------------------------------------------------------------------------------------------
export const DealCustomField: IDealCustomFieldORMModel = dealSchemaManager_ormDatabase.db.model<IDealCustomField, IDealCustomFieldORMModel>(
  "DealCustomField",
  schema,
);
