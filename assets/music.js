/* ==========================================================================
   音乐页
   曲目表 + 两条进度：一条是页面自己的（跟着背景配色的细线），
   一条是浏览器原生播放条（已经用 CSS 拆掉灰底，尽量不抢戏）。
   ========================================================================== */
(function () {
    'use strict';

    var TRACKS = [
        { file: 'music/凌薇花.mp3',   name: '凌薇花',   note: '写给那朵花' },
        { file: 'music/凌薇花开.mp3', name: '凌薇花开', note: '花开的时候' },
        { file: 'music/听见.mp3',     name: '听见',     note: '被听见' },
        { file: 'music/睡懒觉.mp3',   name: '睡懒觉',   note: '早晨' },
        { file: 'music/19.04.mp3',    name: '19.04',    note: '' }
    ];

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    var box = document.getElementById('tracks');
    if (!box) return;

    box.innerHTML = TRACKS.map(function (t, i) {
        var no = (i + 1 < 10 ? '0' : '') + (i + 1);
        return '<div class="track">' +
            '<div class="no">' + no + '</div>' +
            '<div class="name">' +
            '<b>' + esc(t.name) + '</b>' +
            (t.note ? '<span class="note">' + esc(t.note) + '</span>' : '') +
            '</div>' +
            '<audio controls preload="metadata" src="' + esc(t.file) + '"></audio>' +
            '<div class="bar" aria-hidden="true"><i></i></div>' +
            '</div>';
    }).join('');

    var players = Array.prototype.slice.call(box.querySelectorAll('audio'));
    var bars = Array.prototype.slice.call(box.querySelectorAll('.bar i'));

    // 进度条跟着走
    players.forEach(function (a, i) {
        function tick() {
            var d = a.duration;
            var p = (d && isFinite(d)) ? (a.currentTime / d) : 0;
            if (p < 0) p = 0;
            if (p > 1) p = 1;
            bars[i].style.width = (p * 100).toFixed(2) + '%';
        }
        a.addEventListener('timeupdate', tick);
        a.addEventListener('loadedmetadata', tick);
        a.addEventListener('seeked', tick);
        a.addEventListener('ended', tick);

        // 一首一首来，不叠着放
        a.addEventListener('play', function () {
            players.forEach(function (b) { if (b !== a && !b.paused) b.pause(); });
        });
    });
})();
