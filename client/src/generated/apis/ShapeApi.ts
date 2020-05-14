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
import { OdysShape, OdysShapeFromJSON, OdysShapeToJSON } from '../models';

export interface ShapeDeleteRequest {
  id?: string;
  boardId?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  createdAtZoomLevel?: string;
  deleted?: boolean;
  prefer?: ShapeDeletePreferEnum;
}

export interface ShapeGetRequest {
  id?: string;
  boardId?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  createdAtZoomLevel?: string;
  deleted?: boolean;
  select?: string;
  order?: string;
  range?: string;
  rangeUnit?: string;
  offset?: string;
  limit?: string;
  prefer?: ShapeGetPreferEnum;
}

export interface ShapePatchRequest {
  id?: string;
  boardId?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  createdAtZoomLevel?: string;
  deleted?: boolean;
  prefer?: ShapePatchPreferEnum;
  shape?: OdysShape;
}

export interface ShapePostRequest {
  select?: string;
  prefer?: ShapePostPreferEnum;
  shape?: OdysShape;
}

/**
 *
 */
export class ShapeApi extends runtime.BaseAPI {
  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapeDeleteRaw(
    requestParameters: ShapeDeleteRequest
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: runtime.HTTPQuery = {};

    if (requestParameters.id !== undefined) {
      queryParameters['id'] = requestParameters.id;
    }

    if (requestParameters.boardId !== undefined) {
      queryParameters['board_id'] = requestParameters.boardId;
    }

    if (requestParameters.x !== undefined) {
      queryParameters['x'] = requestParameters.x;
    }

    if (requestParameters.y !== undefined) {
      queryParameters['y'] = requestParameters.y;
    }

    if (requestParameters.width !== undefined) {
      queryParameters['width'] = requestParameters.width;
    }

    if (requestParameters.height !== undefined) {
      queryParameters['height'] = requestParameters.height;
    }

    if (requestParameters.text !== undefined) {
      queryParameters['text'] = requestParameters.text;
    }

    if (requestParameters.createdAt !== undefined) {
      queryParameters['created_at'] = requestParameters.createdAt;
    }

    if (requestParameters.updatedAt !== undefined) {
      queryParameters['updated_at'] = requestParameters.updatedAt;
    }

    if (requestParameters.type !== undefined) {
      queryParameters['type'] = requestParameters.type;
    }

    if (requestParameters.createdAtZoomLevel !== undefined) {
      queryParameters['created_at_zoom_level'] =
        requestParameters.createdAtZoomLevel;
    }

    if (requestParameters.deleted !== undefined) {
      queryParameters['deleted'] = requestParameters.deleted;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (
      requestParameters.prefer !== undefined &&
      requestParameters.prefer !== null
    ) {
      headerParameters['Prefer'] = String(requestParameters.prefer);
    }

    const response = await this.request({
      path: `/shape`,
      method: 'DELETE',
      headers: headerParameters,
      query: queryParameters,
    });

    return new runtime.VoidApiResponse(response);
  }

  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapeDelete(requestParameters: ShapeDeleteRequest): Promise<void> {
    await this.shapeDeleteRaw(requestParameters);
  }

  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapeGetRaw(
    requestParameters: ShapeGetRequest
  ): Promise<runtime.ApiResponse<Array<OdysShape>>> {
    const queryParameters: runtime.HTTPQuery = {};

    if (requestParameters.id !== undefined) {
      queryParameters['id'] = requestParameters.id;
    }

    if (requestParameters.boardId !== undefined) {
      queryParameters['board_id'] = requestParameters.boardId;
    }

    if (requestParameters.x !== undefined) {
      queryParameters['x'] = requestParameters.x;
    }

    if (requestParameters.y !== undefined) {
      queryParameters['y'] = requestParameters.y;
    }

    if (requestParameters.width !== undefined) {
      queryParameters['width'] = requestParameters.width;
    }

    if (requestParameters.height !== undefined) {
      queryParameters['height'] = requestParameters.height;
    }

    if (requestParameters.text !== undefined) {
      queryParameters['text'] = requestParameters.text;
    }

    if (requestParameters.createdAt !== undefined) {
      queryParameters['created_at'] = requestParameters.createdAt;
    }

    if (requestParameters.updatedAt !== undefined) {
      queryParameters['updated_at'] = requestParameters.updatedAt;
    }

    if (requestParameters.type !== undefined) {
      queryParameters['type'] = requestParameters.type;
    }

    if (requestParameters.createdAtZoomLevel !== undefined) {
      queryParameters['created_at_zoom_level'] =
        requestParameters.createdAtZoomLevel;
    }

    if (requestParameters.deleted !== undefined) {
      queryParameters['deleted'] = requestParameters.deleted;
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
      path: `/shape`,
      method: 'GET',
      headers: headerParameters,
      query: queryParameters,
    });

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(OdysShapeFromJSON)
    );
  }

  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapeGet(
    requestParameters: ShapeGetRequest
  ): Promise<Array<OdysShape>> {
    const response = await this.shapeGetRaw(requestParameters);
    return await response.value();
  }

  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapePatchRaw(
    requestParameters: ShapePatchRequest
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: runtime.HTTPQuery = {};

    if (requestParameters.id !== undefined) {
      queryParameters['id'] = requestParameters.id;
    }

    if (requestParameters.boardId !== undefined) {
      queryParameters['board_id'] = requestParameters.boardId;
    }

    if (requestParameters.x !== undefined) {
      queryParameters['x'] = requestParameters.x;
    }

    if (requestParameters.y !== undefined) {
      queryParameters['y'] = requestParameters.y;
    }

    if (requestParameters.width !== undefined) {
      queryParameters['width'] = requestParameters.width;
    }

    if (requestParameters.height !== undefined) {
      queryParameters['height'] = requestParameters.height;
    }

    if (requestParameters.text !== undefined) {
      queryParameters['text'] = requestParameters.text;
    }

    if (requestParameters.createdAt !== undefined) {
      queryParameters['created_at'] = requestParameters.createdAt;
    }

    if (requestParameters.updatedAt !== undefined) {
      queryParameters['updated_at'] = requestParameters.updatedAt;
    }

    if (requestParameters.type !== undefined) {
      queryParameters['type'] = requestParameters.type;
    }

    if (requestParameters.createdAtZoomLevel !== undefined) {
      queryParameters['created_at_zoom_level'] =
        requestParameters.createdAtZoomLevel;
    }

    if (requestParameters.deleted !== undefined) {
      queryParameters['deleted'] = requestParameters.deleted;
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
      path: `/shape`,
      method: 'PATCH',
      headers: headerParameters,
      query: queryParameters,
      body: OdysShapeToJSON(requestParameters.shape),
    });

    return new runtime.VoidApiResponse(response);
  }

  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapePatch(requestParameters: ShapePatchRequest): Promise<void> {
    await this.shapePatchRaw(requestParameters);
  }

  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapePostRaw(
    requestParameters: ShapePostRequest
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
      path: `/shape`,
      method: 'POST',
      headers: headerParameters,
      query: queryParameters,
      body: OdysShapeToJSON(requestParameters.shape),
    });

    return new runtime.VoidApiResponse(response);
  }

  /**
   * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
   */
  async shapePost(requestParameters: ShapePostRequest): Promise<void> {
    await this.shapePostRaw(requestParameters);
  }
}

/**
 * @export
 * @enum {string}
 */
export enum ShapeDeletePreferEnum {
  Representation = 'return=representation',
  Minimal = 'return=minimal',
  None = 'return=none',
}
/**
 * @export
 * @enum {string}
 */
export enum ShapeGetPreferEnum {
  Countnone = 'count=none',
}
/**
 * @export
 * @enum {string}
 */
export enum ShapePatchPreferEnum {
  Representation = 'return=representation',
  Minimal = 'return=minimal',
  None = 'return=none',
}
/**
 * @export
 * @enum {string}
 */
export enum ShapePostPreferEnum {
  Representation = 'return=representation',
  Minimal = 'return=minimal',
  None = 'return=none',
}
