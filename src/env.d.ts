interface Constructor<T> {
    new(...args: unknown[]): T;
    prototype: T;
}