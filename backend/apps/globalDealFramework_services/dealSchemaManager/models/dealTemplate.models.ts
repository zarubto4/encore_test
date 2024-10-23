import { z } from "zod";
import { IDealTemplateModel } from "./dealTemplate.orm";
import { DealTypeDBEntitySchema } from "./dealType.orm";
import { defaultGroupon_objectId } from "../../../../libs/core/parsing_and_formating/defaultValidators";

/** Create ------------------------------------------------------------------------------------------------------------*/

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

/** Update -------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Create Template
export interface DealTemplateUpdateRequest {
  id: string;
  name: string;
  email: string;
}
// Validator for Rest Api - Create Template
export const DealTemplateUpdateRequestValidator = z.object({
  id: DealTypeDBEntitySchema.shape._id,
  name: DealTypeDBEntitySchema.shape.name,
  email: DealTypeDBEntitySchema.shape.email,
});

/** Get ---------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Get Template
export interface DealTemplateGetRequest {
  id: string;
}

// Validator for Rest Api - Get Template
export const DealTemplateGetRequestValidator = z.object({
  id: defaultGroupon_objectId,
});

/** Remove ------------------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Remove Template
export type DealTemplateRemoveRequest = DealTemplateGetRequest;

/** Filter -------------------------------------------------------------------------------------------------------------*/

export interface DealTemplateFilterRequest {
  id: string;
}

export interface DealTemplateFilterResponse {
  user_id: string;
}

// Validator for Rest Api - Create Template
export const DealTemplateFilterRequestValidator = z.object({
  name: z.string(),
  email: z.string(),
});

/** Return public model ------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Return Template (Public fields)
export interface DealTemplateResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
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
