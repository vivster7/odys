/* tslint:disable */
/* eslint-disable */

import { ConcreteRequest } from 'relay-runtime';
export type MouseCoordinatePatch = {
  rowId?: number | null;
  x?: number | null;
  y?: number | null;
};
export type CockpitMouseMutationVariables = {
  patch: MouseCoordinatePatch;
  rowId: number;
};
export type CockpitMouseMutationResponse = {
  readonly updateMouseCoordinate: {
    readonly mouseCoordinate: {
      readonly id: string;
      readonly x: number | null;
      readonly y: number | null;
    } | null;
  } | null;
};
export type CockpitMouseMutation = {
  readonly response: CockpitMouseMutationResponse;
  readonly variables: CockpitMouseMutationVariables;
};

/*
mutation CockpitMouseMutation(
  $patch: MouseCoordinatePatch!
  $rowId: Int!
) {
  updateMouseCoordinate(input: {patch: $patch, rowId: $rowId}) {
    mouseCoordinate {
      id
      x
      y
    }
  }
}
*/

const node: ConcreteRequest = (function () {
  var v0 = [
      {
        defaultValue: null,
        kind: 'LocalArgument',
        name: 'patch',
        type: 'MouseCoordinatePatch!',
      },
      {
        defaultValue: null,
        kind: 'LocalArgument',
        name: 'rowId',
        type: 'Int!',
      },
    ],
    v1 = [
      {
        alias: null,
        args: [
          {
            fields: [
              {
                kind: 'Variable',
                name: 'patch',
                variableName: 'patch',
              },
              {
                kind: 'Variable',
                name: 'rowId',
                variableName: 'rowId',
              },
            ],
            kind: 'ObjectValue',
            name: 'input',
          },
        ],
        concreteType: 'UpdateMouseCoordinatePayload',
        kind: 'LinkedField',
        name: 'updateMouseCoordinate',
        plural: false,
        selections: [
          {
            alias: null,
            args: null,
            concreteType: 'MouseCoordinate',
            kind: 'LinkedField',
            name: 'mouseCoordinate',
            plural: false,
            selections: [
              {
                alias: null,
                args: null,
                kind: 'ScalarField',
                name: 'id',
                storageKey: null,
              },
              {
                alias: null,
                args: null,
                kind: 'ScalarField',
                name: 'x',
                storageKey: null,
              },
              {
                alias: null,
                args: null,
                kind: 'ScalarField',
                name: 'y',
                storageKey: null,
              },
            ],
            storageKey: null,
          },
        ],
        storageKey: null,
      },
    ];
  return {
    fragment: {
      argumentDefinitions: v0 /*: any*/,
      kind: 'Fragment',
      metadata: null,
      name: 'CockpitMouseMutation',
      selections: v1 /*: any*/,
      type: 'Mutation',
    },
    kind: 'Request',
    operation: {
      argumentDefinitions: v0 /*: any*/,
      kind: 'Operation',
      name: 'CockpitMouseMutation',
      selections: v1 /*: any*/,
    },
    params: {
      id: null,
      metadata: {},
      name: 'CockpitMouseMutation',
      operationKind: 'mutation',
      text:
        'mutation CockpitMouseMutation(\n  $patch: MouseCoordinatePatch!\n  $rowId: Int!\n) {\n  updateMouseCoordinate(input: {patch: $patch, rowId: $rowId}) {\n    mouseCoordinate {\n      id\n      x\n      y\n    }\n  }\n}\n',
    },
  };
})();
(node as any).hash = '5eed7b5475fb55a5727726bb7226ad90';
export default node;
