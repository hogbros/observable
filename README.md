# observeProperty

[![build badge]][build url]
[![coverage badge]][build url]

Wire in to property changes on an object

## Installation

```bash
npm install @hogbros/observe-property --save
```

## Basic Usage

```js
import { observeProperty } from "@hogbros/observe-property";

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

observeProperty will dynamically create a property getter/setter on the specified object. The setter on this property will invoke a callback method to notify of any updates on the property.

[build url]: https://dev.azure.com/HogBros/Observe-Property/_build/latest?definitionId=15&branchName=feature/documentation_badges
[build badge]: https://img.shields.io/azure-devops/build/HogBros/93e5ea09-1097-48ed-a3d9-ad72bd9a5022/15/feature/documentation_badges.svg
[coverage badge]: https://img.shields.io/azure-devops/coverage/hogbros/observe-property/15/feature/documentation_badges.svg