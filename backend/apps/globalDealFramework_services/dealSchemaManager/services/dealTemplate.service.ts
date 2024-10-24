import { DealTemplate } from "../models/dealTemplate.orm";
import { APIError, ErrCode } from "encore.dev/api";
import {
  DealTemplateCreateRequestValidator,
  DealTemplateFilterRequestValidator,
  DealTemplateFilterResponse,
  DealTemplateGetRequestValidator,
  DealTemplateRemoveRequestValidator,
  DealTemplateResponse,
  DealTemplateResponseClass,
  DealTemplateUpdateRequestValidator,
} from "../models/dealTemplate.models";

export class DealTemplateService {
  /**
   * Create new Deal Template with Validator
   * @param request
   */
  public async createNewDealTemplate(request: DealTemplateCreateRequestValidator): Promise<DealTemplateResponse> {
    const response = await DealTemplate.create(request);
    return new DealTemplateResponseClass(response);
  }

  /**
   * Update Deal Template with Validator by ID
   * @param request
   */
  public async updateDealTemplate(request: DealTemplateUpdateRequestValidator): Promise<DealTemplateResponse> {
    await DealTemplate.updateOne({ _id: request.id }, request);
    return this.getDealTemplate(request);
  }

  /**
   * Get Deal Template by ID
   * @param request
   */
  public async getDealTemplate(request: DealTemplateGetRequestValidator): Promise<DealTemplateResponse> {
    const response = await DealTemplate.findOne(request);
    if (response) {
      return new DealTemplateResponseClass(response);
    } else throw new APIError(ErrCode.NotFound, "Deal Template not found");
  }

  /**
   * Get Deal Templates as List with filtering
   * @param request
   */
  public async getDealTemplateFilter(request: DealTemplateFilterRequestValidator): Promise<DealTemplateFilterResponse> {
    const findQuery = {};
    return {
      list: (await DealTemplate.find(findQuery)).map((e) => new DealTemplateResponseClass(e)),
    };
  }

  /**
   * Remove Deal Template by ID
   * @param request
   */
  public async removeDealTemplate(request: DealTemplateRemoveRequestValidator): Promise<void> {
    const response = await DealTemplate.findOne(request);
    if (response) {
      await DealTemplate.deleteOne({
        _id: DealTemplateGetRequestValidator.parse(request).id,
      });
    } else throw new APIError(ErrCode.NotFound, "Deal Template not found");
  }
}
