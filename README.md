# observeProperty

Wire in to property changes on an object

## Installation

```bash
npm install observe-property --save
```

## Basic Usage

```js
import { observeProperty } from "@hogbros/observed-properties";

const myObject = {
  myObservedProperty: "foo";
};
observeProperty(
  myObject,
  "myObservedProperty",
  (target, oldValue, newValue) => console.log(
    `myObservedProperty changed from ${oldValue} to ${value}`
  )
);
myObject.myObservedProperty = "bar";
// console: myObservedProperty changed from foo to bar
```

## How it Works

observeProperty will dynamically create, a property getter/setter on the specified object. The setter on this property will invoke a callback method to notify of any updates on the property.
