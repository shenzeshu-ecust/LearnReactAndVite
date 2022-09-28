// 1 内联 变量声明
// 这样的变量只在循环中可见
for (let i = 0; i < 3; i++) {
  alert(i); // 0, 1, 2
}
alert(i); // 错误，没有这个变量。

// ~ 2 除了定义一个变量，我们也可以使用现有的变量：

let i = 0;

for (i = 0; i < 3; i++) {
  // 使用现有的变量
  alert(i); // 0, 1, 2
}

alert(i); //3，可见，因为是在循环之外声明的

// 3 for 循环的任何语句段都可以被省略。
let i = 0; // 我们已经声明了 i 并对它进行了赋值
for (; i < 3; i++) {
  // 不再需要 "begin" 语句段
  alert(i); // 0, 1, 2
}
// 我们也可以移除 step 语句段：
let i = 0;

for (; i < 3; ) {
  alert(i++);
}
// ! 实际上我们可以删除所有内容，从而创建一个无限循环：
for (;;) {
  // ! 请注意 for 的两个 ; 必须存在，否则会出现语法错误。
  // 无限循环
}

// 4 跳出循环
// break -- while
let m = 0;
while (m++ < 5) {
  if (m === 3) break;
  console.log(m); // 1  2
}
// continue -- for
// 它不会停掉整个循环。而是停止当前这一次迭代，并强制启动新一轮循环（如果条件允许的话）。

// test

// 以下两个循环的 alert 值是否相同？
// 1 前缀形式 ++i
let i = 0;
while (++i < 5) alert(i); // 1 2 3 4

// 2 后缀形式 i++
// ! 后缀形式 i++ 递增 i 然后返回 旧 值
let i = 0;
while (i++ < 5) alert(i); // 1 2 3 4 5
/*
    第一次 while(0 < 5) alert(1)
    alert 调用是独立的。这是在递增和比较之后执行的另一条语句。因此它得到了当前的 i = 1。
    
    我们在 i = 4 时暂停，前缀形式 ++i 会递增 i 并在比较中使用新值 5。但我们这里是后缀形式 i++。因此，它将 i 递增到 5，但返回旧值。
    因此实际比较的是 while(4 < 5) —— true，程序继续执行 alert。
*/

// for循环
for (let i = 0; i < 5; i++) alert(i);
for (let i = 0; i < 5; ++i) alert(i);
// 结果是一样的
// ! 递增 i++ 与检查条件 i < 5 分开。这只是另一种写法。
