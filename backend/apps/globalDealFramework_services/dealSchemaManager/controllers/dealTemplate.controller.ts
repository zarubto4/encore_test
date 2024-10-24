import { api } from "encore.dev/api";
import { DealTemplateService } from "../services/dealTemplate.service";
import {
  DealTemplateCreateRequest,
  DealTemplateResponse,
  DealTemplateGetRequest,
  DealTemplateRemoveRequest,
  DealTemplateUpdateRequest,
  DealTemplateFilterResponse,
  DealTemplateFilterRequest,
  DealTemplateCreateRequestValidator,
  DealTemplateUpdateRequestValidator,
  DealTemplateGetRequestValidator,
  DealTemplateFilterRequestValidator,
  DealTemplateRemoveRequestValidator,
} from "../models/dealTemplate.models";
import { DefaultResponses, DefaultResponsesI } from "../../../../libs/core/default_responses/responses.models";
import { rbacRequiredUserSignature } from "../utils/utils";
import {
  dealSchemaManager_rbac_template_Create,
  dealSchemaManager_rbac_template_Get,
  dealSchemaManager_rbac_template_Remove,
  dealSchemaManager_rbac_template_Update,
} from "../encore.service";
// Services ------------------------------------------------------------------------------------------------------------
const dealTemplateService = new DealTemplateService();

// Apis ----------------------------------------------------------------------------------------------------------------

/**
 * Create new Deal Template
 */
export const dealTemplateCreate = api(
  { expose: true, auth: true, method: "POST", path: "/deal_schema_management/template" },
  async (params: DealTemplateCreateRequest): Promise<DealTemplateResponse> => {
    // Valid incoming object
    const validObject = DealTemplateCreateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Create, null);

    // Return response
    return await dealTemplateService.createNewDealTemplate(validObject);
  },
);

/**
 * Update Deal Template
 */
export const dealTemplateUpdate = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/template" },
  async (params: DealTemplateUpdateRequest): Promise<DealTemplateResponse> => {
    // Valid incoming object
    const validObject = DealTemplateUpdateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Update, null);

    // Return response
    return await dealTemplateService.updateDealTemplate(validObject);
  },
);

/**
 * Get Deal Template
 */
export const dealTemplateGet = api(
  { expose: true, auth: true, method: "GET", path: "/deal_schema_management/template" },
  async (params: DealTemplateGetRequest): Promise<DealTemplateResponse> => {
    // Valid incoming object
    const validObject = DealTemplateGetRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Get, validObject.id);

    // Return response
    return await dealTemplateService.getDealTemplate(validObject);
  },
);

/**
 * Get Deal Template by ID or eventually by another variable
 */
export const dealTemplateGetList = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/templates" },
  async (params: DealTemplateFilterRequest): Promise<DealTemplateFilterResponse> => {
    // Valid incoming object
    const validObject = DealTemplateFilterRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Get, null);

    // Return response
    return await dealTemplateService.getDealTemplateFilter(validObject);
  },
);

/**
 * Remove Deal Template
 */
export const dealTemplateRemove = api(
  { expose: true, auth: true, method: "DELETE", path: "/deal_schema_management/template" },
  async (params: DealTemplateRemoveRequest): Promise<DefaultResponsesI> => {
    // Valid incoming object
    const validObject = DealTemplateRemoveRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Remove, validObject.id);

    // Execution
    await dealTemplateService.removeDealTemplate(validObject);

    // Return response
    return new DefaultResponses();
  },
);
