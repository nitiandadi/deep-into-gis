---
title: 空间索引
description: 四叉树点索引的构建流程：节点结构、叶子定位、分裂与点的重新分配
---

# 空间索引

1. 空间索引的本质：按照一定的空间规则组织数据，使查询能够排除不相关的区域，减少需要检查的对象数量。
2. 空间索引的应用场景：在大量空间数据中定位目标对象，避免每次查询都遍历全部数据。
3. 常用的空间索引：四叉树、八叉树、规则网格索引、R-tree。

名词解释：

- 四叉树：在二维空间中，按区域中线将一个节点划分为四个子区域，并按需递归划分。
- 八叉树：在三维空间中，将一个节点划分为八个子空间。
- 规则网格索引：将空间划分为固定大小的网格，以网格单元组织对象。
- R-tree：用外接矩形逐层组织空间对象，节点范围可以相互重叠。

## 四叉树点索引的构建流程 {#从概念到代码-我的四叉树实现过程}

<p class="post-meta">2026-10-15 · GIS 核心概念 · C++ 四叉树实践</p>

本文讨论**点四叉树**的一种实现：每个节点对应一个轴对齐矩形，区域沿水平和垂直中线划分为四个子区域；点的 ID 仅保存在叶子节点中。构建索引时，依次确定点所属的叶子；目标叶子达到容量阈值时，先分裂并重新分配已有点，再尝试插入当前点。

根节点的范围通过遍历数据、分别求出 x 和 y 的最小值与最大值得到。下图以容量为 **4** 的简化示例演示一次分裂；工程示例使用的容量为 **100**。

![四叉树构建动图：依次插入点，叶子达到容量后分裂并重新分配已有点，再插入当前点](/images/spatial-index/quadtree-build-animation.gif)

### 1. 节点记录空间范围和点的归属

`QuadTreeNode` 保存当前区域的边界、叶子中点的 ID，以及四个子节点。未分裂的节点是叶子，保存属于该区域的点；分裂后的节点通过子节点表示更细的空间，原有点的 ID 转移到相应叶子。由此，每个已插入点在树中只有一个存放位置。

```cpp
// QuadTreeNode 中与空间划分有关的成员
double boundingBox[4]; // left、top、right、bottom
std::vector<int> featureIds;
QuadTreeNode* leftTopChild;
QuadTreeNode* rightTopChild;
QuadTreeNode* rightBottomChild;
QuadTreeNode* leftBottomChild;
```

`QuadTree` 统一保存原始点及根节点；节点只保存点的 ID。分裂时需要根据 ID 取回坐标，因此树还维护 `pointIndexes`，记录“ID → 原始点数组下标”的映射。这样可以按 ID 直接找到待分配的点，而不必扫描整份数据。

### 2. 按坐标递归定位叶子

在本文使用的屏幕坐标约定中，x 向右增大，y 向下增大。点处于节点区域内，当且仅当它的坐标位于四条边界之间：

```cpp
bool QuadTreeNode::Contains(const Point& point) const
{
    return point.x >= boundingBox[0] && point.x <= boundingBox[2]
        && point.y >= boundingBox[1] && point.y <= boundingBox[3];
}
```

定位从根节点开始。若当前节点已有子节点，就根据点与两条中线的关系选择唯一的子节点，并递归向下；遇到没有子节点的区域时，定位结束。

```cpp
QuadTreeNode* QuadTreeNode::FindLeaf(const Point& point)
{
    if (!leftTopChild && !rightTopChild && !rightBottomChild && !leftBottomChild)
        return this;

    const double midX = std::midpoint(boundingBox[0], boundingBox[2]);
    const double midY = std::midpoint(boundingBox[1], boundingBox[3]);

    QuadTreeNode* child;
    if (point.x < midX)
        child = point.y < midY ? leftTopChild : leftBottomChild;
    else
        child = point.y < midY ? rightTopChild : rightBottomChild;

    return child->FindLeaf(point);
}
```

中线同时属于相邻子区域的边界，因此需要确定唯一归属：`x == midX` 进入右侧，`y == midY` 进入下侧。分裂时也使用同一规则，保证定位路径与点的实际存放位置一致。代码片段聚焦于已处于根节点范围内的点，省略了范围外与异常处理。

### 3. 满叶子分裂后重新分配已有点

设叶子容量为 `M`。插入点时，先定位叶子；若当前点可直接存入，就将其 ID 加入该叶子。若叶子已有 `M` 个点，则将该叶子的区域四等分，建立四个子节点，再根据已有点的坐标逐一确定它们的新归属。

工程中的 `QuadTree::Split` 先通过叶子中的 ID 找回原始点，再由 `QuadTreeNode::Split` 建立子区域并分配这些点。创建子节点和设置范围之后，重新分配的核心部分如下：

```cpp
// nodePoints 是当前叶子中已有 ID 对应的原始点。
for (const Point* point : nodePoints)
{
    QuadTreeNode* child;
    if (point->x < midX)
        child = point->y < midY ? leftTopChild : leftBottomChild;
    else
        child = point->y < midY ? rightTopChild : rightBottomChild;

    child->Insert(*point);
}

featureIds.clear(); // 已有点转移到子节点。
```

分裂只重新安置**已存储的点**，触发分裂的当前点尚未插入。四个子区域建立后，该点重新定位目标叶子并尝试插入。若新的目标叶子也达到容量阈值，就继续分裂。构建主循环可以写为：

```cpp
QuadTree tree(points, 100);
for (const Point& point : points)
{
    while (!tree.Insert(point))
        tree.Split(point);
}
```

这里 `Insert` 在目标叶子已满且可以分裂时返回 `false`，不写入当前点；`Split` 重新分配该叶子的已有点。因此，循环的退出条件是**当前点已经成功插入**，之后才处理下一个点。图中从分裂返回“定位叶子”的箭头，表示的正是这一重试过程。

![四叉树构建流程图：定位叶子、判断容量、分裂重分配并重试当前点](/images/spatial-index/quadtree-build-flow.svg)

这一构建过程形成的空间层级也用于后续查询：某个节点区域与查询范围不相交时，可跳过该节点的整棵子树；相交时再继续访问子节点或检查叶子中的点。
