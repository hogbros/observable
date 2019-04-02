import { Observable } from "../src/observable";
import { expect, spy } from "chai";

describe("Observable", function() {
  it("should only create one Observable implementation per class hierarchy", function() {
    const myObservable = Observable(Object);
    expect(Observable(myObservable)).to.deep.equal(myObservable);
  });
  const propertyTypes = [
    { key: Symbol(), type: "Symbol" },
    { key: "myObservedProperty", type: "string" },
    { key: 0, type: "number" }
  ];
  propertyTypes.forEach(propertyType =>
    it(`correctly stores values on an observed ${
      propertyType.type
    } property`, function() {
      class MyObservable extends Observable<{}>(Object) {
        propertyChangedCallback() {}
      }
      MyObservable.observeProperty(propertyType.key);
      const myObservable = new MyObservable() as any;
      const myValue = {};
      myObservable[propertyType.key] = myValue;
      expect(myObservable[propertyType.key]).to.deep.equal(myValue);
    })
  );
  it("calls the propertyChangedCallback when an observed property is set", function() {
    const MyObservable = Observable(Object);
    MyObservable.observeProperty("myObservedProperty");
    const myObservable = new MyObservable() as any;
    const propertyChangedCallbackSpy = spy.on(
      myObservable,
      "propertyChangedCallback"
    );
    myObservable.myObservedProperty = "Value 1";
    expect(propertyChangedCallbackSpy).to.have.been.called.with(
      "myObservedProperty",
      undefined,
      "Value 1"
    );
    myObservable.myObservedProperty = "Value 2";
    expect(propertyChangedCallbackSpy).to.have.been.called.with(
      "myObservedProperty",
      "Value 1",
      "Value 2"
    );
  });
  it("maintains sub-hierarchy properties when observing them", function() {
    class MySubclass extends class {
      myWrappedProperty: any;
      get myProperty() {
        return this.myWrappedProperty;
      }
      set myProperty(value) {
        this.myWrappedProperty = value;
      }
    } {}
    class MyObservable extends Observable(MySubclass) {
      propertyChangedCallback() {}
    }
    MyObservable.observeProperty("myProperty");
    const myObservable = new MyObservable();
    const myValue = {};
    myObservable.myProperty = myValue;
    expect(myObservable)
      .to.have.property("myProperty")
      .that.deep.equals(myValue);
    expect(myObservable)
      .to.have.property("myWrappedProperty")
      .that.deep.equals(myValue);
  });
  it("fails when observing a base class property that does not have a getter and setter", function() {
    class MySubclass {
      myUnobservableProperty() {}
    }
    class MyObservable extends Observable(MySubclass) {
      propertyChangedCallback() {}
    }
    expect(() =>
      MyObservable.observeProperty("myUnobservableProperty")
    ).to.throw(
      "Unable to observe a base class property that does not have a getter and setter"
    );
  });
});
