# 深度学习入门

## 核心概念

神经网络可以看作一组可学习的函数组合。

## 训练流程

1. 前向传播
2. 计算损失
3. 反向传播
4. 参数更新

## Python 示例

```python
import torch
x = torch.randn(8, 16)
layer = torch.nn.Linear(16, 4)
print(layer(x).shape)
```
