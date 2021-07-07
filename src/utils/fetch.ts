import fetch from 'isomorphic-fetch';

export async function fetchJson<T>(method: HTTPMethod, url: string, body = null, options: any = {}) {
  const { headers = {}, ...optionsRest } = options;
  url = new URL(url, '').toString();

  try {
    const result = await fetch(url, {
      method,
      ...((body as any) && { body: JSON.stringify(body) }),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...optionsRest,
    });
    if (result.status >= 400) {
      throw result;
    }
    try {
      const values = (await result.json()) as T;
      return values;
    } catch (e) {
      return undefined;
    }
  } catch (e) {
    throw e;
  }
}

/**
 * HTTP request methods.
 *
 * HTTP defines a set of request methods to indicate the desired action to be
 * performed for a given resource. Although they can also be nouns, these
 * request methods are sometimes referred as HTTP verbs. Each of them implements
 * a different semantic, but some common features are shared by a group of them:
 * e.g. a request method can be safe, idempotent, or cacheable.
 *
 * @public
 */
export enum HTTPMethod {
  /**
   * The `CONNECT` method establishes a tunnel to the server identified by the
   * target resource.
   */
  CONNECT = 'CONNECT',

  /**
   * The `DELETE` method deletes the specified resource.
   */
  DELETE = 'DELETE',

  /**
   * The `GET` method requests a representation of the specified resource.
   * Requests using GET should only retrieve data.
   */
  GET = 'GET',

  /**
   * The `HEAD` method asks for a response identical to that of a GET request,
   * but without the response body.
   */
  HEAD = 'HEAD',

  /**
   * The `OPTIONS` method is used to describe the communication options for the
   * target resource.
   */
  OPTIONS = 'OPTIONS',

  /**
   * The PATCH method is used to apply partial modifications to a resource.
   */
  PATCH = 'PATCH',

  /**
   * The `POST` method is used to submit an entity to the specified resource,
   * often causing a change in state or side effects on the server.
   */
  POST = 'POST',

  /**
   * The `PUT` method replaces all current representations of the target
   * resource with the request payload.
   */
  PUT = 'PUT',

  /**
   * The `TRACE` method performs a message loop-back test along the path to the
   * target resource.
   */
  TRACE = 'TRACE',
}
