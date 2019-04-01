export function Observable<Base>(baseClass: Constructor<Base>) {
  type Observable = typeof ObservableMixin &
    Constructor<ObservableMixin & Base>;
  if ((baseClass as Observable).isObservable) {
    return baseClass as Observable;
  }
  abstract class ObservableMixin extends (baseClass as Constructor<{}>) {
    public static readonly isObservable = true;

    static observeProperty(key: PropertyKey) {
      let propertyDeclaration: PropertyDescriptor & ThisType<ObservableMixin>;
      if (key in baseClass.prototype) {
        propertyDeclaration = {
          get() {
            return super[key];
          },
          set(value) {
            const oldValue = super[key];
            super[key] = value;
            this.propertyChangedCallback(key, oldValue, value);
          }
        };
      } else {
        const privateKey = typeof key === "symbol" ? Symbol() : `__${key}`;
        propertyDeclaration = {
          get() {
            return (this as any)[privateKey];
          },
          set(value) {
            const oldValue = (this as any)[privateKey];
            (this as any)[privateKey] = value;
            this.propertyChangedCallback(key, oldValue, value);
          }
        };
      }
      propertyDeclaration.configurable = true;
      propertyDeclaration.enumerable = true;
      Object.defineProperty(this.prototype, key, propertyDeclaration);
    }
    abstract propertyChangedCallback(
      key: PropertyKey,
      oldValue: unknown,
      value: unknown
    ): void;
  }
  return ObservableMixin as Observable;
}
