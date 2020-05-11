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
 * @interface Arrow
 */
export interface Arrow {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @type {string}
   * @memberof Arrow
   */
  id: string;
  /**
   *
   * @type {number}
   * @memberof Arrow
   */
  boardId: number;
  /**
   * Note:
   * This is a Foreign Key to `board.id`.<fk table='board' column='id'/>
   * @type {string}
   * @memberof Arrow
   */
  boardUuid: string;
  /**
   * Note:
   * This is a Foreign Key to `shape.id`.<fk table='shape' column='id'/>
   * @type {string}
   * @memberof Arrow
   */
  fromShapeId: string;
  /**
   * Note:
   * This is a Foreign Key to `shape.id`.<fk table='shape' column='id'/>
   * @type {string}
   * @memberof Arrow
   */
  toShapeId: string;
  /**
   *
   * @type {string}
   * @memberof Arrow
   */
  createdAt: string;
  /**
   *
   * @type {string}
   * @memberof Arrow
   */
  updatedAt: string;
}

export function ArrowFromJSON(json: any): Arrow {
  return ArrowFromJSONTyped(json, false);
}

export function ArrowFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): Arrow {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    boardId: json['board_id'],
    boardUuid: json['board_uuid'],
    fromShapeId: json['from_shape_id'],
    toShapeId: json['to_shape_id'],
    createdAt: json['created_at'],
    updatedAt: json['updated_at'],
  };
}

export function ArrowToJSON(value?: Arrow | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    board_id: value.boardId,
    board_uuid: value.boardUuid,
    from_shape_id: value.fromShapeId,
    to_shape_id: value.toShapeId,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
  };
}
