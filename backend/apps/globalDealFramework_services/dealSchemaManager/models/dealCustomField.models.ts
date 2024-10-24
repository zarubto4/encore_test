import { z } from "zod";
import { DealTypeDBEntitySchema } from "./dealType.orm";
import { defaultGroupon_objectId } from "../../../../libs/core/parsing_and_formating/defaultValidators";
import { IDealCustomFieldModel } from "./dealCustomField.orm";

/** -------------------------------------------------------------------------------------------------------------------
 * Create
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Create Template
export interface DealCustomFieldCreateRequest {
  name: string;
  email: string;
}

// Validator for Rest Api - Create Template
export const DealCustomFieldCreateRequestValidator = z.object({
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

// Type for Typescript usage
export type DealCustomFieldCreateRequestValidator = z.infer<typeof DealCustomFieldCreateRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Update
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Update Template
export interface DealCustomFieldUpdateRequest {
  id: string;
  name: string;
  email: string;
}

// Validator for Rest Api - Update Template
export const DealCustomFieldUpdateRequestValidator = z.object({
  id: DealTypeDBEntitySchema.shape._id,
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

// Type for Typescript usage
export type DealCustomFieldUpdateRequestValidator = z.infer<typeof DealCustomFieldUpdateRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Get
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Get Template
export interface DealCustomFieldGetRequest {
  id: string;
}

// Validator for Rest Api - Get Template
export const DealCustomFieldGetRequestValidator = z.object({
  id: defaultGroupon_objectId,
});

// Type for Typescript usage
export type DealCustomFieldGetRequestValidator = z.infer<typeof DealCustomFieldGetRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Remove
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Remove Template
export interface DealCustomFieldRemoveRequest {
  id: string;
}

// Validator for Rest Api - Remove Template
export const DealCustomFieldRemoveRequestValidator = z.object({
  id: defaultGroupon_objectId,
});

// Type for Typescript usage
export type DealCustomFieldRemoveRequestValidator = z.infer<typeof DealCustomFieldRemoveRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Filter
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Get List of Templates
export interface DealCustomFieldFilterRequest {
  alias: string;
}

// Validator for Rest Api - Get List of Template
export const DealCustomFieldFilterRequestValidator = z.object({
  alias: z.string(),
});

// Type for Typescript usage
export type DealCustomFieldFilterRequestValidator = z.infer<typeof DealCustomFieldFilterRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Return public Models
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Return a public model from DB
export interface DealCustomFieldResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Return a public models in list from DB
export interface DealCustomFieldFilterResponse {
  list: DealCustomFieldResponse[];
}

// Model for Rest Api - Return Template (Public fields)
export class DealCustomFieldResponseClass implements DealCustomFieldResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  constructor(dtoSchema: IDealCustomFieldModel) {
    this.name = dtoSchema.name;
    this.email = dtoSchema.email;
    this.created_at = dtoSchema.created_at.toISOString();
    this.updated_at = dtoSchema.updated_at.toISOString();
    this.id = dtoSchema._id.toHexString();
  }
}
