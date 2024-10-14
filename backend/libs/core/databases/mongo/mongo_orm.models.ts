import { ObjectId } from "mongodb";
import { SchemaDefinition } from "mongoose";
import { z } from "zod";

export interface MongoOrmBaseFields {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
}

export const MongoOrmBaseOption = {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MongoOrmBaseMethods {}

export const MongoOrmBaseSchema: SchemaDefinition = {};

// ----

export const Mongo: SchemaDefinition = {
  user_id: z.instanceof(ObjectId),
};
