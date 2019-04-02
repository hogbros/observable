interface Constructor<T> {
  new (...args: unknown[]): T;
}

export type ObservableType<Base> = Constructor<ObservableMixin<Base>> & {
  isObservable: true;
  observeProperty(key: PropertyKey): void;
};
export type ObservableMixin<Base> = Base & ObservableDeclaration;

declare abstract class ObservableDeclaration {
  static readonly isObservable: true;
  static observeProperty(key: PropertyKey): void;
  abstract propertyChangedCallback(
    key: PropertyKey,
    oldValue: unknown,
    value: unknown
  ): void;
}

export function Observable<Base>(baseClass: Constructor<Base>) {
  if ((baseClass as ObservableType<Base>).isObservable) {
    return baseClass as ObservableType<Base>;
  }
  abstract class ObservableImp extends (baseClass as Constructor<{}>)
    implements ObservableDeclaration {
    public static readonly isObservable = true;

    static observeProperty(key: PropertyKey) {
      let get: (target: any) => unknown;
      let set: (target: any, value: unknown) => void;
      if (key in baseClass.prototype) {
        const superPropertyDescriptor = getPropertyDescriptor(
          baseClass.prototype,
          key
        )!;
        if (
          superPropertyDescriptor.get === undefined ||
          superPropertyDescriptor.set === undefined
        ) {
          throw new Error(
            "Unable to observe a base class property that does not have a getter and setter"
          );
        }
        get = target => superPropertyDescriptor.get!.call(target);
        set = (target, value) =>
          superPropertyDescriptor.set!.call(target, value);
      } else {
        const privateKey = typeof key === "symbol" ? Symbol() : `__${key}`;
        get = target => target[privateKey];
        set = (target, value) => (target[privateKey] = value);
      }
      Object.defineProperty(this.prototype, key, {
        get() {
          return get(this);
        },
        set(value) {
          const oldValue = get(this);
          set(this, value);
          this.propertyChangedCallback(key, oldValue, value);
        },
        configurable: true,
        enumerable: true
      });
    }
    abstract propertyChangedCallback(
      key: PropertyKey,
      oldValue: unknown,
      value: unknown
    ): void;
  }
  return ObservableImp as ObservableType<Base>;
}

function getPropertyDescriptor(target: any, key: PropertyKey) {
  while (!target.hasOwnProperty(key)) {
    target = Object.getPrototypeOf(target);
  }
  return Object.getOwnPropertyDescriptor(target, key);
}
