import { api } from "encore.dev/api";
import { DealCustomFieldService } from "../services/dealCustomField.service";
import { DefaultResponses, DefaultResponsesI } from "../../../../libs/core/default_responses/responses.models";
import {
  DealCustomFieldCreateRequest,
  DealCustomFieldCreateRequestValidator,
  DealCustomFieldFilterRequest,
  DealCustomFieldFilterRequestValidator,
  DealCustomFieldFilterResponse,
  DealCustomFieldGetRequest,
  DealCustomFieldRemoveRequest,
  DealCustomFieldRemoveRequestValidator,
  DealCustomFieldResponse,
  DealCustomFieldUpdateRequest,
  DealCustomFieldUpdateRequestValidator,
} from "../models/dealCustomField.models";
import { rbacRequiredUserSignature } from "../utils/utils";
import {
  dealSchemaManager_rbac_custom_field_Create,
  dealSchemaManager_rbac_custom_field_Get,
  dealSchemaManager_rbac_custom_field_Remove,
  dealSchemaManager_rbac_custom_field_Update,
} from "../encore.service";

// Service -------------------------------------------------------------------------------------------------------------
const dealCustomFieldService = new DealCustomFieldService();

// Apis ----------------------------------------------------------------------------------------------------------------

/**
 * Create new Deal Type
 */
export const dealCustomFieldCreate = api(
  { expose: true, auth: true, method: "POST", path: "/deal_schema_management/custom_field" },
  async (params: DealCustomFieldCreateRequest): Promise<DealCustomFieldResponse> => {
    // Valid incoming object
    const validObject = DealCustomFieldCreateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_custom_field_Create, null);

    // Return response
    return await dealCustomFieldService.createNewCustomField(validObject);
  },
);

/**
 * Update Deal Type
 */
export const dealCustomFieldUpdate = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/custom_field" },
  async (params: DealCustomFieldUpdateRequest): Promise<DealCustomFieldResponse> => {
    // Valid incoming object
    const validObject = DealCustomFieldUpdateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_custom_field_Update, validObject.id);

    // Return response
    return await dealCustomFieldService.updateCustomField(validObject);
  },
);

/**
 * Get Deal Type by ID or eventually by another variable
 */
export const dealCustomFieldGet = api(
  { expose: true, auth: true, method: "GET", path: "/deal_schema_management/custom_field" },
  async (params: DealCustomFieldGetRequest): Promise<DealCustomFieldResponse> => {
    // Valid incoming object
    const validObject = DealCustomFieldUpdateRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_custom_field_Get, validObject.id);

    // Return response
    return await dealCustomFieldService.getCustomField(validObject);
  },
);

/**
 * Get Deal Types as List with filtering
 */
export const dealCustomFieldGetList = api(
  { expose: true, auth: true, method: "PUT", path: "/deal_schema_management/custom_fields" },
  async (params: DealCustomFieldFilterRequest): Promise<DealCustomFieldFilterResponse> => {
    // Valid incoming object
    const validObject = DealCustomFieldFilterRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_custom_field_Get, null);

    // Return response
    return await dealCustomFieldService.getCustomFieldFilter(validObject);
  },
);

/**
 * Remove Deal Type
 */
export const dealCustomFieldRemove = api(
  { expose: true, auth: true, method: "DELETE", path: "/deal_schema_management/custom_field" },
  async (params: DealCustomFieldRemoveRequest): Promise<DefaultResponsesI> => {
    // Valid incoming object
    const validObject = DealCustomFieldRemoveRequestValidator.parse(params);

    // Valid permission
    await rbacRequiredUserSignature(dealSchemaManager_rbac_custom_field_Remove, validObject.id);

    // Execution
    await dealCustomFieldService.removeCustomField(validObject);

    // Return response
    return new DefaultResponses();
  },
);
