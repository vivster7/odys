/* tslint:disable */
/* eslint-disable */
/**
 * PostgREST API
 * This is a dynamic API generated by PostgREST
 *
 * The version of the OpenAPI document: 7.0.0 (UNKNOWN)
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from '../runtime';
import { User, UserFromJSON, UserToJSON } from '../models';

export interface UserDeleteRequest {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  prefer?: UserDeletePreferEnum;
}

export interface UserGetRequest {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  select?: string;
  order?: string;
  range?: string;
  rangeUnit?: string;
  offset?: string;
  limit?: string;
  prefer?: UserGetPreferEnum;
}

export interface UserPatchRequest {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  prefer?: UserPatchPreferEnum;
  user?: User;
}

export interface UserPostRequest {
  select?: string;
  prefer?: UserPostPreferEnum;
  user?: User;
}

/**
 *
 */
export class UserApi extends runtime.BaseAPI {
  /**
   */
  async userDeleteRaw(
    requestParameters: UserDeleteRequest
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: runtime.HTTPQuery = {};

    if (requestParameters.id !== undefined) {
      queryParameters['id'] = requestParameters.id;
    }

    if (requestParameters.createdAt !== undefined) {
      queryParameters['created_at'] = requestParameters.createdAt;
    }

    if (requestParameters.updatedAt !== undefined) {
      queryParameters['updated_at'] = requestParameters.updatedAt;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (
      requestParameters.prefer !== undefined &&
      requestParameters.prefer !== null
    ) {
      headerParameters['Prefer'] = String(requestParameters.prefer);
    }

    const response = await this.request({
      path: `/user`,
      method: 'DELETE',
      headers: headerParameters,
      query: queryParameters,
    });

    return new runtime.VoidApiResponse(response);
  }

  /**
   */
  async userDelete(requestParameters: UserDeleteRequest): Promise<void> {
    await this.userDeleteRaw(requestParameters);
  }

  /**
   */
  async userGetRaw(
    requestParameters: UserGetRequest
  ): Promise<runtime.ApiResponse<Array<User>>> {
    const queryParameters: runtime.HTTPQuery = {};

    if (requestParameters.id !== undefined) {
      queryParameters['id'] = requestParameters.id;
    }

    if (requestParameters.createdAt !== undefined) {
      queryParameters['created_at'] = requestParameters.createdAt;
    }

    if (requestParameters.updatedAt !== undefined) {
      queryParameters['updated_at'] = requestParameters.updatedAt;
    }

    if (requestParameters.select !== undefined) {
      queryParameters['select'] = requestParameters.select;
    }

    if (requestParameters.order !== undefined) {
      queryParameters['order'] = requestParameters.order;
    }

    if (requestParameters.offset !== undefined) {
      queryParameters['offset'] = requestParameters.offset;
    }

    if (requestParameters.limit !== undefined) {
      queryParameters['limit'] = requestParameters.limit;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (
      requestParameters.range !== undefined &&
      requestParameters.range !== null
    ) {
      headerParameters['Range'] = String(requestParameters.range);
    }

    if (
      requestParameters.rangeUnit !== undefined &&
      requestParameters.rangeUnit !== null
    ) {
      headerParameters['Range-Unit'] = String(requestParameters.rangeUnit);
    }

    if (
      requestParameters.prefer !== undefined &&
      requestParameters.prefer !== null
    ) {
      headerParameters['Prefer'] = String(requestParameters.prefer);
    }

    const response = await this.request({
      path: `/user`,
      method: 'GET',
      headers: headerParameters,
      query: queryParameters,
    });

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(UserFromJSON)
    );
  }

  /**
   */
  async userGet(requestParameters: UserGetRequest): Promise<Array<User>> {
    const response = await this.userGetRaw(requestParameters);
    return await response.value();
  }

  /**
   */
  async userPatchRaw(
    requestParameters: UserPatchRequest
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: runtime.HTTPQuery = {};

    if (requestParameters.id !== undefined) {
      queryParameters['id'] = requestParameters.id;
    }

    if (requestParameters.createdAt !== undefined) {
      queryParameters['created_at'] = requestParameters.createdAt;
    }

    if (requestParameters.updatedAt !== undefined) {
      queryParameters['updated_at'] = requestParameters.updatedAt;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (
      requestParameters.prefer !== undefined &&
      requestParameters.prefer !== null
    ) {
      headerParameters['Prefer'] = String(requestParameters.prefer);
    }

    const response = await this.request({
      path: `/user`,
      method: 'PATCH',
      headers: headerParameters,
      query: queryParameters,
      body: UserToJSON(requestParameters.user),
    });

    return new runtime.VoidApiResponse(response);
  }

  /**
   */
  async userPatch(requestParameters: UserPatchRequest): Promise<void> {
    await this.userPatchRaw(requestParameters);
  }

  /**
   */
  async userPostRaw(
    requestParameters: UserPostRequest
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: runtime.HTTPQuery = {};

    if (requestParameters.select !== undefined) {
      queryParameters['select'] = requestParameters.select;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (
      requestParameters.prefer !== undefined &&
      requestParameters.prefer !== null
    ) {
      headerParameters['Prefer'] = String(requestParameters.prefer);
    }

    const response = await this.request({
      path: `/user`,
      method: 'POST',
      headers: headerParameters,
      query: queryParameters,
      body: UserToJSON(requestParameters.user),
    });

    return new runtime.VoidApiResponse(response);
  }

  /**
   */
  async userPost(requestParameters: UserPostRequest): Promise<void> {
    await this.userPostRaw(requestParameters);
  }
}

/**
 * @export
 * @enum {string}
 */
export enum UserDeletePreferEnum {
  Representation = 'return=representation',
  Minimal = 'return=minimal',
  None = 'return=none',
}
/**
 * @export
 * @enum {string}
 */
export enum UserGetPreferEnum {
  Countnone = 'count=none',
}
/**
 * @export
 * @enum {string}
 */
export enum UserPatchPreferEnum {
  Representation = 'return=representation',
  Minimal = 'return=minimal',
  None = 'return=none',
}
/**
 * @export
 * @enum {string}
 */
export enum UserPostPreferEnum {
  Representation = 'return=representation',
  Minimal = 'return=minimal',
  None = 'return=none',
}
