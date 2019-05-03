export function observeProperty<Target, Property extends keyof Target>(
  target: Target,
  key: Property,
  callback: (
    target: Target,
    oldValue: Target[Property],
    value: Target[Property]
  ) => void
) {
  Object.defineProperty(target, key, onSet(callback)(
    target,
    key
  ) as TypedPropertyDescriptor<Target[Property]>);
}

export function onSet<Target, Property extends keyof Target>(
  callback: (
    target: Target,
    oldValue: Target[Property],
    value: Target[Property]
  ) => void
): any {
  return function(
    target: Target,
    propertyKey: Property,
    descriptor?: TypedPropertyDescriptor<Target[Property]>
  ) {
    if (descriptor === undefined) {
      descriptor = getPropertyDescriptor(target, propertyKey);
    }
    let get: (target: Target) => Target[Property];
    let set: (target: Target, value: Target[Property]) => void;
    if (
      descriptor !== undefined &&
      descriptor.get !== undefined &&
      descriptor.set !== undefined
    ) {
      get = target =>
        ((descriptor!.get as any) as () => Target[Property]).call(target);
      set = (target, value) =>
        ((descriptor!.set as any) as (value: Target[Property]) => void).call(
          target,
          value
        );
    } else {
      const privateKey = Symbol();
      (target as any)[privateKey] = (target as any)[propertyKey];
      get = target => (target as any)[privateKey];
      set = (target, value) => ((target as any)[privateKey] = value);
    }
    return {
      get(this: Target) {
        return get(this);
      },
      set(this: Target, value: Target[Property]) {
        const oldValue = get(this);
        set(this, value);
        callback(this, oldValue, value);
      }
    };
  };
}

function getPropertyDescriptor<Target, Property extends keyof Target>(
  target: Target,
  key: Property
) {
  while (key in target) {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(target, key);
    if (propertyDescriptor !== undefined) {
      return propertyDescriptor as TypedPropertyDescriptor<Target[Property]>;
    }
    target = Object.getPrototypeOf(target);
  }
  return undefined;
}
