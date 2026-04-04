# Rust 学习笔记

## 所有权

Rust 通过所有权系统在编译期保证内存安全。

## 借用规则

- 同一时刻只能有一个可变引用
- 或者多个不可变引用

## 示例

```rust
fn main() {
    let s = String::from("hello");
    println!("{}", s);
}
```
