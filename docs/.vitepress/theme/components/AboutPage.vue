<template>
  <main class="about-page">
    <header class="hero-panel">
      <div class="hero-grid" aria-hidden="true"></div>
      <svg class="contour contour-a" viewBox="0 0 420 280" aria-hidden="true">
        <path d="M-20 108C52 38 111 39 167 81s103 59 165 5 106-27 133 1" />
        <path d="M-16 136C58 67 113 69 168 108s105 57 164 6 104-30 137-2" />
        <path d="M-12 166C55 102 115 98 171 139s99 50 157 4 108-36 143-8" />
        <path d="M-4 197c61-57 119-61 177-21s96 44 153 5 108-39 151-13" />
      </svg>
      <div class="radar" aria-hidden="true"><span></span></div>

      <div class="hero-content">
        <div class="eyebrow"><i></i> DEVELOPER PROFILE / 31.23°N · 121.47°E</div>
        <p class="hero-label">GIS FULL-STACK DEVELOPER</p>
        <h1>在图层深处，<br><em>理解空间如何运转。</em></h1>
        <p class="hero-intro">
          从 WebGIS 前端到空间服务端，从 API 调用到底层实现。这里记录我对 GIS
          全链路开发、空间计算与 AI 技术的持续探索。
        </p>
        <div class="hero-tags" aria-label="主要技术方向">
          <span>SPATIAL DATA</span><span>MAP RENDERING</span><span>GIS SERVER</span><span>AI × GIS</span>
        </div>
      </div>

      <div class="hero-status">
        <div><span>FOCUS</span><strong>底层原理</strong></div>
        <div><span>PATH</span><strong>前端 → 全栈</strong></div>
        <div><span>STATUS</span><strong class="online">持续探索中</strong></div>
      </div>
    </header>

    <section class="section-block journey-section">
      <div class="section-heading">
        <span class="section-index">01</span>
        <div><p>MY JOURNEY</p><h2>我的 GIS 开发经历</h2></div>
      </div>

      <div class="timeline">
        <article class="timeline-item">
          <div class="timeline-mark"><span>01</span></div>
          <div class="timeline-copy">
            <p class="timeline-meta">START / GIS 专业</p>
            <h3>在地理兴趣与计算机技术之间，找到交点</h3>
            <p>最初选择 GIS 专业，一方面是因为我对地理和空间世界一直很感兴趣，另一方面也希望把这种兴趣与快速发展的计算机技术结合起来。</p>
            <p>进入大学后，代码所展现出的创造力让我十分惊叹。很多原本停留在想法中的东西，可以通过一行行代码变成能够运行、交互并解决实际问题的系统。软件开发的职业前景也很有吸引力——对我而言，这是一条把兴趣与现实回报结合起来的道路。</p>
          </div>
        </article>

        <article class="timeline-item">
          <div class="timeline-mark"><span>02</span></div>
          <div class="timeline-copy">
            <p class="timeline-meta">EXPLORE / 两段 WebGIS 实习</p>
            <h3>从调用地图 API，到追问图形如何被画出来</h3>
            <p>在校期间，我认真对待每一门开发课程，也先后参加了两段 WebGIS 开发实习。接触的内容从基础地图 API 调用，逐渐深入到底层图形学与渲染原理。</p>
            <p>这个过程让我意识到，真正理解一项技术，不能只停留在“会调用接口”，还需要继续追问：数据怎样组织？坐标如何变换？图形为什么能够出现在屏幕上？性能瓶颈又来自哪里？</p>
          </div>
        </article>

        <article class="timeline-item">
          <div class="timeline-mark"><span>03</span></div>
          <div class="timeline-copy">
            <p class="timeline-meta">PRACTICE / GIS 前端开发</p>
            <h3>把学习经历，转化为真实的工程能力</h3>
            <p>凭借两段实习经历，毕业后我顺利找到了一份 GIS 前端开发工作。在七八个月的实际开发中，我开始把学校与实习阶段积累的知识真正放进工程环境，也更加清楚自己希望继续深入的方向。</p>
          </div>
        </article>

        <article class="timeline-item active">
          <div class="timeline-mark"><span>04</span></div>
          <div class="timeline-copy">
            <p class="timeline-meta">GROW / GIS 服务端与全栈</p>
            <h3>从页面走向服务，从工具走向底层</h3>
            <p>后来，一家曾在校招阶段面试过我的公司向我发出邀请。恰好我也在重新思考工作环境和个人发展，于是加入了第二家公司，并开始参与 GIS 服务端相关工作。</p>
            <p>我既参与过自研产品，也实际参与过项目交付，逐步接触 Java、C++、GeoServer、GeoTools、GDAL 等技术。前端、服务端、空间数据处理和项目实践由此连接起来，让我开始形成自己的 GIS 知识体系，也让我确定要沿着 GIS 全栈与底层技术继续深入。</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <span class="section-index">02</span>
        <div><p>WHY I WRITE</p><h2>为什么要写这个博客</h2></div>
      </div>
      <p class="section-lead">GIS 的知识跨度很大。坐标系、空间数据、算法、地图服务、前端渲染和系统架构彼此关联，却常常分散在不同的文档、项目和工具之中。</p>
      <div class="reason-grid">
        <article><span>01 / MAP</span><h3>整理知识地图</h3><p>把项目中遇到的问题、踩过的坑和对底层原理的理解记录下来，让零散经验变成一套能够持续积累的知识体系。</p></article>
        <article><span>02 / WHY</span><h3>讲清技术为什么</h3><p>不止记录 API 怎样调用，还会讨论它解决什么问题、底层做了哪些抽象、真实工程中存在哪些限制。</p></article>
        <article><span>03 / ITERATE</span><h3>保留认知变化</h3><p>把博客作为观察 GIS 行业和个人成长的窗口。结论会随着实践持续修订，认知改变本身也值得记录。</p></article>
      </div>
    </section>

    <section class="section-block stack-concept">
      <div class="section-heading">
        <span class="section-index">03</span>
        <div><p>FULL-STACK VIEW</p><h2>我对 GIS 全栈开发的理解</h2></div>
      </div>
      <blockquote>空间数据从哪里来，如何被组织、处理和分析，怎样通过服务对外提供，最终又如何在前端被渲染和交互，并转化为解决业务问题的能力。</blockquote>
      <div class="pipeline" aria-label="GIS 全链路">
        <div><i>01</i><strong>空间数据</strong><span>Data</span></div><b>→</b>
        <div><i>02</i><strong>计算分析</strong><span>Compute</span></div><b>→</b>
        <div><i>03</i><strong>服务发布</strong><span>Service</span></div><b>→</b>
        <div><i>04</i><strong>地图渲染</strong><span>Render</span></div><b>→</b>
        <div><i>05</i><strong>业务决策</strong><span>Insight</span></div>
      </div>
      <div class="two-column-copy">
        <p>我理解的 GIS 全栈，不是简单掌握一套前端框架和一门后端语言，也不是把常见 GIS 软件和工具罗列在一起。它更像是对空间信息完整生命周期的理解。</p>
        <p>具体语言和框架会变化，但从数据、算法、服务到渲染的整体链路，以及把真实业务抽象为空间计算问题的能力，才是更值得长期积累的部分。</p>
      </div>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <span class="section-index">04</span>
        <div><p>TECH RADAR</p><h2>我的技术栈与关注方向</h2></div>
      </div>
      <div class="tech-grid">
        <article><div class="tech-icon">FE</div><h3>GIS 前端与地图渲染</h3><p>WebGIS、二维与三维地图、图形学基础、WebGL 与 WebGPU。</p><footer><span>WEBGIS</span><span>WEBGL</span><span>WEBGPU</span></footer></article>
        <article><div class="tech-icon">SE</div><h3>GIS 服务端开发</h3><p>空间服务的设计、发布、调度，以及性能与稳定性优化。</p><footer><span>JAVA</span><span>C++</span><span>GEOSERVER</span></footer></article>
        <article><div class="tech-icon">SD</div><h3>空间数据与底层能力</h3><p>数据格式、坐标转换、空间索引、几何算法与大规模数据处理。</p><footer><span>GDAL</span><span>GEOTOOLS</span><span>ALGORITHM</span></footer></article>
        <article><div class="tech-icon">AR</div><h3>GIS 系统工程</h3><p>从数据处理、服务调度到前端展示的完整架构与工程边界。</p><footer><span>ARCHITECTURE</span><span>PERFORMANCE</span></footer></article>
      </div>
      <div class="ai-panel">
        <div class="ai-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
        <div><span class="ai-label">NEXT COORDINATE</span><h3>AI × GIS</h3><p>我正在持续思考：哪些基础能力仍然必须牢牢掌握，哪些工作可以交给 AI 提效，以及怎样让 AI 真正参与 GIS 数据处理、空间分析、服务发布和业务决策。</p></div>
        <strong>探索<br>空间智能</strong>
      </div>
    </section>

    <section class="section-block reading-section">
      <div class="section-heading">
        <span class="section-index">05</span>
        <div><p>READING ROUTES</p><h2>博客阅读指南</h2></div>
      </div>
      <div class="route-list">
        <a href="/topics/gis-full-stack"><span>ROUTE 01</span><strong>GIS 全链路</strong><p>系统理解空间数据、算法、服务与渲染。</p><i>↗</i></a>
        <a href="/topics/"><span>ROUTE 02</span><strong>技术专题</strong><p>深入 GDAL、GeoServer、C++、Java 与图形渲染。</p><i>↗</i></a>
        <a href="/posts/"><span>ROUTE 03</span><strong>项目与实践</strong><p>从真实问题出发，复盘完整的工程落地过程。</p><i>↗</i></a>
        <a href="/topics/ai-gis"><span>ROUTE 04</span><strong>AI × GIS</strong><p>探索智能工具与空间技术结合的新可能。</p><i>↗</i></a>
      </div>
      <p class="closing">这个博客既是一份个人成长记录，也是一场长期探索。<br>如果某篇文章恰好为你带来一点新的思路，那么这些记录就有了更大的意义。</p>
    </section>
  </main>
</template>

<style scoped>
.about-page { --cyan:#31d7be; --blue:#4da8ff; --deep:#071b22; width:100%; max-width:1200px; margin:0 auto; padding:48px 24px 110px; color:var(--vp-c-text-1); }
.hero-panel { position:relative; min-height:570px; padding:72px clamp(28px,6vw,88px) 32px; overflow:hidden; color:#eafdf9; border:1px solid rgba(73,218,193,.23); border-radius:24px; background:radial-gradient(circle at 77% 34%,rgba(18,158,151,.22),transparent 26%),radial-gradient(circle at 20% 0,rgba(54,117,180,.2),transparent 31%),linear-gradient(145deg,#06171d 0%,#09262b 56%,#071b22 100%); box-shadow:0 26px 70px rgba(4,34,40,.18); }
.hero-grid { position:absolute; inset:0; opacity:.19; background-image:linear-gradient(rgba(92,228,205,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(92,228,205,.2) 1px,transparent 1px); background-size:44px 44px; mask-image:linear-gradient(to right,black,transparent 78%); }
.hero-grid::after { content:""; position:absolute; inset:0; background:linear-gradient(120deg,transparent 48%,rgba(75,239,216,.08) 49%,transparent 50%); }
.contour { position:absolute; right:-40px; top:35px; width:min(47%,480px); fill:none; stroke:rgba(80,224,200,.25); stroke-width:1.2; }
.radar { position:absolute; right:11%; top:23%; width:220px; aspect-ratio:1; border:1px solid rgba(79,225,201,.25); border-radius:50%; box-shadow:inset 0 0 35px rgba(49,215,190,.05); }
.radar::before,.radar::after { content:""; position:absolute; inset:22%; border:1px solid rgba(79,225,201,.18); border-radius:50%; }
.radar::after { inset:44% -12%; border-radius:0; border-width:1px 0; }
.radar span { position:absolute; left:50%; top:50%; width:47%; height:1px; transform-origin:left; background:linear-gradient(90deg,var(--cyan),transparent); animation:scan 8s linear infinite; }
@keyframes scan { to { transform:rotate(360deg); } }
.hero-content { position:relative; z-index:2; max-width:700px; }
.eyebrow,.hero-label,.section-heading p,.timeline-meta,.reason-grid article>span,.ai-label { letter-spacing:.14em; font:600 11px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; }
.eyebrow { display:flex; align-items:center; gap:10px; margin-bottom:72px; color:rgba(203,245,237,.56); }
.eyebrow i { width:7px; height:7px; border-radius:50%; background:var(--cyan); box-shadow:0 0 12px var(--cyan); }
.hero-label { color:var(--cyan); }
.hero-panel h1 { margin:14px 0 22px; max-width:700px; color:#f1fffc; font-size:clamp(42px,6vw,72px); line-height:1.06; letter-spacing:-.055em; }
.hero-panel h1 em { color:transparent; font-style:normal; background:linear-gradient(100deg,#80f0d9,#65b9ff); background-clip:text; -webkit-background-clip:text; }
.hero-intro { max-width:620px; color:rgba(224,248,243,.7); font-size:16px; line-height:1.9; }
.hero-tags { display:flex; flex-wrap:wrap; gap:9px; margin-top:34px; }
.hero-tags span { padding:7px 10px; color:rgba(206,246,238,.72); font:500 10px/1 ui-monospace,Consolas,monospace; letter-spacing:.08em; border:1px solid rgba(84,219,196,.2); border-radius:4px; background:rgba(18,75,76,.35); }
.hero-status { position:relative; z-index:2; display:grid; grid-template-columns:repeat(3,1fr); gap:1px; margin-top:68px; padding-top:25px; border-top:1px solid rgba(90,219,197,.16); }
.hero-status div { display:flex; flex-direction:column; gap:6px; }
.hero-status span { color:rgba(190,232,225,.4); font:600 9px/1 ui-monospace,Consolas,monospace; letter-spacing:.14em; }
.hero-status strong { color:rgba(235,255,251,.8); font-size:13px; font-weight:500; }
.hero-status .online::before { content:""; display:inline-block; width:6px; height:6px; margin-right:8px; border-radius:50%; background:var(--cyan); box-shadow:0 0 9px var(--cyan); }
.section-block { padding:100px clamp(4px,4vw,42px) 0; }
.section-heading { display:flex; align-items:flex-start; gap:20px; margin-bottom:42px; }
.section-index { display:grid; place-items:center; width:38px; height:38px; flex:none; color:var(--vp-c-brand-1); font:600 11px/1 ui-monospace,Consolas,monospace; border:1px solid var(--vp-c-brand-soft); border-radius:50%; }
.section-heading p { margin:0 0 6px; color:var(--vp-c-brand-1); }
.section-heading h2 { margin:0; border:0; font-size:clamp(27px,4vw,38px); letter-spacing:-.035em; }
.section-lead { max-width:800px; margin:-12px 0 36px 58px; color:var(--vp-c-text-2); font-size:17px; line-height:1.9; }
.timeline { margin-left:18px; }
.timeline-item { display:grid; grid-template-columns:66px 1fr; position:relative; padding-bottom:55px; }
.timeline-item:not(:last-child)::before { content:""; position:absolute; left:17px; top:36px; bottom:0; width:1px; background:linear-gradient(var(--vp-c-brand-1),var(--vp-c-divider)); }
.timeline-mark { position:relative; z-index:1; display:grid; place-items:center; width:35px; height:35px; color:var(--vp-c-brand-1); font:600 10px/1 ui-monospace,Consolas,monospace; border:1px solid var(--vp-c-brand-1); border-radius:50%; background:var(--vp-c-bg); box-shadow:0 0 0 7px var(--vp-c-bg); }
.timeline-item.active .timeline-mark { color:#06251e; background:var(--vp-c-brand-1); box-shadow:0 0 0 7px var(--vp-c-bg),0 0 22px var(--vp-c-brand-soft); }
.timeline-copy { max-width:850px; padding:2px 0 0; }
.timeline-meta { margin:0 0 8px; color:var(--vp-c-brand-1); }
.timeline-copy h3 { margin:0 0 14px; font-size:21px; }
.timeline-copy p { margin:8px 0; color:var(--vp-c-text-2); line-height:1.85; }
.reason-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-left:58px; }
.reason-grid article,.tech-grid article { position:relative; overflow:hidden; padding:27px; border:1px solid var(--vp-c-divider); border-radius:14px; background:linear-gradient(145deg,var(--vp-c-bg-soft),transparent); transition:transform .25s,border-color .25s,box-shadow .25s; }
.reason-grid article::before,.tech-grid article::before { content:""; position:absolute; top:0; left:0; width:42%; height:1px; background:linear-gradient(90deg,var(--vp-c-brand-1),transparent); }
.reason-grid article:hover,.tech-grid article:hover { transform:translateY(-4px); border-color:var(--vp-c-brand-1); box-shadow:0 18px 40px rgba(5,70,60,.08); }
.reason-grid article>span { color:var(--vp-c-brand-1); }
.reason-grid h3,.tech-grid h3 { margin:22px 0 10px; font-size:18px; }
.reason-grid p,.tech-grid p { margin:0; color:var(--vp-c-text-2); font-size:14px; line-height:1.75; }
.stack-concept blockquote { margin:0 0 34px 58px; padding:22px 26px; color:var(--vp-c-text-1); font-size:18px; line-height:1.8; border-left:2px solid var(--vp-c-brand-1); background:linear-gradient(90deg,var(--vp-c-brand-soft),transparent); }
.pipeline { display:flex; align-items:center; justify-content:center; gap:12px; margin-left:58px; padding:28px 20px; border:1px solid var(--vp-c-divider); border-radius:15px; background-image:linear-gradient(var(--vp-c-brand-soft) 1px,transparent 1px),linear-gradient(90deg,var(--vp-c-brand-soft) 1px,transparent 1px); background-size:30px 30px; }
.pipeline div { min-width:100px; padding:13px 12px; text-align:center; border:1px solid var(--vp-c-divider); border-radius:9px; background:var(--vp-c-bg); }
.pipeline i { display:block; color:var(--vp-c-brand-1); font:600 9px/1 ui-monospace,Consolas,monospace; }
.pipeline strong { display:block; margin:7px 0 3px; font-size:14px; }
.pipeline span { color:var(--vp-c-text-3); font:10px/1 ui-monospace,Consolas,monospace; }
.pipeline b { color:var(--vp-c-brand-1); font-weight:400; }
.two-column-copy { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin:28px 0 0 58px; }
.two-column-copy p { color:var(--vp-c-text-2); line-height:1.85; }
.tech-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-left:58px; }
.tech-icon { display:grid; place-items:center; width:42px; height:42px; color:var(--vp-c-brand-1); font:700 11px/1 ui-monospace,Consolas,monospace; border:1px solid var(--vp-c-brand-1); border-radius:9px; background:var(--vp-c-brand-soft); }
.tech-grid article h3 { margin-top:18px; }
.tech-grid footer { display:flex; flex-wrap:wrap; gap:6px; margin-top:20px; }
.tech-grid footer span { padding:5px 7px; color:var(--vp-c-text-3); font:600 9px/1 ui-monospace,Consolas,monospace; border:1px solid var(--vp-c-divider); border-radius:4px; }
.ai-panel { display:grid; grid-template-columns:100px 1fr auto; align-items:center; gap:28px; margin:15px 0 0 58px; padding:31px; overflow:hidden; color:#e8fff9; border:1px solid rgba(70,221,196,.2); border-radius:15px; background:linear-gradient(120deg,#071d24,#0b3436); }
.ai-panel h3 { margin:5px 0 8px; color:#f1fffc; font-size:26px; }
.ai-panel p { margin:0; color:rgba(220,248,242,.66); font-size:14px; line-height:1.8; }
.ai-panel>strong { color:rgba(123,238,217,.25); font-size:28px; line-height:1.15; text-align:right; white-space:nowrap; }
.ai-label { color:var(--cyan); }
.ai-orbit { position:relative; width:78px; height:78px; border:1px solid rgba(73,218,193,.35); border-radius:50%; }
.ai-orbit::before,.ai-orbit::after { content:""; position:absolute; inset:19%; border:1px solid rgba(73,218,193,.23); border-radius:50%; }
.ai-orbit::after { inset:45%; border:0; background:var(--cyan); box-shadow:0 0 16px var(--cyan); }
.ai-orbit i { position:absolute; width:5px; height:5px; border-radius:50%; background:var(--cyan); }
.ai-orbit i:nth-child(1){left:8px;top:16px}.ai-orbit i:nth-child(2){right:1px;top:39px}.ai-orbit i:nth-child(3){left:28px;bottom:-2px}
.route-list { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-left:58px; }
.route-list a { display:grid; grid-template-columns:1fr auto; gap:6px 20px; padding:23px; color:var(--vp-c-text-1); text-decoration:none; border:1px solid var(--vp-c-divider); border-radius:12px; transition:border-color .2s,transform .2s,background .2s; }
.route-list a:hover { transform:translateY(-3px); border-color:var(--vp-c-brand-1); background:var(--vp-c-brand-soft); }
.route-list span { grid-column:1; color:var(--vp-c-brand-1); font:600 9px/1 ui-monospace,Consolas,monospace; letter-spacing:.12em; }
.route-list strong { grid-column:1; font-size:18px; }
.route-list p { grid-column:1; margin:0; color:var(--vp-c-text-2); font-size:13px; }
.route-list i { grid-column:2; grid-row:1/4; align-self:center; color:var(--vp-c-brand-1); font-size:20px; font-style:normal; }
.closing { margin:70px auto 10px; color:var(--vp-c-text-2); font-size:16px; line-height:2; text-align:center; }
@media (max-width:760px) {
  .about-page { padding:24px 16px 80px; }
  .hero-panel { min-height:auto; padding:42px 24px 25px; border-radius:17px; }
  .radar,.contour { opacity:.45; }
  .eyebrow { margin-bottom:50px; font-size:9px; }
  .hero-panel h1 { font-size:40px; }
  .hero-status { grid-template-columns:1fr; gap:18px; }
  .section-block { padding-top:72px; }
  .section-lead,.reason-grid,.stack-concept blockquote,.pipeline,.two-column-copy,.tech-grid,.ai-panel,.route-list { margin-left:0; }
  .timeline { margin-left:0; }
  .timeline-item { grid-template-columns:52px 1fr; }
  .reason-grid,.tech-grid,.route-list,.two-column-copy { grid-template-columns:1fr; }
  .pipeline { justify-content:flex-start; overflow-x:auto; }
  .pipeline div { min-width:105px; }
  .ai-panel { grid-template-columns:70px 1fr; gap:18px; padding:24px; }
  .ai-panel>strong { display:none; }
  .ai-orbit { width:62px; height:62px; }
}
@media (prefers-reduced-motion:reduce) { .radar span { animation:none; } }
</style>
