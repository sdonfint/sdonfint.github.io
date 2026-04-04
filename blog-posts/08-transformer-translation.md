# Attention Is All You Need 阅读

## 核心思想

用自注意力替代循环结构，提高并行效率。

## 关键模块

- Multi-Head Attention
- Feed Forward
- Positional Encoding

## 公式片段

```text
Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V
```
