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

import { exists, mapValues } from '../runtime';
/**
 * A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.
 * @export
 * @interface OdysShape
 */
export interface OdysShape {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @type {string}
   * @memberof OdysShape
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `board.id`.<fk table='board' column='id'/>
   * @type {string}
   * @memberof OdysShape
   */
  boardId: string;
  /**
   * top left x-coordinate of shape
   * @type {number}
   * @memberof OdysShape
   */
  x: number;
  /**
   * top left y-coordinate of shape
   * @type {number}
   * @memberof OdysShape
   */
  y: number;
  /**
   * distance to grow in the x-axis
   * @type {number}
   * @memberof OdysShape
   */
  width: number;
  /**
   * distance to grow in the y-axis
   * @type {number}
   * @memberof OdysShape
   */
  height: number;
  /**
   * content inside shape
   * @type {string}
   * @memberof OdysShape
   */
  text: string;
  /**
   *
   * @type {string}
   * @memberof OdysShape
   */
  createdAt: string;
  /**
   *
   * @type {string}
   * @memberof OdysShape
   */
  updatedAt: string;
  /**
   * e.g. rect, grouping_rect, text..
   * @type {string}
   * @memberof OdysShape
   */
  type: string;
  /**
   * a shape created at zoom level 5 will only be visible when around level 5
   * @type {number}
   * @memberof OdysShape
   */
  createdAtZoomLevel: number;
  /**
   *
   * @type {boolean}
   * @memberof OdysShape
   */
  isDeleted: boolean;
  /**
   *
   * @type {string}
   * @memberof OdysShape
   */
  parentId: string;
}

export function OdysShapeFromJSON(json: any): OdysShape {
  return OdysShapeFromJSONTyped(json, false);
}

export function OdysShapeFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): OdysShape {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    boardId: json['board_id'],
    x: json['x'],
    y: json['y'],
    width: json['width'],
    height: json['height'],
    text: json['text'],
    createdAt: json['created_at'],
    updatedAt: json['updated_at'],
    type: json['type'],
    createdAtZoomLevel: json['created_at_zoom_level'],
    isDeleted: json['is_deleted'],
    parentId: json['parent_id'],
  };
}

export function OdysShapeToJSON(value?: OdysShape | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    board_id: value.boardId,
    x: value.x,
    y: value.y,
    width: value.width,
    height: value.height,
    text: value.text,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
    type: value.type,
    created_at_zoom_level: value.createdAtZoomLevel,
    is_deleted: value.isDeleted,
    parent_id: value.parentId,
  };
}
