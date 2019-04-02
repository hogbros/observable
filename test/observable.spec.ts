import { Observable } from "../src/observable";
import { expect, spy } from "chai";

describe("Observable", function() {
  it("should only create one Observable implementation per class hierarchy", function() {
    const myObservable = Observable(Object);
    expect(Observable(myObservable)).to.deep.equal(myObservable);
  });
  it("calls the propertyChangedCallback when an observed property is set", function() {
    const MyObservable = Observable(Object);
    MyObservable.observeProperty("myObservedProperty");
    const myObservable = new MyObservable();
    const propertyChangedCallbackSpy = spy.on(
      myObservable,
      "propertyChangedCallback"
    );
    (myObservable as any).myObservedProperty = "Value 1";
    expect(propertyChangedCallbackSpy).to.have.been.called.with(
      "myObservedProperty",
      undefined,
      "Value 1"
    );
    (myObservable as any).myObservedProperty = "Value 2";
    expect(propertyChangedCallbackSpy).to.have.been.called.with(
      "myObservedProperty",
      "Value 1",
      "Value 2"
    );
  });
});
