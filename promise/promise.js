const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2)
    return reject(new TypeError("Chaining cycle detected for promise"));
  if (
    Object.prototype.toString.call(x) === "[object Object]" ||
    Object.prototype.toString.call(x) === "[object Function]"
  ) {
    let called = false;
    try {
      const then = x.then;
      if (Object.prototype.toString.call(then) === "[object Function]") {
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}
class MyPromise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.fulfillCallback = [];
    this.rejectCallback = [];

    const resolve = (value) => {
      if (value instanceof MyPromise) {
        return value.then(resolve, reject);
      }
      if (this.status !== PENDING) return;
      this.status = FULFILLED;
      this.value = value;
      while (this.fulfillCallback.length) {
        this.fulfillCallback.shift()();
      }
    };
    const reject = (reson) => {
      if (this.status !== PENDING) return;
      this.status = REJECTED;
      this.reason = reson;
      while (this.rejectCallback.length) {
        this.rejectCallback.shift()();
      }
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  static resolve(value) {
    return new MyPromise((resolve, reject) => {
      resolve(value);
    });
  }
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
  static race(values) {
    return new MyPromise((resolve, reject) => {
      for (let idx = 0; idx < values.length; idx++) {
        MyPromise.resolve(ele).then(resolve, reject);
      }
    });
  }

  static all(values) {
    const resultArr = [];
    let times = 0;

    return new MyPromise((resolve, reject) => {
      function processData(idx, data) {
        resultArr[idx] = data;
        if (++times === values.length) {
          resolve(resultArr);
        }
      }
      for (let idx = 0; idx < values.length; idx++) {
        const ele = values[idx];
        // console.log(ele);
        MyPromise.resolve(ele)
          .then((res) => {
            processData(idx, res);
          })
          .catch(reject);
      }
    });
  }
  catch(errorCallback) {
    this.then(null, errorCallback);
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (e) => {
            throw e;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      } else {
        this.fulfillCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.rejectCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });
    return promise2;
  }
}

MyPromise.deferred = function () {
  const dfd = {};
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = MyPromise;
