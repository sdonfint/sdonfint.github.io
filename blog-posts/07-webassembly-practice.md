# WebAssembly 实战

## 适用场景

高性能计算、图像处理、音视频编解码。

## JS 调用

```js
const wasm = await WebAssembly.instantiateStreaming(fetch("app.wasm"));
console.log(wasm.instance.exports.add(2, 3));
```

## 注意事项

### 数据拷贝成本

跨边界传递大对象时要评估内存拷贝开销。
