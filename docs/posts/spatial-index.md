---
title: 空间索引
description: 四叉树点索引的构建与矩形范围查询：节点划分、相交剪枝和叶子点筛选
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

根节点的范围通过遍历数据、分别求出 x 和 y 的最小值与最大值得到。交互演示页面可切换数据分布和叶子容量，使用自动播放、时间轴或逐步操作观察点的插入、节点分裂与重新分配；工程示例使用的容量为 **100**。

<a href="/deep-into-gis/interactive/quadtree-interactive.html">单独打开完整演示</a>

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

## 四叉树的矩形范围查询

点定位每层只选择一个子节点；矩形范围可能同时覆盖多个子区域，因此范围查询需要保留所有可能包含结果的分支。查询不改变已有的四叉树结构，而是依次执行**范围求交、候选子树递归、叶子点筛选**。节点范围用于排除不相关区域，点坐标用于确定最终结果。

下面的交互动画展示最小相关节点的定位、递归访问、子树剪枝和叶子点筛选。可拖动查询矩形，也可切换点分布、叶子容量、查询预设，并使用逐步播放或时间轴观察过程。动画使用少量示意点以便辨认节点；文末性能对比另用 10 万个点。

<a href="/deep-into-gis/interactive/quadtree-range-query.html" target="_blank" rel="noopener noreferrer">单独打开范围查询动画</a>

### 1. 求查询范围与当前节点的交集

从根节点开始，将查询矩形与当前节点的边界求交。若两者不相交，该节点及其后代都不可能包含结果，可以直接跳过。在本文采用的 y 向下增大的坐标约定中，交集的左边界与上边界取较大值，右边界与下边界取较小值：

```cpp
const BoundingBox nodeBounds = node.getBounds();
const BoundingBox overlap{
    std::max(nodeBounds.left, range.left),
    std::max(nodeBounds.top, range.top),
    std::min(nodeBounds.right, range.right),
    std::min(nodeBounds.bottom, range.bottom)
};

if (overlap.left > overlap.right || overlap.top > overlap.bottom)
    return std::nullopt;
```

交集只用于缩小搜索区域。即使查询矩形超出根节点范围，也只需在它与根节点重叠的部分继续查找；递归进入子节点后，重复同样的求交判断。

### 2. 根据中线选择候选子树

当前节点不是叶子时，以其水平、垂直中线判断交集涉及哪些象限。只涉及一个象限时，可以沿该子节点继续下降；涉及两个或四个象限时，当前节点就是容纳该交集的最小已有节点，后续分别访问相交的子树。

```cpp
std::vector<QuadTree::Quadrant> QuadTree::GetOverlappingQuadrants(
    const BoundingBox& range, const QuadTreeNode& node) const
{
    const auto overlap = IntersectNodeBounds(range, node);
    if (!overlap)
        return {};

    const BoundingBox nodeBounds = node.getBounds();
    const double midX = std::midpoint(nodeBounds.left, nodeBounds.right);
    const double midY = std::midpoint(nodeBounds.top, nodeBounds.bottom);

    const bool left   = overlap->left < midX;
    const bool right  = overlap->right >= midX;
    const bool top    = overlap->top < midY;
    const bool bottom = overlap->bottom >= midY;

    std::vector<Quadrant> quadrants;
    if (left && top)     quadrants.push_back(Quadrant::LeftTop);
    if (right && top)    quadrants.push_back(Quadrant::RightTop);
    if (right && bottom) quadrants.push_back(Quadrant::RightBottom);
    if (left && bottom)  quadrants.push_back(Quadrant::LeftBottom);
    return quadrants;
}
```

这里的 `quadrants` 是当前节点需要考虑的象限列表。沿用建树时的边界归属规则：中线上的点存入右侧或下侧子节点。查询矩形的边界也包含在查询范围内，因此当它的右边界恰好落在中线上时，左右两侧都可能需要检查。

寻找查询起点时，只要交集仍落在单个象限，就递归下降；一旦跨越中线，返回当前节点，随后再从这里分支搜索。这是定位“最小相关节点”的核心递归：

```cpp
const QuadTreeNode* QuadTree::FindSmallestContainingNode(
    const QuadTreeNode& node, const BoundingBox& range) const
{
    const auto overlap = IntersectNodeBounds(range, node);
    if (!overlap)
        return nullptr;
    if (node.IsLeaf())
        return &node;

    const auto quadrants = GetOverlappingQuadrants(*overlap, node);
    if (quadrants.size() != 1)
        return &node;

    const QuadTreeNode* child = GetChild(node, quadrants.front());
    return child ? FindSmallestContainingNode(*child, *overlap) : &node;
}
```

### 3. 在相交叶子中检查点

从最小相关节点开始，对每个节点先做相交判断。内部节点仅递归访问与查询矩形相交的子节点；叶子节点则根据保存的点 ID 取回坐标，逐点判断是否位于查询矩形内。核心递归如下，省略了数据一致性异常处理：

```cpp
void QuadTree::CollectPointsInRange(const QuadTreeNode& node,
                                    const BoundingBox& range,
                                    std::vector<Point>& result) const
{
    const auto overlap = IntersectNodeBounds(range, node);
    if (!overlap)
        return;

    if (node.IsLeaf())
    {
        for (int id : node.getFeatureIds())
        {
            const Point* point = FindPoint(id);
            if (point->x >= range.left && point->x <= range.right
                && point->y >= range.top && point->y <= range.bottom)
                result.push_back(*point);
        }
        return;
    }

    for (Quadrant quadrant : GetOverlappingQuadrants(*overlap, node))
        if (const QuadTreeNode* child = GetChild(node, quadrant))
            CollectPointsInRange(*child, range, result);
}
```

公开的查询接口先定位起点，再调用上面的递归收集函数：

```cpp
std::vector<Point> QuadTree::QueryRange(const BoundingBox& range) const
{
    std::vector<Point> result;
    const QuadTreeNode* start = FindSmallestContainingNode(*root, range);
    if (start)
        CollectPointsInRange(*start, range, result);
    return result;
}
```

节点范围与查询矩形相交，只表示该子树**可能**包含结果；叶子中的点仍需进行一次精确坐标判断。这样，查询结果只包含已插入索引且实际位于矩形内的点，也避免了逐一检查整份原始数据。

### 4. 与全量遍历使用同一查询范围

构建索引后，可用同一个矩形分别查询原始点数组和四叉树。全量遍历检查每个点；四叉树从相关节点出发，只检查相交叶子中的点。两者使用相同的闭区间边界条件：

```cpp
std::vector<Point> FullScanQuery(const std::vector<Point>& points,
                                 const BoundingBox& range)
{
    std::vector<Point> result;
    for (const Point& point : points)
        if (point.x >= range.left && point.x <= range.right
            && point.y >= range.top && point.y <= range.bottom)
            result.push_back(point);
    return result;
}

// points 已读取，tree 已插入全部点。
const BoundingBox range{200.0, 200.0, 400.0, 400.0};
auto scanned = FullScanQuery(points, range);
auto indexed = tree.QueryRange(range);

auto ids = [](const std::vector<Point>& result) {
    std::vector<int> values;
    for (const Point& point : result)
        values.push_back(point.id);
    std::sort(values.begin(), values.end());
    return values;
};
assert(ids(scanned) == ids(indexed));
```

比较点 ID 前先排序，是因为两种方法的遍历顺序不同。全量遍历每次都检查全部 `N` 个点；四叉树查询通过范围相交判断剪去无关子树，实际工作量还取决于数据分布、叶子容量和查询矩形的大小。

使用工程的 Release 版程序、`points_100000.csv` 中的 100,000 个均匀随机点、叶子容量 100，以及矩形 `{200, 200, 400, 400}` 测量。每轮分别重复执行 1000 次相同查询，运行 9 轮后取总耗时中位数；计时包含结果向量的构造，不包含索引构建。两种方法每次均返回相同的 **4035 个点**。

| 查询方式 | 1000 次查询的耗时中位数 | 平均每次 |
| --- | ---: | ---: |
| 全量遍历 | 406133 µs | 406.133 µs |
| 四叉树索引 | 122762 µs | 122.762 µs |

在这组数据与查询范围下，四叉树查询耗时约为全量遍历的 **30%**，即约快 **3.3 倍**。这说明剪枝减少了需要检查的点，但测量结果只适用于上述数据与环境；数据分布、节点容量、查询区域以及索引构建成本都会影响实际收益。
