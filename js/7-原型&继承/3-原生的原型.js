// ! 1 Object.prototype
// 简短的表达式 obj = {} 和 obj = new Object() 是一个意思

// 当 new Object() 被调用（或一个字面量对象 {...} 被创建），这个对象的 [[Prototype]] 属性被设置为 Object.prototype：
let obj = {};
console.log(obj.__proto__ === Object.prototype); // true
console.log(obj.toString === Object.prototype.toString); // true
console.log(obj.toString === obj.__proto__.toString); // true
// ~ Object.prototype 上方的链中没有更多的 [[Prototype]]：
console.log(Object.prototype.__proto__); // ~ null

// ! 2 其他内建原型
/*
    * 其他内建对象，像 Array、Date、Function 及其他，都在 prototype 上挂载了方法。

    * 例如，当我们创建一个数组 [1, 2, 3]，在内部会默认使用 new Array() 构造器。
    * 因此 Array.prototype 变成了这个数组的 prototype，并为这个数组提供数组的操作方法。这样内存的存储效率是很高的。

    ~ 按照规范，所有的内建原型顶端都是 Object.prototype。这就是为什么有人说“一切都从对象继承而来”。
*/
let arr = [1, 2, 3];

// 它继承自 Array.prototype？
console.log(arr.__proto__ === Array.prototype); // true

// 接下来继承自 Object.prototype？
console.log(arr.__proto__.__proto__ === Object.prototype); // true

// 原型链的顶端为 null。
console.log(arr.__proto__.__proto__.__proto__); // null

// ~ 其他内建对象也以同样的方式运行。即使是函数 —— 它们是内建构造器 Function 的对象，并且它们的方法（call/apply 及其他）都取自 Function.prototype。函数也有自己的 toString 方法。
function f() {}

console.log(f.__proto__ == Function.prototype); // true
console.log(f.__proto__.__proto__ == Object.prototype); // true，继承自 Object
/*

* 所有的内建对象都遵循相同的模式（pattern）：

    ~ 1 方法都存储在 prototype 中（Array.prototype、Object.prototype、Date.prototype 等）。
    ~ 2 对象本身只存储数据（数组元素、对象属性、日期）。

*/

// ! 3 基本数据类型的原型对象
/*
最复杂的事情发生在字符串、数字和布尔值上。

    正如我们记忆中的那样，它们并不是对象。
    ~ 但是如果我们试图访问它们的属性，那么临时包装器对象将会通过内建的构造器 String、Number 和 Boolean 被创建。它们提供给我们操作字符串、数字和布尔值的方法然后消失。

    这些对象对我们来说是无形地创建出来的。大多数引擎都会对其进行优化，但是规范中描述的就是通过这种方式。
    ~ 这些对象的方法也驻留在它们的 prototype 中，可以通过 String.prototype、Number.prototype 和 Boolean.prototype 进行获取。

*/
console.log(String.prototype); // {}

// ! 4 值 null 和 undefined 没有对象包装器

// 特殊值 null 和 undefined 比较特殊。它们没有对象包装器，所以它们没有方法和属性。并且它们也没有相应的原型。

// ! 5 可以更改原生原型(不建议，除了polyfilling)
// 例如，我们向 String.prototype 中添加一个方法，这个方法将对所有的字符串都是可用的：
String.prototype.show = function () {
  console.log(this);
};

"BOOM!".show(); // BOOM!

/*
~ 原型是全局的，所以很容易造成冲突。如果有两个库都添加了 String.prototype.show 方法，那么其中的一个方法将被另一个覆盖。
所以，通常来说，修改原生原型被认为是一个很不好的想法。

*/

// ~ 在现代编程中，只有一种情况下允许修改原生原型。那就是 polyfilling。
// Polyfilling 是一个术语，表示某个方法在 JavaScript 规范中已存在，但是特定的 JavaScript 引擎尚不支持该方法，那么我们可以通过手动实现它，并用以填充内建原型。
if (!String.prototype.repeat) {
  // 如果这儿没有这个方法
  // 那就在 prototype 中添加它

  String.prototype.repeat = function (n) {
    // 重复传入的字符串 n 次

    // 实际上，实现代码比这个要复杂一些（完整的方法可以在规范中找到）
    // 但即使是不够完美的 polyfill 也常常被认为是足够好的
    return new Array(n + 1).join(this);
  };
}

console.log("La".repeat(3)); // LaLaLa

// ! 6 从原型中借用
// 在 装饰器模式和转发，call/apply 一章中，我们讨论了方法借用。那是指我们从一个对象获取一个方法，并将其复制到另一个对象。

// 一些原生原型的方法通常会被借用。例如，如果我们要创建类数组对象，则可能需要向其中复制一些 Array 方法。
let obj2 = {
  0: "Hello",
  1: "world!",
  length: 2,
};

obj2.join = Array.prototype.join;

console.log(obj2.join(",")); // Hello,world!

/*
上面这段代码有效，是因为内建的方法 join 的内部算法只关心正确的索引和 length 属性。它不会检查这个对象是否是真正的数组。许多内建方法就是这样。

~ 另一种方式是通过将 obj.__proto__ 设置为 Array.prototype，这样 Array 中的所有方法都自动地可以在 obj 中使用了。

~ 但是如果 obj 已经从另一个对象进行了继承，那么这种方法就不可行了
~ 我们一次只能继承一个对象。
*/

// TEST
// 给函数添加一个 "f.defer(ms)" 方法
Function.prototype.defer = function (ms) {
  setTimeout(this, ms); // this就是函数本身，就是  .前面的函数
};
function f() {
  console.log("Hello!");
}

f.defer(1000); // 1 秒后显示 "Hello!"

// 在所有函数的原型中添加 defer2(ms) 方法，该方法返回一个包装器，将函数调用延迟 ms 毫秒
Function.prototype.defer2 = function (ms) {
  let f = this;
  function fn(...args) {
    setTimeout(() => f.apply(this, args), ms);
  }
  return fn;
};

// check it
function f2(a, b) {
  console.log(a + b);
}

f2.defer2(1000)(1, 2); // 1 秒后显示 3
