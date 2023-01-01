// 被代理对象
const data = { num: 1 };

let activeEffect;
// 副作用函数栈解决effect嵌套
const effectStack = [];

// WeakMap: targrt->Map
// Map: key->Set
// Set: Array<effectFn>
const bucket = new WeakMap();
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  },
});

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  const effectToRun = new Set();
  effects &&
    effects.forEach((fn) => {
      if (activeEffect !== fn) {
        effectToRun.add(fn);
      }
    });
  effectToRun &&
    effectToRun.forEach((fn) => {
      const {
        options: { scheduler },
      } = fn;
      // 调度器
      scheduler ? scheduler(fn) : fn();
    });
  return true;
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    const res = fn();
    effectStack.pop(effectFn);
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };

  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  } else {
    return effectFn;
  }
}

// 每次执行副作用函数之前将其从相关联的依赖集合中剔除，副作用函数执行完以后再重新收集依赖
function cleanup(effectFn) {
  for (const dep of effectFn.deps) {
    dep.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

// test scheduler
const jobQueue = new Set();
let isFlushing = false;
const p = Promise.resolve();
function flushJob() {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => jobQueue.forEach((job) => job())).finally(
    () => (isFlushing = false)
  );
}

// effect(
//   () => {
//     console.log(obj.num);
//   },
//   {
//     scheduler(fn) {
//       jobQueue.add(fn);
//       flushJob();
//     },
//   }
// );

function computed(getter) {
  let dirty = true;
  let value;
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      trigger(obj, "value");
    },
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, "value");
      return value;
    },
  };

  return obj;
}

function watch(source, cb, options) {
  // 监听属性可以为getter函数也可以是整个对象
  const getter = typeof source === "function" ? source : () => traverse(source);
  let newVal, oldVal;

  const job = () => {
    newVal = effectFn();
    cb(newVal, oldVal);
    oldVal = newVal;
  };

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if ((options.flush = "post")) {
        Promise.resolve().then(() => job());
      } else {
        job();
      }
    },
  });

  if (options.immediate) {
    job();
  } else {
    oldVal = effectFn();
  }
}

function traverse(source, seen = new Set()) {
  if (typeof source !== "object" || source === null || seen.has(source)) return;
  seen.add(source);
  for (const key in source) {
    if (Object.hasOwnProperty.call(source, key)) traverse(source[key], seen);
  }
}

watch(
  () => obj.num,
  (newVal, oldVal) => {
    console.log(newVal, "--", oldVal);
  },
  {
    immediate: true,
  }
);
setTimeout(() => {
  obj.num++;
}, 1000);
