import { onSet } from "../src/observe-property";
import { expect, spy } from "chai";

describe("onSet", function() {
  it(`correctly maintains values on an observed property`, function() {
    class MyClass {
      @onSet(() => {})
      myObservedProperty?: string;
    }
    const myObject = new MyClass();
    myObject.myObservedProperty = "bar";
    expect(myObject.myObservedProperty).to.deep.equal("bar");
  });
  it("persists an existing property getter/setter when observed", function() {
    const getterSpy = spy();
    const setterSpy = spy();
    class MyClass {
      myHiddenProperty?: string = "foo";

      @onSet(() => {})
      get myObservedProperty() {
        getterSpy();
        return this.myHiddenProperty;
      }
      set myObservedProperty(value) {
        (setterSpy as any)(value);
        this.myHiddenProperty = value;
      }
    }
    const myObject = new MyClass();

    expect(myObject)
      .property("myObservedProperty")
      .to.deep.equal("foo");
    expect(getterSpy).to.have.been.called();
    myObject.myObservedProperty = "bar";
    expect(setterSpy).to.have.been.called.with("bar");
  });
  it("fires a callback when an observed property is updated", function() {
    const observeSpy = spy();
    class MyClass {
      @onSet(observeSpy)
      myObservedProperty?: string;
    }
    const myObject = new MyClass();

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
    class MyClass extends Base {
      @onSet(() => {})
      myProperty: any;
    }

    const myObject = new MyClass();

    myObject.myProperty = "foo";
    expect(myObject)
      .to.have.property("myProperty")
      .that.deep.equals("foo");
    expect(myObject)
      .to.have.property("myWrappedProperty")
      .that.deep.equals("foo");
  });
});
