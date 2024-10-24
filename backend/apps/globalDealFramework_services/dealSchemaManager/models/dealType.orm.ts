import { z } from "zod";
import { ObjectId } from "mongodb";

// Entity Schema -------------------------------------------------------------------------------------------------------
export const DealTypeDBEntitySchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string(),
  email: z.string().email(),
});

export type DealTypeEntity = z.infer<typeof DealTypeDBEntitySchema>;

// DTO -----------------------------------------------------------------------------------------------------------------
export const DealTypeDTOSchema = z.object({
  id: z.string(),
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

export type DealTypeDTO = z.infer<typeof DealTypeDTOSchema>;

// Convert -------------------------------------------------------------------------------------------------------------
export function dealTypeConvertFromEntity(entity: DealTypeEntity): DealTypeDTO {
  const candidate: DealTypeDTO = {
    ...entity,
    id: entity._id.toHexString(),
  };
  return DealTypeDTOSchema.parse(candidate);
}
