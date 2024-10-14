import { DealTemplate } from "../models/dealTemplate.orm";
import { ObjectId } from "mongodb";
import { APIError, ErrCode } from "encore.dev/api";
import {
  DealTemplateCreateRequest,
  DealTemplateCreateRequestValidator,
  DealTemplateFilterRequest,
  DealTemplateFilterRequestValidator,
  DealTemplateFilterResponse,
  DealTemplateGetRequest,
  DealTemplateGetRequestValidator,
  DealTemplateRemoveRequest,
  DealTemplateResponse,
  DealTemplateResponseClass,
  DealTemplateUpdateRequest,
  DealTemplateUpdateRequestValidator,
} from "../models/dealTemplate.models";
import {
  dealSchemaManager_rbac_template_Create,
  dealSchemaManager_rbac_template_Get,
  dealSchemaManager_rbac_template_Remove,
  dealSchemaManager_rbac_template_Update,
} from "../encore.service";
import { rbacRequiredUserSignature } from "../utils/utils";

export class DealTemplateService {
  /**
   * Create new Deal Template with Validator
   * @param request
   */

  public async createNewDealTemplate(request: DealTemplateCreateRequest): Promise<DealTemplateResponse> {
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Create, null);
    const response = await DealTemplate.create(DealTemplateCreateRequestValidator.parse(request));
    return new DealTemplateResponseClass(response);
  }

  /**
   * Update Deal Template with Validator by ID
   * @param request
   */
  public async updateDealTemplate(request: DealTemplateUpdateRequest): Promise<DealTemplateResponse> {
    const validObject = DealTemplateUpdateRequestValidator.parse(request);
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Update, validObject.id);
    await DealTemplate.updateOne({ _id: new ObjectId(validObject.id) }, validObject);
    return this.getDealTemplate({ id: request.id });
  }

  /**
   * Get Deal Template by ID
   * @param request
   */
  public async getDealTemplate(request: DealTemplateGetRequest): Promise<DealTemplateResponse> {
    const validObject = DealTemplateGetRequestValidator.parse(request);
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Get, validObject.id);
    const response = await DealTemplate.findOne(new ObjectId(validObject.id));
    if (response) {
      return new DealTemplateResponseClass(response);
    } else throw new APIError(ErrCode.NotFound, "Deal Template not found");
  }

  /**
   * Get Deal Templates as List with filtering
   * @param request
   */
  public async getDealTemplateFilter(request: DealTemplateFilterRequest): Promise<DealTemplateFilterResponse> {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validObject = DealTemplateFilterRequestValidator.parse(request);
    if (await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Get, null)) {
      // TODO
    } else {
      // TODO
    }
    // @ts-expect-error @ts-ignore
    return null;
  }

  /**
   * Remove Deal Template by ID
   * @param request
   */
  public async removeDealTemplate(request: DealTemplateRemoveRequest): Promise<void> {
    const validObject = DealTemplateUpdateRequestValidator.parse(request);
    await rbacRequiredUserSignature(dealSchemaManager_rbac_template_Remove, validObject.id);
    const response = await DealTemplate.findOne(new ObjectId(validObject.id));
    if (response) {
      await DealTemplate.deleteOne({
        _id: DealTemplateGetRequestValidator.parse(request).id,
      });
    } else throw new APIError(ErrCode.NotFound, "Deal Template not found");
  }
}
