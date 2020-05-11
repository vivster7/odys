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
 * User's gather in a room to draw diagrams in real-time.
 * @export
 * @interface Room
 */
export interface Room {
  /**
   * Note:
   * This is a Primary Key.<pk/>
   * @type {string}
   * @memberof Room
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof Room
   */
  createdAt: string;
  /**
   *
   * @type {string}
   * @memberof Room
   */
  updatedAt: string;
}

export function RoomFromJSON(json: any): Room {
  return RoomFromJSONTyped(json, false);
}

export function RoomFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): Room {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    createdAt: json['created_at'],
    updatedAt: json['updated_at'],
  };
}

export function RoomToJSON(value?: Room | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
  };
}
