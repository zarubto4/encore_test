import { z } from "zod";
import { IDealTemplateModel } from "./dealTemplate.orm";
import { DealTypeDBEntitySchema } from "./dealType.orm";
import { defaultGroupon_objectId } from "../../../../libs/core/parsing_and_formating/defaultValidators";

/** -------------------------------------------------------------------------------------------------------------------
 * Create
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Create Template
export interface DealTemplateCreateRequest {
  name: string;
  email: string;
}

// Validator for Rest Api - Create Template
export const DealTemplateCreateRequestValidator = z.object({
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

// Type for Typescript usage
export type DealTemplateCreateRequestValidator = z.infer<typeof DealTemplateCreateRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Update
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Update Template
export interface DealTemplateUpdateRequest {
  id: string;
  name: string;
  email: string;
}

// Validator for Rest Api - Update Template
export const DealTemplateUpdateRequestValidator = z.object({
  id: DealTypeDBEntitySchema.shape._id,
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

// Type for Typescript usage
export type DealTemplateUpdateRequestValidator = z.infer<typeof DealTemplateUpdateRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Get
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Get Template
export interface DealTemplateGetRequest {
  id: string;
}

// Validator for Rest Api - Get Template
export const DealTemplateGetRequestValidator = z.object({
  id: defaultGroupon_objectId,
});

// Type for Typescript usage
export type DealTemplateGetRequestValidator = z.infer<typeof DealTemplateGetRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Remove
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Remove Template
export interface DealTemplateRemoveRequest {
  id: string;
}

// Validator for Rest Api - Remove Template
export const DealTemplateRemoveRequestValidator = z.object({
  id: defaultGroupon_objectId,
});

// Type for Typescript usage
export type DealTemplateRemoveRequestValidator = z.infer<typeof DealTemplateRemoveRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Filter
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Get List of Templates
export interface DealTemplateFilterRequest {
  alias: string;
}

// Validator for Rest Api - Get List of Template
export const DealTemplateFilterRequestValidator = z.object({
  alias: z.string(),
});

// Type for Typescript usage
export type DealTemplateFilterRequestValidator = z.infer<typeof DealTemplateFilterRequestValidator>;

/** -------------------------------------------------------------------------------------------------------------------
 * Return public Models
 *
 * -------------------------------------------------------------------------------------------------------------------*/

// Return a public model from DB
export interface DealTemplateResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Return a public models in list from DB
export interface DealTemplateFilterResponse {
  list: DealTemplateResponse[];
}

// Model for Rest Api - Return Template (Public fields)
export class DealTemplateResponseClass implements DealTemplateResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  constructor(dtoSchema: IDealTemplateModel) {
    this.name = dtoSchema.name;
    this.email = dtoSchema.email;
    this.created_at = dtoSchema.created_at.toISOString();
    this.updated_at = dtoSchema.updated_at.toISOString();
    this.id = dtoSchema._id.toHexString();
  }
}
