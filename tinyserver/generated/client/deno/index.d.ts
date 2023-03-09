
/**
 * Client
**/

import * as runtime from '.././runtime/index.d.ts';
type UnwrapPromise<P extends any> = P extends Promise<infer R> ? R : P
type UnwrapTuple<Tuple extends readonly unknown[]> = {
  [K in keyof Tuple]: K extends `${number}` ? Tuple[K] extends Prisma.PrismaPromise<infer X> ? X : UnwrapPromise<Tuple[K]> : UnwrapPromise<Tuple[K]>
};


/**
 * Model User
 * 
 */
export type User = {
  id: string
  email: string
  role: Role
  max_capacity: number
  file_usage: number
  client_random_value: string
  encrypted_master_key: string
  encrypted_master_key_iv: string
  encrypted_rsa_private_key: string
  encrypted_rsa_private_key_iv: string
  hashed_authentication_key: string
  rsa_public_key: string
  created_at: Date
  updated_at: Date
}

/**
 * Model TFASolution
 * 
 */
export type TFASolution = {
  id: string
  type: SolutionType
  value: string
  user_id: string
  available: boolean
  created_at: Date
  updated_at: Date
}

/**
 * Model ConfirmingEmailAddress
 * 
 */
export type ConfirmingEmailAddress = {
  id: string
  email: string
  hashedtoken: string
  user_id: string | null
  expired_at: Date
  created_at: Date
  updated_at: Date
}

/**
 * Model Sessions
 * 
 */
export type Sessions = {
  id: string
  session_key: string
  data: string
  user_id: string | null
  expired_at: Date
  created_at: Date
  updated_at: Date
}

/**
 * Model Hooks
 * 
 */
export type Hooks = {
  id: string
  name: string
  data: string
  user_id: string
  expired_at: Date | null
  created_at: Date
  updated_at: Date
}

/**
 * Model Files
 * 
 */
export type Files = {
  id: string
  size: number
  created_by: string
  created_at: Date
  updated_at: Date
  encryption_data: string
}

/**
 * Model Coupons
 * 
 */
export type Coupons = {
  id: string
  data: string
  expired_at: Date | null
  created_at: Date
  updated_at: Date
}


/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const Role: {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

export type Role = (typeof Role)[keyof typeof Role]


export const SolutionType: {
  TOTP: 'TOTP',
  FIDO2: 'FIDO2',
  EMAIL: 'EMAIL'
};

export type SolutionType = (typeof SolutionType)[keyof typeof SolutionType]


/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  GlobalReject extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined = 'rejectOnNotFound' extends keyof T
    ? T['rejectOnNotFound']
    : false
      > {
    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => Promise<void> : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): Promise<void>;

  /**
   * Add a middleware
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<this, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">) => Promise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<R>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<GlobalReject>;

  /**
   * `prisma.tFASolution`: Exposes CRUD operations for the **TFASolution** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TFASolutions
    * const tFASolutions = await prisma.tFASolution.findMany()
    * ```
    */
  get tFASolution(): Prisma.TFASolutionDelegate<GlobalReject>;

  /**
   * `prisma.confirmingEmailAddress`: Exposes CRUD operations for the **ConfirmingEmailAddress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConfirmingEmailAddresses
    * const confirmingEmailAddresses = await prisma.confirmingEmailAddress.findMany()
    * ```
    */
  get confirmingEmailAddress(): Prisma.ConfirmingEmailAddressDelegate<GlobalReject>;

  /**
   * `prisma.sessions`: Exposes CRUD operations for the **Sessions** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.sessions.findMany()
    * ```
    */
  get sessions(): Prisma.SessionsDelegate<GlobalReject>;

  /**
   * `prisma.hooks`: Exposes CRUD operations for the **Hooks** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Hooks
    * const hooks = await prisma.hooks.findMany()
    * ```
    */
  get hooks(): Prisma.HooksDelegate<GlobalReject>;

  /**
   * `prisma.files`: Exposes CRUD operations for the **Files** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Files
    * const files = await prisma.files.findMany()
    * ```
    */
  get files(): Prisma.FilesDelegate<GlobalReject>;

  /**
   * `prisma.coupons`: Exposes CRUD operations for the **Coupons** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Coupons
    * const coupons = await prisma.coupons.findMany()
    * ```
    */
  get coupons(): Prisma.CouponsDelegate<GlobalReject>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket


  /**
   * Prisma Client JS version: 4.11.0
   * Query Engine version: 8fde8fef4033376662cad983758335009d522acb
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }
  type HasSelect = {
    select: any
  }
  type HasInclude = {
    include: any
  }
  type CheckSelect<T, S, U> = T extends SelectAndInclude
    ? 'Please either choose `select` or `include`'
    : T extends HasSelect
    ? U
    : T extends HasInclude
    ? U
    : S

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  export function validator<V>(): <S>(select: runtime.Types.Utils.LegacyExact<S, V>) => S;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but with an array
   */
  type PickArray<T, K extends Array<keyof T>> = Prisma__Pick<T, TupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    TFASolution: 'TFASolution',
    ConfirmingEmailAddress: 'ConfirmingEmailAddress',
    Sessions: 'Sessions',
    Hooks: 'Hooks',
    Files: 'Files',
    Coupons: 'Coupons'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  export type DefaultPrismaClient = PrismaClient
  export type RejectOnNotFound = boolean | ((error: Error) => Error)
  export type RejectPerModel = { [P in ModelName]?: RejectOnNotFound }
  export type RejectPerOperation =  { [P in "findUnique" | "findFirst"]?: RejectPerModel | RejectOnNotFound } 
  type IsReject<T> = T extends true ? True : T extends (err: Error) => Error ? True : False
  export type HasReject<
    GlobalRejectSettings extends Prisma.PrismaClientOptions['rejectOnNotFound'],
    LocalRejectSettings,
    Action extends PrismaAction,
    Model extends ModelName
  > = LocalRejectSettings extends RejectOnNotFound
    ? IsReject<LocalRejectSettings>
    : GlobalRejectSettings extends RejectPerOperation
    ? Action extends keyof GlobalRejectSettings
      ? GlobalRejectSettings[Action] extends RejectOnNotFound
        ? IsReject<GlobalRejectSettings[Action]>
        : GlobalRejectSettings[Action] extends RejectPerModel
        ? Model extends keyof GlobalRejectSettings[Action]
          ? IsReject<GlobalRejectSettings[Action][Model]>
          : False
        : False
      : False
    : IsReject<GlobalRejectSettings>
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

  export interface PrismaClientOptions {
    /**
     * Configure findUnique/findFirst to throw an error if the query returns null. 
     * @deprecated since 4.0.0. Use `findUniqueOrThrow`/`findFirstOrThrow` methods instead.
     * @example
     * ```
     * // Reject on both findUnique/findFirst
     * rejectOnNotFound: true
     * // Reject only on findFirst with a custom error
     * rejectOnNotFound: { findFirst: (err) => new Error("Custom Error")}
     * // Reject on user.findUnique with a custom error
     * rejectOnNotFound: { findUnique: {User: (err) => new Error("User not found")}}
     * ```
     */
    rejectOnNotFound?: RejectOnNotFound | RejectPerOperation
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources

    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat

    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findMany'
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => Promise<T>,
  ) => Promise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */


  export type UserCountOutputType = {
    tfa_solutions: number
    ConfirmingEmailAddress: number
    Sessions: number
    Hooks: number
    Files: number
  }

  export type UserCountOutputTypeSelect = {
    tfa_solutions?: boolean | UserCountOutputTypeCountTfa_solutionsArgs
    ConfirmingEmailAddress?: boolean | UserCountOutputTypeCountConfirmingEmailAddressArgs
    Sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    Hooks?: boolean | UserCountOutputTypeCountHooksArgs
    Files?: boolean | UserCountOutputTypeCountFilesArgs
  }

  export type UserCountOutputTypeGetPayload<S extends boolean | null | undefined | UserCountOutputTypeArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? UserCountOutputType :
    S extends undefined ? never :
    S extends { include: any } & (UserCountOutputTypeArgs)
    ? UserCountOutputType 
    : S extends { select: any } & (UserCountOutputTypeArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof UserCountOutputType ? UserCountOutputType[P] : never
  } 
      : UserCountOutputType




  // Custom InputTypes

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeArgs = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect | null
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTfa_solutionsArgs = {
    where?: TFASolutionWhereInput
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountConfirmingEmailAddressArgs = {
    where?: ConfirmingEmailAddressWhereInput
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs = {
    where?: SessionsWhereInput
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountHooksArgs = {
    where?: HooksWhereInput
  }


  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFilesArgs = {
    where?: FilesWhereInput
  }



  /**
   * Models
   */

  /**
   * Model User
   */


  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    max_capacity: number | null
    file_usage: number | null
  }

  export type UserSumAggregateOutputType = {
    max_capacity: number | null
    file_usage: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    role: Role | null
    max_capacity: number | null
    file_usage: number | null
    client_random_value: string | null
    encrypted_master_key: string | null
    encrypted_master_key_iv: string | null
    encrypted_rsa_private_key: string | null
    encrypted_rsa_private_key_iv: string | null
    hashed_authentication_key: string | null
    rsa_public_key: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    role: Role | null
    max_capacity: number | null
    file_usage: number | null
    client_random_value: string | null
    encrypted_master_key: string | null
    encrypted_master_key_iv: string | null
    encrypted_rsa_private_key: string | null
    encrypted_rsa_private_key_iv: string | null
    hashed_authentication_key: string | null
    rsa_public_key: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    role: number
    max_capacity: number
    file_usage: number
    client_random_value: number
    encrypted_master_key: number
    encrypted_master_key_iv: number
    encrypted_rsa_private_key: number
    encrypted_rsa_private_key_iv: number
    hashed_authentication_key: number
    rsa_public_key: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    max_capacity?: true
    file_usage?: true
  }

  export type UserSumAggregateInputType = {
    max_capacity?: true
    file_usage?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    role?: true
    max_capacity?: true
    file_usage?: true
    client_random_value?: true
    encrypted_master_key?: true
    encrypted_master_key_iv?: true
    encrypted_rsa_private_key?: true
    encrypted_rsa_private_key_iv?: true
    hashed_authentication_key?: true
    rsa_public_key?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    role?: true
    max_capacity?: true
    file_usage?: true
    client_random_value?: true
    encrypted_master_key?: true
    encrypted_master_key_iv?: true
    encrypted_rsa_private_key?: true
    encrypted_rsa_private_key_iv?: true
    hashed_authentication_key?: true
    rsa_public_key?: true
    created_at?: true
    updated_at?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    role?: true
    max_capacity?: true
    file_usage?: true
    client_random_value?: true
    encrypted_master_key?: true
    encrypted_master_key_iv?: true
    encrypted_rsa_private_key?: true
    encrypted_rsa_private_key_iv?: true
    hashed_authentication_key?: true
    rsa_public_key?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserAggregateArgs = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs = {
    where?: UserWhereInput
    orderBy?: Enumerable<UserOrderByWithAggregationInput>
    by: UserScalarFieldEnum[]
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }


  export type UserGroupByOutputType = {
    id: string
    email: string
    role: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at: Date
    updated_at: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect = {
    id?: boolean
    email?: boolean
    role?: boolean
    max_capacity?: boolean
    file_usage?: boolean
    client_random_value?: boolean
    encrypted_master_key?: boolean
    encrypted_master_key_iv?: boolean
    encrypted_rsa_private_key?: boolean
    encrypted_rsa_private_key_iv?: boolean
    hashed_authentication_key?: boolean
    rsa_public_key?: boolean
    created_at?: boolean
    updated_at?: boolean
    tfa_solutions?: boolean | User$tfa_solutionsArgs
    ConfirmingEmailAddress?: boolean | User$ConfirmingEmailAddressArgs
    Sessions?: boolean | User$SessionsArgs
    Hooks?: boolean | User$HooksArgs
    Files?: boolean | User$FilesArgs
    _count?: boolean | UserCountOutputTypeArgs
  }


  export type UserInclude = {
    tfa_solutions?: boolean | User$tfa_solutionsArgs
    ConfirmingEmailAddress?: boolean | User$ConfirmingEmailAddressArgs
    Sessions?: boolean | User$SessionsArgs
    Hooks?: boolean | User$HooksArgs
    Files?: boolean | User$FilesArgs
    _count?: boolean | UserCountOutputTypeArgs
  }

  export type UserGetPayload<S extends boolean | null | undefined | UserArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? User :
    S extends undefined ? never :
    S extends { include: any } & (UserArgs | UserFindManyArgs)
    ? User  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'tfa_solutions' ? Array < TFASolutionGetPayload<S['include'][P]>>  :
        P extends 'ConfirmingEmailAddress' ? Array < ConfirmingEmailAddressGetPayload<S['include'][P]>>  :
        P extends 'Sessions' ? Array < SessionsGetPayload<S['include'][P]>>  :
        P extends 'Hooks' ? Array < HooksGetPayload<S['include'][P]>>  :
        P extends 'Files' ? Array < FilesGetPayload<S['include'][P]>>  :
        P extends '_count' ? UserCountOutputTypeGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (UserArgs | UserFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'tfa_solutions' ? Array < TFASolutionGetPayload<S['select'][P]>>  :
        P extends 'ConfirmingEmailAddress' ? Array < ConfirmingEmailAddressGetPayload<S['select'][P]>>  :
        P extends 'Sessions' ? Array < SessionsGetPayload<S['select'][P]>>  :
        P extends 'Hooks' ? Array < HooksGetPayload<S['select'][P]>>  :
        P extends 'Files' ? Array < FilesGetPayload<S['select'][P]>>  :
        P extends '_count' ? UserCountOutputTypeGetPayload<S['select'][P]> :  P extends keyof User ? User[P] : never
  } 
      : User


  type UserCountArgs = 
    Omit<UserFindManyArgs, 'select' | 'include'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends UserFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, UserFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'User'> extends True ? Prisma__UserClient<UserGetPayload<T>> : Prisma__UserClient<UserGetPayload<T> | null, null>

    /**
     * Find one User that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, UserFindUniqueOrThrowArgs>
    ): Prisma__UserClient<UserGetPayload<T>>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends UserFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, UserFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'User'> extends True ? Prisma__UserClient<UserGetPayload<T>> : Prisma__UserClient<UserGetPayload<T> | null, null>

    /**
     * Find the first User that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UserFindFirstOrThrowArgs>
    ): Prisma__UserClient<UserGetPayload<T>>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends UserFindManyArgs>(
      args?: SelectSubset<T, UserFindManyArgs>
    ): Prisma.PrismaPromise<Array<UserGetPayload<T>>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
    **/
    create<T extends UserCreateArgs>(
      args: SelectSubset<T, UserCreateArgs>
    ): Prisma__UserClient<UserGetPayload<T>>

    /**
     * Create many Users.
     *     @param {UserCreateManyArgs} args - Arguments to create many Users.
     *     @example
     *     // Create many Users
     *     const user = await prisma.user.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends UserCreateManyArgs>(
      args?: SelectSubset<T, UserCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
    **/
    delete<T extends UserDeleteArgs>(
      args: SelectSubset<T, UserDeleteArgs>
    ): Prisma__UserClient<UserGetPayload<T>>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends UserUpdateArgs>(
      args: SelectSubset<T, UserUpdateArgs>
    ): Prisma__UserClient<UserGetPayload<T>>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends UserDeleteManyArgs>(
      args?: SelectSubset<T, UserDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends UserUpdateManyArgs>(
      args: SelectSubset<T, UserUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
    **/
    upsert<T extends UserUpsertArgs>(
      args: SelectSubset<T, UserUpsertArgs>
    ): Prisma__UserClient<UserGetPayload<T>>

    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__UserClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    tfa_solutions<T extends User$tfa_solutionsArgs= {}>(args?: Subset<T, User$tfa_solutionsArgs>): Prisma.PrismaPromise<Array<TFASolutionGetPayload<T>>| Null>;

    ConfirmingEmailAddress<T extends User$ConfirmingEmailAddressArgs= {}>(args?: Subset<T, User$ConfirmingEmailAddressArgs>): Prisma.PrismaPromise<Array<ConfirmingEmailAddressGetPayload<T>>| Null>;

    Sessions<T extends User$SessionsArgs= {}>(args?: Subset<T, User$SessionsArgs>): Prisma.PrismaPromise<Array<SessionsGetPayload<T>>| Null>;

    Hooks<T extends User$HooksArgs= {}>(args?: Subset<T, User$HooksArgs>): Prisma.PrismaPromise<Array<HooksGetPayload<T>>| Null>;

    Files<T extends User$FilesArgs= {}>(args?: Subset<T, User$FilesArgs>): Prisma.PrismaPromise<Array<FilesGetPayload<T>>| Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * User base type for findUnique actions
   */
  export type UserFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUnique
   */
  export interface UserFindUniqueArgs extends UserFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User base type for findFirst actions
   */
  export type UserFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: Enumerable<UserScalarFieldEnum>
  }

  /**
   * User findFirst
   */
  export interface UserFindFirstArgs extends UserFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: Enumerable<UserScalarFieldEnum>
  }


  /**
   * User findMany
   */
  export type UserFindManyArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: Enumerable<UserOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: Enumerable<UserScalarFieldEnum>
  }


  /**
   * User create
   */
  export type UserCreateArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }


  /**
   * User createMany
   */
  export type UserCreateManyArgs = {
    /**
     * The data used to create many Users.
     */
    data: Enumerable<UserCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * User update
   */
  export type UserUpdateArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User updateMany
   */
  export type UserUpdateManyArgs = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }


  /**
   * User upsert
   */
  export type UserUpsertArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }


  /**
   * User delete
   */
  export type UserDeleteArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }


  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }


  /**
   * User.tfa_solutions
   */
  export type User$tfa_solutionsArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    where?: TFASolutionWhereInput
    orderBy?: Enumerable<TFASolutionOrderByWithRelationInput>
    cursor?: TFASolutionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<TFASolutionScalarFieldEnum>
  }


  /**
   * User.ConfirmingEmailAddress
   */
  export type User$ConfirmingEmailAddressArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    where?: ConfirmingEmailAddressWhereInput
    orderBy?: Enumerable<ConfirmingEmailAddressOrderByWithRelationInput>
    cursor?: ConfirmingEmailAddressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<ConfirmingEmailAddressScalarFieldEnum>
  }


  /**
   * User.Sessions
   */
  export type User$SessionsArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    where?: SessionsWhereInput
    orderBy?: Enumerable<SessionsOrderByWithRelationInput>
    cursor?: SessionsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<SessionsScalarFieldEnum>
  }


  /**
   * User.Hooks
   */
  export type User$HooksArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    where?: HooksWhereInput
    orderBy?: Enumerable<HooksOrderByWithRelationInput>
    cursor?: HooksWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<HooksScalarFieldEnum>
  }


  /**
   * User.Files
   */
  export type User$FilesArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    where?: FilesWhereInput
    orderBy?: Enumerable<FilesOrderByWithRelationInput>
    cursor?: FilesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Enumerable<FilesScalarFieldEnum>
  }


  /**
   * User without action
   */
  export type UserArgs = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: UserInclude | null
  }



  /**
   * Model TFASolution
   */


  export type AggregateTFASolution = {
    _count: TFASolutionCountAggregateOutputType | null
    _min: TFASolutionMinAggregateOutputType | null
    _max: TFASolutionMaxAggregateOutputType | null
  }

  export type TFASolutionMinAggregateOutputType = {
    id: string | null
    type: SolutionType | null
    value: string | null
    user_id: string | null
    available: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type TFASolutionMaxAggregateOutputType = {
    id: string | null
    type: SolutionType | null
    value: string | null
    user_id: string | null
    available: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type TFASolutionCountAggregateOutputType = {
    id: number
    type: number
    value: number
    user_id: number
    available: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type TFASolutionMinAggregateInputType = {
    id?: true
    type?: true
    value?: true
    user_id?: true
    available?: true
    created_at?: true
    updated_at?: true
  }

  export type TFASolutionMaxAggregateInputType = {
    id?: true
    type?: true
    value?: true
    user_id?: true
    available?: true
    created_at?: true
    updated_at?: true
  }

  export type TFASolutionCountAggregateInputType = {
    id?: true
    type?: true
    value?: true
    user_id?: true
    available?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type TFASolutionAggregateArgs = {
    /**
     * Filter which TFASolution to aggregate.
     */
    where?: TFASolutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TFASolutions to fetch.
     */
    orderBy?: Enumerable<TFASolutionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TFASolutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TFASolutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TFASolutions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TFASolutions
    **/
    _count?: true | TFASolutionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TFASolutionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TFASolutionMaxAggregateInputType
  }

  export type GetTFASolutionAggregateType<T extends TFASolutionAggregateArgs> = {
        [P in keyof T & keyof AggregateTFASolution]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTFASolution[P]>
      : GetScalarType<T[P], AggregateTFASolution[P]>
  }




  export type TFASolutionGroupByArgs = {
    where?: TFASolutionWhereInput
    orderBy?: Enumerable<TFASolutionOrderByWithAggregationInput>
    by: TFASolutionScalarFieldEnum[]
    having?: TFASolutionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TFASolutionCountAggregateInputType | true
    _min?: TFASolutionMinAggregateInputType
    _max?: TFASolutionMaxAggregateInputType
  }


  export type TFASolutionGroupByOutputType = {
    id: string
    type: SolutionType
    value: string
    user_id: string
    available: boolean
    created_at: Date
    updated_at: Date
    _count: TFASolutionCountAggregateOutputType | null
    _min: TFASolutionMinAggregateOutputType | null
    _max: TFASolutionMaxAggregateOutputType | null
  }

  type GetTFASolutionGroupByPayload<T extends TFASolutionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<TFASolutionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TFASolutionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TFASolutionGroupByOutputType[P]>
            : GetScalarType<T[P], TFASolutionGroupByOutputType[P]>
        }
      >
    >


  export type TFASolutionSelect = {
    id?: boolean
    type?: boolean
    value?: boolean
    user_id?: boolean
    available?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserArgs
  }


  export type TFASolutionInclude = {
    user?: boolean | UserArgs
  }

  export type TFASolutionGetPayload<S extends boolean | null | undefined | TFASolutionArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? TFASolution :
    S extends undefined ? never :
    S extends { include: any } & (TFASolutionArgs | TFASolutionFindManyArgs)
    ? TFASolution  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'user' ? UserGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (TFASolutionArgs | TFASolutionFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'user' ? UserGetPayload<S['select'][P]> :  P extends keyof TFASolution ? TFASolution[P] : never
  } 
      : TFASolution


  type TFASolutionCountArgs = 
    Omit<TFASolutionFindManyArgs, 'select' | 'include'> & {
      select?: TFASolutionCountAggregateInputType | true
    }

  export interface TFASolutionDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one TFASolution that matches the filter.
     * @param {TFASolutionFindUniqueArgs} args - Arguments to find a TFASolution
     * @example
     * // Get one TFASolution
     * const tFASolution = await prisma.tFASolution.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends TFASolutionFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, TFASolutionFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'TFASolution'> extends True ? Prisma__TFASolutionClient<TFASolutionGetPayload<T>> : Prisma__TFASolutionClient<TFASolutionGetPayload<T> | null, null>

    /**
     * Find one TFASolution that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {TFASolutionFindUniqueOrThrowArgs} args - Arguments to find a TFASolution
     * @example
     * // Get one TFASolution
     * const tFASolution = await prisma.tFASolution.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends TFASolutionFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, TFASolutionFindUniqueOrThrowArgs>
    ): Prisma__TFASolutionClient<TFASolutionGetPayload<T>>

    /**
     * Find the first TFASolution that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TFASolutionFindFirstArgs} args - Arguments to find a TFASolution
     * @example
     * // Get one TFASolution
     * const tFASolution = await prisma.tFASolution.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends TFASolutionFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, TFASolutionFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'TFASolution'> extends True ? Prisma__TFASolutionClient<TFASolutionGetPayload<T>> : Prisma__TFASolutionClient<TFASolutionGetPayload<T> | null, null>

    /**
     * Find the first TFASolution that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TFASolutionFindFirstOrThrowArgs} args - Arguments to find a TFASolution
     * @example
     * // Get one TFASolution
     * const tFASolution = await prisma.tFASolution.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends TFASolutionFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TFASolutionFindFirstOrThrowArgs>
    ): Prisma__TFASolutionClient<TFASolutionGetPayload<T>>

    /**
     * Find zero or more TFASolutions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TFASolutionFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TFASolutions
     * const tFASolutions = await prisma.tFASolution.findMany()
     * 
     * // Get first 10 TFASolutions
     * const tFASolutions = await prisma.tFASolution.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tFASolutionWithIdOnly = await prisma.tFASolution.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends TFASolutionFindManyArgs>(
      args?: SelectSubset<T, TFASolutionFindManyArgs>
    ): Prisma.PrismaPromise<Array<TFASolutionGetPayload<T>>>

    /**
     * Create a TFASolution.
     * @param {TFASolutionCreateArgs} args - Arguments to create a TFASolution.
     * @example
     * // Create one TFASolution
     * const TFASolution = await prisma.tFASolution.create({
     *   data: {
     *     // ... data to create a TFASolution
     *   }
     * })
     * 
    **/
    create<T extends TFASolutionCreateArgs>(
      args: SelectSubset<T, TFASolutionCreateArgs>
    ): Prisma__TFASolutionClient<TFASolutionGetPayload<T>>

    /**
     * Create many TFASolutions.
     *     @param {TFASolutionCreateManyArgs} args - Arguments to create many TFASolutions.
     *     @example
     *     // Create many TFASolutions
     *     const tFASolution = await prisma.tFASolution.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends TFASolutionCreateManyArgs>(
      args?: SelectSubset<T, TFASolutionCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a TFASolution.
     * @param {TFASolutionDeleteArgs} args - Arguments to delete one TFASolution.
     * @example
     * // Delete one TFASolution
     * const TFASolution = await prisma.tFASolution.delete({
     *   where: {
     *     // ... filter to delete one TFASolution
     *   }
     * })
     * 
    **/
    delete<T extends TFASolutionDeleteArgs>(
      args: SelectSubset<T, TFASolutionDeleteArgs>
    ): Prisma__TFASolutionClient<TFASolutionGetPayload<T>>

    /**
     * Update one TFASolution.
     * @param {TFASolutionUpdateArgs} args - Arguments to update one TFASolution.
     * @example
     * // Update one TFASolution
     * const tFASolution = await prisma.tFASolution.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends TFASolutionUpdateArgs>(
      args: SelectSubset<T, TFASolutionUpdateArgs>
    ): Prisma__TFASolutionClient<TFASolutionGetPayload<T>>

    /**
     * Delete zero or more TFASolutions.
     * @param {TFASolutionDeleteManyArgs} args - Arguments to filter TFASolutions to delete.
     * @example
     * // Delete a few TFASolutions
     * const { count } = await prisma.tFASolution.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends TFASolutionDeleteManyArgs>(
      args?: SelectSubset<T, TFASolutionDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TFASolutions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TFASolutionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TFASolutions
     * const tFASolution = await prisma.tFASolution.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends TFASolutionUpdateManyArgs>(
      args: SelectSubset<T, TFASolutionUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TFASolution.
     * @param {TFASolutionUpsertArgs} args - Arguments to update or create a TFASolution.
     * @example
     * // Update or create a TFASolution
     * const tFASolution = await prisma.tFASolution.upsert({
     *   create: {
     *     // ... data to create a TFASolution
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TFASolution we want to update
     *   }
     * })
    **/
    upsert<T extends TFASolutionUpsertArgs>(
      args: SelectSubset<T, TFASolutionUpsertArgs>
    ): Prisma__TFASolutionClient<TFASolutionGetPayload<T>>

    /**
     * Count the number of TFASolutions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TFASolutionCountArgs} args - Arguments to filter TFASolutions to count.
     * @example
     * // Count the number of TFASolutions
     * const count = await prisma.tFASolution.count({
     *   where: {
     *     // ... the filter for the TFASolutions we want to count
     *   }
     * })
    **/
    count<T extends TFASolutionCountArgs>(
      args?: Subset<T, TFASolutionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TFASolutionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TFASolution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TFASolutionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TFASolutionAggregateArgs>(args: Subset<T, TFASolutionAggregateArgs>): Prisma.PrismaPromise<GetTFASolutionAggregateType<T>>

    /**
     * Group by TFASolution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TFASolutionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TFASolutionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TFASolutionGroupByArgs['orderBy'] }
        : { orderBy?: TFASolutionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TFASolutionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTFASolutionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for TFASolution.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__TFASolutionClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs= {}>(args?: Subset<T, UserArgs>): Prisma__UserClient<UserGetPayload<T> | Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * TFASolution base type for findUnique actions
   */
  export type TFASolutionFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * Filter, which TFASolution to fetch.
     */
    where: TFASolutionWhereUniqueInput
  }

  /**
   * TFASolution findUnique
   */
  export interface TFASolutionFindUniqueArgs extends TFASolutionFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * TFASolution findUniqueOrThrow
   */
  export type TFASolutionFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * Filter, which TFASolution to fetch.
     */
    where: TFASolutionWhereUniqueInput
  }


  /**
   * TFASolution base type for findFirst actions
   */
  export type TFASolutionFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * Filter, which TFASolution to fetch.
     */
    where?: TFASolutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TFASolutions to fetch.
     */
    orderBy?: Enumerable<TFASolutionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TFASolutions.
     */
    cursor?: TFASolutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TFASolutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TFASolutions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TFASolutions.
     */
    distinct?: Enumerable<TFASolutionScalarFieldEnum>
  }

  /**
   * TFASolution findFirst
   */
  export interface TFASolutionFindFirstArgs extends TFASolutionFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * TFASolution findFirstOrThrow
   */
  export type TFASolutionFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * Filter, which TFASolution to fetch.
     */
    where?: TFASolutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TFASolutions to fetch.
     */
    orderBy?: Enumerable<TFASolutionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TFASolutions.
     */
    cursor?: TFASolutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TFASolutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TFASolutions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TFASolutions.
     */
    distinct?: Enumerable<TFASolutionScalarFieldEnum>
  }


  /**
   * TFASolution findMany
   */
  export type TFASolutionFindManyArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * Filter, which TFASolutions to fetch.
     */
    where?: TFASolutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TFASolutions to fetch.
     */
    orderBy?: Enumerable<TFASolutionOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TFASolutions.
     */
    cursor?: TFASolutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TFASolutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TFASolutions.
     */
    skip?: number
    distinct?: Enumerable<TFASolutionScalarFieldEnum>
  }


  /**
   * TFASolution create
   */
  export type TFASolutionCreateArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * The data needed to create a TFASolution.
     */
    data: XOR<TFASolutionCreateInput, TFASolutionUncheckedCreateInput>
  }


  /**
   * TFASolution createMany
   */
  export type TFASolutionCreateManyArgs = {
    /**
     * The data used to create many TFASolutions.
     */
    data: Enumerable<TFASolutionCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * TFASolution update
   */
  export type TFASolutionUpdateArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * The data needed to update a TFASolution.
     */
    data: XOR<TFASolutionUpdateInput, TFASolutionUncheckedUpdateInput>
    /**
     * Choose, which TFASolution to update.
     */
    where: TFASolutionWhereUniqueInput
  }


  /**
   * TFASolution updateMany
   */
  export type TFASolutionUpdateManyArgs = {
    /**
     * The data used to update TFASolutions.
     */
    data: XOR<TFASolutionUpdateManyMutationInput, TFASolutionUncheckedUpdateManyInput>
    /**
     * Filter which TFASolutions to update
     */
    where?: TFASolutionWhereInput
  }


  /**
   * TFASolution upsert
   */
  export type TFASolutionUpsertArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * The filter to search for the TFASolution to update in case it exists.
     */
    where: TFASolutionWhereUniqueInput
    /**
     * In case the TFASolution found by the `where` argument doesn't exist, create a new TFASolution with this data.
     */
    create: XOR<TFASolutionCreateInput, TFASolutionUncheckedCreateInput>
    /**
     * In case the TFASolution was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TFASolutionUpdateInput, TFASolutionUncheckedUpdateInput>
  }


  /**
   * TFASolution delete
   */
  export type TFASolutionDeleteArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
    /**
     * Filter which TFASolution to delete.
     */
    where: TFASolutionWhereUniqueInput
  }


  /**
   * TFASolution deleteMany
   */
  export type TFASolutionDeleteManyArgs = {
    /**
     * Filter which TFASolutions to delete
     */
    where?: TFASolutionWhereInput
  }


  /**
   * TFASolution without action
   */
  export type TFASolutionArgs = {
    /**
     * Select specific fields to fetch from the TFASolution
     */
    select?: TFASolutionSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: TFASolutionInclude | null
  }



  /**
   * Model ConfirmingEmailAddress
   */


  export type AggregateConfirmingEmailAddress = {
    _count: ConfirmingEmailAddressCountAggregateOutputType | null
    _min: ConfirmingEmailAddressMinAggregateOutputType | null
    _max: ConfirmingEmailAddressMaxAggregateOutputType | null
  }

  export type ConfirmingEmailAddressMinAggregateOutputType = {
    id: string | null
    email: string | null
    hashedtoken: string | null
    user_id: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConfirmingEmailAddressMaxAggregateOutputType = {
    id: string | null
    email: string | null
    hashedtoken: string | null
    user_id: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConfirmingEmailAddressCountAggregateOutputType = {
    id: number
    email: number
    hashedtoken: number
    user_id: number
    expired_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ConfirmingEmailAddressMinAggregateInputType = {
    id?: true
    email?: true
    hashedtoken?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type ConfirmingEmailAddressMaxAggregateInputType = {
    id?: true
    email?: true
    hashedtoken?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type ConfirmingEmailAddressCountAggregateInputType = {
    id?: true
    email?: true
    hashedtoken?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ConfirmingEmailAddressAggregateArgs = {
    /**
     * Filter which ConfirmingEmailAddress to aggregate.
     */
    where?: ConfirmingEmailAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfirmingEmailAddresses to fetch.
     */
    orderBy?: Enumerable<ConfirmingEmailAddressOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConfirmingEmailAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfirmingEmailAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfirmingEmailAddresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConfirmingEmailAddresses
    **/
    _count?: true | ConfirmingEmailAddressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConfirmingEmailAddressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConfirmingEmailAddressMaxAggregateInputType
  }

  export type GetConfirmingEmailAddressAggregateType<T extends ConfirmingEmailAddressAggregateArgs> = {
        [P in keyof T & keyof AggregateConfirmingEmailAddress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConfirmingEmailAddress[P]>
      : GetScalarType<T[P], AggregateConfirmingEmailAddress[P]>
  }




  export type ConfirmingEmailAddressGroupByArgs = {
    where?: ConfirmingEmailAddressWhereInput
    orderBy?: Enumerable<ConfirmingEmailAddressOrderByWithAggregationInput>
    by: ConfirmingEmailAddressScalarFieldEnum[]
    having?: ConfirmingEmailAddressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConfirmingEmailAddressCountAggregateInputType | true
    _min?: ConfirmingEmailAddressMinAggregateInputType
    _max?: ConfirmingEmailAddressMaxAggregateInputType
  }


  export type ConfirmingEmailAddressGroupByOutputType = {
    id: string
    email: string
    hashedtoken: string
    user_id: string | null
    expired_at: Date
    created_at: Date
    updated_at: Date
    _count: ConfirmingEmailAddressCountAggregateOutputType | null
    _min: ConfirmingEmailAddressMinAggregateOutputType | null
    _max: ConfirmingEmailAddressMaxAggregateOutputType | null
  }

  type GetConfirmingEmailAddressGroupByPayload<T extends ConfirmingEmailAddressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<ConfirmingEmailAddressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConfirmingEmailAddressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConfirmingEmailAddressGroupByOutputType[P]>
            : GetScalarType<T[P], ConfirmingEmailAddressGroupByOutputType[P]>
        }
      >
    >


  export type ConfirmingEmailAddressSelect = {
    id?: boolean
    email?: boolean
    hashedtoken?: boolean
    user_id?: boolean
    expired_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserArgs
  }


  export type ConfirmingEmailAddressInclude = {
    user?: boolean | UserArgs
  }

  export type ConfirmingEmailAddressGetPayload<S extends boolean | null | undefined | ConfirmingEmailAddressArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? ConfirmingEmailAddress :
    S extends undefined ? never :
    S extends { include: any } & (ConfirmingEmailAddressArgs | ConfirmingEmailAddressFindManyArgs)
    ? ConfirmingEmailAddress  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'user' ? UserGetPayload<S['include'][P]> | null :  never
  } 
    : S extends { select: any } & (ConfirmingEmailAddressArgs | ConfirmingEmailAddressFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'user' ? UserGetPayload<S['select'][P]> | null :  P extends keyof ConfirmingEmailAddress ? ConfirmingEmailAddress[P] : never
  } 
      : ConfirmingEmailAddress


  type ConfirmingEmailAddressCountArgs = 
    Omit<ConfirmingEmailAddressFindManyArgs, 'select' | 'include'> & {
      select?: ConfirmingEmailAddressCountAggregateInputType | true
    }

  export interface ConfirmingEmailAddressDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one ConfirmingEmailAddress that matches the filter.
     * @param {ConfirmingEmailAddressFindUniqueArgs} args - Arguments to find a ConfirmingEmailAddress
     * @example
     * // Get one ConfirmingEmailAddress
     * const confirmingEmailAddress = await prisma.confirmingEmailAddress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ConfirmingEmailAddressFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, ConfirmingEmailAddressFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'ConfirmingEmailAddress'> extends True ? Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>> : Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T> | null, null>

    /**
     * Find one ConfirmingEmailAddress that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {ConfirmingEmailAddressFindUniqueOrThrowArgs} args - Arguments to find a ConfirmingEmailAddress
     * @example
     * // Get one ConfirmingEmailAddress
     * const confirmingEmailAddress = await prisma.confirmingEmailAddress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ConfirmingEmailAddressFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, ConfirmingEmailAddressFindUniqueOrThrowArgs>
    ): Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>>

    /**
     * Find the first ConfirmingEmailAddress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfirmingEmailAddressFindFirstArgs} args - Arguments to find a ConfirmingEmailAddress
     * @example
     * // Get one ConfirmingEmailAddress
     * const confirmingEmailAddress = await prisma.confirmingEmailAddress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ConfirmingEmailAddressFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, ConfirmingEmailAddressFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'ConfirmingEmailAddress'> extends True ? Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>> : Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T> | null, null>

    /**
     * Find the first ConfirmingEmailAddress that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfirmingEmailAddressFindFirstOrThrowArgs} args - Arguments to find a ConfirmingEmailAddress
     * @example
     * // Get one ConfirmingEmailAddress
     * const confirmingEmailAddress = await prisma.confirmingEmailAddress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ConfirmingEmailAddressFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ConfirmingEmailAddressFindFirstOrThrowArgs>
    ): Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>>

    /**
     * Find zero or more ConfirmingEmailAddresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfirmingEmailAddressFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConfirmingEmailAddresses
     * const confirmingEmailAddresses = await prisma.confirmingEmailAddress.findMany()
     * 
     * // Get first 10 ConfirmingEmailAddresses
     * const confirmingEmailAddresses = await prisma.confirmingEmailAddress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const confirmingEmailAddressWithIdOnly = await prisma.confirmingEmailAddress.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends ConfirmingEmailAddressFindManyArgs>(
      args?: SelectSubset<T, ConfirmingEmailAddressFindManyArgs>
    ): Prisma.PrismaPromise<Array<ConfirmingEmailAddressGetPayload<T>>>

    /**
     * Create a ConfirmingEmailAddress.
     * @param {ConfirmingEmailAddressCreateArgs} args - Arguments to create a ConfirmingEmailAddress.
     * @example
     * // Create one ConfirmingEmailAddress
     * const ConfirmingEmailAddress = await prisma.confirmingEmailAddress.create({
     *   data: {
     *     // ... data to create a ConfirmingEmailAddress
     *   }
     * })
     * 
    **/
    create<T extends ConfirmingEmailAddressCreateArgs>(
      args: SelectSubset<T, ConfirmingEmailAddressCreateArgs>
    ): Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>>

    /**
     * Create many ConfirmingEmailAddresses.
     *     @param {ConfirmingEmailAddressCreateManyArgs} args - Arguments to create many ConfirmingEmailAddresses.
     *     @example
     *     // Create many ConfirmingEmailAddresses
     *     const confirmingEmailAddress = await prisma.confirmingEmailAddress.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends ConfirmingEmailAddressCreateManyArgs>(
      args?: SelectSubset<T, ConfirmingEmailAddressCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ConfirmingEmailAddress.
     * @param {ConfirmingEmailAddressDeleteArgs} args - Arguments to delete one ConfirmingEmailAddress.
     * @example
     * // Delete one ConfirmingEmailAddress
     * const ConfirmingEmailAddress = await prisma.confirmingEmailAddress.delete({
     *   where: {
     *     // ... filter to delete one ConfirmingEmailAddress
     *   }
     * })
     * 
    **/
    delete<T extends ConfirmingEmailAddressDeleteArgs>(
      args: SelectSubset<T, ConfirmingEmailAddressDeleteArgs>
    ): Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>>

    /**
     * Update one ConfirmingEmailAddress.
     * @param {ConfirmingEmailAddressUpdateArgs} args - Arguments to update one ConfirmingEmailAddress.
     * @example
     * // Update one ConfirmingEmailAddress
     * const confirmingEmailAddress = await prisma.confirmingEmailAddress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ConfirmingEmailAddressUpdateArgs>(
      args: SelectSubset<T, ConfirmingEmailAddressUpdateArgs>
    ): Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>>

    /**
     * Delete zero or more ConfirmingEmailAddresses.
     * @param {ConfirmingEmailAddressDeleteManyArgs} args - Arguments to filter ConfirmingEmailAddresses to delete.
     * @example
     * // Delete a few ConfirmingEmailAddresses
     * const { count } = await prisma.confirmingEmailAddress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ConfirmingEmailAddressDeleteManyArgs>(
      args?: SelectSubset<T, ConfirmingEmailAddressDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConfirmingEmailAddresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfirmingEmailAddressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConfirmingEmailAddresses
     * const confirmingEmailAddress = await prisma.confirmingEmailAddress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ConfirmingEmailAddressUpdateManyArgs>(
      args: SelectSubset<T, ConfirmingEmailAddressUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ConfirmingEmailAddress.
     * @param {ConfirmingEmailAddressUpsertArgs} args - Arguments to update or create a ConfirmingEmailAddress.
     * @example
     * // Update or create a ConfirmingEmailAddress
     * const confirmingEmailAddress = await prisma.confirmingEmailAddress.upsert({
     *   create: {
     *     // ... data to create a ConfirmingEmailAddress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConfirmingEmailAddress we want to update
     *   }
     * })
    **/
    upsert<T extends ConfirmingEmailAddressUpsertArgs>(
      args: SelectSubset<T, ConfirmingEmailAddressUpsertArgs>
    ): Prisma__ConfirmingEmailAddressClient<ConfirmingEmailAddressGetPayload<T>>

    /**
     * Count the number of ConfirmingEmailAddresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfirmingEmailAddressCountArgs} args - Arguments to filter ConfirmingEmailAddresses to count.
     * @example
     * // Count the number of ConfirmingEmailAddresses
     * const count = await prisma.confirmingEmailAddress.count({
     *   where: {
     *     // ... the filter for the ConfirmingEmailAddresses we want to count
     *   }
     * })
    **/
    count<T extends ConfirmingEmailAddressCountArgs>(
      args?: Subset<T, ConfirmingEmailAddressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConfirmingEmailAddressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConfirmingEmailAddress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfirmingEmailAddressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConfirmingEmailAddressAggregateArgs>(args: Subset<T, ConfirmingEmailAddressAggregateArgs>): Prisma.PrismaPromise<GetConfirmingEmailAddressAggregateType<T>>

    /**
     * Group by ConfirmingEmailAddress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfirmingEmailAddressGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConfirmingEmailAddressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConfirmingEmailAddressGroupByArgs['orderBy'] }
        : { orderBy?: ConfirmingEmailAddressGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConfirmingEmailAddressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConfirmingEmailAddressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for ConfirmingEmailAddress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__ConfirmingEmailAddressClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs= {}>(args?: Subset<T, UserArgs>): Prisma__UserClient<UserGetPayload<T> | Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * ConfirmingEmailAddress base type for findUnique actions
   */
  export type ConfirmingEmailAddressFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * Filter, which ConfirmingEmailAddress to fetch.
     */
    where: ConfirmingEmailAddressWhereUniqueInput
  }

  /**
   * ConfirmingEmailAddress findUnique
   */
  export interface ConfirmingEmailAddressFindUniqueArgs extends ConfirmingEmailAddressFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * ConfirmingEmailAddress findUniqueOrThrow
   */
  export type ConfirmingEmailAddressFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * Filter, which ConfirmingEmailAddress to fetch.
     */
    where: ConfirmingEmailAddressWhereUniqueInput
  }


  /**
   * ConfirmingEmailAddress base type for findFirst actions
   */
  export type ConfirmingEmailAddressFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * Filter, which ConfirmingEmailAddress to fetch.
     */
    where?: ConfirmingEmailAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfirmingEmailAddresses to fetch.
     */
    orderBy?: Enumerable<ConfirmingEmailAddressOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConfirmingEmailAddresses.
     */
    cursor?: ConfirmingEmailAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfirmingEmailAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfirmingEmailAddresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConfirmingEmailAddresses.
     */
    distinct?: Enumerable<ConfirmingEmailAddressScalarFieldEnum>
  }

  /**
   * ConfirmingEmailAddress findFirst
   */
  export interface ConfirmingEmailAddressFindFirstArgs extends ConfirmingEmailAddressFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * ConfirmingEmailAddress findFirstOrThrow
   */
  export type ConfirmingEmailAddressFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * Filter, which ConfirmingEmailAddress to fetch.
     */
    where?: ConfirmingEmailAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfirmingEmailAddresses to fetch.
     */
    orderBy?: Enumerable<ConfirmingEmailAddressOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConfirmingEmailAddresses.
     */
    cursor?: ConfirmingEmailAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfirmingEmailAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfirmingEmailAddresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConfirmingEmailAddresses.
     */
    distinct?: Enumerable<ConfirmingEmailAddressScalarFieldEnum>
  }


  /**
   * ConfirmingEmailAddress findMany
   */
  export type ConfirmingEmailAddressFindManyArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * Filter, which ConfirmingEmailAddresses to fetch.
     */
    where?: ConfirmingEmailAddressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfirmingEmailAddresses to fetch.
     */
    orderBy?: Enumerable<ConfirmingEmailAddressOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConfirmingEmailAddresses.
     */
    cursor?: ConfirmingEmailAddressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfirmingEmailAddresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfirmingEmailAddresses.
     */
    skip?: number
    distinct?: Enumerable<ConfirmingEmailAddressScalarFieldEnum>
  }


  /**
   * ConfirmingEmailAddress create
   */
  export type ConfirmingEmailAddressCreateArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * The data needed to create a ConfirmingEmailAddress.
     */
    data: XOR<ConfirmingEmailAddressCreateInput, ConfirmingEmailAddressUncheckedCreateInput>
  }


  /**
   * ConfirmingEmailAddress createMany
   */
  export type ConfirmingEmailAddressCreateManyArgs = {
    /**
     * The data used to create many ConfirmingEmailAddresses.
     */
    data: Enumerable<ConfirmingEmailAddressCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * ConfirmingEmailAddress update
   */
  export type ConfirmingEmailAddressUpdateArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * The data needed to update a ConfirmingEmailAddress.
     */
    data: XOR<ConfirmingEmailAddressUpdateInput, ConfirmingEmailAddressUncheckedUpdateInput>
    /**
     * Choose, which ConfirmingEmailAddress to update.
     */
    where: ConfirmingEmailAddressWhereUniqueInput
  }


  /**
   * ConfirmingEmailAddress updateMany
   */
  export type ConfirmingEmailAddressUpdateManyArgs = {
    /**
     * The data used to update ConfirmingEmailAddresses.
     */
    data: XOR<ConfirmingEmailAddressUpdateManyMutationInput, ConfirmingEmailAddressUncheckedUpdateManyInput>
    /**
     * Filter which ConfirmingEmailAddresses to update
     */
    where?: ConfirmingEmailAddressWhereInput
  }


  /**
   * ConfirmingEmailAddress upsert
   */
  export type ConfirmingEmailAddressUpsertArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * The filter to search for the ConfirmingEmailAddress to update in case it exists.
     */
    where: ConfirmingEmailAddressWhereUniqueInput
    /**
     * In case the ConfirmingEmailAddress found by the `where` argument doesn't exist, create a new ConfirmingEmailAddress with this data.
     */
    create: XOR<ConfirmingEmailAddressCreateInput, ConfirmingEmailAddressUncheckedCreateInput>
    /**
     * In case the ConfirmingEmailAddress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConfirmingEmailAddressUpdateInput, ConfirmingEmailAddressUncheckedUpdateInput>
  }


  /**
   * ConfirmingEmailAddress delete
   */
  export type ConfirmingEmailAddressDeleteArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
    /**
     * Filter which ConfirmingEmailAddress to delete.
     */
    where: ConfirmingEmailAddressWhereUniqueInput
  }


  /**
   * ConfirmingEmailAddress deleteMany
   */
  export type ConfirmingEmailAddressDeleteManyArgs = {
    /**
     * Filter which ConfirmingEmailAddresses to delete
     */
    where?: ConfirmingEmailAddressWhereInput
  }


  /**
   * ConfirmingEmailAddress without action
   */
  export type ConfirmingEmailAddressArgs = {
    /**
     * Select specific fields to fetch from the ConfirmingEmailAddress
     */
    select?: ConfirmingEmailAddressSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ConfirmingEmailAddressInclude | null
  }



  /**
   * Model Sessions
   */


  export type AggregateSessions = {
    _count: SessionsCountAggregateOutputType | null
    _min: SessionsMinAggregateOutputType | null
    _max: SessionsMaxAggregateOutputType | null
  }

  export type SessionsMinAggregateOutputType = {
    id: string | null
    session_key: string | null
    data: string | null
    user_id: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SessionsMaxAggregateOutputType = {
    id: string | null
    session_key: string | null
    data: string | null
    user_id: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SessionsCountAggregateOutputType = {
    id: number
    session_key: number
    data: number
    user_id: number
    expired_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type SessionsMinAggregateInputType = {
    id?: true
    session_key?: true
    data?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type SessionsMaxAggregateInputType = {
    id?: true
    session_key?: true
    data?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type SessionsCountAggregateInputType = {
    id?: true
    session_key?: true
    data?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type SessionsAggregateArgs = {
    /**
     * Filter which Sessions to aggregate.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionsMaxAggregateInputType
  }

  export type GetSessionsAggregateType<T extends SessionsAggregateArgs> = {
        [P in keyof T & keyof AggregateSessions]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSessions[P]>
      : GetScalarType<T[P], AggregateSessions[P]>
  }




  export type SessionsGroupByArgs = {
    where?: SessionsWhereInput
    orderBy?: Enumerable<SessionsOrderByWithAggregationInput>
    by: SessionsScalarFieldEnum[]
    having?: SessionsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionsCountAggregateInputType | true
    _min?: SessionsMinAggregateInputType
    _max?: SessionsMaxAggregateInputType
  }


  export type SessionsGroupByOutputType = {
    id: string
    session_key: string
    data: string
    user_id: string | null
    expired_at: Date
    created_at: Date
    updated_at: Date
    _count: SessionsCountAggregateOutputType | null
    _min: SessionsMinAggregateOutputType | null
    _max: SessionsMaxAggregateOutputType | null
  }

  type GetSessionsGroupByPayload<T extends SessionsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<SessionsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionsGroupByOutputType[P]>
            : GetScalarType<T[P], SessionsGroupByOutputType[P]>
        }
      >
    >


  export type SessionsSelect = {
    id?: boolean
    session_key?: boolean
    data?: boolean
    user_id?: boolean
    expired_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserArgs
  }


  export type SessionsInclude = {
    user?: boolean | UserArgs
  }

  export type SessionsGetPayload<S extends boolean | null | undefined | SessionsArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Sessions :
    S extends undefined ? never :
    S extends { include: any } & (SessionsArgs | SessionsFindManyArgs)
    ? Sessions  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'user' ? UserGetPayload<S['include'][P]> | null :  never
  } 
    : S extends { select: any } & (SessionsArgs | SessionsFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'user' ? UserGetPayload<S['select'][P]> | null :  P extends keyof Sessions ? Sessions[P] : never
  } 
      : Sessions


  type SessionsCountArgs = 
    Omit<SessionsFindManyArgs, 'select' | 'include'> & {
      select?: SessionsCountAggregateInputType | true
    }

  export interface SessionsDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one Sessions that matches the filter.
     * @param {SessionsFindUniqueArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends SessionsFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, SessionsFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Sessions'> extends True ? Prisma__SessionsClient<SessionsGetPayload<T>> : Prisma__SessionsClient<SessionsGetPayload<T> | null, null>

    /**
     * Find one Sessions that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {SessionsFindUniqueOrThrowArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends SessionsFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, SessionsFindUniqueOrThrowArgs>
    ): Prisma__SessionsClient<SessionsGetPayload<T>>

    /**
     * Find the first Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsFindFirstArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends SessionsFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, SessionsFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Sessions'> extends True ? Prisma__SessionsClient<SessionsGetPayload<T>> : Prisma__SessionsClient<SessionsGetPayload<T> | null, null>

    /**
     * Find the first Sessions that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsFindFirstOrThrowArgs} args - Arguments to find a Sessions
     * @example
     * // Get one Sessions
     * const sessions = await prisma.sessions.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends SessionsFindFirstOrThrowArgs>(
      args?: SelectSubset<T, SessionsFindFirstOrThrowArgs>
    ): Prisma__SessionsClient<SessionsGetPayload<T>>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.sessions.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.sessions.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionsWithIdOnly = await prisma.sessions.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends SessionsFindManyArgs>(
      args?: SelectSubset<T, SessionsFindManyArgs>
    ): Prisma.PrismaPromise<Array<SessionsGetPayload<T>>>

    /**
     * Create a Sessions.
     * @param {SessionsCreateArgs} args - Arguments to create a Sessions.
     * @example
     * // Create one Sessions
     * const Sessions = await prisma.sessions.create({
     *   data: {
     *     // ... data to create a Sessions
     *   }
     * })
     * 
    **/
    create<T extends SessionsCreateArgs>(
      args: SelectSubset<T, SessionsCreateArgs>
    ): Prisma__SessionsClient<SessionsGetPayload<T>>

    /**
     * Create many Sessions.
     *     @param {SessionsCreateManyArgs} args - Arguments to create many Sessions.
     *     @example
     *     // Create many Sessions
     *     const sessions = await prisma.sessions.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends SessionsCreateManyArgs>(
      args?: SelectSubset<T, SessionsCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Sessions.
     * @param {SessionsDeleteArgs} args - Arguments to delete one Sessions.
     * @example
     * // Delete one Sessions
     * const Sessions = await prisma.sessions.delete({
     *   where: {
     *     // ... filter to delete one Sessions
     *   }
     * })
     * 
    **/
    delete<T extends SessionsDeleteArgs>(
      args: SelectSubset<T, SessionsDeleteArgs>
    ): Prisma__SessionsClient<SessionsGetPayload<T>>

    /**
     * Update one Sessions.
     * @param {SessionsUpdateArgs} args - Arguments to update one Sessions.
     * @example
     * // Update one Sessions
     * const sessions = await prisma.sessions.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends SessionsUpdateArgs>(
      args: SelectSubset<T, SessionsUpdateArgs>
    ): Prisma__SessionsClient<SessionsGetPayload<T>>

    /**
     * Delete zero or more Sessions.
     * @param {SessionsDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.sessions.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends SessionsDeleteManyArgs>(
      args?: SelectSubset<T, SessionsDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const sessions = await prisma.sessions.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends SessionsUpdateManyArgs>(
      args: SelectSubset<T, SessionsUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Sessions.
     * @param {SessionsUpsertArgs} args - Arguments to update or create a Sessions.
     * @example
     * // Update or create a Sessions
     * const sessions = await prisma.sessions.upsert({
     *   create: {
     *     // ... data to create a Sessions
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sessions we want to update
     *   }
     * })
    **/
    upsert<T extends SessionsUpsertArgs>(
      args: SelectSubset<T, SessionsUpsertArgs>
    ): Prisma__SessionsClient<SessionsGetPayload<T>>

    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.sessions.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionsCountArgs>(
      args?: Subset<T, SessionsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionsAggregateArgs>(args: Subset<T, SessionsAggregateArgs>): Prisma.PrismaPromise<GetSessionsAggregateType<T>>

    /**
     * Group by Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionsGroupByArgs['orderBy'] }
        : { orderBy?: SessionsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Sessions.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__SessionsClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs= {}>(args?: Subset<T, UserArgs>): Prisma__UserClient<UserGetPayload<T> | Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Sessions base type for findUnique actions
   */
  export type SessionsFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * Filter, which Sessions to fetch.
     */
    where: SessionsWhereUniqueInput
  }

  /**
   * Sessions findUnique
   */
  export interface SessionsFindUniqueArgs extends SessionsFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Sessions findUniqueOrThrow
   */
  export type SessionsFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * Filter, which Sessions to fetch.
     */
    where: SessionsWhereUniqueInput
  }


  /**
   * Sessions base type for findFirst actions
   */
  export type SessionsFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: Enumerable<SessionsScalarFieldEnum>
  }

  /**
   * Sessions findFirst
   */
  export interface SessionsFindFirstArgs extends SessionsFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Sessions findFirstOrThrow
   */
  export type SessionsFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: Enumerable<SessionsScalarFieldEnum>
  }


  /**
   * Sessions findMany
   */
  export type SessionsFindManyArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: Enumerable<SessionsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: Enumerable<SessionsScalarFieldEnum>
  }


  /**
   * Sessions create
   */
  export type SessionsCreateArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * The data needed to create a Sessions.
     */
    data: XOR<SessionsCreateInput, SessionsUncheckedCreateInput>
  }


  /**
   * Sessions createMany
   */
  export type SessionsCreateManyArgs = {
    /**
     * The data used to create many Sessions.
     */
    data: Enumerable<SessionsCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Sessions update
   */
  export type SessionsUpdateArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * The data needed to update a Sessions.
     */
    data: XOR<SessionsUpdateInput, SessionsUncheckedUpdateInput>
    /**
     * Choose, which Sessions to update.
     */
    where: SessionsWhereUniqueInput
  }


  /**
   * Sessions updateMany
   */
  export type SessionsUpdateManyArgs = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionsUpdateManyMutationInput, SessionsUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionsWhereInput
  }


  /**
   * Sessions upsert
   */
  export type SessionsUpsertArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * The filter to search for the Sessions to update in case it exists.
     */
    where: SessionsWhereUniqueInput
    /**
     * In case the Sessions found by the `where` argument doesn't exist, create a new Sessions with this data.
     */
    create: XOR<SessionsCreateInput, SessionsUncheckedCreateInput>
    /**
     * In case the Sessions was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionsUpdateInput, SessionsUncheckedUpdateInput>
  }


  /**
   * Sessions delete
   */
  export type SessionsDeleteArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
    /**
     * Filter which Sessions to delete.
     */
    where: SessionsWhereUniqueInput
  }


  /**
   * Sessions deleteMany
   */
  export type SessionsDeleteManyArgs = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionsWhereInput
  }


  /**
   * Sessions without action
   */
  export type SessionsArgs = {
    /**
     * Select specific fields to fetch from the Sessions
     */
    select?: SessionsSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: SessionsInclude | null
  }



  /**
   * Model Hooks
   */


  export type AggregateHooks = {
    _count: HooksCountAggregateOutputType | null
    _min: HooksMinAggregateOutputType | null
    _max: HooksMaxAggregateOutputType | null
  }

  export type HooksMinAggregateOutputType = {
    id: string | null
    name: string | null
    data: string | null
    user_id: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type HooksMaxAggregateOutputType = {
    id: string | null
    name: string | null
    data: string | null
    user_id: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type HooksCountAggregateOutputType = {
    id: number
    name: number
    data: number
    user_id: number
    expired_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type HooksMinAggregateInputType = {
    id?: true
    name?: true
    data?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type HooksMaxAggregateInputType = {
    id?: true
    name?: true
    data?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type HooksCountAggregateInputType = {
    id?: true
    name?: true
    data?: true
    user_id?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type HooksAggregateArgs = {
    /**
     * Filter which Hooks to aggregate.
     */
    where?: HooksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hooks to fetch.
     */
    orderBy?: Enumerable<HooksOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HooksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Hooks
    **/
    _count?: true | HooksCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HooksMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HooksMaxAggregateInputType
  }

  export type GetHooksAggregateType<T extends HooksAggregateArgs> = {
        [P in keyof T & keyof AggregateHooks]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHooks[P]>
      : GetScalarType<T[P], AggregateHooks[P]>
  }




  export type HooksGroupByArgs = {
    where?: HooksWhereInput
    orderBy?: Enumerable<HooksOrderByWithAggregationInput>
    by: HooksScalarFieldEnum[]
    having?: HooksScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HooksCountAggregateInputType | true
    _min?: HooksMinAggregateInputType
    _max?: HooksMaxAggregateInputType
  }


  export type HooksGroupByOutputType = {
    id: string
    name: string
    data: string
    user_id: string
    expired_at: Date | null
    created_at: Date
    updated_at: Date
    _count: HooksCountAggregateOutputType | null
    _min: HooksMinAggregateOutputType | null
    _max: HooksMaxAggregateOutputType | null
  }

  type GetHooksGroupByPayload<T extends HooksGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<HooksGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HooksGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HooksGroupByOutputType[P]>
            : GetScalarType<T[P], HooksGroupByOutputType[P]>
        }
      >
    >


  export type HooksSelect = {
    id?: boolean
    name?: boolean
    data?: boolean
    user_id?: boolean
    expired_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserArgs
  }


  export type HooksInclude = {
    user?: boolean | UserArgs
  }

  export type HooksGetPayload<S extends boolean | null | undefined | HooksArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Hooks :
    S extends undefined ? never :
    S extends { include: any } & (HooksArgs | HooksFindManyArgs)
    ? Hooks  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'user' ? UserGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (HooksArgs | HooksFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'user' ? UserGetPayload<S['select'][P]> :  P extends keyof Hooks ? Hooks[P] : never
  } 
      : Hooks


  type HooksCountArgs = 
    Omit<HooksFindManyArgs, 'select' | 'include'> & {
      select?: HooksCountAggregateInputType | true
    }

  export interface HooksDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one Hooks that matches the filter.
     * @param {HooksFindUniqueArgs} args - Arguments to find a Hooks
     * @example
     * // Get one Hooks
     * const hooks = await prisma.hooks.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends HooksFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, HooksFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Hooks'> extends True ? Prisma__HooksClient<HooksGetPayload<T>> : Prisma__HooksClient<HooksGetPayload<T> | null, null>

    /**
     * Find one Hooks that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {HooksFindUniqueOrThrowArgs} args - Arguments to find a Hooks
     * @example
     * // Get one Hooks
     * const hooks = await prisma.hooks.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends HooksFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, HooksFindUniqueOrThrowArgs>
    ): Prisma__HooksClient<HooksGetPayload<T>>

    /**
     * Find the first Hooks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HooksFindFirstArgs} args - Arguments to find a Hooks
     * @example
     * // Get one Hooks
     * const hooks = await prisma.hooks.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends HooksFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, HooksFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Hooks'> extends True ? Prisma__HooksClient<HooksGetPayload<T>> : Prisma__HooksClient<HooksGetPayload<T> | null, null>

    /**
     * Find the first Hooks that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HooksFindFirstOrThrowArgs} args - Arguments to find a Hooks
     * @example
     * // Get one Hooks
     * const hooks = await prisma.hooks.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends HooksFindFirstOrThrowArgs>(
      args?: SelectSubset<T, HooksFindFirstOrThrowArgs>
    ): Prisma__HooksClient<HooksGetPayload<T>>

    /**
     * Find zero or more Hooks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HooksFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Hooks
     * const hooks = await prisma.hooks.findMany()
     * 
     * // Get first 10 Hooks
     * const hooks = await prisma.hooks.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const hooksWithIdOnly = await prisma.hooks.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends HooksFindManyArgs>(
      args?: SelectSubset<T, HooksFindManyArgs>
    ): Prisma.PrismaPromise<Array<HooksGetPayload<T>>>

    /**
     * Create a Hooks.
     * @param {HooksCreateArgs} args - Arguments to create a Hooks.
     * @example
     * // Create one Hooks
     * const Hooks = await prisma.hooks.create({
     *   data: {
     *     // ... data to create a Hooks
     *   }
     * })
     * 
    **/
    create<T extends HooksCreateArgs>(
      args: SelectSubset<T, HooksCreateArgs>
    ): Prisma__HooksClient<HooksGetPayload<T>>

    /**
     * Create many Hooks.
     *     @param {HooksCreateManyArgs} args - Arguments to create many Hooks.
     *     @example
     *     // Create many Hooks
     *     const hooks = await prisma.hooks.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends HooksCreateManyArgs>(
      args?: SelectSubset<T, HooksCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Hooks.
     * @param {HooksDeleteArgs} args - Arguments to delete one Hooks.
     * @example
     * // Delete one Hooks
     * const Hooks = await prisma.hooks.delete({
     *   where: {
     *     // ... filter to delete one Hooks
     *   }
     * })
     * 
    **/
    delete<T extends HooksDeleteArgs>(
      args: SelectSubset<T, HooksDeleteArgs>
    ): Prisma__HooksClient<HooksGetPayload<T>>

    /**
     * Update one Hooks.
     * @param {HooksUpdateArgs} args - Arguments to update one Hooks.
     * @example
     * // Update one Hooks
     * const hooks = await prisma.hooks.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends HooksUpdateArgs>(
      args: SelectSubset<T, HooksUpdateArgs>
    ): Prisma__HooksClient<HooksGetPayload<T>>

    /**
     * Delete zero or more Hooks.
     * @param {HooksDeleteManyArgs} args - Arguments to filter Hooks to delete.
     * @example
     * // Delete a few Hooks
     * const { count } = await prisma.hooks.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends HooksDeleteManyArgs>(
      args?: SelectSubset<T, HooksDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Hooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HooksUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Hooks
     * const hooks = await prisma.hooks.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends HooksUpdateManyArgs>(
      args: SelectSubset<T, HooksUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Hooks.
     * @param {HooksUpsertArgs} args - Arguments to update or create a Hooks.
     * @example
     * // Update or create a Hooks
     * const hooks = await prisma.hooks.upsert({
     *   create: {
     *     // ... data to create a Hooks
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Hooks we want to update
     *   }
     * })
    **/
    upsert<T extends HooksUpsertArgs>(
      args: SelectSubset<T, HooksUpsertArgs>
    ): Prisma__HooksClient<HooksGetPayload<T>>

    /**
     * Count the number of Hooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HooksCountArgs} args - Arguments to filter Hooks to count.
     * @example
     * // Count the number of Hooks
     * const count = await prisma.hooks.count({
     *   where: {
     *     // ... the filter for the Hooks we want to count
     *   }
     * })
    **/
    count<T extends HooksCountArgs>(
      args?: Subset<T, HooksCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HooksCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Hooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HooksAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HooksAggregateArgs>(args: Subset<T, HooksAggregateArgs>): Prisma.PrismaPromise<GetHooksAggregateType<T>>

    /**
     * Group by Hooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HooksGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HooksGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HooksGroupByArgs['orderBy'] }
        : { orderBy?: HooksGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HooksGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHooksGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Hooks.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__HooksClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    user<T extends UserArgs= {}>(args?: Subset<T, UserArgs>): Prisma__UserClient<UserGetPayload<T> | Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Hooks base type for findUnique actions
   */
  export type HooksFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * Filter, which Hooks to fetch.
     */
    where: HooksWhereUniqueInput
  }

  /**
   * Hooks findUnique
   */
  export interface HooksFindUniqueArgs extends HooksFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Hooks findUniqueOrThrow
   */
  export type HooksFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * Filter, which Hooks to fetch.
     */
    where: HooksWhereUniqueInput
  }


  /**
   * Hooks base type for findFirst actions
   */
  export type HooksFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * Filter, which Hooks to fetch.
     */
    where?: HooksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hooks to fetch.
     */
    orderBy?: Enumerable<HooksOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Hooks.
     */
    cursor?: HooksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Hooks.
     */
    distinct?: Enumerable<HooksScalarFieldEnum>
  }

  /**
   * Hooks findFirst
   */
  export interface HooksFindFirstArgs extends HooksFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Hooks findFirstOrThrow
   */
  export type HooksFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * Filter, which Hooks to fetch.
     */
    where?: HooksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hooks to fetch.
     */
    orderBy?: Enumerable<HooksOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Hooks.
     */
    cursor?: HooksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hooks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Hooks.
     */
    distinct?: Enumerable<HooksScalarFieldEnum>
  }


  /**
   * Hooks findMany
   */
  export type HooksFindManyArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * Filter, which Hooks to fetch.
     */
    where?: HooksWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Hooks to fetch.
     */
    orderBy?: Enumerable<HooksOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Hooks.
     */
    cursor?: HooksWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Hooks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Hooks.
     */
    skip?: number
    distinct?: Enumerable<HooksScalarFieldEnum>
  }


  /**
   * Hooks create
   */
  export type HooksCreateArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * The data needed to create a Hooks.
     */
    data: XOR<HooksCreateInput, HooksUncheckedCreateInput>
  }


  /**
   * Hooks createMany
   */
  export type HooksCreateManyArgs = {
    /**
     * The data used to create many Hooks.
     */
    data: Enumerable<HooksCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Hooks update
   */
  export type HooksUpdateArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * The data needed to update a Hooks.
     */
    data: XOR<HooksUpdateInput, HooksUncheckedUpdateInput>
    /**
     * Choose, which Hooks to update.
     */
    where: HooksWhereUniqueInput
  }


  /**
   * Hooks updateMany
   */
  export type HooksUpdateManyArgs = {
    /**
     * The data used to update Hooks.
     */
    data: XOR<HooksUpdateManyMutationInput, HooksUncheckedUpdateManyInput>
    /**
     * Filter which Hooks to update
     */
    where?: HooksWhereInput
  }


  /**
   * Hooks upsert
   */
  export type HooksUpsertArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * The filter to search for the Hooks to update in case it exists.
     */
    where: HooksWhereUniqueInput
    /**
     * In case the Hooks found by the `where` argument doesn't exist, create a new Hooks with this data.
     */
    create: XOR<HooksCreateInput, HooksUncheckedCreateInput>
    /**
     * In case the Hooks was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HooksUpdateInput, HooksUncheckedUpdateInput>
  }


  /**
   * Hooks delete
   */
  export type HooksDeleteArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
    /**
     * Filter which Hooks to delete.
     */
    where: HooksWhereUniqueInput
  }


  /**
   * Hooks deleteMany
   */
  export type HooksDeleteManyArgs = {
    /**
     * Filter which Hooks to delete
     */
    where?: HooksWhereInput
  }


  /**
   * Hooks without action
   */
  export type HooksArgs = {
    /**
     * Select specific fields to fetch from the Hooks
     */
    select?: HooksSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: HooksInclude | null
  }



  /**
   * Model Files
   */


  export type AggregateFiles = {
    _count: FilesCountAggregateOutputType | null
    _avg: FilesAvgAggregateOutputType | null
    _sum: FilesSumAggregateOutputType | null
    _min: FilesMinAggregateOutputType | null
    _max: FilesMaxAggregateOutputType | null
  }

  export type FilesAvgAggregateOutputType = {
    size: number | null
  }

  export type FilesSumAggregateOutputType = {
    size: number | null
  }

  export type FilesMinAggregateOutputType = {
    id: string | null
    size: number | null
    created_by: string | null
    created_at: Date | null
    updated_at: Date | null
    encryption_data: string | null
  }

  export type FilesMaxAggregateOutputType = {
    id: string | null
    size: number | null
    created_by: string | null
    created_at: Date | null
    updated_at: Date | null
    encryption_data: string | null
  }

  export type FilesCountAggregateOutputType = {
    id: number
    size: number
    created_by: number
    created_at: number
    updated_at: number
    encryption_data: number
    _all: number
  }


  export type FilesAvgAggregateInputType = {
    size?: true
  }

  export type FilesSumAggregateInputType = {
    size?: true
  }

  export type FilesMinAggregateInputType = {
    id?: true
    size?: true
    created_by?: true
    created_at?: true
    updated_at?: true
    encryption_data?: true
  }

  export type FilesMaxAggregateInputType = {
    id?: true
    size?: true
    created_by?: true
    created_at?: true
    updated_at?: true
    encryption_data?: true
  }

  export type FilesCountAggregateInputType = {
    id?: true
    size?: true
    created_by?: true
    created_at?: true
    updated_at?: true
    encryption_data?: true
    _all?: true
  }

  export type FilesAggregateArgs = {
    /**
     * Filter which Files to aggregate.
     */
    where?: FilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: Enumerable<FilesOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Files
    **/
    _count?: true | FilesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FilesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FilesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FilesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FilesMaxAggregateInputType
  }

  export type GetFilesAggregateType<T extends FilesAggregateArgs> = {
        [P in keyof T & keyof AggregateFiles]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFiles[P]>
      : GetScalarType<T[P], AggregateFiles[P]>
  }




  export type FilesGroupByArgs = {
    where?: FilesWhereInput
    orderBy?: Enumerable<FilesOrderByWithAggregationInput>
    by: FilesScalarFieldEnum[]
    having?: FilesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FilesCountAggregateInputType | true
    _avg?: FilesAvgAggregateInputType
    _sum?: FilesSumAggregateInputType
    _min?: FilesMinAggregateInputType
    _max?: FilesMaxAggregateInputType
  }


  export type FilesGroupByOutputType = {
    id: string
    size: number
    created_by: string
    created_at: Date
    updated_at: Date
    encryption_data: string
    _count: FilesCountAggregateOutputType | null
    _avg: FilesAvgAggregateOutputType | null
    _sum: FilesSumAggregateOutputType | null
    _min: FilesMinAggregateOutputType | null
    _max: FilesMaxAggregateOutputType | null
  }

  type GetFilesGroupByPayload<T extends FilesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<FilesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FilesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FilesGroupByOutputType[P]>
            : GetScalarType<T[P], FilesGroupByOutputType[P]>
        }
      >
    >


  export type FilesSelect = {
    id?: boolean
    size?: boolean
    created_by?: boolean
    created_at?: boolean
    updated_at?: boolean
    encryption_data?: boolean
    createUser?: boolean | UserArgs
  }


  export type FilesInclude = {
    createUser?: boolean | UserArgs
  }

  export type FilesGetPayload<S extends boolean | null | undefined | FilesArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Files :
    S extends undefined ? never :
    S extends { include: any } & (FilesArgs | FilesFindManyArgs)
    ? Files  & {
    [P in TruthyKeys<S['include']>]:
        P extends 'createUser' ? UserGetPayload<S['include'][P]> :  never
  } 
    : S extends { select: any } & (FilesArgs | FilesFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
        P extends 'createUser' ? UserGetPayload<S['select'][P]> :  P extends keyof Files ? Files[P] : never
  } 
      : Files


  type FilesCountArgs = 
    Omit<FilesFindManyArgs, 'select' | 'include'> & {
      select?: FilesCountAggregateInputType | true
    }

  export interface FilesDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one Files that matches the filter.
     * @param {FilesFindUniqueArgs} args - Arguments to find a Files
     * @example
     * // Get one Files
     * const files = await prisma.files.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends FilesFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, FilesFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Files'> extends True ? Prisma__FilesClient<FilesGetPayload<T>> : Prisma__FilesClient<FilesGetPayload<T> | null, null>

    /**
     * Find one Files that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {FilesFindUniqueOrThrowArgs} args - Arguments to find a Files
     * @example
     * // Get one Files
     * const files = await prisma.files.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends FilesFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, FilesFindUniqueOrThrowArgs>
    ): Prisma__FilesClient<FilesGetPayload<T>>

    /**
     * Find the first Files that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilesFindFirstArgs} args - Arguments to find a Files
     * @example
     * // Get one Files
     * const files = await prisma.files.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends FilesFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, FilesFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Files'> extends True ? Prisma__FilesClient<FilesGetPayload<T>> : Prisma__FilesClient<FilesGetPayload<T> | null, null>

    /**
     * Find the first Files that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilesFindFirstOrThrowArgs} args - Arguments to find a Files
     * @example
     * // Get one Files
     * const files = await prisma.files.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends FilesFindFirstOrThrowArgs>(
      args?: SelectSubset<T, FilesFindFirstOrThrowArgs>
    ): Prisma__FilesClient<FilesGetPayload<T>>

    /**
     * Find zero or more Files that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilesFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Files
     * const files = await prisma.files.findMany()
     * 
     * // Get first 10 Files
     * const files = await prisma.files.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const filesWithIdOnly = await prisma.files.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends FilesFindManyArgs>(
      args?: SelectSubset<T, FilesFindManyArgs>
    ): Prisma.PrismaPromise<Array<FilesGetPayload<T>>>

    /**
     * Create a Files.
     * @param {FilesCreateArgs} args - Arguments to create a Files.
     * @example
     * // Create one Files
     * const Files = await prisma.files.create({
     *   data: {
     *     // ... data to create a Files
     *   }
     * })
     * 
    **/
    create<T extends FilesCreateArgs>(
      args: SelectSubset<T, FilesCreateArgs>
    ): Prisma__FilesClient<FilesGetPayload<T>>

    /**
     * Create many Files.
     *     @param {FilesCreateManyArgs} args - Arguments to create many Files.
     *     @example
     *     // Create many Files
     *     const files = await prisma.files.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends FilesCreateManyArgs>(
      args?: SelectSubset<T, FilesCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Files.
     * @param {FilesDeleteArgs} args - Arguments to delete one Files.
     * @example
     * // Delete one Files
     * const Files = await prisma.files.delete({
     *   where: {
     *     // ... filter to delete one Files
     *   }
     * })
     * 
    **/
    delete<T extends FilesDeleteArgs>(
      args: SelectSubset<T, FilesDeleteArgs>
    ): Prisma__FilesClient<FilesGetPayload<T>>

    /**
     * Update one Files.
     * @param {FilesUpdateArgs} args - Arguments to update one Files.
     * @example
     * // Update one Files
     * const files = await prisma.files.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends FilesUpdateArgs>(
      args: SelectSubset<T, FilesUpdateArgs>
    ): Prisma__FilesClient<FilesGetPayload<T>>

    /**
     * Delete zero or more Files.
     * @param {FilesDeleteManyArgs} args - Arguments to filter Files to delete.
     * @example
     * // Delete a few Files
     * const { count } = await prisma.files.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends FilesDeleteManyArgs>(
      args?: SelectSubset<T, FilesDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Files
     * const files = await prisma.files.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends FilesUpdateManyArgs>(
      args: SelectSubset<T, FilesUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Files.
     * @param {FilesUpsertArgs} args - Arguments to update or create a Files.
     * @example
     * // Update or create a Files
     * const files = await prisma.files.upsert({
     *   create: {
     *     // ... data to create a Files
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Files we want to update
     *   }
     * })
    **/
    upsert<T extends FilesUpsertArgs>(
      args: SelectSubset<T, FilesUpsertArgs>
    ): Prisma__FilesClient<FilesGetPayload<T>>

    /**
     * Count the number of Files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilesCountArgs} args - Arguments to filter Files to count.
     * @example
     * // Count the number of Files
     * const count = await prisma.files.count({
     *   where: {
     *     // ... the filter for the Files we want to count
     *   }
     * })
    **/
    count<T extends FilesCountArgs>(
      args?: Subset<T, FilesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FilesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FilesAggregateArgs>(args: Subset<T, FilesAggregateArgs>): Prisma.PrismaPromise<GetFilesAggregateType<T>>

    /**
     * Group by Files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FilesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FilesGroupByArgs['orderBy'] }
        : { orderBy?: FilesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FilesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFilesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Files.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__FilesClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);

    createUser<T extends UserArgs= {}>(args?: Subset<T, UserArgs>): Prisma__UserClient<UserGetPayload<T> | Null>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Files base type for findUnique actions
   */
  export type FilesFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * Filter, which Files to fetch.
     */
    where: FilesWhereUniqueInput
  }

  /**
   * Files findUnique
   */
  export interface FilesFindUniqueArgs extends FilesFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Files findUniqueOrThrow
   */
  export type FilesFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * Filter, which Files to fetch.
     */
    where: FilesWhereUniqueInput
  }


  /**
   * Files base type for findFirst actions
   */
  export type FilesFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * Filter, which Files to fetch.
     */
    where?: FilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: Enumerable<FilesOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Files.
     */
    cursor?: FilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Files.
     */
    distinct?: Enumerable<FilesScalarFieldEnum>
  }

  /**
   * Files findFirst
   */
  export interface FilesFindFirstArgs extends FilesFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Files findFirstOrThrow
   */
  export type FilesFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * Filter, which Files to fetch.
     */
    where?: FilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: Enumerable<FilesOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Files.
     */
    cursor?: FilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Files.
     */
    distinct?: Enumerable<FilesScalarFieldEnum>
  }


  /**
   * Files findMany
   */
  export type FilesFindManyArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * Filter, which Files to fetch.
     */
    where?: FilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: Enumerable<FilesOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Files.
     */
    cursor?: FilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    distinct?: Enumerable<FilesScalarFieldEnum>
  }


  /**
   * Files create
   */
  export type FilesCreateArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * The data needed to create a Files.
     */
    data: XOR<FilesCreateInput, FilesUncheckedCreateInput>
  }


  /**
   * Files createMany
   */
  export type FilesCreateManyArgs = {
    /**
     * The data used to create many Files.
     */
    data: Enumerable<FilesCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Files update
   */
  export type FilesUpdateArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * The data needed to update a Files.
     */
    data: XOR<FilesUpdateInput, FilesUncheckedUpdateInput>
    /**
     * Choose, which Files to update.
     */
    where: FilesWhereUniqueInput
  }


  /**
   * Files updateMany
   */
  export type FilesUpdateManyArgs = {
    /**
     * The data used to update Files.
     */
    data: XOR<FilesUpdateManyMutationInput, FilesUncheckedUpdateManyInput>
    /**
     * Filter which Files to update
     */
    where?: FilesWhereInput
  }


  /**
   * Files upsert
   */
  export type FilesUpsertArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * The filter to search for the Files to update in case it exists.
     */
    where: FilesWhereUniqueInput
    /**
     * In case the Files found by the `where` argument doesn't exist, create a new Files with this data.
     */
    create: XOR<FilesCreateInput, FilesUncheckedCreateInput>
    /**
     * In case the Files was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FilesUpdateInput, FilesUncheckedUpdateInput>
  }


  /**
   * Files delete
   */
  export type FilesDeleteArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
    /**
     * Filter which Files to delete.
     */
    where: FilesWhereUniqueInput
  }


  /**
   * Files deleteMany
   */
  export type FilesDeleteManyArgs = {
    /**
     * Filter which Files to delete
     */
    where?: FilesWhereInput
  }


  /**
   * Files without action
   */
  export type FilesArgs = {
    /**
     * Select specific fields to fetch from the Files
     */
    select?: FilesSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: FilesInclude | null
  }



  /**
   * Model Coupons
   */


  export type AggregateCoupons = {
    _count: CouponsCountAggregateOutputType | null
    _min: CouponsMinAggregateOutputType | null
    _max: CouponsMaxAggregateOutputType | null
  }

  export type CouponsMinAggregateOutputType = {
    id: string | null
    data: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CouponsMaxAggregateOutputType = {
    id: string | null
    data: string | null
    expired_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CouponsCountAggregateOutputType = {
    id: number
    data: number
    expired_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CouponsMinAggregateInputType = {
    id?: true
    data?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type CouponsMaxAggregateInputType = {
    id?: true
    data?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
  }

  export type CouponsCountAggregateInputType = {
    id?: true
    data?: true
    expired_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CouponsAggregateArgs = {
    /**
     * Filter which Coupons to aggregate.
     */
    where?: CouponsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: Enumerable<CouponsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CouponsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Coupons
    **/
    _count?: true | CouponsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CouponsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CouponsMaxAggregateInputType
  }

  export type GetCouponsAggregateType<T extends CouponsAggregateArgs> = {
        [P in keyof T & keyof AggregateCoupons]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoupons[P]>
      : GetScalarType<T[P], AggregateCoupons[P]>
  }




  export type CouponsGroupByArgs = {
    where?: CouponsWhereInput
    orderBy?: Enumerable<CouponsOrderByWithAggregationInput>
    by: CouponsScalarFieldEnum[]
    having?: CouponsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CouponsCountAggregateInputType | true
    _min?: CouponsMinAggregateInputType
    _max?: CouponsMaxAggregateInputType
  }


  export type CouponsGroupByOutputType = {
    id: string
    data: string
    expired_at: Date | null
    created_at: Date
    updated_at: Date
    _count: CouponsCountAggregateOutputType | null
    _min: CouponsMinAggregateOutputType | null
    _max: CouponsMaxAggregateOutputType | null
  }

  type GetCouponsGroupByPayload<T extends CouponsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickArray<CouponsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CouponsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CouponsGroupByOutputType[P]>
            : GetScalarType<T[P], CouponsGroupByOutputType[P]>
        }
      >
    >


  export type CouponsSelect = {
    id?: boolean
    data?: boolean
    expired_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type CouponsGetPayload<S extends boolean | null | undefined | CouponsArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Coupons :
    S extends undefined ? never :
    S extends { include: any } & (CouponsArgs | CouponsFindManyArgs)
    ? Coupons 
    : S extends { select: any } & (CouponsArgs | CouponsFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof Coupons ? Coupons[P] : never
  } 
      : Coupons


  type CouponsCountArgs = 
    Omit<CouponsFindManyArgs, 'select' | 'include'> & {
      select?: CouponsCountAggregateInputType | true
    }

  export interface CouponsDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {

    /**
     * Find zero or one Coupons that matches the filter.
     * @param {CouponsFindUniqueArgs} args - Arguments to find a Coupons
     * @example
     * // Get one Coupons
     * const coupons = await prisma.coupons.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CouponsFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, CouponsFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Coupons'> extends True ? Prisma__CouponsClient<CouponsGetPayload<T>> : Prisma__CouponsClient<CouponsGetPayload<T> | null, null>

    /**
     * Find one Coupons that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {CouponsFindUniqueOrThrowArgs} args - Arguments to find a Coupons
     * @example
     * // Get one Coupons
     * const coupons = await prisma.coupons.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CouponsFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, CouponsFindUniqueOrThrowArgs>
    ): Prisma__CouponsClient<CouponsGetPayload<T>>

    /**
     * Find the first Coupons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponsFindFirstArgs} args - Arguments to find a Coupons
     * @example
     * // Get one Coupons
     * const coupons = await prisma.coupons.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CouponsFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, CouponsFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Coupons'> extends True ? Prisma__CouponsClient<CouponsGetPayload<T>> : Prisma__CouponsClient<CouponsGetPayload<T> | null, null>

    /**
     * Find the first Coupons that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponsFindFirstOrThrowArgs} args - Arguments to find a Coupons
     * @example
     * // Get one Coupons
     * const coupons = await prisma.coupons.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CouponsFindFirstOrThrowArgs>(
      args?: SelectSubset<T, CouponsFindFirstOrThrowArgs>
    ): Prisma__CouponsClient<CouponsGetPayload<T>>

    /**
     * Find zero or more Coupons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponsFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Coupons
     * const coupons = await prisma.coupons.findMany()
     * 
     * // Get first 10 Coupons
     * const coupons = await prisma.coupons.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const couponsWithIdOnly = await prisma.coupons.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends CouponsFindManyArgs>(
      args?: SelectSubset<T, CouponsFindManyArgs>
    ): Prisma.PrismaPromise<Array<CouponsGetPayload<T>>>

    /**
     * Create a Coupons.
     * @param {CouponsCreateArgs} args - Arguments to create a Coupons.
     * @example
     * // Create one Coupons
     * const Coupons = await prisma.coupons.create({
     *   data: {
     *     // ... data to create a Coupons
     *   }
     * })
     * 
    **/
    create<T extends CouponsCreateArgs>(
      args: SelectSubset<T, CouponsCreateArgs>
    ): Prisma__CouponsClient<CouponsGetPayload<T>>

    /**
     * Create many Coupons.
     *     @param {CouponsCreateManyArgs} args - Arguments to create many Coupons.
     *     @example
     *     // Create many Coupons
     *     const coupons = await prisma.coupons.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends CouponsCreateManyArgs>(
      args?: SelectSubset<T, CouponsCreateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Coupons.
     * @param {CouponsDeleteArgs} args - Arguments to delete one Coupons.
     * @example
     * // Delete one Coupons
     * const Coupons = await prisma.coupons.delete({
     *   where: {
     *     // ... filter to delete one Coupons
     *   }
     * })
     * 
    **/
    delete<T extends CouponsDeleteArgs>(
      args: SelectSubset<T, CouponsDeleteArgs>
    ): Prisma__CouponsClient<CouponsGetPayload<T>>

    /**
     * Update one Coupons.
     * @param {CouponsUpdateArgs} args - Arguments to update one Coupons.
     * @example
     * // Update one Coupons
     * const coupons = await prisma.coupons.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CouponsUpdateArgs>(
      args: SelectSubset<T, CouponsUpdateArgs>
    ): Prisma__CouponsClient<CouponsGetPayload<T>>

    /**
     * Delete zero or more Coupons.
     * @param {CouponsDeleteManyArgs} args - Arguments to filter Coupons to delete.
     * @example
     * // Delete a few Coupons
     * const { count } = await prisma.coupons.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CouponsDeleteManyArgs>(
      args?: SelectSubset<T, CouponsDeleteManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coupons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Coupons
     * const coupons = await prisma.coupons.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CouponsUpdateManyArgs>(
      args: SelectSubset<T, CouponsUpdateManyArgs>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Coupons.
     * @param {CouponsUpsertArgs} args - Arguments to update or create a Coupons.
     * @example
     * // Update or create a Coupons
     * const coupons = await prisma.coupons.upsert({
     *   create: {
     *     // ... data to create a Coupons
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Coupons we want to update
     *   }
     * })
    **/
    upsert<T extends CouponsUpsertArgs>(
      args: SelectSubset<T, CouponsUpsertArgs>
    ): Prisma__CouponsClient<CouponsGetPayload<T>>

    /**
     * Count the number of Coupons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponsCountArgs} args - Arguments to filter Coupons to count.
     * @example
     * // Count the number of Coupons
     * const count = await prisma.coupons.count({
     *   where: {
     *     // ... the filter for the Coupons we want to count
     *   }
     * })
    **/
    count<T extends CouponsCountArgs>(
      args?: Subset<T, CouponsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CouponsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Coupons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CouponsAggregateArgs>(args: Subset<T, CouponsAggregateArgs>): Prisma.PrismaPromise<GetCouponsAggregateType<T>>

    /**
     * Group by Coupons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CouponsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CouponsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CouponsGroupByArgs['orderBy'] }
        : { orderBy?: CouponsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CouponsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCouponsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Coupons.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__CouponsClient<T, Null = never> implements Prisma.PrismaPromise<T> {
    private readonly _dmmf;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    constructor(_dmmf: runtime.DMMFClass, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Coupons base type for findUnique actions
   */
  export type CouponsFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * Filter, which Coupons to fetch.
     */
    where: CouponsWhereUniqueInput
  }

  /**
   * Coupons findUnique
   */
  export interface CouponsFindUniqueArgs extends CouponsFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Coupons findUniqueOrThrow
   */
  export type CouponsFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * Filter, which Coupons to fetch.
     */
    where: CouponsWhereUniqueInput
  }


  /**
   * Coupons base type for findFirst actions
   */
  export type CouponsFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * Filter, which Coupons to fetch.
     */
    where?: CouponsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: Enumerable<CouponsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coupons.
     */
    cursor?: CouponsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coupons.
     */
    distinct?: Enumerable<CouponsScalarFieldEnum>
  }

  /**
   * Coupons findFirst
   */
  export interface CouponsFindFirstArgs extends CouponsFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Coupons findFirstOrThrow
   */
  export type CouponsFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * Filter, which Coupons to fetch.
     */
    where?: CouponsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: Enumerable<CouponsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coupons.
     */
    cursor?: CouponsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coupons.
     */
    distinct?: Enumerable<CouponsScalarFieldEnum>
  }


  /**
   * Coupons findMany
   */
  export type CouponsFindManyArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * Filter, which Coupons to fetch.
     */
    where?: CouponsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coupons to fetch.
     */
    orderBy?: Enumerable<CouponsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Coupons.
     */
    cursor?: CouponsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coupons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coupons.
     */
    skip?: number
    distinct?: Enumerable<CouponsScalarFieldEnum>
  }


  /**
   * Coupons create
   */
  export type CouponsCreateArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * The data needed to create a Coupons.
     */
    data: XOR<CouponsCreateInput, CouponsUncheckedCreateInput>
  }


  /**
   * Coupons createMany
   */
  export type CouponsCreateManyArgs = {
    /**
     * The data used to create many Coupons.
     */
    data: Enumerable<CouponsCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Coupons update
   */
  export type CouponsUpdateArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * The data needed to update a Coupons.
     */
    data: XOR<CouponsUpdateInput, CouponsUncheckedUpdateInput>
    /**
     * Choose, which Coupons to update.
     */
    where: CouponsWhereUniqueInput
  }


  /**
   * Coupons updateMany
   */
  export type CouponsUpdateManyArgs = {
    /**
     * The data used to update Coupons.
     */
    data: XOR<CouponsUpdateManyMutationInput, CouponsUncheckedUpdateManyInput>
    /**
     * Filter which Coupons to update
     */
    where?: CouponsWhereInput
  }


  /**
   * Coupons upsert
   */
  export type CouponsUpsertArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * The filter to search for the Coupons to update in case it exists.
     */
    where: CouponsWhereUniqueInput
    /**
     * In case the Coupons found by the `where` argument doesn't exist, create a new Coupons with this data.
     */
    create: XOR<CouponsCreateInput, CouponsUncheckedCreateInput>
    /**
     * In case the Coupons was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CouponsUpdateInput, CouponsUncheckedUpdateInput>
  }


  /**
   * Coupons delete
   */
  export type CouponsDeleteArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
    /**
     * Filter which Coupons to delete.
     */
    where: CouponsWhereUniqueInput
  }


  /**
   * Coupons deleteMany
   */
  export type CouponsDeleteManyArgs = {
    /**
     * Filter which Coupons to delete
     */
    where?: CouponsWhereInput
  }


  /**
   * Coupons without action
   */
  export type CouponsArgs = {
    /**
     * Select specific fields to fetch from the Coupons
     */
    select?: CouponsSelect | null
  }



  /**
   * Enums
   */

  // Based on
  // https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

  export const ConfirmingEmailAddressScalarFieldEnum: {
    id: 'id',
    email: 'email',
    hashedtoken: 'hashedtoken',
    user_id: 'user_id',
    expired_at: 'expired_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ConfirmingEmailAddressScalarFieldEnum = (typeof ConfirmingEmailAddressScalarFieldEnum)[keyof typeof ConfirmingEmailAddressScalarFieldEnum]


  export const CouponsScalarFieldEnum: {
    id: 'id',
    data: 'data',
    expired_at: 'expired_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CouponsScalarFieldEnum = (typeof CouponsScalarFieldEnum)[keyof typeof CouponsScalarFieldEnum]


  export const FilesScalarFieldEnum: {
    id: 'id',
    size: 'size',
    created_by: 'created_by',
    created_at: 'created_at',
    updated_at: 'updated_at',
    encryption_data: 'encryption_data'
  };

  export type FilesScalarFieldEnum = (typeof FilesScalarFieldEnum)[keyof typeof FilesScalarFieldEnum]


  export const HooksScalarFieldEnum: {
    id: 'id',
    name: 'name',
    data: 'data',
    user_id: 'user_id',
    expired_at: 'expired_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type HooksScalarFieldEnum = (typeof HooksScalarFieldEnum)[keyof typeof HooksScalarFieldEnum]


  export const SessionsScalarFieldEnum: {
    id: 'id',
    session_key: 'session_key',
    data: 'data',
    user_id: 'user_id',
    expired_at: 'expired_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type SessionsScalarFieldEnum = (typeof SessionsScalarFieldEnum)[keyof typeof SessionsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const TFASolutionScalarFieldEnum: {
    id: 'id',
    type: 'type',
    value: 'value',
    user_id: 'user_id',
    available: 'available',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type TFASolutionScalarFieldEnum = (typeof TFASolutionScalarFieldEnum)[keyof typeof TFASolutionScalarFieldEnum]


  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    role: 'role',
    max_capacity: 'max_capacity',
    file_usage: 'file_usage',
    client_random_value: 'client_random_value',
    encrypted_master_key: 'encrypted_master_key',
    encrypted_master_key_iv: 'encrypted_master_key_iv',
    encrypted_rsa_private_key: 'encrypted_rsa_private_key',
    encrypted_rsa_private_key_iv: 'encrypted_rsa_private_key_iv',
    hashed_authentication_key: 'hashed_authentication_key',
    rsa_public_key: 'rsa_public_key',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: Enumerable<UserWhereInput>
    OR?: Enumerable<UserWhereInput>
    NOT?: Enumerable<UserWhereInput>
    id?: StringFilter | string
    email?: StringFilter | string
    role?: EnumRoleFilter | Role
    max_capacity?: IntFilter | number
    file_usage?: IntFilter | number
    client_random_value?: StringFilter | string
    encrypted_master_key?: StringFilter | string
    encrypted_master_key_iv?: StringFilter | string
    encrypted_rsa_private_key?: StringFilter | string
    encrypted_rsa_private_key_iv?: StringFilter | string
    hashed_authentication_key?: StringFilter | string
    rsa_public_key?: StringFilter | string
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
    tfa_solutions?: TFASolutionListRelationFilter
    ConfirmingEmailAddress?: ConfirmingEmailAddressListRelationFilter
    Sessions?: SessionsListRelationFilter
    Hooks?: HooksListRelationFilter
    Files?: FilesListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    max_capacity?: SortOrder
    file_usage?: SortOrder
    client_random_value?: SortOrder
    encrypted_master_key?: SortOrder
    encrypted_master_key_iv?: SortOrder
    encrypted_rsa_private_key?: SortOrder
    encrypted_rsa_private_key_iv?: SortOrder
    hashed_authentication_key?: SortOrder
    rsa_public_key?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tfa_solutions?: TFASolutionOrderByRelationAggregateInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressOrderByRelationAggregateInput
    Sessions?: SessionsOrderByRelationAggregateInput
    Hooks?: HooksOrderByRelationAggregateInput
    Files?: FilesOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = {
    id?: string
    email?: string
  }

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    max_capacity?: SortOrder
    file_usage?: SortOrder
    client_random_value?: SortOrder
    encrypted_master_key?: SortOrder
    encrypted_master_key_iv?: SortOrder
    encrypted_rsa_private_key?: SortOrder
    encrypted_rsa_private_key_iv?: SortOrder
    hashed_authentication_key?: SortOrder
    rsa_public_key?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: Enumerable<UserScalarWhereWithAggregatesInput>
    OR?: Enumerable<UserScalarWhereWithAggregatesInput>
    NOT?: Enumerable<UserScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    email?: StringWithAggregatesFilter | string
    role?: EnumRoleWithAggregatesFilter | Role
    max_capacity?: IntWithAggregatesFilter | number
    file_usage?: IntWithAggregatesFilter | number
    client_random_value?: StringWithAggregatesFilter | string
    encrypted_master_key?: StringWithAggregatesFilter | string
    encrypted_master_key_iv?: StringWithAggregatesFilter | string
    encrypted_rsa_private_key?: StringWithAggregatesFilter | string
    encrypted_rsa_private_key_iv?: StringWithAggregatesFilter | string
    hashed_authentication_key?: StringWithAggregatesFilter | string
    rsa_public_key?: StringWithAggregatesFilter | string
    created_at?: DateTimeWithAggregatesFilter | Date | string
    updated_at?: DateTimeWithAggregatesFilter | Date | string
  }

  export type TFASolutionWhereInput = {
    AND?: Enumerable<TFASolutionWhereInput>
    OR?: Enumerable<TFASolutionWhereInput>
    NOT?: Enumerable<TFASolutionWhereInput>
    id?: StringFilter | string
    type?: EnumSolutionTypeFilter | SolutionType
    value?: StringFilter | string
    user_id?: StringFilter | string
    available?: BoolFilter | boolean
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type TFASolutionOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    user_id?: SortOrder
    available?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type TFASolutionWhereUniqueInput = {
    id?: string
  }

  export type TFASolutionOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    user_id?: SortOrder
    available?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: TFASolutionCountOrderByAggregateInput
    _max?: TFASolutionMaxOrderByAggregateInput
    _min?: TFASolutionMinOrderByAggregateInput
  }

  export type TFASolutionScalarWhereWithAggregatesInput = {
    AND?: Enumerable<TFASolutionScalarWhereWithAggregatesInput>
    OR?: Enumerable<TFASolutionScalarWhereWithAggregatesInput>
    NOT?: Enumerable<TFASolutionScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    type?: EnumSolutionTypeWithAggregatesFilter | SolutionType
    value?: StringWithAggregatesFilter | string
    user_id?: StringWithAggregatesFilter | string
    available?: BoolWithAggregatesFilter | boolean
    created_at?: DateTimeWithAggregatesFilter | Date | string
    updated_at?: DateTimeWithAggregatesFilter | Date | string
  }

  export type ConfirmingEmailAddressWhereInput = {
    AND?: Enumerable<ConfirmingEmailAddressWhereInput>
    OR?: Enumerable<ConfirmingEmailAddressWhereInput>
    NOT?: Enumerable<ConfirmingEmailAddressWhereInput>
    id?: StringFilter | string
    email?: StringFilter | string
    hashedtoken?: StringFilter | string
    user_id?: StringNullableFilter | string | null
    expired_at?: DateTimeFilter | Date | string
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput> | null
  }

  export type ConfirmingEmailAddressOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    hashedtoken?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ConfirmingEmailAddressWhereUniqueInput = {
    id?: string
  }

  export type ConfirmingEmailAddressOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    hashedtoken?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ConfirmingEmailAddressCountOrderByAggregateInput
    _max?: ConfirmingEmailAddressMaxOrderByAggregateInput
    _min?: ConfirmingEmailAddressMinOrderByAggregateInput
  }

  export type ConfirmingEmailAddressScalarWhereWithAggregatesInput = {
    AND?: Enumerable<ConfirmingEmailAddressScalarWhereWithAggregatesInput>
    OR?: Enumerable<ConfirmingEmailAddressScalarWhereWithAggregatesInput>
    NOT?: Enumerable<ConfirmingEmailAddressScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    email?: StringWithAggregatesFilter | string
    hashedtoken?: StringWithAggregatesFilter | string
    user_id?: StringNullableWithAggregatesFilter | string | null
    expired_at?: DateTimeWithAggregatesFilter | Date | string
    created_at?: DateTimeWithAggregatesFilter | Date | string
    updated_at?: DateTimeWithAggregatesFilter | Date | string
  }

  export type SessionsWhereInput = {
    AND?: Enumerable<SessionsWhereInput>
    OR?: Enumerable<SessionsWhereInput>
    NOT?: Enumerable<SessionsWhereInput>
    id?: StringFilter | string
    session_key?: StringFilter | string
    data?: StringFilter | string
    user_id?: StringNullableFilter | string | null
    expired_at?: DateTimeFilter | Date | string
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput> | null
  }

  export type SessionsOrderByWithRelationInput = {
    id?: SortOrder
    session_key?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionsWhereUniqueInput = {
    id?: string
    session_key?: string
  }

  export type SessionsOrderByWithAggregationInput = {
    id?: SortOrder
    session_key?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: SessionsCountOrderByAggregateInput
    _max?: SessionsMaxOrderByAggregateInput
    _min?: SessionsMinOrderByAggregateInput
  }

  export type SessionsScalarWhereWithAggregatesInput = {
    AND?: Enumerable<SessionsScalarWhereWithAggregatesInput>
    OR?: Enumerable<SessionsScalarWhereWithAggregatesInput>
    NOT?: Enumerable<SessionsScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    session_key?: StringWithAggregatesFilter | string
    data?: StringWithAggregatesFilter | string
    user_id?: StringNullableWithAggregatesFilter | string | null
    expired_at?: DateTimeWithAggregatesFilter | Date | string
    created_at?: DateTimeWithAggregatesFilter | Date | string
    updated_at?: DateTimeWithAggregatesFilter | Date | string
  }

  export type HooksWhereInput = {
    AND?: Enumerable<HooksWhereInput>
    OR?: Enumerable<HooksWhereInput>
    NOT?: Enumerable<HooksWhereInput>
    id?: StringFilter | string
    name?: StringFilter | string
    data?: StringFilter | string
    user_id?: StringFilter | string
    expired_at?: DateTimeNullableFilter | Date | string | null
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type HooksOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type HooksWhereUniqueInput = {
    id?: string
  }

  export type HooksOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: HooksCountOrderByAggregateInput
    _max?: HooksMaxOrderByAggregateInput
    _min?: HooksMinOrderByAggregateInput
  }

  export type HooksScalarWhereWithAggregatesInput = {
    AND?: Enumerable<HooksScalarWhereWithAggregatesInput>
    OR?: Enumerable<HooksScalarWhereWithAggregatesInput>
    NOT?: Enumerable<HooksScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    name?: StringWithAggregatesFilter | string
    data?: StringWithAggregatesFilter | string
    user_id?: StringWithAggregatesFilter | string
    expired_at?: DateTimeNullableWithAggregatesFilter | Date | string | null
    created_at?: DateTimeWithAggregatesFilter | Date | string
    updated_at?: DateTimeWithAggregatesFilter | Date | string
  }

  export type FilesWhereInput = {
    AND?: Enumerable<FilesWhereInput>
    OR?: Enumerable<FilesWhereInput>
    NOT?: Enumerable<FilesWhereInput>
    id?: StringFilter | string
    size?: IntFilter | number
    created_by?: StringFilter | string
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
    encryption_data?: StringFilter | string
    createUser?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type FilesOrderByWithRelationInput = {
    id?: SortOrder
    size?: SortOrder
    created_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    encryption_data?: SortOrder
    createUser?: UserOrderByWithRelationInput
  }

  export type FilesWhereUniqueInput = {
    id?: string
  }

  export type FilesOrderByWithAggregationInput = {
    id?: SortOrder
    size?: SortOrder
    created_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    encryption_data?: SortOrder
    _count?: FilesCountOrderByAggregateInput
    _avg?: FilesAvgOrderByAggregateInput
    _max?: FilesMaxOrderByAggregateInput
    _min?: FilesMinOrderByAggregateInput
    _sum?: FilesSumOrderByAggregateInput
  }

  export type FilesScalarWhereWithAggregatesInput = {
    AND?: Enumerable<FilesScalarWhereWithAggregatesInput>
    OR?: Enumerable<FilesScalarWhereWithAggregatesInput>
    NOT?: Enumerable<FilesScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    size?: IntWithAggregatesFilter | number
    created_by?: StringWithAggregatesFilter | string
    created_at?: DateTimeWithAggregatesFilter | Date | string
    updated_at?: DateTimeWithAggregatesFilter | Date | string
    encryption_data?: StringWithAggregatesFilter | string
  }

  export type CouponsWhereInput = {
    AND?: Enumerable<CouponsWhereInput>
    OR?: Enumerable<CouponsWhereInput>
    NOT?: Enumerable<CouponsWhereInput>
    id?: StringFilter | string
    data?: StringFilter | string
    expired_at?: DateTimeNullableFilter | Date | string | null
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
  }

  export type CouponsOrderByWithRelationInput = {
    id?: SortOrder
    data?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CouponsWhereUniqueInput = {
    id?: string
  }

  export type CouponsOrderByWithAggregationInput = {
    id?: SortOrder
    data?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: CouponsCountOrderByAggregateInput
    _max?: CouponsMaxOrderByAggregateInput
    _min?: CouponsMinOrderByAggregateInput
  }

  export type CouponsScalarWhereWithAggregatesInput = {
    AND?: Enumerable<CouponsScalarWhereWithAggregatesInput>
    OR?: Enumerable<CouponsScalarWhereWithAggregatesInput>
    NOT?: Enumerable<CouponsScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    data?: StringWithAggregatesFilter | string
    expired_at?: DateTimeNullableWithAggregatesFilter | Date | string | null
    created_at?: DateTimeWithAggregatesFilter | Date | string
    updated_at?: DateTimeWithAggregatesFilter | Date | string
  }

  export type UserCreateInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressCreateNestedManyWithoutUserInput
    Sessions?: SessionsCreateNestedManyWithoutUserInput
    Hooks?: HooksCreateNestedManyWithoutUserInput
    Files?: FilesCreateNestedManyWithoutCreateUserInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionUncheckedCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedCreateNestedManyWithoutUserInput
    Sessions?: SessionsUncheckedCreateNestedManyWithoutUserInput
    Hooks?: HooksUncheckedCreateNestedManyWithoutUserInput
    Files?: FilesUncheckedCreateNestedManyWithoutCreateUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUpdateManyWithoutUserNestedInput
    Hooks?: HooksUpdateManyWithoutUserNestedInput
    Files?: FilesUpdateManyWithoutCreateUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUncheckedUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUncheckedUpdateManyWithoutUserNestedInput
    Hooks?: HooksUncheckedUpdateManyWithoutUserNestedInput
    Files?: FilesUncheckedUpdateManyWithoutCreateUserNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TFASolutionCreateInput = {
    id: string
    type: SolutionType
    value: string
    available?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutTfa_solutionsInput
  }

  export type TFASolutionUncheckedCreateInput = {
    id: string
    type: SolutionType
    value: string
    user_id: string
    available?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TFASolutionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumSolutionTypeFieldUpdateOperationsInput | SolutionType
    value?: StringFieldUpdateOperationsInput | string
    available?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutTfa_solutionsNestedInput
  }

  export type TFASolutionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumSolutionTypeFieldUpdateOperationsInput | SolutionType
    value?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    available?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TFASolutionCreateManyInput = {
    id: string
    type: SolutionType
    value: string
    user_id: string
    available?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TFASolutionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumSolutionTypeFieldUpdateOperationsInput | SolutionType
    value?: StringFieldUpdateOperationsInput | string
    available?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TFASolutionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumSolutionTypeFieldUpdateOperationsInput | SolutionType
    value?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    available?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfirmingEmailAddressCreateInput = {
    id: string
    email: string
    hashedtoken: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
    user?: UserCreateNestedOneWithoutConfirmingEmailAddressInput
  }

  export type ConfirmingEmailAddressUncheckedCreateInput = {
    id: string
    email: string
    hashedtoken: string
    user_id?: string | null
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConfirmingEmailAddressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    hashedtoken?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutConfirmingEmailAddressNestedInput
  }

  export type ConfirmingEmailAddressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    hashedtoken?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfirmingEmailAddressCreateManyInput = {
    id: string
    email: string
    hashedtoken: string
    user_id?: string | null
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConfirmingEmailAddressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    hashedtoken?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfirmingEmailAddressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    hashedtoken?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionsCreateInput = {
    id: string
    session_key: string
    data: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
    user?: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionsUncheckedCreateInput = {
    id: string
    session_key: string
    data: string
    user_id?: string | null
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SessionsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    session_key?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutSessionsNestedInput
  }

  export type SessionsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    session_key?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionsCreateManyInput = {
    id: string
    session_key: string
    data: string
    user_id?: string | null
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SessionsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    session_key?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    session_key?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HooksCreateInput = {
    id: string
    name: string
    data: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutHooksInput
  }

  export type HooksUncheckedCreateInput = {
    id: string
    name: string
    data: string
    user_id: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type HooksUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutHooksNestedInput
  }

  export type HooksUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HooksCreateManyInput = {
    id: string
    name: string
    data: string
    user_id: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type HooksUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HooksUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilesCreateInput = {
    id: string
    size: number
    created_at?: Date | string
    updated_at?: Date | string
    encryption_data: string
    createUser: UserCreateNestedOneWithoutFilesInput
  }

  export type FilesUncheckedCreateInput = {
    id: string
    size: number
    created_by: string
    created_at?: Date | string
    updated_at?: Date | string
    encryption_data: string
  }

  export type FilesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    encryption_data?: StringFieldUpdateOperationsInput | string
    createUser?: UserUpdateOneRequiredWithoutFilesNestedInput
  }

  export type FilesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    created_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    encryption_data?: StringFieldUpdateOperationsInput | string
  }

  export type FilesCreateManyInput = {
    id: string
    size: number
    created_by: string
    created_at?: Date | string
    updated_at?: Date | string
    encryption_data: string
  }

  export type FilesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    encryption_data?: StringFieldUpdateOperationsInput | string
  }

  export type FilesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    created_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    encryption_data?: StringFieldUpdateOperationsInput | string
  }

  export type CouponsCreateInput = {
    id: string
    data: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CouponsUncheckedCreateInput = {
    id: string
    data: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CouponsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponsCreateManyInput = {
    id: string
    data: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CouponsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CouponsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type EnumRoleFilter = {
    equals?: Role
    in?: Enumerable<Role>
    notIn?: Enumerable<Role>
    not?: NestedEnumRoleFilter | Role
  }

  export type IntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type DateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type TFASolutionListRelationFilter = {
    every?: TFASolutionWhereInput
    some?: TFASolutionWhereInput
    none?: TFASolutionWhereInput
  }

  export type ConfirmingEmailAddressListRelationFilter = {
    every?: ConfirmingEmailAddressWhereInput
    some?: ConfirmingEmailAddressWhereInput
    none?: ConfirmingEmailAddressWhereInput
  }

  export type SessionsListRelationFilter = {
    every?: SessionsWhereInput
    some?: SessionsWhereInput
    none?: SessionsWhereInput
  }

  export type HooksListRelationFilter = {
    every?: HooksWhereInput
    some?: HooksWhereInput
    none?: HooksWhereInput
  }

  export type FilesListRelationFilter = {
    every?: FilesWhereInput
    some?: FilesWhereInput
    none?: FilesWhereInput
  }

  export type TFASolutionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConfirmingEmailAddressOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SessionsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HooksOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FilesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    max_capacity?: SortOrder
    file_usage?: SortOrder
    client_random_value?: SortOrder
    encrypted_master_key?: SortOrder
    encrypted_master_key_iv?: SortOrder
    encrypted_rsa_private_key?: SortOrder
    encrypted_rsa_private_key_iv?: SortOrder
    hashed_authentication_key?: SortOrder
    rsa_public_key?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    max_capacity?: SortOrder
    file_usage?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    max_capacity?: SortOrder
    file_usage?: SortOrder
    client_random_value?: SortOrder
    encrypted_master_key?: SortOrder
    encrypted_master_key_iv?: SortOrder
    encrypted_rsa_private_key?: SortOrder
    encrypted_rsa_private_key_iv?: SortOrder
    hashed_authentication_key?: SortOrder
    rsa_public_key?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    role?: SortOrder
    max_capacity?: SortOrder
    file_usage?: SortOrder
    client_random_value?: SortOrder
    encrypted_master_key?: SortOrder
    encrypted_master_key_iv?: SortOrder
    encrypted_rsa_private_key?: SortOrder
    encrypted_rsa_private_key_iv?: SortOrder
    hashed_authentication_key?: SortOrder
    rsa_public_key?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    max_capacity?: SortOrder
    file_usage?: SortOrder
  }

  export type StringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type EnumRoleWithAggregatesFilter = {
    equals?: Role
    in?: Enumerable<Role>
    notIn?: Enumerable<Role>
    not?: NestedEnumRoleWithAggregatesFilter | Role
    _count?: NestedIntFilter
    _min?: NestedEnumRoleFilter
    _max?: NestedEnumRoleFilter
  }

  export type IntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type DateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type EnumSolutionTypeFilter = {
    equals?: SolutionType
    in?: Enumerable<SolutionType>
    notIn?: Enumerable<SolutionType>
    not?: NestedEnumSolutionTypeFilter | SolutionType
  }

  export type BoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type UserRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type TFASolutionCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    user_id?: SortOrder
    available?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TFASolutionMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    user_id?: SortOrder
    available?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TFASolutionMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    value?: SortOrder
    user_id?: SortOrder
    available?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EnumSolutionTypeWithAggregatesFilter = {
    equals?: SolutionType
    in?: Enumerable<SolutionType>
    notIn?: Enumerable<SolutionType>
    not?: NestedEnumSolutionTypeWithAggregatesFilter | SolutionType
    _count?: NestedIntFilter
    _min?: NestedEnumSolutionTypeFilter
    _max?: NestedEnumSolutionTypeFilter
  }

  export type BoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type StringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableFilter | string | null
  }

  export type ConfirmingEmailAddressCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    hashedtoken?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConfirmingEmailAddressMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    hashedtoken?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConfirmingEmailAddressMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    hashedtoken?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type StringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type SessionsCountOrderByAggregateInput = {
    id?: SortOrder
    session_key?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SessionsMaxOrderByAggregateInput = {
    id?: SortOrder
    session_key?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SessionsMinOrderByAggregateInput = {
    id?: SortOrder
    session_key?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type DateTimeNullableFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | null
    notIn?: Enumerable<Date> | Enumerable<string> | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableFilter | Date | string | null
  }

  export type HooksCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type HooksMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type HooksMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    user_id?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | null
    notIn?: Enumerable<Date> | Enumerable<string> | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableWithAggregatesFilter | Date | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedDateTimeNullableFilter
    _max?: NestedDateTimeNullableFilter
  }

  export type FilesCountOrderByAggregateInput = {
    id?: SortOrder
    size?: SortOrder
    created_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    encryption_data?: SortOrder
  }

  export type FilesAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type FilesMaxOrderByAggregateInput = {
    id?: SortOrder
    size?: SortOrder
    created_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    encryption_data?: SortOrder
  }

  export type FilesMinOrderByAggregateInput = {
    id?: SortOrder
    size?: SortOrder
    created_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    encryption_data?: SortOrder
  }

  export type FilesSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type CouponsCountOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CouponsMaxOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CouponsMinOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    expired_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TFASolutionCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<TFASolutionCreateWithoutUserInput>, Enumerable<TFASolutionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<TFASolutionCreateOrConnectWithoutUserInput>
    createMany?: TFASolutionCreateManyUserInputEnvelope
    connect?: Enumerable<TFASolutionWhereUniqueInput>
  }

  export type ConfirmingEmailAddressCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<ConfirmingEmailAddressCreateWithoutUserInput>, Enumerable<ConfirmingEmailAddressUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<ConfirmingEmailAddressCreateOrConnectWithoutUserInput>
    createMany?: ConfirmingEmailAddressCreateManyUserInputEnvelope
    connect?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
  }

  export type SessionsCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<SessionsCreateWithoutUserInput>, Enumerable<SessionsUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<SessionsCreateOrConnectWithoutUserInput>
    createMany?: SessionsCreateManyUserInputEnvelope
    connect?: Enumerable<SessionsWhereUniqueInput>
  }

  export type HooksCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<HooksCreateWithoutUserInput>, Enumerable<HooksUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<HooksCreateOrConnectWithoutUserInput>
    createMany?: HooksCreateManyUserInputEnvelope
    connect?: Enumerable<HooksWhereUniqueInput>
  }

  export type FilesCreateNestedManyWithoutCreateUserInput = {
    create?: XOR<Enumerable<FilesCreateWithoutCreateUserInput>, Enumerable<FilesUncheckedCreateWithoutCreateUserInput>>
    connectOrCreate?: Enumerable<FilesCreateOrConnectWithoutCreateUserInput>
    createMany?: FilesCreateManyCreateUserInputEnvelope
    connect?: Enumerable<FilesWhereUniqueInput>
  }

  export type TFASolutionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<TFASolutionCreateWithoutUserInput>, Enumerable<TFASolutionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<TFASolutionCreateOrConnectWithoutUserInput>
    createMany?: TFASolutionCreateManyUserInputEnvelope
    connect?: Enumerable<TFASolutionWhereUniqueInput>
  }

  export type ConfirmingEmailAddressUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<ConfirmingEmailAddressCreateWithoutUserInput>, Enumerable<ConfirmingEmailAddressUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<ConfirmingEmailAddressCreateOrConnectWithoutUserInput>
    createMany?: ConfirmingEmailAddressCreateManyUserInputEnvelope
    connect?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
  }

  export type SessionsUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<SessionsCreateWithoutUserInput>, Enumerable<SessionsUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<SessionsCreateOrConnectWithoutUserInput>
    createMany?: SessionsCreateManyUserInputEnvelope
    connect?: Enumerable<SessionsWhereUniqueInput>
  }

  export type HooksUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<Enumerable<HooksCreateWithoutUserInput>, Enumerable<HooksUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<HooksCreateOrConnectWithoutUserInput>
    createMany?: HooksCreateManyUserInputEnvelope
    connect?: Enumerable<HooksWhereUniqueInput>
  }

  export type FilesUncheckedCreateNestedManyWithoutCreateUserInput = {
    create?: XOR<Enumerable<FilesCreateWithoutCreateUserInput>, Enumerable<FilesUncheckedCreateWithoutCreateUserInput>>
    connectOrCreate?: Enumerable<FilesCreateOrConnectWithoutCreateUserInput>
    createMany?: FilesCreateManyCreateUserInputEnvelope
    connect?: Enumerable<FilesWhereUniqueInput>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: Role
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TFASolutionUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<TFASolutionCreateWithoutUserInput>, Enumerable<TFASolutionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<TFASolutionCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<TFASolutionUpsertWithWhereUniqueWithoutUserInput>
    createMany?: TFASolutionCreateManyUserInputEnvelope
    set?: Enumerable<TFASolutionWhereUniqueInput>
    disconnect?: Enumerable<TFASolutionWhereUniqueInput>
    delete?: Enumerable<TFASolutionWhereUniqueInput>
    connect?: Enumerable<TFASolutionWhereUniqueInput>
    update?: Enumerable<TFASolutionUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<TFASolutionUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<TFASolutionScalarWhereInput>
  }

  export type ConfirmingEmailAddressUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<ConfirmingEmailAddressCreateWithoutUserInput>, Enumerable<ConfirmingEmailAddressUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<ConfirmingEmailAddressCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<ConfirmingEmailAddressUpsertWithWhereUniqueWithoutUserInput>
    createMany?: ConfirmingEmailAddressCreateManyUserInputEnvelope
    set?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    disconnect?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    delete?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    connect?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    update?: Enumerable<ConfirmingEmailAddressUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<ConfirmingEmailAddressUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<ConfirmingEmailAddressScalarWhereInput>
  }

  export type SessionsUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<SessionsCreateWithoutUserInput>, Enumerable<SessionsUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<SessionsCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<SessionsUpsertWithWhereUniqueWithoutUserInput>
    createMany?: SessionsCreateManyUserInputEnvelope
    set?: Enumerable<SessionsWhereUniqueInput>
    disconnect?: Enumerable<SessionsWhereUniqueInput>
    delete?: Enumerable<SessionsWhereUniqueInput>
    connect?: Enumerable<SessionsWhereUniqueInput>
    update?: Enumerable<SessionsUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<SessionsUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<SessionsScalarWhereInput>
  }

  export type HooksUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<HooksCreateWithoutUserInput>, Enumerable<HooksUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<HooksCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<HooksUpsertWithWhereUniqueWithoutUserInput>
    createMany?: HooksCreateManyUserInputEnvelope
    set?: Enumerable<HooksWhereUniqueInput>
    disconnect?: Enumerable<HooksWhereUniqueInput>
    delete?: Enumerable<HooksWhereUniqueInput>
    connect?: Enumerable<HooksWhereUniqueInput>
    update?: Enumerable<HooksUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<HooksUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<HooksScalarWhereInput>
  }

  export type FilesUpdateManyWithoutCreateUserNestedInput = {
    create?: XOR<Enumerable<FilesCreateWithoutCreateUserInput>, Enumerable<FilesUncheckedCreateWithoutCreateUserInput>>
    connectOrCreate?: Enumerable<FilesCreateOrConnectWithoutCreateUserInput>
    upsert?: Enumerable<FilesUpsertWithWhereUniqueWithoutCreateUserInput>
    createMany?: FilesCreateManyCreateUserInputEnvelope
    set?: Enumerable<FilesWhereUniqueInput>
    disconnect?: Enumerable<FilesWhereUniqueInput>
    delete?: Enumerable<FilesWhereUniqueInput>
    connect?: Enumerable<FilesWhereUniqueInput>
    update?: Enumerable<FilesUpdateWithWhereUniqueWithoutCreateUserInput>
    updateMany?: Enumerable<FilesUpdateManyWithWhereWithoutCreateUserInput>
    deleteMany?: Enumerable<FilesScalarWhereInput>
  }

  export type TFASolutionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<TFASolutionCreateWithoutUserInput>, Enumerable<TFASolutionUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<TFASolutionCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<TFASolutionUpsertWithWhereUniqueWithoutUserInput>
    createMany?: TFASolutionCreateManyUserInputEnvelope
    set?: Enumerable<TFASolutionWhereUniqueInput>
    disconnect?: Enumerable<TFASolutionWhereUniqueInput>
    delete?: Enumerable<TFASolutionWhereUniqueInput>
    connect?: Enumerable<TFASolutionWhereUniqueInput>
    update?: Enumerable<TFASolutionUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<TFASolutionUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<TFASolutionScalarWhereInput>
  }

  export type ConfirmingEmailAddressUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<ConfirmingEmailAddressCreateWithoutUserInput>, Enumerable<ConfirmingEmailAddressUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<ConfirmingEmailAddressCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<ConfirmingEmailAddressUpsertWithWhereUniqueWithoutUserInput>
    createMany?: ConfirmingEmailAddressCreateManyUserInputEnvelope
    set?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    disconnect?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    delete?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    connect?: Enumerable<ConfirmingEmailAddressWhereUniqueInput>
    update?: Enumerable<ConfirmingEmailAddressUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<ConfirmingEmailAddressUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<ConfirmingEmailAddressScalarWhereInput>
  }

  export type SessionsUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<SessionsCreateWithoutUserInput>, Enumerable<SessionsUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<SessionsCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<SessionsUpsertWithWhereUniqueWithoutUserInput>
    createMany?: SessionsCreateManyUserInputEnvelope
    set?: Enumerable<SessionsWhereUniqueInput>
    disconnect?: Enumerable<SessionsWhereUniqueInput>
    delete?: Enumerable<SessionsWhereUniqueInput>
    connect?: Enumerable<SessionsWhereUniqueInput>
    update?: Enumerable<SessionsUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<SessionsUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<SessionsScalarWhereInput>
  }

  export type HooksUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<Enumerable<HooksCreateWithoutUserInput>, Enumerable<HooksUncheckedCreateWithoutUserInput>>
    connectOrCreate?: Enumerable<HooksCreateOrConnectWithoutUserInput>
    upsert?: Enumerable<HooksUpsertWithWhereUniqueWithoutUserInput>
    createMany?: HooksCreateManyUserInputEnvelope
    set?: Enumerable<HooksWhereUniqueInput>
    disconnect?: Enumerable<HooksWhereUniqueInput>
    delete?: Enumerable<HooksWhereUniqueInput>
    connect?: Enumerable<HooksWhereUniqueInput>
    update?: Enumerable<HooksUpdateWithWhereUniqueWithoutUserInput>
    updateMany?: Enumerable<HooksUpdateManyWithWhereWithoutUserInput>
    deleteMany?: Enumerable<HooksScalarWhereInput>
  }

  export type FilesUncheckedUpdateManyWithoutCreateUserNestedInput = {
    create?: XOR<Enumerable<FilesCreateWithoutCreateUserInput>, Enumerable<FilesUncheckedCreateWithoutCreateUserInput>>
    connectOrCreate?: Enumerable<FilesCreateOrConnectWithoutCreateUserInput>
    upsert?: Enumerable<FilesUpsertWithWhereUniqueWithoutCreateUserInput>
    createMany?: FilesCreateManyCreateUserInputEnvelope
    set?: Enumerable<FilesWhereUniqueInput>
    disconnect?: Enumerable<FilesWhereUniqueInput>
    delete?: Enumerable<FilesWhereUniqueInput>
    connect?: Enumerable<FilesWhereUniqueInput>
    update?: Enumerable<FilesUpdateWithWhereUniqueWithoutCreateUserInput>
    updateMany?: Enumerable<FilesUpdateManyWithWhereWithoutCreateUserInput>
    deleteMany?: Enumerable<FilesScalarWhereInput>
  }

  export type UserCreateNestedOneWithoutTfa_solutionsInput = {
    create?: XOR<UserCreateWithoutTfa_solutionsInput, UserUncheckedCreateWithoutTfa_solutionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTfa_solutionsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumSolutionTypeFieldUpdateOperationsInput = {
    set?: SolutionType
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutTfa_solutionsNestedInput = {
    create?: XOR<UserCreateWithoutTfa_solutionsInput, UserUncheckedCreateWithoutTfa_solutionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTfa_solutionsInput
    upsert?: UserUpsertWithoutTfa_solutionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutTfa_solutionsInput, UserUncheckedUpdateWithoutTfa_solutionsInput>
  }

  export type UserCreateNestedOneWithoutConfirmingEmailAddressInput = {
    create?: XOR<UserCreateWithoutConfirmingEmailAddressInput, UserUncheckedCreateWithoutConfirmingEmailAddressInput>
    connectOrCreate?: UserCreateOrConnectWithoutConfirmingEmailAddressInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutConfirmingEmailAddressNestedInput = {
    create?: XOR<UserCreateWithoutConfirmingEmailAddressInput, UserUncheckedCreateWithoutConfirmingEmailAddressInput>
    connectOrCreate?: UserCreateOrConnectWithoutConfirmingEmailAddressInput
    upsert?: UserUpsertWithoutConfirmingEmailAddressInput
    disconnect?: boolean
    delete?: boolean
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutConfirmingEmailAddressInput, UserUncheckedUpdateWithoutConfirmingEmailAddressInput>
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    disconnect?: boolean
    delete?: boolean
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserCreateNestedOneWithoutHooksInput = {
    create?: XOR<UserCreateWithoutHooksInput, UserUncheckedCreateWithoutHooksInput>
    connectOrCreate?: UserCreateOrConnectWithoutHooksInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutHooksNestedInput = {
    create?: XOR<UserCreateWithoutHooksInput, UserUncheckedCreateWithoutHooksInput>
    connectOrCreate?: UserCreateOrConnectWithoutHooksInput
    upsert?: UserUpsertWithoutHooksInput
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutHooksInput, UserUncheckedUpdateWithoutHooksInput>
  }

  export type UserCreateNestedOneWithoutFilesInput = {
    create?: XOR<UserCreateWithoutFilesInput, UserUncheckedCreateWithoutFilesInput>
    connectOrCreate?: UserCreateOrConnectWithoutFilesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutFilesNestedInput = {
    create?: XOR<UserCreateWithoutFilesInput, UserUncheckedCreateWithoutFilesInput>
    connectOrCreate?: UserCreateOrConnectWithoutFilesInput
    upsert?: UserUpsertWithoutFilesInput
    connect?: UserWhereUniqueInput
    update?: XOR<UserUpdateWithoutFilesInput, UserUncheckedUpdateWithoutFilesInput>
  }

  export type NestedStringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type NestedEnumRoleFilter = {
    equals?: Role
    in?: Enumerable<Role>
    notIn?: Enumerable<Role>
    not?: NestedEnumRoleFilter | Role
  }

  export type NestedIntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type NestedDateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type NestedStringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type NestedEnumRoleWithAggregatesFilter = {
    equals?: Role
    in?: Enumerable<Role>
    notIn?: Enumerable<Role>
    not?: NestedEnumRoleWithAggregatesFilter | Role
    _count?: NestedIntFilter
    _min?: NestedEnumRoleFilter
    _max?: NestedEnumRoleFilter
  }

  export type NestedIntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type NestedFloatFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedFloatFilter | number
  }

  export type NestedDateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type NestedEnumSolutionTypeFilter = {
    equals?: SolutionType
    in?: Enumerable<SolutionType>
    notIn?: Enumerable<SolutionType>
    not?: NestedEnumSolutionTypeFilter | SolutionType
  }

  export type NestedBoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type NestedEnumSolutionTypeWithAggregatesFilter = {
    equals?: SolutionType
    in?: Enumerable<SolutionType>
    notIn?: Enumerable<SolutionType>
    not?: NestedEnumSolutionTypeWithAggregatesFilter | SolutionType
    _count?: NestedIntFilter
    _min?: NestedEnumSolutionTypeFilter
    _max?: NestedEnumSolutionTypeFilter
  }

  export type NestedBoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type NestedStringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableFilter | string | null
  }

  export type NestedStringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type NestedIntNullableFilter = {
    equals?: number | null
    in?: Enumerable<number> | null
    notIn?: Enumerable<number> | null
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntNullableFilter | number | null
  }

  export type NestedDateTimeNullableFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | null
    notIn?: Enumerable<Date> | Enumerable<string> | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableFilter | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter = {
    equals?: Date | string | null
    in?: Enumerable<Date> | Enumerable<string> | null
    notIn?: Enumerable<Date> | Enumerable<string> | null
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeNullableWithAggregatesFilter | Date | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedDateTimeNullableFilter
    _max?: NestedDateTimeNullableFilter
  }

  export type TFASolutionCreateWithoutUserInput = {
    id: string
    type: SolutionType
    value: string
    available?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TFASolutionUncheckedCreateWithoutUserInput = {
    id: string
    type: SolutionType
    value: string
    available?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TFASolutionCreateOrConnectWithoutUserInput = {
    where: TFASolutionWhereUniqueInput
    create: XOR<TFASolutionCreateWithoutUserInput, TFASolutionUncheckedCreateWithoutUserInput>
  }

  export type TFASolutionCreateManyUserInputEnvelope = {
    data: Enumerable<TFASolutionCreateManyUserInput>
    skipDuplicates?: boolean
  }

  export type ConfirmingEmailAddressCreateWithoutUserInput = {
    id: string
    email: string
    hashedtoken: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConfirmingEmailAddressUncheckedCreateWithoutUserInput = {
    id: string
    email: string
    hashedtoken: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConfirmingEmailAddressCreateOrConnectWithoutUserInput = {
    where: ConfirmingEmailAddressWhereUniqueInput
    create: XOR<ConfirmingEmailAddressCreateWithoutUserInput, ConfirmingEmailAddressUncheckedCreateWithoutUserInput>
  }

  export type ConfirmingEmailAddressCreateManyUserInputEnvelope = {
    data: Enumerable<ConfirmingEmailAddressCreateManyUserInput>
    skipDuplicates?: boolean
  }

  export type SessionsCreateWithoutUserInput = {
    id: string
    session_key: string
    data: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SessionsUncheckedCreateWithoutUserInput = {
    id: string
    session_key: string
    data: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SessionsCreateOrConnectWithoutUserInput = {
    where: SessionsWhereUniqueInput
    create: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput>
  }

  export type SessionsCreateManyUserInputEnvelope = {
    data: Enumerable<SessionsCreateManyUserInput>
    skipDuplicates?: boolean
  }

  export type HooksCreateWithoutUserInput = {
    id: string
    name: string
    data: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type HooksUncheckedCreateWithoutUserInput = {
    id: string
    name: string
    data: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type HooksCreateOrConnectWithoutUserInput = {
    where: HooksWhereUniqueInput
    create: XOR<HooksCreateWithoutUserInput, HooksUncheckedCreateWithoutUserInput>
  }

  export type HooksCreateManyUserInputEnvelope = {
    data: Enumerable<HooksCreateManyUserInput>
    skipDuplicates?: boolean
  }

  export type FilesCreateWithoutCreateUserInput = {
    id: string
    size: number
    created_at?: Date | string
    updated_at?: Date | string
    encryption_data: string
  }

  export type FilesUncheckedCreateWithoutCreateUserInput = {
    id: string
    size: number
    created_at?: Date | string
    updated_at?: Date | string
    encryption_data: string
  }

  export type FilesCreateOrConnectWithoutCreateUserInput = {
    where: FilesWhereUniqueInput
    create: XOR<FilesCreateWithoutCreateUserInput, FilesUncheckedCreateWithoutCreateUserInput>
  }

  export type FilesCreateManyCreateUserInputEnvelope = {
    data: Enumerable<FilesCreateManyCreateUserInput>
    skipDuplicates?: boolean
  }

  export type TFASolutionUpsertWithWhereUniqueWithoutUserInput = {
    where: TFASolutionWhereUniqueInput
    update: XOR<TFASolutionUpdateWithoutUserInput, TFASolutionUncheckedUpdateWithoutUserInput>
    create: XOR<TFASolutionCreateWithoutUserInput, TFASolutionUncheckedCreateWithoutUserInput>
  }

  export type TFASolutionUpdateWithWhereUniqueWithoutUserInput = {
    where: TFASolutionWhereUniqueInput
    data: XOR<TFASolutionUpdateWithoutUserInput, TFASolutionUncheckedUpdateWithoutUserInput>
  }

  export type TFASolutionUpdateManyWithWhereWithoutUserInput = {
    where: TFASolutionScalarWhereInput
    data: XOR<TFASolutionUpdateManyMutationInput, TFASolutionUncheckedUpdateManyWithoutTfa_solutionsInput>
  }

  export type TFASolutionScalarWhereInput = {
    AND?: Enumerable<TFASolutionScalarWhereInput>
    OR?: Enumerable<TFASolutionScalarWhereInput>
    NOT?: Enumerable<TFASolutionScalarWhereInput>
    id?: StringFilter | string
    type?: EnumSolutionTypeFilter | SolutionType
    value?: StringFilter | string
    user_id?: StringFilter | string
    available?: BoolFilter | boolean
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
  }

  export type ConfirmingEmailAddressUpsertWithWhereUniqueWithoutUserInput = {
    where: ConfirmingEmailAddressWhereUniqueInput
    update: XOR<ConfirmingEmailAddressUpdateWithoutUserInput, ConfirmingEmailAddressUncheckedUpdateWithoutUserInput>
    create: XOR<ConfirmingEmailAddressCreateWithoutUserInput, ConfirmingEmailAddressUncheckedCreateWithoutUserInput>
  }

  export type ConfirmingEmailAddressUpdateWithWhereUniqueWithoutUserInput = {
    where: ConfirmingEmailAddressWhereUniqueInput
    data: XOR<ConfirmingEmailAddressUpdateWithoutUserInput, ConfirmingEmailAddressUncheckedUpdateWithoutUserInput>
  }

  export type ConfirmingEmailAddressUpdateManyWithWhereWithoutUserInput = {
    where: ConfirmingEmailAddressScalarWhereInput
    data: XOR<ConfirmingEmailAddressUpdateManyMutationInput, ConfirmingEmailAddressUncheckedUpdateManyWithoutConfirmingEmailAddressInput>
  }

  export type ConfirmingEmailAddressScalarWhereInput = {
    AND?: Enumerable<ConfirmingEmailAddressScalarWhereInput>
    OR?: Enumerable<ConfirmingEmailAddressScalarWhereInput>
    NOT?: Enumerable<ConfirmingEmailAddressScalarWhereInput>
    id?: StringFilter | string
    email?: StringFilter | string
    hashedtoken?: StringFilter | string
    user_id?: StringNullableFilter | string | null
    expired_at?: DateTimeFilter | Date | string
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
  }

  export type SessionsUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionsWhereUniqueInput
    update: XOR<SessionsUpdateWithoutUserInput, SessionsUncheckedUpdateWithoutUserInput>
    create: XOR<SessionsCreateWithoutUserInput, SessionsUncheckedCreateWithoutUserInput>
  }

  export type SessionsUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionsWhereUniqueInput
    data: XOR<SessionsUpdateWithoutUserInput, SessionsUncheckedUpdateWithoutUserInput>
  }

  export type SessionsUpdateManyWithWhereWithoutUserInput = {
    where: SessionsScalarWhereInput
    data: XOR<SessionsUpdateManyMutationInput, SessionsUncheckedUpdateManyWithoutSessionsInput>
  }

  export type SessionsScalarWhereInput = {
    AND?: Enumerable<SessionsScalarWhereInput>
    OR?: Enumerable<SessionsScalarWhereInput>
    NOT?: Enumerable<SessionsScalarWhereInput>
    id?: StringFilter | string
    session_key?: StringFilter | string
    data?: StringFilter | string
    user_id?: StringNullableFilter | string | null
    expired_at?: DateTimeFilter | Date | string
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
  }

  export type HooksUpsertWithWhereUniqueWithoutUserInput = {
    where: HooksWhereUniqueInput
    update: XOR<HooksUpdateWithoutUserInput, HooksUncheckedUpdateWithoutUserInput>
    create: XOR<HooksCreateWithoutUserInput, HooksUncheckedCreateWithoutUserInput>
  }

  export type HooksUpdateWithWhereUniqueWithoutUserInput = {
    where: HooksWhereUniqueInput
    data: XOR<HooksUpdateWithoutUserInput, HooksUncheckedUpdateWithoutUserInput>
  }

  export type HooksUpdateManyWithWhereWithoutUserInput = {
    where: HooksScalarWhereInput
    data: XOR<HooksUpdateManyMutationInput, HooksUncheckedUpdateManyWithoutHooksInput>
  }

  export type HooksScalarWhereInput = {
    AND?: Enumerable<HooksScalarWhereInput>
    OR?: Enumerable<HooksScalarWhereInput>
    NOT?: Enumerable<HooksScalarWhereInput>
    id?: StringFilter | string
    name?: StringFilter | string
    data?: StringFilter | string
    user_id?: StringFilter | string
    expired_at?: DateTimeNullableFilter | Date | string | null
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
  }

  export type FilesUpsertWithWhereUniqueWithoutCreateUserInput = {
    where: FilesWhereUniqueInput
    update: XOR<FilesUpdateWithoutCreateUserInput, FilesUncheckedUpdateWithoutCreateUserInput>
    create: XOR<FilesCreateWithoutCreateUserInput, FilesUncheckedCreateWithoutCreateUserInput>
  }

  export type FilesUpdateWithWhereUniqueWithoutCreateUserInput = {
    where: FilesWhereUniqueInput
    data: XOR<FilesUpdateWithoutCreateUserInput, FilesUncheckedUpdateWithoutCreateUserInput>
  }

  export type FilesUpdateManyWithWhereWithoutCreateUserInput = {
    where: FilesScalarWhereInput
    data: XOR<FilesUpdateManyMutationInput, FilesUncheckedUpdateManyWithoutFilesInput>
  }

  export type FilesScalarWhereInput = {
    AND?: Enumerable<FilesScalarWhereInput>
    OR?: Enumerable<FilesScalarWhereInput>
    NOT?: Enumerable<FilesScalarWhereInput>
    id?: StringFilter | string
    size?: IntFilter | number
    created_by?: StringFilter | string
    created_at?: DateTimeFilter | Date | string
    updated_at?: DateTimeFilter | Date | string
    encryption_data?: StringFilter | string
  }

  export type UserCreateWithoutTfa_solutionsInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    ConfirmingEmailAddress?: ConfirmingEmailAddressCreateNestedManyWithoutUserInput
    Sessions?: SessionsCreateNestedManyWithoutUserInput
    Hooks?: HooksCreateNestedManyWithoutUserInput
    Files?: FilesCreateNestedManyWithoutCreateUserInput
  }

  export type UserUncheckedCreateWithoutTfa_solutionsInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedCreateNestedManyWithoutUserInput
    Sessions?: SessionsUncheckedCreateNestedManyWithoutUserInput
    Hooks?: HooksUncheckedCreateNestedManyWithoutUserInput
    Files?: FilesUncheckedCreateNestedManyWithoutCreateUserInput
  }

  export type UserCreateOrConnectWithoutTfa_solutionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTfa_solutionsInput, UserUncheckedCreateWithoutTfa_solutionsInput>
  }

  export type UserUpsertWithoutTfa_solutionsInput = {
    update: XOR<UserUpdateWithoutTfa_solutionsInput, UserUncheckedUpdateWithoutTfa_solutionsInput>
    create: XOR<UserCreateWithoutTfa_solutionsInput, UserUncheckedCreateWithoutTfa_solutionsInput>
  }

  export type UserUpdateWithoutTfa_solutionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    ConfirmingEmailAddress?: ConfirmingEmailAddressUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUpdateManyWithoutUserNestedInput
    Hooks?: HooksUpdateManyWithoutUserNestedInput
    Files?: FilesUpdateManyWithoutCreateUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTfa_solutionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUncheckedUpdateManyWithoutUserNestedInput
    Hooks?: HooksUncheckedUpdateManyWithoutUserNestedInput
    Files?: FilesUncheckedUpdateManyWithoutCreateUserNestedInput
  }

  export type UserCreateWithoutConfirmingEmailAddressInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionCreateNestedManyWithoutUserInput
    Sessions?: SessionsCreateNestedManyWithoutUserInput
    Hooks?: HooksCreateNestedManyWithoutUserInput
    Files?: FilesCreateNestedManyWithoutCreateUserInput
  }

  export type UserUncheckedCreateWithoutConfirmingEmailAddressInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionUncheckedCreateNestedManyWithoutUserInput
    Sessions?: SessionsUncheckedCreateNestedManyWithoutUserInput
    Hooks?: HooksUncheckedCreateNestedManyWithoutUserInput
    Files?: FilesUncheckedCreateNestedManyWithoutCreateUserInput
  }

  export type UserCreateOrConnectWithoutConfirmingEmailAddressInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutConfirmingEmailAddressInput, UserUncheckedCreateWithoutConfirmingEmailAddressInput>
  }

  export type UserUpsertWithoutConfirmingEmailAddressInput = {
    update: XOR<UserUpdateWithoutConfirmingEmailAddressInput, UserUncheckedUpdateWithoutConfirmingEmailAddressInput>
    create: XOR<UserCreateWithoutConfirmingEmailAddressInput, UserUncheckedCreateWithoutConfirmingEmailAddressInput>
  }

  export type UserUpdateWithoutConfirmingEmailAddressInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUpdateManyWithoutUserNestedInput
    Hooks?: HooksUpdateManyWithoutUserNestedInput
    Files?: FilesUpdateManyWithoutCreateUserNestedInput
  }

  export type UserUncheckedUpdateWithoutConfirmingEmailAddressInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUncheckedUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUncheckedUpdateManyWithoutUserNestedInput
    Hooks?: HooksUncheckedUpdateManyWithoutUserNestedInput
    Files?: FilesUncheckedUpdateManyWithoutCreateUserNestedInput
  }

  export type UserCreateWithoutSessionsInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressCreateNestedManyWithoutUserInput
    Hooks?: HooksCreateNestedManyWithoutUserInput
    Files?: FilesCreateNestedManyWithoutCreateUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionUncheckedCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedCreateNestedManyWithoutUserInput
    Hooks?: HooksUncheckedCreateNestedManyWithoutUserInput
    Files?: FilesUncheckedCreateNestedManyWithoutCreateUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUpdateManyWithoutUserNestedInput
    Hooks?: HooksUpdateManyWithoutUserNestedInput
    Files?: FilesUpdateManyWithoutCreateUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUncheckedUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedUpdateManyWithoutUserNestedInput
    Hooks?: HooksUncheckedUpdateManyWithoutUserNestedInput
    Files?: FilesUncheckedUpdateManyWithoutCreateUserNestedInput
  }

  export type UserCreateWithoutHooksInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressCreateNestedManyWithoutUserInput
    Sessions?: SessionsCreateNestedManyWithoutUserInput
    Files?: FilesCreateNestedManyWithoutCreateUserInput
  }

  export type UserUncheckedCreateWithoutHooksInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionUncheckedCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedCreateNestedManyWithoutUserInput
    Sessions?: SessionsUncheckedCreateNestedManyWithoutUserInput
    Files?: FilesUncheckedCreateNestedManyWithoutCreateUserInput
  }

  export type UserCreateOrConnectWithoutHooksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutHooksInput, UserUncheckedCreateWithoutHooksInput>
  }

  export type UserUpsertWithoutHooksInput = {
    update: XOR<UserUpdateWithoutHooksInput, UserUncheckedUpdateWithoutHooksInput>
    create: XOR<UserCreateWithoutHooksInput, UserUncheckedCreateWithoutHooksInput>
  }

  export type UserUpdateWithoutHooksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUpdateManyWithoutUserNestedInput
    Files?: FilesUpdateManyWithoutCreateUserNestedInput
  }

  export type UserUncheckedUpdateWithoutHooksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUncheckedUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUncheckedUpdateManyWithoutUserNestedInput
    Files?: FilesUncheckedUpdateManyWithoutCreateUserNestedInput
  }

  export type UserCreateWithoutFilesInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressCreateNestedManyWithoutUserInput
    Sessions?: SessionsCreateNestedManyWithoutUserInput
    Hooks?: HooksCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutFilesInput = {
    id: string
    email: string
    role?: Role
    max_capacity: number
    file_usage: number
    client_random_value: string
    encrypted_master_key: string
    encrypted_master_key_iv: string
    encrypted_rsa_private_key: string
    encrypted_rsa_private_key_iv: string
    hashed_authentication_key: string
    rsa_public_key: string
    created_at?: Date | string
    updated_at?: Date | string
    tfa_solutions?: TFASolutionUncheckedCreateNestedManyWithoutUserInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedCreateNestedManyWithoutUserInput
    Sessions?: SessionsUncheckedCreateNestedManyWithoutUserInput
    Hooks?: HooksUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFilesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFilesInput, UserUncheckedCreateWithoutFilesInput>
  }

  export type UserUpsertWithoutFilesInput = {
    update: XOR<UserUpdateWithoutFilesInput, UserUncheckedUpdateWithoutFilesInput>
    create: XOR<UserCreateWithoutFilesInput, UserUncheckedCreateWithoutFilesInput>
  }

  export type UserUpdateWithoutFilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUpdateManyWithoutUserNestedInput
    Hooks?: HooksUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutFilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | Role
    max_capacity?: IntFieldUpdateOperationsInput | number
    file_usage?: IntFieldUpdateOperationsInput | number
    client_random_value?: StringFieldUpdateOperationsInput | string
    encrypted_master_key?: StringFieldUpdateOperationsInput | string
    encrypted_master_key_iv?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key?: StringFieldUpdateOperationsInput | string
    encrypted_rsa_private_key_iv?: StringFieldUpdateOperationsInput | string
    hashed_authentication_key?: StringFieldUpdateOperationsInput | string
    rsa_public_key?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tfa_solutions?: TFASolutionUncheckedUpdateManyWithoutUserNestedInput
    ConfirmingEmailAddress?: ConfirmingEmailAddressUncheckedUpdateManyWithoutUserNestedInput
    Sessions?: SessionsUncheckedUpdateManyWithoutUserNestedInput
    Hooks?: HooksUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TFASolutionCreateManyUserInput = {
    id: string
    type: SolutionType
    value: string
    available?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConfirmingEmailAddressCreateManyUserInput = {
    id: string
    email: string
    hashedtoken: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SessionsCreateManyUserInput = {
    id: string
    session_key: string
    data: string
    expired_at: Date | string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type HooksCreateManyUserInput = {
    id: string
    name: string
    data: string
    expired_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilesCreateManyCreateUserInput = {
    id: string
    size: number
    created_at?: Date | string
    updated_at?: Date | string
    encryption_data: string
  }

  export type TFASolutionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumSolutionTypeFieldUpdateOperationsInput | SolutionType
    value?: StringFieldUpdateOperationsInput | string
    available?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TFASolutionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumSolutionTypeFieldUpdateOperationsInput | SolutionType
    value?: StringFieldUpdateOperationsInput | string
    available?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TFASolutionUncheckedUpdateManyWithoutTfa_solutionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumSolutionTypeFieldUpdateOperationsInput | SolutionType
    value?: StringFieldUpdateOperationsInput | string
    available?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfirmingEmailAddressUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    hashedtoken?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfirmingEmailAddressUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    hashedtoken?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfirmingEmailAddressUncheckedUpdateManyWithoutConfirmingEmailAddressInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    hashedtoken?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionsUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    session_key?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionsUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    session_key?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionsUncheckedUpdateManyWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    session_key?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: DateTimeFieldUpdateOperationsInput | Date | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HooksUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HooksUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HooksUncheckedUpdateManyWithoutHooksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    expired_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilesUpdateWithoutCreateUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    encryption_data?: StringFieldUpdateOperationsInput | string
  }

  export type FilesUncheckedUpdateWithoutCreateUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    encryption_data?: StringFieldUpdateOperationsInput | string
  }

  export type FilesUncheckedUpdateManyWithoutFilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    encryption_data?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}