const MyPromise = require("./promise.js");

const arr = new MyPromise((resolve, reject) => {
  resolve(1)
})

arr.then(res => {
  console.log(1);
})
