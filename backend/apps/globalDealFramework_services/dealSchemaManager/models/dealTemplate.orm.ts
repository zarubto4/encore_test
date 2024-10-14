import { dealSchemaManager_ormDatabase } from "../encore.service";
import { Model, Schema, HydratedDocument } from "mongoose";
import { ObjectId } from "mongodb";
import { MongoOrmBaseFields, MongoOrmBaseMethods, MongoOrmBaseOption, MongoOrmBaseSchema } from "../../../../libs/core/databases/mongo/mongo_orm.models";

// Model Content as Interface  -----------------------------------------------------------------------------------------
export interface IDealTemplate extends MongoOrmBaseFields {
  name: string;
  email: string;
}

// Model Methods as Interface ------------------------------------------------------------------------------------------
export interface IDealTemplateMethods extends MongoOrmBaseMethods {
  fullName(): string;
}

// Model Static methods ------------------------------------------------------------------------------------------------
interface IDealTemplateORMModel extends Model<IDealTemplate, unknown, IDealTemplateMethods> {
  remove(name: ObjectId): Promise<HydratedDocument<IDealTemplate, IDealTemplateMethods>>;
}

// Model ---------------------------------------------------------------------------------------------------------------
export type IDealTemplateModel = IDealTemplate & IDealTemplateMethods;

// Schema In Database  -------------------------------------------------------------------------------------------------
const schema = new Schema<IDealTemplate, IDealTemplateORMModel, IDealTemplateMethods>(
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
  MongoOrmBaseOption,
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
export const DealTemplate: IDealTemplateORMModel = dealSchemaManager_ormDatabase.db.model<IDealTemplate, IDealTemplateORMModel>("DealTemplate", schema);
