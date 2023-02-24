// 1 async function
// ! 在函数前面的 “async” 这个单词表达了一个简单的事情：即这个函数总是返回一个 promise。其他值将自动被包装在一个 resolved 的 promise 中。
async function f() {
  return 1;
}
f().then(console.log); // 1

// 也可以显示的 返回一个promise，结果一样~
async function f() {
  return Promise.resolve(1);
}

f().then(console.log); // 1
// ~ 所以说，async 确保了函数返回一个 promise，也会将非 promise 的值包装进去。

// 2 await
// 只在 async 函数内工作
// let value = await promise;

// ! 关键字 await 让 JavaScript 引擎等待直到 promise 完成（settle）并返回结果。

async function fc() {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), 1000);
  });

  let result = await promise; // 等待，直到 promise resolve (*)

  console.log(result); // "done!"
}

fc();

/*
~ 让我们强调一下：await 实际上会暂停函数的执行，直到 promise 状态变为 settled，然后以 promise 的结果继续执行。
~ 这个行为不会耗费任何 CPU 资源，因为 JavaScript 引擎可以同时处理其他任务：执行其他脚本，处理事件等。

相比于 promise.then，它只是获取 promise 的结果的一个更优雅的语法。并且也更易于读写。

*/

// ! 现代浏览器在 modules 里允许顶层的 await
// 我们假设此代码在 module 中的顶层运行
let response = await fetch("/article/promise-chaining/user.json");
let user = await response.json();

console.log(user);
// 如果我们没有使用 modules，或者必须兼容 旧版本浏览器 ，那么这儿还有一个通用的方法：包装到匿名的异步函数中。
// 像这样：

(async () => {
  let response = await fetch("/article/promise-chaining/user.json");
  let user = await response.json();
  // ...
})();

// ! await 接受 “thenables”
// ~ 第三方对象可能不是一个 promise，但却是 promise 兼容的：如果这些对象支持 .then，那么就可以对它们使用 await。
class Thenable {
  constructor(num) {
    this.num = num;
  }
  then(resolve, reject) {
    // * 有then方法 且提供了两个参数
    console.log(resolve);
    // 1000ms 后使用 this.num*2 进行 resolve
    setTimeout(() => resolve(this.num * 2), 1000); // (*)
  }
}

async function func() {
  // 等待 1 秒，之后 result 变为 2
  let result = await new Thenable(1);
  console.log(result);
}

func();
/*
    如果 await 接收了一个非 promise 的但是提供了 .then 方法的对象，它就会调用这个 .then 方法，
    并将内建的函数 resolve 和 reject 作为参数传入（就像它对待一个常规的 Promise executor 时一样）。
    然后 await 等待直到这两个函数中的某个被调用（在上面这个例子中发生在 (*) 行），然后使用得到的结果继续执行后续任务。
*/

// ! Class 中的 async 方法
class Waiter {
  // ~ 要声明一个 class 中的 async 方法，只需在对应方法前面加上 async 即可：
  async wait() {
    return await Promise.resolve(1);
  }
}

new Waiter().wait().then(console.log); // 1（alert 等同于 result => console.log(result)）

// 3 Error处理
// 如果一个 promise 正常 resolve，await promise 返回的就是resolve其结果。
// ~ 但是如果 promise 被 reject，它将 throw 这个 error，就像在这一行有一个 throw 语句那样。
async function ff() {
  await Promise.reject(new Error("Whoops!"));
}
// 等同于
async function fff() {
  throw new Error("Whoops!");
}

// ~ 我们可以用 try..catch 来捕获上面提到的那个 error，与常规的 throw 使用的是一样的方式：
async function A() {
  try {
    let response = await fetch("http://no-sucn-url");
    let user = await response.json();
  } catch (error) {
    console.log(error); // 捕获到 fetch 和 response.json 中的错误
  }
}
A();

// ~ 如果不用try catch, 那么异步函数B 的调用生成的promise将变化为 rejected。我们可以在函数调用后面加.catch来处理这个error
async function B() {
  await Promise.reject(new Error("---"));
}
B().catch(console.log); // --- （*）顶层代码中可以用这种方法捕获错误，用then 获取结果

// 如果我们忘了在这添加 .catch，那么我们就会得到一个未处理的 promise error（可以在控制台中查看）。
// 我们可以使用在 使用 promise 进行错误处理 一章中所讲的全局事件处理程序 unhandledrejection 来捕获这类 error。

/*
* async/await 和 promise.then/catch

    当我们使用 async/await 时，几乎就不会用到 .then 了，因为 await 为我们处理了等待。并且我们使用常规的 try..catch 而不是 .catch。这通常（但不总是）更加方便。
    ~ 但是当我们在代码的顶层时，也就是在所有 async 函数之外，我们在语法上就不能使用 await 了，所以这时候通常的做法是添加 .then/catch 来处理最终的结果（result）或掉出来的（falling-through）error，例如像上面那个例子中的 (*) 行那样。


*/

// ! async/await 可以和 Promise.all 一起使用
// 等待结果数组
let results = await Promise.all([
  fetch(url1),
  fetch(url2),
  // ...
]);
// 如果出现 error，也会正常传递，从失败了的 promise 传到 Promise.all，然后变成我们能通过使用 try..catch 在调用周围捕获到的异常（exception）。

/*
 * 函数前面的关键字 async 有两个作用：

   1 让这个函数总是返回一个 promise。
   2 允许在该函数内使用 await。

 * Promise 前的关键字 await 使 JavaScript 引擎等待该 promise settle，然后：

   1 如果有 error，就会抛出异常 —— 就像那里调用了 throw error 一样。
   2 否则，就返回结果。

这两个关键字一起提供了一个很好的用来编写异步代码的框架，这种代码易于阅读也易于编写。

 * 有了 async/await 之后，我们就几乎不需要使用 promise.then/catch，但是不要忘了它们是基于 promise 的，因为有些时候（例如在最外层作用域）我们不得不使用这些方法。并且，当我们需要同时等待需要任务时，Promise.all 是很好用的。
 */

// TEST
// 用async await重写代码
function loadJson(url) {
  return fetch(url).then((response) => {
    if (response.status == 200) {
      return response.json();
    } else {
      throw new Error(response.status);
    }
  });
}

async function loadJson(url) {
  let response = await fetch(url);
  /**
   * 我们可以返回 return response.json() 而不用等待它，像这样:

    if (response.status == 200) {
    return response.json(); // (3)
    }

    然后外部的代码就必须 await 这个 promise resolve。在本例中它无关紧要。
   */
  if (response.status == 200) {
    return await response.json();
  }
  throw new Error(response.status);
}

loadJson("https://javascript.info/no-such-user.json").catch(console.log); // Error: 404
// loadJson 抛出的 error 被 .catch 处理了。在这儿我们我们不能使用 await loadJson(…)，因为我们不是在一个 async 函数中。
