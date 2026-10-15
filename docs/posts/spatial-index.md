---
title: 空间索引
description: 从空间索引的基本概念到 C++ 四叉树实践，记录数据范围、节点设计、叶子查找与插入分裂的思路
---

# 空间索引

1. 空间索引的本质：按照一定的空间规则，对空间数据进行组织或划分，建立一种能够快速减少搜索范围的数据结构。
2. 空间索引的应用场景：在海量空间数据里快速找到想要的数据，避免每次全量遍历。
3. 常用的空间索引：四叉树、八叉树、规则网格索引、R-tree。

名词解释：

- 四叉树空间索引：在二维空间中递归地把区域划分为四个子空间。
- 八叉树空间索引：在三维空间中递归地把区域划分为八个子空间。
- 规则网格索引：使用规则网格划分二维空间，也就是常说的格子化。
- R-tree：把空间上相近的要素分组，用外接矩形逐层组织成树，这部分还需要继续加深理解。

## 从概念到代码：我的四叉树实现过程

<p class="post-meta">2026-10-15 · GIS 核心概念 · C++20 四叉树实践</p>

只看定义时，我知道四叉树就是把二维空间分成四块，再继续向下划分。但真正准备动手写，问题就具体了：根节点的范围从哪里来？一个点放进哪个节点？节点满了，已有的数据怎么交给子节点？整棵树又该由谁来管理？

这次我先用点数据，把“计算范围、找到叶子、插入、分裂、重新分配”这条链路走通。这里采用的方式是按区域中线四等分，叶子节点保存点的 ID，原始坐标由整棵树统一管理。

### 先准备能观察结果的点数据

工程里准备了三份 CSV，格式都是 `id,x,y`：

| 数据集 | 数量 | 用来观察什么 |
| --- | ---: | --- |
| `points_small.csv` | 32 | 四个象限各 8 个点，方便人工检查点的归属 |
| `points_1000.csv` | 1,000 | 普通随机点加两个密集区域，观察局部继续分裂 |
| `points_edge_cases.csv` | 20 | 角点、边界点、中线附近的点和重复坐标 |

边界数据里有两个点在预设的 `[0,1000] × [0,1000]` 范围外。如果手动固定根节点范围，可以用它们测试越界；这次根节点取整份数据的实际范围，因此它们也会被包含进去。

点和范围先用两个简单的数据结构表示：

```cpp
struct Point
{
    int id;
    double x;
    double y;
};

struct BoundingBox
{
    double left;
    double top;
    double right;
    double bottom;
};
```

我在这个工程里采用的是屏幕坐标约定：x 向右增大，y 向下增大。因此 `top` 对应最小 y，`bottom` 对应最大 y。这个约定需要和后面的象限判断保持一致。

### 根节点的范围：先遍历一次数据

我最初的想法很直接：用一个 for 循环，记录 x、y 的最大值和最小值。这就能得到包住整份数据的最小轴对齐矩形。

```cpp
BoundingBox calculateBoundingBox(const std::vector<Point>& points)
{
    if (points.empty())
        throw std::invalid_argument("Cannot calculate bounds of an empty point set");

    // 从第一个点初始化，避免用 0 初始化导致全正/全负坐标的范围错误。
    const Point& first = points.front();
    BoundingBox bounds{first.x, first.y, first.x, first.y};

    // 当前数据采用 y 向下增大的坐标约定：top 是最小 y，bottom 是最大 y。
    for (const Point& point : points)
    {
        if (point.x < bounds.left)
            bounds.left = point.x;
        if (point.x > bounds.right)
            bounds.right = point.x;
        if (point.y < bounds.top)
            bounds.top = point.y;
        if (point.y > bounds.bottom)
            bounds.bottom = point.y;
    }
    return bounds;
}
```

这里用第一个点初始化四个边界。这样无论坐标全是正数还是全是负数，都会从真实数据开始计算，而不是把 0 当成一个不存在的边界。

这个步骤遍历一次，时间复杂度是 O(n)。得到的矩形就是根节点的范围，后续每次分裂都从当前节点自己的范围继续四等分。

### 节点里到底要存什么

我先定义了 `TreeNode`：一个节点的范围、一组点 ID，以及四个子节点。后面为了控制分裂，还加上了节点深度。

整理后的声明如下：

```cpp
#pragma once

#include "SpatialData.h"

class TreeNode
{
public:
    TreeNode(int count, int depth = 0);
    ~TreeNode();
    TreeNode(const TreeNode&) = delete;
    TreeNode& operator=(const TreeNode&) = delete;
    void Insert(const Point& point);
	int getMaxCount() const { return maxCount; }
    int getFeatureCount() const { return static_cast<int>(featureIds.size()); }
    int getDepth() const { return depth; }
    const std::vector<int>& getFeatureIds() const { return featureIds; }
    void setBoundingBox(const BoundingBox& bounds);
    bool Contains(const Point& point) const; // 包含边界上的点
    TreeNode* FindLeaf(const Point& point); // 范围外返回 nullptr，否则返回所属叶子
    bool CanSplit(int maxDepth) const;
    void Split(const std::vector<const Point*>& nodePoints);

private:
	int maxCount; // 触发分裂的容量阈值；无法继续分裂时允许超出
    int depth;
    double boundingBox[4]; // left, top, right, bottom
    std::vector<int> featureIds;
    TreeNode* leftTopChild;
    TreeNode* rightTopChild;
    TreeNode* rightBottomChild;
    TreeNode* leftBottomChild;
};
```

`maxCount` 是触发分裂的容量阈值，`featureIds.size()` 才是当前节点实际存了多少个点。这两个量要分开理解。

我在这里也顺便理清了几个 C++ 写法：

- 普通数组的长度需要在编译时确定，不能直接拿运行时的成员变量作为数组长度。
- `std::vector<int>(100)` 会创建 100 个值为 0 的元素。
- `reserve(100)` 只预留空间，元素数量仍然是 0，后面用 `push_back(point.id)` 添加。

节点构造时预留容量，并把四个子节点指针初始化为空：

```cpp
TreeNode::TreeNode(int count, int depth)
    : maxCount(count),
      depth(depth),
      boundingBox{},
      leftTopChild(nullptr),
      rightTopChild(nullptr),
      rightBottomChild(nullptr),
      leftBottomChild(nullptr)
{
	if (maxCount <= 0)
        throw std::invalid_argument("Node capacity must be positive");
	this->featureIds.reserve(maxCount);
}
```

### 为什么还要增加一个 Tree

最开始我关注的是单个节点。随着读取数据、查找点和插入流程逐渐串起来，我觉得还需要一个表示“整棵树”的数据结构。

我把职责分成了两层：

| 类型 | 负责的内容 |
| --- | --- |
| `Tree` | 保存点数据、维护 ID 查找表、管理根节点、提供插入和查找入口 |
| `TreeNode` | 保存本节点的范围与 ID，查找自己的子节点，完成局部的分裂 |

这样 `main.cpp` 就可以专门用来测试，不需要自己管理根节点的生命周期，也不需要在测试代码里到处传整份数据。

```cpp
#pragma once

#include "TreeNode.h"

#include <memory>
#include <unordered_map>

class Tree
{
public:
    // 保存数据并创建空根节点，不会自动插入所有点。
    Tree(const std::vector<Point>& points, int count, int maxDepth = 32);

    const Point* FindPoint(int id) const;
    TreeNode* FindLeaf(const Point& point);
    bool Insert(const Point& point); // 范围外或叶子满且可继续分裂时返回 false
    void Split(const Point& point); // 只分裂该点所属的叶子，不插入当前点

    const BoundingBox& getBounds() const { return bounds; }
    int getMaxCount() const { return maxCount; }

private:
    std::vector<Point> points;
    std::unordered_map<int, std::size_t> pointIndexes; // id -> points 下标
    BoundingBox bounds;
    int maxCount;
    int maxDepth;
    std::unique_ptr<TreeNode> root;
};
```

`std::unique_ptr<TreeNode>` 管理根节点，离开作用域时会自动释放。节点析构函数再释放自己的四个子节点，逐层释放整棵树。这里只让一个对象拥有每个节点，节点的复制操作也被禁用了。

`Tree` 的构造函数负责保存数据、计算范围、创建空根节点和建立 ID 查找表。真正的点插入由后面的循环驱动。

```cpp
Tree::Tree(const std::vector<Point>& points, int count, int maxDepth)
    : points(points),
      bounds(calculateBoundingBox(this->points)),
      maxCount(count),
      maxDepth(maxDepth),
      root(std::make_unique<TreeNode>(count))
{
    if (maxDepth < 0)
        throw std::invalid_argument("Maximum depth must not be negative");
    pointIndexes.reserve(this->points.size());
    for (std::size_t i = 0; i < this->points.size(); ++i)
    {
        if (!pointIndexes.emplace(this->points[i].id, i).second)
            throw std::invalid_argument("Duplicate point id: " + std::to_string(this->points[i].id));
    }
    root->setBoundingBox(bounds);
}

const Point* Tree::FindPoint(int id) const
{
    const auto found = pointIndexes.find(id);
    return found == pointIndexes.end() ? nullptr : &points[found->second];
}
```

这里的 `pointIndexes` 我一开始也特意弄清楚了。它保存的是“点 ID → 数据数组下标”，例如：

| 点 ID | 在 points 中的下标 |
| ---: | ---: |
| 10 | 0 |
| 25 | 1 |
| 80 | 2 |

节点保存 ID，分裂时再根据 ID 找回坐标，就不需要每次扫描整份数据。ID 不要求连续，但在输入数据中必须唯一；两个不同 ID 的点可以拥有相同坐标。

这个表服务于按 ID 查数据，四叉树则服务于按位置组织空间，两者处理的是不同的查找需求。

### 判断包含关系，并递归找到叶子

点是否位于节点范围内，只需要比较四个边界：

```cpp
bool TreeNode::Contains(const Point& point) const
{
    // boundingBox 的顺序是 left、top、right、bottom，y 向下增大。
    return point.x >= boundingBox[0] && point.x <= boundingBox[2]
        && point.y >= boundingBox[1] && point.y <= boundingBox[3];
}
```

这个函数包含边界。不过，相邻子节点会共享中线，如果依次对四个节点调用 `Contains()`，中线上的点可能同时满足多个节点。

所以在选择子节点时，我统一约定：

- `x < midX` 归左侧，否则归右侧。
- `y < midY` 归上侧，否则归下侧。

沿着这个规则向下查找，没有子节点的节点就是叶子：

```cpp
TreeNode* TreeNode::FindLeaf(const Point& point)
{
    if (!Contains(point))
        return nullptr;

    // 没有子节点，当前节点就是叶子节点。
    if (!leftTopChild && !rightTopChild && !rightBottomChild && !leftBottomChild)
        return this;

    // 与 Split 的归属规则一致，避免共享边界上的点选中多个子节点。
    const double midX = std::midpoint(boundingBox[0], boundingBox[2]);
    const double midY = std::midpoint(boundingBox[1], boundingBox[3]);
    TreeNode* child = nullptr;
    if (point.x < midX)
        child = point.y < midY ? leftTopChild : leftBottomChild;
    else
        child = point.y < midY ? rightTopChild : rightBottomChild;

    return child ? child->FindLeaf(point) : nullptr;
}
```

`Tree::FindLeaf(point)` 只需要把调用交给根节点。这里找到的是“这个位置所属的叶子”，不要求这个点已经被插入；范围外的点返回空指针。

### 把插入和分裂理解成两个动作

我把 `Insert()` 设计成先判断容量，再决定是否写入：

- 找不到所属叶子，返回 false。
- 叶子已满，而且还能继续分裂，返回 false，当前点尚未写入。
- 叶子有空间，或者已经达到分裂停止条件，把当前点写入并返回 true。

`TreeNode::Insert()` 只负责保存 ID，容量检查由 `Tree::Insert()` 完成：

```cpp
bool Tree::Insert(const Point& point)
{
    TreeNode* leaf = FindLeaf(point);
    if (!leaf)
        return false;

    // 本阶段只插入构造时提供的数据，确保节点 id 能找到同一个原始点。
    const Point* original = FindPoint(point.id);
    if (!original)
        throw std::invalid_argument("Unknown point id: " + std::to_string(point.id));
    if (original->x != point.x || original->y != point.y)
        throw std::invalid_argument("Coordinates do not match point id: " + std::to_string(point.id));

    if (leaf->getFeatureCount() >= maxCount && leaf->CanSplit(maxDepth))
        return false;

    // 达到深度限制或浮点中点无法继续缩小范围时，保留为叶子并允许超容量。
    // 重复坐标的点因此也能存下，不会无限分裂。
    leaf->Insert(*original);
    return true;
}
```

```cpp
void TreeNode::Insert(const Point& point)
{
	this->featureIds.push_back(point.id);
}
```

这样我在外层就能清楚地区分“当前点已经插入”和“需要先分裂再重试”这两种状态。

### 节点满了，已有的点怎么重新分配

分裂一个节点时，我关心的是它里面已经存下来的点：

1. 取出节点保存的 ID。
2. 由 `Tree` 查到这些 ID 对应的坐标。
3. 把当前范围沿 x、y 中线分成四块。
4. 创建四个子节点，设置各自范围。
5. 按坐标把已有点放入对应子节点。
6. 清空父节点的 ID，让数据保存在叶子上。

树这一层负责按 ID 取数据：

```cpp
void Tree::Split(const Point& point)
{
    TreeNode* leaf = FindLeaf(point);
    if (!leaf)
        throw std::out_of_range("Point is outside the tree bounds");
    if (!leaf->CanSplit(maxDepth))
        throw std::logic_error("Leaf has reached its subdivision limit");

    // 由 Tree 根据 id 查表，节点只接收需要重新分配的点。
    std::vector<const Point*> nodePoints;
    nodePoints.reserve(leaf->getFeatureIds().size());
    for (int id : leaf->getFeatureIds())
    {
        const Point* original = FindPoint(id);
        if (!original)
            throw std::runtime_error("Point id not found: " + std::to_string(id));
        nodePoints.push_back(original);
    }
    leaf->Split(nodePoints);
}
```

节点这一层负责创建子空间和重新分配：

```cpp
void TreeNode::Split(const std::vector<const Point*>& nodePoints)
{
    if (leftTopChild || rightTopChild || rightBottomChild || leftBottomChild)
        throw std::logic_error("Node already has children");

    const double left = boundingBox[0];
    const double top = boundingBox[1];
    const double right = boundingBox[2];
    const double bottom = boundingBox[3];
    const double midX = std::midpoint(left, right);
    const double midY = std::midpoint(top, bottom);

    leftTopChild = new TreeNode(maxCount, depth + 1);
    rightTopChild = new TreeNode(maxCount, depth + 1);
    rightBottomChild = new TreeNode(maxCount, depth + 1);
    leftBottomChild = new TreeNode(maxCount, depth + 1);

    leftTopChild->setBoundingBox({left, top, midX, midY});
    rightTopChild->setBoundingBox({midX, top, right, midY});
    rightBottomChild->setBoundingBox({midX, midY, right, bottom});
    leftBottomChild->setBoundingBox({left, midY, midX, bottom});

    // 仅重新分配已有点；继续分裂和当前点的插入由外层循环驱动。
    // x == midX 归右侧；y == midY 归下侧，保证每个点只进入一个子节点。
    for (const Point* point : nodePoints)
    {
        if (point->x < midX)
        {
            if (point->y < midY)
                leftTopChild->Insert(*point);
            else
                leftBottomChild->Insert(*point);
        }
        else
        {
            if (point->y < midY)
                rightTopChild->Insert(*point);
            else
                rightBottomChild->Insert(*point);
        }
    }

    // 点已交给子节点，父节点不再保存这些 id。
    featureIds.clear();
}
```

这里的 `Split()` 只处理当前叶子里已有的点。它完成以后，当前待插入点要重新查找叶子，再尝试插入。如果新的目标叶子仍然满着，就继续按同样的规则向下分裂。

### 把自己的思路画成流程

梳理这个过程时，我先画了下面这张图，主要关注“输入一个点、找到子空间、判断容量、分裂”之间的联系：

![我最初梳理四叉树插入与分裂时画的流程图](/images/spatial-index/quadtree-first-flow.png)

结合现在的代码，我把容量判断、重试和停止条件整理成了下面的流程：

![四叉树构建流程：找到叶子，判断容量，分裂后重试当前点](/images/spatial-index/quadtree-insertion-flow.svg)

我理解的关键是：**当前点插入成功以后，才开始处理下一个点。** 分裂会重新组织已有点，当前点则重新走一遍“查找叶子、尝试插入”的过程。

### 递归查找，循环驱动分裂

递归体现在 `FindLeaf()`：从根节点一路找到目标叶子。

分裂的推进可以由一个 while 循环完成。每次失败时分裂目标叶子，然后继续尝试同一个点；直到成功，再处理下一条数据。不需要让 `Split()` 自己一次性递归处理整棵树。

完整测试入口如下：

```cpp
#include "SpatialData.h"
#include "Tree.h"

#include <exception>
#include <iostream>
#include <stdexcept>

// 在这里编写和运行自己的空间索引测试。
int main(int argc, char* argv[])
{
    try
    {
        const std::string path = argc > 1 ? argv[1] : "data/points_1000.csv";
        const std::vector<Point> points = readPoints(path);
        Tree tree(points, 100);

        std::size_t splitCount = 0;
        for (const Point& point : points)
        {
            // 原始点都在根节点范围内；满叶子分裂后，继续重试同一个点。
            while (!tree.Insert(point))
            {
                if (!tree.FindLeaf(point))
                    throw std::out_of_range("Point is outside the tree bounds");
                tree.Split(point);
                ++splitCount;
            }
        }
        std::cout << "Indexed " << points.size() << " points with " << splitCount << " splits.\n";

        TreeNode* leaf = tree.FindLeaf(points.front());
        if (leaf)
            std::cout << "First point's leaf contains " << leaf->getFeatureCount() << " points.\n";
    }
    catch (const std::exception& error)
    {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
```

其中的范围外判断，是为了区分“需要分裂”和“点不在根节点范围内”。本次插入的是构造时传入的整份数据，根节点由这些数据计算得到，正常情况下都能找到所属叶子。

### 分裂到什么时候停止

只设置“每个节点最多放 100 个点”还不够。多个点的坐标完全相同时，无论分裂多少次，它们仍会落在同一个子空间；浮点数精度也会限制边界继续缩小。

这次实现增加了两个停止条件：

- 达到最大深度，默认是 32，根节点深度为 0。
- x、y 两个方向的中点都无法再把范围缩小。

判断代码如下：

```cpp
bool TreeNode::CanSplit(int maxDepth) const
{
    if (depth >= maxDepth)
        return false;

    const double midX = std::midpoint(boundingBox[0], boundingBox[2]);
    const double midY = std::midpoint(boundingBox[1], boundingBox[3]);
    // 至少一个方向还能缩小即可分裂，也支持所有点落在同一直线上的数据。
    return (midX > boundingBox[0] && midX < boundingBox[2])
        || (midY > boundingBox[1] && midY < boundingBox[3]);
}
```

如果只有一个方向还能缩小，仍然允许分裂，因此所有点位于同一条水平线或竖直线上时也能继续处理。

停止分裂以后，我选择保留这个叶子，并允许它超过容量阈值。这样相同坐标的点仍然可以全部存下。这里的 100 是希望触发分裂的阈值，不能同时被理解成任何情况下都不可超过的硬上限。

### 跑完数据以后，我验证了什么

使用默认的 1,000 个点和容量 100，程序的输出是：

```text
Indexed 1000 points with 8 splits.
First point's leaf contains 40 points.
```

这个输出描述的是当前这份固定数据和参数的结果；更换点分布、容量或者最大深度，分裂次数都会变化。

除了运行程序，我还逐个检查了点最终所属的叶子：叶子的 ID 列表确实包含这个点，所有叶子里的 ID 总数与输入一致，没有遗漏或重复。测试也覆盖了非连续 ID、中线归属、多层查找、相同坐标、共线点，以及达到最大深度后保留超容量叶子的情况。

工程使用 CMake 和 C++20，`std::midpoint` 来自 `<numeric>`。目录按用途拆分为：

```text
main.cpp                     测试入口
SpatialData.h / .cpp          点、范围、CSV 读取、范围计算
Tree.h / .cpp                 整棵树与原始数据管理
TreeNode.h / .cpp             节点范围、叶子查找、局部分裂
data/                        练习点数据
```

这次把点数据的索引构建和叶子定位串了起来。接下来我想继续补充矩形范围查询：先判断查询范围与哪些节点相交，再只去对应节点筛选点。之后再考虑线数据——线可能穿过多个子空间，它的存放和查询规则还需要单独设计。
