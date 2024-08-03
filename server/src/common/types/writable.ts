type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

export type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];

export type TotalWritable<T extends object> = {
  [P in WritableKeys<T>]: T[P] extends Array<infer U>
    ? U extends object
      ? TotalWritable<U>
      : never
    : T[P];
}[WritableKeys<T>];

export type DeepWritable<T extends object> = Pick<T, WritableKeys<T>>;
