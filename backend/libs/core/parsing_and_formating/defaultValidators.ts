import { z } from "zod";
import { ObjectId } from "mongodb";

export const defaultGroupon_objectId = z.instanceof(ObjectId);
export const defaultGroupon_userId = z.string().uuid();
export const defaultGroupon_bToken = z.string().min(4).max(4);
