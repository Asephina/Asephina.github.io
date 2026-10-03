/* ==========================================================================
   纳凌薇 · 站点共用脚本
   只做三件事：注入顶栏、取 JSON、转义文本。没有依赖，没有构建步骤。
   ========================================================================== */
(function () {
    'use strict';

    var NAV = [
        { href: 'index.html', label: '主页' },
        { href: 'core.html', label: '核心' },
        { href: 'create.html', label: '创造存在性' },
        { href: 'world.html', label: '予你的人间' }
    ];

    /** 分组名 → 点缀色。写在小标题上，不再靠数第几个 .grid 来配色。 */
    var TONE = {
        '言与思': 'bloom',
        '形与声': 'jade',
        '名与存': 'gold',
        '信与物': 'bloom',
        '忆与痕': 'jade',
        '来路': 'gold',
        '她': 'jade',
        '其余的画': 'bloom',
        '苦': 'bloom',
        '暖': 'gold'
    };

    var LM = window.LM = {};

    /** 页面路径（用于判断当前栏） */
    function here() {
        var p = location.pathname.split('/').pop();
        return p === '' ? 'index.html' : p;
    }

    /** 注入顶栏；不需要顶栏的页面（主页）不调用它 */
    LM.topbar = function () {
        var cur = here();
        var links = NAV.map(function (n) {
            var on = n.href === cur ? ' aria-current="page"' : '';
            return '<a href="' + n.href + '"' + on + '>' + n.label + '</a>';
        }).join('');
        var el = document.createElement('div');
        el.className = 'topbar';
        el.innerHTML = '<a class="brand" href="index.html">纳凌薇</a><nav>' + links + '</nav>';
        document.body.insertBefore(el, document.body.firstChild);
    };

    /** 取 JSON；失败返回 null，由调用方显示空态 */
    LM.json = function (path) {
        return fetch(path, { cache: 'no-cache' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    };

    /** 文本转义（文章正文直接当纯文本渲染，不走 innerHTML） */
    LM.esc = function (s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    /** 按小标题给每一组上色：读一遍 h2.sec，设到它下面那一块上 */
    LM.tone = function () {
        var secs = document.querySelectorAll('h2.sec');
        for (var i = 0; i < secs.length; i++) {
            var t = (secs[i].textContent || '').trim();
            if (!TONE[t]) continue;
            var el = secs[i].nextElementSibling;
            var box = null;
            while (el && !box) {
                if (el.classList && (el.classList.contains('grid') || el.classList.contains('gal'))) box = el;
                el = el.nextElementSibling;
            }
            if (box) box.setAttribute('data-tone', TONE[t]);
        }
    };

    /** 版权记号：一个圈里一个 C（内联 SVG，不必外链图片） */
    LM.copyMark = function (size) {
        size = size || 15;
        return '<svg class="cc" viewBox="0 0 24 24" width="' + size + '" height="' + size +
            '" aria-hidden="true" focusable="false">' +
            '<circle cx="12" cy="12" r="10.2" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
            '<path d="M15.2 9.4a4.1 4.1 0 1 0 0 5.2" fill="none" stroke="currentColor" ' +
            'stroke-width="1.9" stroke-linecap="round"/></svg>';
    };

    /** 通用底栏：只有一行，版权记号 + 年份 + 使用协议（隐私政策在使用协议内部） */
    LM.foot = function () {
        return '纳凌薇 · 爱希尔芙纳 · Amara Sephina　' + LM.copyMark(15) +
            ' 2026　|　<a href="terms.html">使用协议</a>';
    };

    /** 进门：在每一页上挂上站点的锁。门屏会先把内容遮住，口令对了才放行。 */
    LM.gate = function () {
        if (document.querySelector('script[data-gate]')) return;
        var s = document.createElement('script');
        s.src = 'assets/gate.js';
        s.setAttribute('data-gate', '1');
        document.head.appendChild(s);
    };

    /** 把 #head / #foot 的公共部分填上（各页只写自己那一段） */
    LM.shell = function (opts) {
        opts = opts || {};
        LM.gate();
        LM.topbar();
        LM.tone();
        var f = document.getElementById('foot');
        if (f) {
            f.className = 'foot';
            f.innerHTML = LM.foot();
        }
    };
})();
