export function observeProperty<Target = Object, Value = unknown>(
  target: Target,
  key: PropertyKey,
  changeCallback: (target: Target, oldValue: Value, value: Value) => void
) {
  let get: (target: Target) => Value;
  let set: (target: Target, value: Value) => void;
  const propertyDescriptor = getPropertyDescriptor(target, key);
  if (
    propertyDescriptor !== undefined &&
    propertyDescriptor.get !== undefined &&
    propertyDescriptor.set !== undefined
  ) {
    get = target => propertyDescriptor.get!.call(target);
    set = (target, value) => propertyDescriptor.set!.call(target, value);
  } else {
    const privateKey = typeof key === "symbol" ? Symbol() : `__${key}`;
    (target as any)[privateKey] = (target as any)[key];
    get = target => (target as any)[privateKey];
    set = (target, value) => ((target as any)[privateKey] = value);
  }
  Object.defineProperty(target, key, {
    get() {
      return get(this);
    },
    set(value: Value) {
      const oldValue = get(this);
      set(this, value);
      changeCallback(this, oldValue, value);
    }
  });
}

function getPropertyDescriptor(target: any, key: PropertyKey) {
  while (key in target) {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(target, key);
    if (propertyDescriptor !== undefined) {
      return propertyDescriptor;
    }
    target = Object.getPrototypeOf(target);
  }
  return undefined;
}
