import { Observable } from "../src/observable";
import { assert } from "chai";

describe("Observable", function() {
    it("should only create one Observable implementation per class hierarchy", function() {
        const myObservable = Observable(Object);
        assert.strictEqual(Observable(myObservable), myObservable);
    });
});