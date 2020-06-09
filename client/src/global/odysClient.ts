import {
  OdysArrow,
  OdysArrowFromJSON,
  OdysArrowToJSON,
  OdysBoard,
  OdysBoardFromJSON,
  OdysBoardToJSON,
  OdysRoom,
  OdysRoomFromJSON,
  OdysRoomToJSON,
  OdysRoomUser,
  OdysRoomUserFromJSON,
  OdysRoomUserToJSON,
  OdysShape,
  OdysShapeFromJSON,
  OdysShapeToJSON,
  OdysUser,
  OdysUserFromJSON,
  OdysUserToJSON,
} from 'generated';

const POSTGREST_API_URL = (
  process.env.REACT_APP_POSTGREST_API_URL || ''
).replace(/\/+$/, '');

type OdysModel =
  | OdysArrow
  | OdysBoard
  | OdysRoom
  | OdysRoomUser
  | OdysShape
  | OdysUser;
type OdysModelString =
  | 'OdysArrow'
  | 'OdysBoard'
  | 'OdysRoom'
  | 'OdysRoomUser'
  | 'OdysShape'
  | 'OdysUser';
type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

type LookupResult = {
  path: string;
  serializer: (m: any | null | undefined) => any;
  deserializer: (json: any) => OdysModel;
};
const lookup: { [key in OdysModelString]: LookupResult } = {
  OdysArrow: {
    path: '/arrow',
    serializer: OdysArrowToJSON,
    deserializer: OdysArrowFromJSON,
  },
  OdysBoard: {
    path: '/board',
    serializer: OdysBoardToJSON,
    deserializer: OdysBoardFromJSON,
  },
  OdysRoom: {
    path: '/room',
    serializer: OdysRoomToJSON,
    deserializer: OdysRoomFromJSON,
  },
  OdysRoomUser: {
    path: '/room_user',
    serializer: OdysRoomUserToJSON,
    deserializer: OdysRoomUserFromJSON,
  },
  OdysShape: {
    path: '/shape',
    serializer: OdysShapeToJSON,
    deserializer: OdysShapeFromJSON,
  },
  OdysUser: {
    path: '/user',
    serializer: OdysUserToJSON,
    deserializer: OdysUserFromJSON,
  },
};

type QueryOpts = {
  onConflict: string[];
  select: string[];
};

type HeaderOpts = {
  mergeDuplicates?: boolean;
  returnRepresentation?: boolean;
};

type OdysRequestInit = {
  query?: string;
  headers?: string[][];
  body?: any[];
  queryOpts?: QueryOpts;
  headerOpts?: HeaderOpts;
};

type PostgrestError = {
  code: string;
  details: string | null;
  hint: string | null;
  message: string;
};

class OdysClient {
  private base_url: string;
  private defaultHeaders: string[][];

  constructor(defaultHeaders?: string[][]) {
    if (!POSTGREST_API_URL)
      throw new Error("Missing config 'REACT_APP_POSTGREST_API_URL'");
    this.base_url = POSTGREST_API_URL;
    this.defaultHeaders = defaultHeaders ?? [
      ['Content-Type', 'application/json'],
    ];
  }

  async request(
    method: HTTPMethod,
    model: OdysModelString,
    init: OdysRequestInit
  ): Promise<any[]> {
    const { path, serializer, deserializer } = lookup[model];

    const { query = '', body = [], headers = [], queryOpts, headerOpts } = init;

    const fullQuery = this.constructQuery(query, queryOpts);
    const fullHeaders = this.constructHeaders(
      this.defaultHeaders.concat(headers),
      headerOpts
    );

    // not using generated client, missing support for on_conflict.
    const url = `${this.base_url}${path}${fullQuery ? '?' + fullQuery : ''}`;
    const params: RequestInit = {
      headers: new Headers(fullHeaders),
      method: method,
    };

    if (body.length > 0) {
      params.body = JSON.stringify(body.map((b: any) => serializer(b)));
    }

    const p = await fetch(url, params);
    let json: any;
    try {
      json = await p.json();
    } catch (err) {
      // empty responses cannot be deserialized
      json = [];
    }

    if ('message' in json) {
      throw new Error((json as PostgrestError).message);
    }
    return json.map((j: any) => deserializer(j));
  }

  private constructQuery(
    queryStr: string,
    queryOpts?: QueryOpts | undefined
  ): string {
    const query = [queryStr];
    if (queryOpts?.onConflict) {
      query.push(`on_conflict=${queryOpts.onConflict.join(',')}`);
    }

    if (queryOpts?.select) {
      query.push(`select=${queryOpts.select.join(',')}`);
    }

    return query.join('&');
  }

  private constructHeaders(
    headers: string[][],
    headerOpts?: HeaderOpts
  ): string[][] {
    if (headerOpts?.mergeDuplicates) {
      headers.push(['Prefer', 'resolution=merge-duplicates']);
    }

    if (headerOpts?.returnRepresentation) {
      headers.push(['Prefer', 'return=representation']);
    }

    return headers;
  }
}

const odysClient = new OdysClient();
export default odysClient;
