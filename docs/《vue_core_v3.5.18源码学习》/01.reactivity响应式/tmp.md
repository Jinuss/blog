---
title: tmp
date: 2025-08-20 11:29:33
permalink: /pages/30d3cf/
categories:
  - 5.18源码学习》
  - reactivity响应式
tags:
  - 
author: 
  name: 东流
  link: https://github.com/Jinuss
---
### JavaScript Map、Set、WeakMap、WeakSet 方法对比表

以下是四种集合类型的方法和属性完整对比：

| **方法**           | **Map**          | **Set**         | **WeakMap** | **WeakSet** |
| ------------------ | ---------------- | --------------- | ----------- | ----------- |
| `.size`            | ✅                | ✅               | ❌           | ❌           |
| `.set(key, value)` | ✅                | -               | ✅           | -           |
| `.get(key)`        | ✅                | -               | ✅           | -           |
| `.has(key)`        | ✅                | ✅               | ✅           | ✅           |
| `.delete(key)`     | ✅                | ✅               | ✅           | ✅           |
| `.clear()`         | ✅                | ✅               | ❌           | ❌           |
| `.add(value)`      | -                | ✅               | -           | ✅           |
| `.keys()`          | ✅                | ✅               | ❌           | ❌           |
| `.values()`        | ✅                | ✅               | ❌           | ❌           |
| `.entries()`       | ✅                | ✅               | ❌           | ❌           |
| `.forEach()`       | ✅                | ✅               | ❌           | ❌           |
| `Symbol.iterator`  | ✅ (同`.entries`) | ✅ (同`.values`) | ❌           | ❌           |

### 使用示例对比

#### Map - 键值对集合
```javascript
const map = new Map();
const key = { id: 1 };

// 基本操作
map.set('name', 'Alice');
map.set(key, 25);
console.log(map.get('name')); // 'Alice'
console.log(map.size);       // 2

// 迭代
map.forEach((value, key) => {
  console.log(key, value); // 'name' 'Alice', {...} 25
});

// 转换
console.log([...map]); // [['name', 'Alice'], [{...}, 25]]
```

#### Set - 唯一值集合
```javascript
const set = new Set([1, 2, 2, 3]); // 自动去重
console.log(set.size); // 3

// 基本操作
set.add(4).add(1); 
console.log(set.has(4)); // true
set.delete(2);

// 迭代
for (const num of set) {
  console.log(num); // 1, 3, 4
}

// 转换数组
console.log([...set]); // [1, 3, 4]
```

#### WeakMap - 弱引用键值对
```javascript
const weakMap = new WeakMap();
let obj = { id: 1 };

weakMap.set(obj, 'data');
console.log(weakMap.get(obj)); // 'data'

obj = null; // 内存中会销毁obj的引用，weakMap中的条目自动移除
```

#### WeakSet - 弱引用对象集合
```javascript
const weakSet = new WeakSet();
let obj1 = { id: 1 };
let obj2 = { id: 2 };

weakSet.add(obj1).add(obj2);
console.log(weakSet.has(obj1)); // true

obj1 = null; // 内存中会销毁obj1的引用，自动从weakSet移除
```

### 关键特性说明

1. **强引用 vs 弱引用**：
   - Map/Set 保持强引用，防止键被 GC
   - WeakMap/WeakSet 允许键被垃圾回收（内存敏感场景适用）

2. **迭代与可见性**：
   - Map/Set 暴露所有条目且可枚举
   - WeakMap/WeakSet 隐藏内部结构（安全优势）

3. **使用场景**：
   ```mermaid
   graph LR
   A[键类型] --> B{对象值？}
   B -->|是| C{需要值存储？}
   C -->|是| D(WeakMap)
   C -->|否| E(WeakSet)
   B -->|否| F{键需要保护？}
   F -->|是| G(Map)
   F -->|否| H(Set)
   ```

4. **内存管理差异**：
   - Map 可能导致内存泄漏（保持键不被释放）
   - WeakMap 当键无其他引用时自动释放内存

### 使用建议
- **私有数据存储** → WeakMap/WeakSet
- **高频缓存** → Map
- **去重集合** → Set
- **DOM节点关联** → WeakMap（避免内存泄漏）