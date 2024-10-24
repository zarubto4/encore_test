import { DealCustomField } from "../models/dealCustomField.orm";
import { APIError, ErrCode } from "encore.dev/api";
import {
  DealCustomFieldCreateRequestValidator,
  DealCustomFieldFilterRequestValidator,
  DealCustomFieldFilterResponse,
  DealCustomFieldGetRequestValidator,
  DealCustomFieldRemoveRequestValidator,
  DealCustomFieldResponse,
  DealCustomFieldResponseClass,
  DealCustomFieldUpdateRequestValidator,
} from "../models/dealCustomField.models";

export class DealCustomFieldService {
  /**
   * Create new Deal Template with Validator
   * @param request
   */
  public async createNewCustomField(request: DealCustomFieldCreateRequestValidator): Promise<DealCustomFieldResponse> {
    const response = await DealCustomField.create(request);
    return new DealCustomFieldResponseClass(response);
  }

  /**
   * Update Deal Template with Validator by ID
   * @param request
   */
  public async updateCustomField(request: DealCustomFieldUpdateRequestValidator): Promise<DealCustomFieldResponse> {
    await DealCustomField.updateOne({ _id: request.id }, request);
    return this.getCustomField(request);
  }

  /**
   * Get Deal Template by ID
   * @param request
   */
  public async getCustomField(request: DealCustomFieldGetRequestValidator): Promise<DealCustomFieldResponse> {
    const response = await DealCustomField.findOne(request);
    if (response) {
      return new DealCustomFieldResponseClass(response);
    } else throw new APIError(ErrCode.NotFound, "Deal Template not found");
  }

  /**
   * Get Deal Templates as List with filtering
   * @param request
   */
  public async getCustomFieldFilter(request: DealCustomFieldFilterRequestValidator): Promise<DealCustomFieldFilterResponse> {
    const findQuery = {};
    return {
      list: (await DealCustomField.find(findQuery)).map((e) => new DealCustomFieldResponseClass(e)),
    };
  }

  /**
   * Remove Deal Template by ID
   * @param request
   */
  public async removeCustomField(request: DealCustomFieldRemoveRequestValidator): Promise<void> {
    const response = await DealCustomField.findOne(request);
    if (response) {
      await DealCustomField.deleteOne({
        _id: DealCustomFieldGetRequestValidator.parse(request).id,
      });
    } else throw new APIError(ErrCode.NotFound, "Deal Template not found");
  }
}
