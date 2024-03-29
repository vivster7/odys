/* tslint:disable */
/* eslint-disable */
/**
 * PostgREST API
 * This is a dynamic API generated by PostgREST
 *
 * The version of the OpenAPI document: 10.1.2
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
 * @interface OdysRoom
 */
export interface OdysRoom {
    /**
     * Note:
     * This is a Primary Key.<pk/>
     * @type {string}
     * @memberof OdysRoom
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof OdysRoom
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof OdysRoom
     */
    updatedAt: string;
}

export function OdysRoomFromJSON(json: any): OdysRoom {
    return OdysRoomFromJSONTyped(json, false);
}

export function OdysRoomFromJSONTyped(json: any, ignoreDiscriminator: boolean): OdysRoom {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'createdAt': json['created_at'],
        'updatedAt': json['updated_at'],
    };
}

export function OdysRoomToJSON(value?: OdysRoom | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'created_at': value.createdAt,
        'updated_at': value.updatedAt,
    };
}


