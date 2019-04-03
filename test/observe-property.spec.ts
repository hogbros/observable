import { observeProperty } from "../src/observe-property";
import { expect, spy } from "chai";

describe("observeProperty", function() {
  const propertyTypes = [
    { key: Symbol(), type: "Symbol" },
    { key: "myObservedProperty", type: "string" },
    { key: 0, type: "number" }
  ];
  propertyTypes.forEach(({ key, type }) =>
    it(`correctly maintains values on an observed ${type} property`, function() {
      const myObject = { [key]: "foo" } as any;
      observeProperty(myObject, key, () => {});
      expect(myObject[key]).to.deep.equal("foo");
      myObject[key] = "bar";
      expect(myObject[key]).to.deep.equal("bar");
    })
  );
  it("persists an existing property getter/setter when observed", function() {
    const property: PropertyDescriptor & ThisType<any> = {
      get() {
        return this.myHiddenProperty;
      },
      set(value) {
        this.myHiddenProperty = value;
      },
      configurable: true
    };
    const getterSpy = spy.on(property, "get");
    const setterSpy = spy.on(property, "set");
    const myObject: {
      myHiddenProperty?: string;
      myObservedProperty?: string;
    } = { myHiddenProperty: "foo" };
    Object.defineProperty(myObject, "myObservedProperty", property);
    observeProperty(myObject, "myObservedProperty", () => {});

    expect(myObject)
      .property("myObservedProperty")
      .to.deep.equal("foo");
    expect(getterSpy).to.have.been.called();
    myObject.myObservedProperty = "bar";
    expect(setterSpy).to.have.been.called.with("bar");
  });
  it("fires a callback when an observed property is updated", function() {
    const myObject: { myObservedProperty?: string } = {};
    const observeSpy = spy();
    observeProperty(myObject, "myObservedProperty", observeSpy);
    myObject.myObservedProperty = "foo";
    expect(observeSpy).to.have.been.called.with(myObject, undefined, "foo");
    myObject.myObservedProperty = "bar";
    expect(observeSpy).to.have.been.called.with(myObject, "foo", "bar");
  });
  it("maintains sub-hierarchy properties when observing them", function() {
    class Base {
      myWrappedProperty: any;
      get myProperty() {
        return this.myWrappedProperty;
      }
      set myProperty(value) {
        this.myWrappedProperty = value;
      }
    }
    const myObject = new Base();
    observeProperty(myObject, "myProperty", () => {});
    myObject.myProperty = "foo";
    expect(myObject)
      .to.have.property("myProperty")
      .that.deep.equals("foo");
    expect(myObject)
      .to.have.property("myWrappedProperty")
      .that.deep.equals("foo");
  });
});
