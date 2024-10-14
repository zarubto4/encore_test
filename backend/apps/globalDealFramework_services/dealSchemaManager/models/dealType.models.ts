import { z } from "zod";
import { DealTypeDBEntitySchema, DealTypeDTO } from "./dealType.orm";
import { defaultGroupon_objectId } from "../../../../libs/core/parsing_and_formating/defaultValidators";

// Create --------------------------------------------------------------------------------------------------------------
export interface DealTypeCreateRequest {
  name: string;
  email: string;
}

export const DealTypeCreateRequestValidator = z.object({
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

export type DealTypeCreateRequestValidator = z.infer<typeof DealTypeCreateRequestValidator>;

// Update --------------------------------------------------------------------------------------------------------------
export interface DealTypeUpdateRequest {
  id: string;
  name: string;
  email: string;
}

export const DealTypeUpdateRequestValidator = z.object({
  id: DealTypeDBEntitySchema.shape._id,
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});
export type DealTypeUpdateRequestValidator = z.infer<typeof DealTypeUpdateRequestValidator>;

// Get --------------------------------------------------------------------------------------------------------------
export interface DealTypeGetRequest {
  id: string;
}

export const DealTypeGetRequestValidator = z.object({
  id: defaultGroupon_objectId,
});
export type DealTypeGetRequestValidator = z.infer<typeof DealTypeGetRequestValidator>;

// Remove --------------------------------------------------------------------------------------------------------------
export interface DealTypeRemoveRequest {
  id: string;
}

// Filter --------------------------------------------------------------------------------------------------------------
export interface DealTypeFilterRequest {
  id: string;
}
export interface DealTypeFilterResponse {
  userId: string;
}
// TODO

// Return public model -------------------------------------------------------------------------------------------------
export interface DealTypeResponse {
  id: string;
  name: string;
  email: string;
}

export class DealTypeResponseClass implements DealTypeResponse {
  id: string;
  name: string;
  email: string;

  constructor(dtoSchema: DealTypeDTO) {
    this.name = dtoSchema.name;
    this.email = dtoSchema.email;
    this.id = dtoSchema.id;
  }
}
