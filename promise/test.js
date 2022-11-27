const MyPromise = require("./promise.js");

const arr = MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.resolve(2),
  MyPromise.resolve(MyPromise.resolve(3)),
]);
arr.then((arr) => console.log(arr)).catch((e) => console.log(e));
