---
title: 拓扑与空间关系：从 DE-9IM 到自动驾驶车道网络
description: 从常规 GIS 的几何拓扑出发，理解 DE-9IM、道路网络、车道级连接、交通规则，以及 OGC、Lanelet2、OpenDRIVE 与 NDS 的职责边界
---

# 拓扑与空间关系：从 DE-9IM 到自动驾驶车道网络

<p class="post-meta">2026-07-26 · GIS 核心概念 · 拓扑与空间关系 · 约 30 分钟</p>

前面几章解决了“空间对象在哪里”的问题：坐标怎样表达位置，地球模型怎样定义位置，投影和坐标转换又怎样改变坐标表达。

这一章讨论“空间对象之间是什么关系”。

先看一个自动驾驶中很典型的场景：一条高架道路从地面道路上方穿过。

```text
二维几何关系：两条道路相交
道路网络关系：两条道路没有公共节点
驾驶语义关系：车辆不能从高架直接转入地面道路
```

如果只调用 `lineA.crosses(lineB)`，得到的只是二维平面中的几何事实。它无法告诉我们两条路是否同高、是否连通、是否允许转向，更无法判断当前车辆能不能走。

这说明 GIS 里的“拓扑”不是一种模型，而是一类关系。至少要分成几个层次：

| 层次 | 主要问题 | 典型关系或要素 |
|---|---|---|
| 几何拓扑 | 几何对象怎样相交 | 相离、接触、包含、穿越、重叠 |
| 网络拓扑 | 对象怎样连接和到达 | 节点、边、前驱、后继、方向、路径 |
| 车道拓扑 | 车辆怎样沿车道运动 | 跟随、合流、分流、相邻、换道、冲突 |
| 规则拓扑 | 谁在什么条件下能够通行 | 限速、让行、信号灯、转向限制、参与者类型 |
| 三维与时态关系 | 关系在什么高度和时间成立 | 桥隧、楼层、潮汐车道、施工封闭、临时限速 |

常规 GIS 更常讨论第一层；传统导航会进入第二层；自动驾驶地图则必须继续处理后面几层。

因此，这一章不会用 DE-9IM 概括所有拓扑。九交模型是理解几何关系的基础，但不是道路网络和自动驾驶语义的终点。

## 第一层：常规 GIS 中的几何拓扑

几何学关心坐标、长度、角度和面积；拓扑学关心对象在连续变形后仍然保持的关系。

将一幅地图整体平移、旋转或按比例缩放：

- 位于多边形内部的点仍然在内部；
- 共享边界的两个地块仍然共享边界；
- 两个相离的区域仍然相离；
- 穿过区域的线仍然穿过该区域。

这些关系不依赖对象位于 `(100, 200)` 还是 `(1000, 2000)`。

但“拓扑与具体坐标值无关”不代表计算机不使用坐标。JTS、GEOS 等几何引擎仍然要根据有限精度坐标判断两条线是否真正相交。理论上的拓扑不变性和工程中的数值计算需要分开理解。

## 从内部、边界和外部开始

OGC Simple Features 使用点集拓扑描述空间关系。任意几何对象都可以分成三个部分：

- **内部（Interior，I）**：对象的主体；
- **边界（Boundary，B）**：内部与外部之间的分界；
- **外部（Exterior，E）**：整个空间中不属于对象的部分。

不同几何类型拥有不同的内部和边界：

| 几何类型 | 内部 | 边界 | 外部 |
|---|---|---|---|
| Point | 点本身 | 空集 | 除该点之外的空间 |
| LineString | 去掉端点后的线 | 两个端点 | 不在线上的空间 |
| Polygon | 外环以内、排除边界与孔洞的区域 | 外环和所有内环 | 多边形之外以及孔洞内部 |

这几个定义会直接影响空间谓词。

例如，点落在 Polygon 的洞中时，点位于多边形外部；点恰好落在 Polygon 边界上时，它不在多边形内部。

线的边界通常是端点，而不是整条线。闭合 LineString 在常用的 mod-2 boundary rule 下，首尾节点出现两次，边界可以为空。`MultiLineString` 的边界还会受到节点出现次数影响。

## DE-9IM 九交模型

设两个几何对象为 A 和 B。分别取两者的内部、边界和外部，再两两求交：

| A \ B | B 的内部 I(B) | B 的边界 B(B) | B 的外部 E(B) |
|---|---:|---:|---:|
| **A 的内部 I(A)** | I(A) ∩ I(B) | I(A) ∩ B(B) | I(A) ∩ E(B) |
| **A 的边界 B(A)** | B(A) ∩ I(B) | B(A) ∩ B(B) | B(A) ∩ E(B) |
| **A 的外部 E(A)** | E(A) ∩ I(B) | E(A) ∩ B(B) | E(A) ∩ E(B) |

九个交集组成 **DE-9IM（Dimensionally Extended Nine-Intersection Model，维度扩展九交模型）**。

每个交集不仅记录是否为空，还记录它的最高维度：

| 字符 | 含义 | 典型结果 |
|---|---|---|
| `F` | 空集，维度为 -1 | 没有交集 |
| `0` | 零维 | 一个或多个点 |
| `1` | 一维 | 一段或多段线 |
| `2` | 二维 | 一块或多块面 |
| `T` | 非空 | `0`、`1`、`2` 均可 |
| `*` | 不关心 | 任意结果 |

程序通常按行把矩阵展开为九个字符：

```text
II  IB  IE  BI  BB  BE  EI  EB  EE
```

也就是：

```text
I(A)∩I(B), I(A)∩B(B), I(A)∩E(B),
B(A)∩I(B), B(A)∩B(B), B(A)∩E(B),
E(A)∩I(B), E(A)∩B(B), E(A)∩E(B)
```

### 点严格位于多边形内部

设 A 是点，B 是多边形：

| A \ B | I(B) | B(B) | E(B) |
|---|---:|---:|---:|
| I(A) | 0 | F | F |
| B(A) | F | F | F |
| E(A) | 2 | 1 | 2 |

展开后得到：

```text
0FFFFF212
```

它满足 `Within` 模式 `T*F**F***`。反过来，多边形对点满足 `Contains`。

### 点位于多边形边界

点的内部不再与多边形内部相交，而是与多边形边界相交：

```text
F0FFFF212
```

此时：

- `point.within(polygon)` 为 `false`；
- `polygon.contains(point)` 为 `false`；
- `polygon.covers(point)` 为 `true`；
- `point.touches(polygon)` 为 `true`。

`Contains` 和 `Covers` 的区别不是 API 的偶然差异，而是内部与边界定义不同。

### 两条线在中段交叉

一条水平线与一条竖直线在各自中间相交，端点互不接触：

```text
0F1FF0102
```

第一位 `0` 表示两条线的内部交于一个点；第三位和第七位的 `1` 表示两条线都有一部分位于对方外部。两条线满足 `Crosses`，而不是 `Touches`。

## 常见空间谓词是九交矩阵的具名模式

GIS 中常见的空间谓词，本质上是对九交矩阵进行模式匹配：

| 空间关系 | 典型模式 | 核心语义 |
|---|---|---|
| `Disjoint` | `FF*FF****` | 内部和边界完全没有交集 |
| `Intersects` | `Disjoint` 的反面 | 任意内部或边界部分发生相交 |
| `Within` | `T*F**F***` | A 在 B 内，且 A 没有部分位于 B 外部 |
| `Contains` | `T*****FF*` | A 包含 B，是 `Within` 的逆关系 |
| `EqualsTopo` | `T*F**FFF*` | A 与 B 表示相同的点集 |
| `Touches` | 与维度组合有关 | 内部不相交，但边界发生接触 |
| `Crosses` | 与维度组合有关 | 内部发生低维相交，并穿过彼此 |
| `Overlaps` | 与输入维度有关 | 同维对象部分重叠，双方都不完全包含对方 |

几个名称很容易被业务语言误导。

### `Intersects` 不等于 `Overlaps`

`Intersects` 的范围非常宽。端点接触、线穿过面、一个面完全包含另一个面，都属于相交。

`Overlaps` 通常要求两个对象维度相同，并且双方都存在不属于对方的部分。因此一个面完全包含另一个面不叫重叠，一条线穿过一个面也不叫重叠。

### `Contains` 不一定包含边界

行政区查询经常需要先定义边界政策：

- 边界点不算进入任何区：使用严格的 `Contains`；
- 边界点也算命中：使用 `Covers`；
- 相邻区域都使用 `Covers`：边界点可能同时命中多个区域，还需要消歧规则。

### `Touches` 不能区分所有邻接类型

两个地块共享一段界址线和只碰到一个角点，都可能满足 `Touches`。如果业务中的“相邻地块”只接受共享边线，就应进一步约束边界交集维度：

```text
F***1****  → 边界交集是一维，共享一段边线
F***0****  → 边界交集是零维，只共享角点
```

这正是直接使用九交模型的价值。

## DE-9IM 的能力边界

DE-9IM 能准确回答：

- 点是否位于车道面内；
- 停止线是否穿过车道；
- 两个车道面是否有几何重叠；
- 道路边界是否接触；
- 两条中心线是否在二维平面相交。

但它不能直接回答：

- 两条道路是否在路网中连通；
- 车辆是否能从车道 A 驶入车道 B；
- 相邻车道之间是否允许换道；
- 两个二维相交对象是否处于不同高度；
- 当前信号灯状态是否允许通行；
- 某条车道是否只允许公交车进入；
- 连接关系在施工期间是否仍然有效。

原因在于 DE-9IM 只观察几何点集。方向、身份、规则、参与者、时间和层级并不属于点集本身。

## 第二层：道路网络中的图拓扑

传统道路导航通常把道路抽象成图：

```text
现实道路
   ↓ 抽象
节点 Node + 边 Edge
   ↓ 添加
方向 Direction + 权重 Cost + 转向 Turn
   ↓ 计算
可达性、最短路径、服务区
```

在这个模型中：

- 节点表示道路端点、交叉口或人为切分点；
- 边表示节点之间可以通行的道路段；
- 方向表示单向或双向通行；
- 权重表示距离、时间、费用或综合成本；
- 转向关系表示从一条边进入另一条边是否允许。

### 几何相交不等于图连通

假设两条 LineString 在二维中形成十字：

```text
DE-9IM：Crosses = true
```

路网中至少存在三种可能：

1. 普通平交路口：交点被切成节点，四个方向可能连通；
2. 高架与地面道路：几何相交，但图中不建立连接；
3. 封闭道路交叉：存在节点，但某些转向被禁止。

DE-9IM 在三种情况下可能给出相同结果，路由结果却完全不同。

反过来也一样：两条道路端点坐标完全重合，并不自动代表可以通行。它们可能属于不同楼层、不同道路系统，或者缺少必要的连接关系。

### 网络拓扑最好显式保存

可以根据几何位置推导候选连接，但不能把“坐标相等”当作最终网络语义。

可靠的道路网络通常显式保存：

- 稳定的节点和道路段标识；
- 前驱、后继或起终点引用；
- 行驶方向；
- 转向限制；
- 层级与高程信息；
- 网络版本。

几何用于展示、测距、匹配和发现异常，图关系用于计算可达性。二者需要保持一致，但不能互相替代。

## 第三层：自动驾驶中的车道级拓扑

普通导航只需要告诉驾驶者“沿这条道路行驶，然后右转”，道路中心线网络往往已经够用。

自动驾驶系统必须知道车辆当前位于哪条车道、下一段轨迹接到哪里、能否换道、哪里需要停车，以及驶入路口后会与哪些交通流发生冲突。

因此地图模型需要从“道路级边”细化到“车道级通行单元”。

一个车道单元通常至少包含：

```text
几何
├─ 左边界
├─ 右边界
├─ 中心线或参考轨迹
└─ 高程、坡度或横坡

连接
├─ predecessor / successor
├─ merge / split
├─ left / right
└─ lane-change relation

规则
├─ speed limit
├─ right of way
├─ traffic light
├─ stop line
└─ participant restriction
```

这时“相邻”也不再只有一种：

- 左侧有另一条车道，并且允许跨越边线换道；
- 左侧有另一条车道，但实线禁止换道；
- 两条车道几何上靠近，却分属对向车流；
- 两条车道在路口区域相交，属于冲突关系而非跟随关系。

这些差异无法用一个 `Touches` 或 `Intersects` 概括。

## Lanelet2 如何表达车道拓扑

Lanelet2 是自动驾驶和机器人领域常见的开源车道地图模型。一个 Lanelet 由一条左边界和一条右边界构成，可选中心线，并可以引用对它生效的 Regulatory Element。

它将几何、连接和规则分开组织：

```text
LaneletMap
├─ Point / LineString / Polygon
├─ Lanelet / Area
└─ RegulatoryElement
       ↓
TrafficRules
       ↓
RoutingGraph
```

RoutingGraph 中的关系包括：

- `succeeding`：可以沿行驶方向进入的后继车道；
- `left`、`right`：可以通过换道到达；
- `adjacent left`、`adjacent right`：空间上相邻，但不能换入；
- `conflicting`：行驶区域发生冲突；
- `area`：车道与可通行区域之间的连接。

这组关系直接说明了几何邻接与可通行邻接的区别：

```text
左右相邻 + 边线允许跨越 = reachable left/right
左右相邻 + 边线禁止跨越 = adjacent left/right
```

Lanelet2 构建路由图时还需要 `TrafficRules` 和 `RoutingCost`。同一份地图，对机动车、自行车和行人可以得到不同的可通行图。

也就是说，路由图不只是几何对象的固定属性，而是：

```text
RoutingGraph =
    LaneletMap
  + TrafficRules(地区, 交通参与者)
  + RoutingCost
```

Autoware 也通过 Lanelet2 地图加载器读取车道地图，并将其投影到车辆使用的地图坐标系中。这说明车道级拓扑并没有抛弃坐标参考和几何基础，而是在其上增加了驾驶语义。

## OpenDRIVE 如何表达静态道路网络

ASAM OpenDRIVE 的主要定位是描述可用于驾驶和交通仿真的静态道路网络。它使用 XML 表达：

- 道路参考线及平面几何；
- 道路纵断面和横断面；
- 车道及车道段；
- 道路标线；
- 信号和道路对象；
- 道路连接与路口。

OpenDRIVE 的道路并不是一组互不相关的 LineString。道路通过 `<link>` 中的 `<predecessor>` 和 `<successor>` 显式连接；复杂路口通过 Junction、Connection、Connecting Road 和 Lane Link 描述车辆能够沿哪些车道通过路口。

可以把它粗略理解为：

```text
Road reference line
    └─ LaneSection
         └─ Lane

Road.link
    ├─ predecessor
    └─ successor

Junction.connection
    └─ connectingRoad + laneLink
```

如果入口车道与出口车道没有 Lane Link，就不能只因为两条车道在几何上相接，而认为它们存在可行驶路径。

与 Lanelet2 相比，OpenDRIVE 更强调参数化道路、道路参考线和仿真场景中的静态网络交换；Lanelet2 更接近由左右边界定义的通行单元、交通规则解释和运行时路由图。二者能表达部分相同事实，但数据组织方式和主要使用场景不同。

## 第四层：交通规则也是拓扑的一部分

如果只看几何和连接，车辆可能拥有多条候选路径。但能否真正通行，还取决于交通规则。

例如一条车道连接到路口出口：

```text
几何：边界连续
连接：存在 successor
方向：与行驶方向一致
信号：当前为红灯
结论：拓扑上可达，但当前不能通过停止线
```

再例如相邻车道：

```text
几何：共享边界
车道图：左右相邻
边线：双实线
结论：相邻但不可换道
```

因此自动驾驶中的关系更接近一个带条件的有向图：

```text
edge(A, B)
  if participant = vehicle
  and direction is valid
  and lane marking allows crossing
  and turn restriction allows movement
  and temporary state is open
```

Lanelet2 的 Regulatory Element 可以关联交通灯、交通标志、限速、停止线和让行关系。Traffic Rules 再从特定地区和交通参与者的视角解释这些信息。

这也说明，拓扑并不总是地图文件中一张永远不变的图。它可能是根据地图、规则和运行状态计算出的视图。

## 第五层：三维、时间与动态状态

### 二维相交无法解释桥梁和隧道

OGC Simple Features、JTS 和 GEOS 中最常见的空间谓词主要按 XY 平面计算。Z 值可以保存在坐标中，却通常不参与 `Intersects`、`Touches` 等关系判断。

因此在自动驾驶地图中，还需要结合：

- 道路或车道层级；
- 高程曲线；
- 桥梁、隧道属性；
- 连接标识；
- 三维距离或专用三维算法。

正确处理方式不是看到二维交点就建立网络节点，而是先把几何交点当作候选，再由层级和显式连接关系确认。

### 拓扑还会随时间变化

道路网络的静态底图可能长期不变，但实际可通行关系会受到以下因素影响：

- 道路施工和临时封闭；
- 潮汐车道；
- 分时段转向限制；
- 可变限速；
- 事故占道；
- 信号灯状态；
- 自动驾驶 ODD 是否满足。

所以更完整的判断是：

```text
canTraverse(A, B, participant, vehicleState, time, environment)
```

而不是一个永久不变的：

```text
connected(A, B)
```

静态地图、准动态地图和实时感知数据需要共同参与最终决策。地图提供先验结构，感知和在线服务修正当前状态。

## OGC 为什么没有统一自动驾驶地图

“自动驾驶不使用 OGC”并不准确。更准确的说法是：

> OGC 的通用几何与服务标准仍然构成很多空间基础能力，但它们不足以单独表达车道级驾驶语义。

OGC Simple Features 擅长统一：

- Point、LineString、Polygon 等几何类型；
- CRS 下的几何坐标；
- `Intersects`、`Contains` 等空间谓词；
- 空间数据库和 GIS 引擎之间的基础语义。

OGC API、WMS、WFS、GeoPackage、3D Tiles 等规范或生态能力，则更偏向空间数据访问、交换、存储和可视化。

自动驾驶地图还要解决：

- 车道级连接和换道；
- 道路规则对具体车道的作用范围；
- 高精定位要素；
- 增量更新和车端带宽；
- 仿真、测试与真实道路的交换；
- 安全相关的版本和质量要求；
- 不同车辆、地区和 ODD 下的可通行性。

这些需求促使汽车、ITS 和仿真领域发展出更专门的规范。

| 规范或模型 | 主要职责 | 不适合单独解决什么 |
|---|---|---|
| OGC Simple Features / DE-9IM | 通用二维几何和点集空间关系 | 车道连接、交通规则和动态可达性 |
| ISO GDF | ITS 道路数据库的概念模型、要素、属性和关系 | 不是所有自动驾驶软件的统一运行时模型 |
| ASAM OpenDRIVE | 静态道路网络和仿真环境交换 | 不负责实时交通参与者和完整动态状态 |
| Lanelet2 | 开源车道地图、规则解释和路由图 | 不是覆盖所有车企生产与车端分发的行业标准 |
| NDS / NDS.Live | 汽车地图存储、分发、车端与云端使用 | 不能替代通用 GIS 的全部数据和服务标准 |
| 厂商内部模型 | 生产、编译、质检、增量更新和运行优化 | 跨厂商互操作性通常有限 |

目前没有一套标准同时统一几何、车道语义、仿真、地图生产、云端分发、车端运行和实时决策。

这不一定意味着行业完全没有标准，而是不同标准在解决不同阶段的问题：

```text
测绘与地图生产
      ↓
内部生产模型 / ISO GDF / GIS 数据库
      ↓
仿真与测试
      ↓
ASAM OpenDRIVE
      ↓
开源自动驾驶运行
      ↓
Lanelet2 / Autoware 扩展
      ↓
量产车载地图与分发
      ↓
NDS / 厂商编译格式
```

一家公司可能同时使用多个模型，并在不同环节做转换。真正困难的通常不是把坐标和几何类型转换过去，而是保证连接、方向、规则、有效范围、版本和质量语义不丢失。

## 用同一个路口观察不同模型

假设一辆车从南向北进入十字路口，准备左转到西侧道路。

### 在 DE-9IM 中

我们可以计算：

- 入口车道面与路口面的 `Intersects`；
- 转向轨迹是否 `Within` 可行驶区域；
- 停止线是否 `Crosses` 入口车道；
- 左转轨迹与对向直行轨迹是否相交。

它帮助发现几何关系和潜在冲突，但不能决定车辆是否可以左转。

### 在传统道路图中

路口被表示为节点或一组内部连接边。路由算法可以找到：

```text
南侧道路边 → 路口连接边 → 西侧道路边
```

它解决了道路级可达性，但未必知道具体进入和驶出的是哪条车道。

### 在车道级地图中

入口 Lane 连接到一条左转 Lane，再连接到西侧出口 Lane。模型还会表达：

- Lane 的前驱和后继；
- 入口车道是否允许左转；
- 左转 Lane 与对向直行 Lane 是否冲突；
- 停止线和信号灯作用于哪条 Lane。

### 在运行时决策中

即使路径拓扑成立，车辆仍需判断：

- 当前信号灯相位；
- 对向车辆和行人状态；
- 定位置信度；
- 道路是否被临时封闭；
- 当前场景是否处于系统 ODD 内。

因此完整链路是：

```text
几何正确
   ↓
车道连接存在
   ↓
静态交通规则允许
   ↓
动态状态允许
   ↓
感知确认安全
   ↓
规划生成可执行轨迹
```

地图拓扑只负责其中一部分，却是后续计算可信的前提。

## DE-9IM 在自动驾驶中仍然有什么价值

虽然九交模型不能表达完整驾驶拓扑，它仍然是地图生产和质检的重要基础。

### 车道几何质检

- 左右边界是否交叉；
- 车道面是否自相交；
- 相邻车道是否存在异常缝隙或重叠；
- 后继车道是否与当前车道边界接触；
- 车道中心线是否位于车道面内部。

### 道路对象关联

- 停止线是否穿过对应车道；
- 人行横道是否覆盖目标道路；
- 信号灯是否位于合理道路范围；
- 道路标记是否落在对应车道内；
- 障碍物是否侵入可行驶区域。

### 冲突候选生成

两个 Lane 的可行驶面或中心轨迹相交，可以产生潜在冲突候选。之后还要结合高程、方向、连接和规则过滤：

```text
几何相交
   ↓
同一高程或层级？
   ↓
行驶时间区间可能重叠？
   ↓
是否受信号或让行关系控制？
   ↓
最终冲突关系
```

这才是 DE-9IM 在自动驾驶拓扑中的合理位置：它负责几何关系，不负责替整个驾驶世界做决定。

## JTS、GeoTools、GDAL 和 GEOS 处在哪一层

这些库主要解决几何拓扑和空间数据处理。

### JTS 与 GeoTools

JTS `Geometry` 提供常用空间谓词：

```java
boolean intersects = a.intersects(b);
boolean touches    = a.touches(b);
boolean crosses    = a.crosses(b);
boolean within     = a.within(b);
boolean contains   = a.contains(b);
boolean covers     = a.covers(b);
boolean overlaps   = a.overlaps(b);
boolean equalsTopo = a.equalsTopo(b);
```

需要完整九交矩阵时：

```java
IntersectionMatrix matrix = a.relate(b);

System.out.println(matrix.toString());
boolean sharesBoundaryLine = matrix.matches("F***1****");
```

GeoTools 在 JTS 之上提供 Feature、Filter 和 DataStore。空间关系可以进入要素查询：

```java
FilterFactory ff = CommonFactoryFinder.getFilterFactory();

Filter filter = ff.intersects(
    ff.property("the_geom"),
    ff.literal(queryGeometry)
);

SimpleFeatureCollection result = featureSource.getFeatures(filter);
```

这些能力适合地图生产、空间查询和几何质检。要构建自动驾驶可通行图，仍需额外的车道和规则模型。

### GDAL/OGR 与 GEOS

OGR `Geometry` 也提供具名谓词：

```python
from osgeo import ogr

lane = ogr.CreateGeometryFromWkt(
    "POLYGON ((0 0, 10 0, 10 4, 0 4, 0 0))"
)
stop_line = ogr.CreateGeometryFromWkt(
    "LINESTRING (8 -1, 8 5)"
)

print(lane.Intersects(stop_line))
print(stop_line.Crosses(lane))
```

OGR 的多数精确拓扑谓词依赖 GEOS。没有 GEOS 时，某些操作会报告不支持；`Intersects()` 还可能退化成包围盒相交判断。因此对精确拓扑结果有要求时，必须确认 GDAL 的构建能力。

OGR 主要公开 `Intersects`、`Touches`、`Contains` 等具名谓词，没有像 JTS `relate()` 那样直接提供通用九交矩阵接口。自定义矩阵可以进一步使用 GEOS、JTS 或 PostGIS `ST_Relate`。

这些工具可以判断两条车道几何是否相交，却不会自动生成 Lanelet2 的 `succeeding` 关系，也不会理解 OpenDRIVE 的 Junction Connection。那属于更高层的数据模型和业务逻辑。

## 一套统一的理解框架

面对任何 GIS、导航或自动驾驶地图格式，可以依次问五个问题。

### Geometry：对象在哪里、长什么样

```text
Point / LineString / Polygon
中心线 / 左右边界 / 高程曲线
坐标参考系 / 精度 / 单位
```

### Geometric Relation：几何上怎样相交

```text
DE-9IM
Intersects / Contains / Touches / Crosses
距离 / 缓冲区 / 叠加
```

### Connectivity：能否连接和到达

```text
Node / Edge
predecessor / successor
merge / split
lane change
```

### Traffic Semantics：谁在什么条件下可以通过

```text
方向
限速
标线
信号灯
让行与转向限制
交通参与者类型
```

### Temporal State：关系在什么时候有效

```text
地图版本
有效时间
封路与施工
可变限速
实时信号
ODD 状态
```

这五层不是新的文件标准，而是一套用于比较和设计地图系统的概念框架。

它能帮助我们判断一项能力究竟缺在哪里：

- 几何相交错误，是数据精度或坐标问题；
- 几何正确但路径断开，是网络连接问题；
- 路径存在但不应通行，是规则建模问题；
- 静态规则正确但当前不可走，是动态状态问题；
- 不同格式转换后能显示却不能规划，是高层语义丢失。

## 工程中的拓扑检查链路

无论是常规 GIS 还是自动驾驶地图，都不应该只检查“文件能否打开”。

一套完整检查可以分层执行：

```text
坐标与几何层
├─ CRS、单位和轴顺序正确
├─ 几何有效
├─ 边界连续
└─ 高程与层级合理

几何关系层
├─ 不应重叠的对象没有重叠
├─ 应接触的边界没有缝隙
├─ 停止线、人行横道关联正确
└─ 潜在冲突关系完整

网络层
├─ predecessor / successor 对称一致
├─ 没有意外悬挂节点
├─ 合流和分流关系完整
└─ 高架与地面没有错误连通

规则层
├─ 方向与连接一致
├─ 换道关系与边线类型一致
├─ 信号灯、停止线和车道引用完整
└─ 参与者和地区规则能够解释

版本与动态层
├─ 对象 ID 稳定
├─ 增量更新引用不失效
├─ 有效时间明确
└─ 静态地图与动态状态可以对齐
```

几何检查可以大量使用 JTS、GEOS、PostGIS 和空间索引；网络检查需要图遍历和一致性规则；交通语义检查则需要领域模型。

## 总结

这一章最重要的结论，是把几个经常混在一起的概念分开：

```text
DE-9IM 描述几何点集关系
图模型描述连接和可达关系
车道模型描述车辆运动通道
交通规则描述条件化的通行关系
时态状态描述关系何时有效
```

DE-9IM 能统一常规 GIS 中大量点、线、面关系，也是 JTS、GEOS、GeoTools、GDAL/OGR 和空间数据库的基础。但它无法概括自动驾驶中的全部拓扑。

自动驾驶也不是完全脱离 OGC 和传统 GIS。它仍然需要坐标参考、几何运算、空间索引、数据质量和空间服务，只是在这些通用能力之上，增加了车道连接、驾驶规则、三维层级、动态更新和车端运行模型。

当前行业没有一个标准覆盖全部环节。OGC Simple Features、ISO GDF、ASAM OpenDRIVE、Lanelet2、NDS 和厂商内部模型更像是分工协作。理解每套模型负责哪一层，比寻找一个能够解决所有问题的“统一格式”更重要。

下一章将进入**空间计算与几何运算**，讨论缓冲区、叠加、裁剪、合并和简化怎样改变几何，以及这些操作为何会产生碎片、无效几何与精度问题。

## 参考资料

- [OGC Simple Feature Access — Part 1: Common Architecture](https://docs.ogc.org/is/06-103r4/06-103r4.pdf)
- [JTS Geometry API](https://locationtech.github.io/jts/javadoc/org/locationtech/jts/geom/Geometry.html)
- [JTS IntersectionMatrix API](https://locationtech.github.io/jts/javadoc/org/locationtech/jts/geom/IntersectionMatrix.html)
- [GeoTools：DE-9IM](https://docs.geotools.org/stable/userguide/library/jts/dim9.html)
- [GDAL：OGRGeometry C++ API](https://gdal.org/en/stable/api/ogrgeometry_cpp.html)
- [Lanelet2：Lanelet Primitives](https://docs.ros.org/en/rolling/p/lanelet2_core/doc/LaneletPrimitives.html)
- [Lanelet2：Routing](https://docs.ros.org/en/rolling/p/lanelet2_routing/index.html)
- [ASAM OpenDRIVE 1.9.0](https://publications.pages.asam.net/standards/ASAM_OpenDRIVE/ASAM_OpenDRIVE_Specification/v1.9.0/specification/00_preface/00_introduction.html)
- [ASAM OpenDRIVE：Road Linkage](https://publications.pages.asam.net/standards/ASAM_OpenDRIVE/ASAM_OpenDRIVE_Specification/v1.8.1/specification/10_roads/10_03_road_linkage.html)
- [ISO 20524-1:2020：Geographic Data Files](https://www.iso.org/standard/68244.html)
- [NDS.Live](https://nds-association.org/nds-live/)
- [Autoware Map Loader](https://autowarefoundation.github.io/autoware_core/latest/map/autoware_map_loader/)
