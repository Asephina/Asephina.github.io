/* ==========================================================================
   纳凌薇 · 进门（站点的锁）
   --------------------------------------------------------------------------
   网站还在做，暂时不给外人和搜索引擎看。
   这个脚本做三件事：
     1. 页面一加载就把内容遮住，只留一块「输入口令」的屏；
     2. 口令对了，在本标签页记一个标记，这一趟浏览就不再问；
     3. 口令不对就什么都不显示。
   换口令：改下面 HASH 即可（先算 SHA-256）。

   说明（很重要）：
     这是**客户端**的锁，挡住的是「打开网址的人」。
     文件本身仍然躺在公开的 GitHub 仓库里，懂行的人绕过它去看源码是能看到的。
     要挡住这种人，得换成 Cloudflare Access 那种服务端鉴权，或者把仓库转私有。
   ========================================================================== */
(function () {
    'use strict';

    var HASH = 'ceaca80e97c4bc38a4a9fa1f28e36ef5f2193b88e6aadd0fefb85f632722d6f2';
    var KEY = 'lm.gate';
    var NOSCRIPT = '<div class="gate-note">这个页面需要 JavaScript 才能打开。</div>';

    // 已经有标记就直接放行，什么都不做
    try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) {}

    // 门屏自带样式：这样连不加载 site.css 的页面（比如后台）也能用
    var CSS = [
        '.gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;',
        'justify-content:center;padding:24px;background:#0a0a15;text-align:center;',
        'font-family:"Noto Serif SC","Songti SC","PingFang SC","Microsoft YaHei",serif}',
        '.gate-box{width:100%;max-width:360px;padding:34px 26px 26px;border:1px solid rgba(161,140,209,.17);',
        'border-radius:24px;background:rgba(20,20,42,.86);box-shadow:0 26px 60px rgba(0,0,0,.5)}',
        '.gate-mark{color:#fbc2eb;line-height:0;margin-bottom:14px}',
        '.gate h1{margin:0 0 10px;font-size:22px;font-weight:500;letter-spacing:.24em;',
        'text-indent:.24em;color:#ece9f6}',
        '.gate-sub{margin:0 0 22px;font-size:12.5px;line-height:2;color:#7b7595;letter-spacing:.06em}',
        '.gate-row{display:flex;gap:8px}',
        '.gate-in{flex:1;min-width:0;font-family:inherit;font-size:14px;letter-spacing:.1em;',
        'padding:11px 14px;border-radius:999px;border:1px solid rgba(161,140,209,.17);',
        'background:#06060e;color:#ece9f6;outline:none}',
        '.gate-in:focus{border-color:#a18cd1}',
        '.gate-in::placeholder{color:#544f6d;letter-spacing:.2em}',
        '.gate-btn{font-family:inherit;font-size:13px;letter-spacing:.12em;padding:11px 20px;',
        'border-radius:999px;border:1px solid rgba(161,140,209,.34);background:rgba(161,140,209,.14);',
        'color:#ece9f6;cursor:pointer}',
        '.gate-btn:hover{border-color:#a18cd1}.gate-btn:disabled{opacity:.5;cursor:default}',
        '.gate-err{margin:12px 0 0;min-height:1.2em;font-size:12px;letter-spacing:.06em;color:#f2a0b5}',
        '.gate-foot{margin:18px 0 0;padding-top:16px;border-top:1px solid rgba(161,140,209,.09);',
        'font-size:11.5px;line-height:1.9;letter-spacing:.06em;color:#544f6d}',
        '.gate-note{font-size:12px;color:#7b7595;line-height:2}'
    ].join('');

    // 先遮住内容，再插门屏：样式在 body 一出现就生效，避免闪一下再盖上
    var style = document.createElement('style');
    style.textContent = CSS + 'body>*:not(.gate){display:none!important}';
    (document.head || document.documentElement).appendChild(style);

    // 造一块门屏
    var gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML = [
        '<div class="gate-box">',
        '  <div class="gate-mark"></div>',
        '  <h1>纳凌薇</h1>',
        '  <p class="gate-sub">这里还在做，先不开门。</p>',
        '  <div class="gate-row">',
        '    <input class="gate-in" type="password" autocomplete="current-password" placeholder="口令" aria-label="口令">',
        '    <button class="gate-btn" type="button">进去</button>',
        '  </div>',
        '  <p class="gate-err" role="alert"></p>',
        '  <p class="gate-foot">如果你是在等它做好 —— 谢谢你愿意等。</p>',
        '</div>'
    ].join('');
    (document.body || document.documentElement).appendChild(gate);

    // 花心那颗小圆点：用 DOM 拼一个，不写 innerHTML
    var mark = gate.querySelector('.gate-mark');
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '26');
    svg.setAttribute('height', '26');
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', '12'); c.setAttribute('cy', '12'); c.setAttribute('r', '10.2');
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', 'currentColor'); c.setAttribute('stroke-width', '1.4');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M15.2 9.4a4.1 4.1 0 1 0 0 5.2');
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.7'); p.setAttribute('stroke-linecap', 'round');
    svg.appendChild(c); svg.appendChild(p);
    if (mark) mark.appendChild(svg);

    var input = gate.querySelector('.gate-in');
    var button = gate.querySelector('.gate-btn');
    var err = gate.querySelector('.gate-err');
    var tries = 0;

    function hex(buf) {
        var b = new Uint8Array(buf), s = '';
        for (var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
        return s;
    }

    function digest(text) {
        if (window.crypto && crypto.subtle && window.TextEncoder) {
            return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
                .then(hex);
        }
        return Promise.reject(new Error('这个浏览器需要 https 才能校验口令'));
    }

    function submit() {
        var v = (input.value || '');
        if (!v) { err.textContent = '口令是空的。'; input.focus(); return; }
        button.disabled = true;
        digest(v).then(function (h) {
            if (h === HASH) {
                try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
                location.reload();
                return;
            }
            tries++;
            button.disabled = false;
            input.value = '';
            input.focus();
            err.textContent = tries >= 3 ? '还是不对。慢一点，再试一次。' : '口令不对。';
        }).catch(function (e2) {
            button.disabled = false;
            err.textContent = e2.message;
        });
    }

    if (button) button.addEventListener('click', submit);
    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') submit();
        });
    }
    setTimeout(function () { if (input) input.focus(); }, 60);

    // 没有 JS 的环境提示一句
    var ns = document.createElement('noscript');
    ns.innerHTML = NOSCRIPT;
    gate.appendChild(ns);
})();
