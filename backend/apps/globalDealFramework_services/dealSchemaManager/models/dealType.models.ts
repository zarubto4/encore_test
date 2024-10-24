import { z } from "zod";
import { DealTypeDBEntitySchema, DealTypeDTO } from "./dealType.orm";
import { defaultGroupon_objectId } from "../../../../libs/core/parsing_and_formating/defaultValidators";

/** -------------------------------------------------------------------------------------------------------------------
 * Create
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Create Template
export interface DealTypeCreateRequest {
  name: string;
  email: string;
}

// Validator for Rest Api - Create Template
export const DealTypeCreateRequestValidator = z.object({
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

// Type for Typescript usage
export type DealTypeCreateRequestValidator = z.infer<typeof DealTypeCreateRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Update
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Update Type
export interface DealTypeUpdateRequest {
  id: string;
  name: string;
  email: string;
}

// Validator for Rest Api - Update Type
export const DealTypeUpdateRequestValidator = z.object({
  id: DealTypeDBEntitySchema.shape._id,
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

// Type for Typescript usage
export type DealTypeUpdateRequestValidator = z.infer<typeof DealTypeUpdateRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Get
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Get Type
export interface DealTypeGetRequest {
  id: string;
}

// Validator for Rest Api - Get Type
export const DealTypeGetRequestValidator = z.object({
  id: defaultGroupon_objectId,
});

// Type for Typescript usage
export type DealTypeGetRequestValidator = z.infer<typeof DealTypeGetRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Remove
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Remove Type
export interface DealTypeRemoveRequest {
  id: string;
}

// Validator for Rest Api - Remove Type
export const DealTypeRemoveRequestValidator = z.object({
  id: defaultGroupon_objectId,
});

// Type for Typescript usage
export type DealTypeRemoveRequestValidator = z.infer<typeof DealTypeRemoveRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Filter
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Get List of Types
export interface DealTypeFilterRequest {
  alias?: string;
}

// Validator for Rest Api - Get List of Type
export const DealTypeFilterRequestValidator = z.object({
  alias: z.string().max(64, "Alias To long").min(1, "Alias To short").optional(),
});

// Type for Typescript usage
export type DealTypeFilterRequestValidator = z.infer<typeof DealTypeFilterRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Return public Models
 *
 * -------------------------------------------------------------------------------------------------------------------*/

export interface DealTypeResponse {
  id: string;
  name: string;
  email: string;
}

export interface DealTypeFilterResponse {
  list: DealTypeResponse[];
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
