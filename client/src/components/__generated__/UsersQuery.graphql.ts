/* tslint:disable */
/* eslint-disable */

import { ConcreteRequest } from 'relay-runtime';
export type UsersQueryVariables = {};
export type UsersQueryResponse = {
  readonly users: {
    readonly nodes: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly email: string;
    }>;
  } | null;
};
export type UsersQuery = {
  readonly response: UsersQueryResponse;
  readonly variables: UsersQueryVariables;
};

/*
query UsersQuery {
  users(first: 10) {
    nodes {
      id
      name
      email
    }
  }
}
*/

const node: ConcreteRequest = (function () {
  var v0 = [
    {
      alias: null,
      args: [
        {
          kind: 'Literal',
          name: 'first',
          value: 10,
        },
      ],
      concreteType: 'UsersConnection',
      kind: 'LinkedField',
      name: 'users',
      plural: false,
      selections: [
        {
          alias: null,
          args: null,
          concreteType: 'User',
          kind: 'LinkedField',
          name: 'nodes',
          plural: true,
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
              name: 'name',
              storageKey: null,
            },
            {
              alias: null,
              args: null,
              kind: 'ScalarField',
              name: 'email',
              storageKey: null,
            },
          ],
          storageKey: null,
        },
      ],
      storageKey: 'users(first:10)',
    },
  ];
  return {
    fragment: {
      argumentDefinitions: [],
      kind: 'Fragment',
      metadata: null,
      name: 'UsersQuery',
      selections: v0 /*: any*/,
      type: 'Query',
    },
    kind: 'Request',
    operation: {
      argumentDefinitions: [],
      kind: 'Operation',
      name: 'UsersQuery',
      selections: v0 /*: any*/,
    },
    params: {
      id: null,
      metadata: {},
      name: 'UsersQuery',
      operationKind: 'query',
      text:
        'query UsersQuery {\n  users(first: 10) {\n    nodes {\n      id\n      name\n      email\n    }\n  }\n}\n',
    },
  };
})();
(node as any).hash = '8205881ac86439bfb40e52f5f84a7aee';
export default node;
