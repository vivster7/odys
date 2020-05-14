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
 * An arrow connects two shapes. It must have a direction (from, to).
 * @export
 * @interface OdysArrow
 */
export interface OdysArrow {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @type {string}
   * @memberof OdysArrow
   */
  id: string;
  /**
   * Note:
   * This is a Foreign Key to `board.id`.<fk table='board' column='id'/>
   * @type {string}
   * @memberof OdysArrow
   */
  boardId: string;
  /**
   * Note:
   * This is a Foreign Key to `shape.id`.<fk table='shape' column='id'/>
   * @type {string}
   * @memberof OdysArrow
   */
  fromShapeId: string;
  /**
   * Note:
   * This is a Foreign Key to `shape.id`.<fk table='shape' column='id'/>
   * @type {string}
   * @memberof OdysArrow
   */
  toShapeId: string;
  /**
   *
   * @type {string}
   * @memberof OdysArrow
   */
  createdAt: string;
  /**
   *
   * @type {string}
   * @memberof OdysArrow
   */
  updatedAt: string;
  /**
   *
   * @type {string}
   * @memberof OdysArrow
   */
  text: string;
  /**
   *
   * @type {boolean}
   * @memberof OdysArrow
   */
  deleted: boolean;
}

export function OdysArrowFromJSON(json: any): OdysArrow {
  return OdysArrowFromJSONTyped(json, false);
}

export function OdysArrowFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): OdysArrow {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    boardId: json['board_id'],
    fromShapeId: json['from_shape_id'],
    toShapeId: json['to_shape_id'],
    createdAt: json['created_at'],
    updatedAt: json['updated_at'],
    text: json['text'],
    deleted: json['deleted'],
  };
}

export function OdysArrowToJSON(value?: OdysArrow | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    board_id: value.boardId,
    from_shape_id: value.fromShapeId,
    to_shape_id: value.toShapeId,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
    text: value.text,
    deleted: value.deleted,
  };
}
