(function () {
  'use strict';

  /* ---------- Three.js particle hero ---------- */
  var canvas = document.getElementById('hero-canvas');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.THREE && canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 14;

    var COUNT = window.innerWidth < 700 ? 900 : 2200;
    var palette = [0x7C5CFF, 0x22D3EE, 0xF472B6].map(function (c) { return new THREE.Color(c); });
    var pos = new Float32Array(COUNT * 3);
    var col = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      var r = 6 + Math.random() * 14;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      var c = palette[i % 3];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    // glowing wireframe accent
    var knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(2.2, 0.55, 140, 16),
      new THREE.MeshBasicMaterial({ color: 0x7C5CFF, wireframe: true, transparent: true, opacity: 0.18 })
    );
    scene.add(knot);

    var mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    var visible = true;
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);

    var clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      var t = clock.getElapsedTime();
      if (!reduce) {
        points.rotation.y = t * 0.04;
        points.rotation.x = t * 0.015;
        knot.rotation.x = t * 0.15;
        knot.rotation.y = t * 0.2;
      }
      camera.position.x += (mx * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (-my * 1.2 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    })();
  }

  /* ---------- Typing effect ---------- */
  var words = ['Aspiring Developer', 'Problem Solver', 'Lifelong Learner', 'Web Enthusiast'];
  var el = document.getElementById('typed');
  var w = 0, ch = 0, del = false;
  function type() {
    var word = words[w];
    el.textContent = word.slice(0, ch);
    if (!del && ch === word.length) { del = true; return setTimeout(type, 1600); }
    if (del && ch === 0) { del = false; w = (w + 1) % words.length; }
    ch += del ? -1 : 1;
    setTimeout(type, del ? 40 : 85);
  }
  if (reduce) { el.textContent = words[0]; } else { type(); }

  /* ---------- Scroll reveal, skill bars, counters ---------- */
  function countUp(node) {
    var target = +node.dataset.count, start = performance.now(), dur = 1500;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var t = en.target;
      t.classList.add('in');
      t.querySelectorAll('.bar i').forEach(function (b) { b.style.width = b.dataset.w + '%'; });
      t.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(t);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(function (n) { io.observe(n); });
  // stats block lives inside a reveal-right container; skill bars inside .reveal items

  /* ---------- Card tilt ---------- */
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Nav, progress, mobile menu ---------- */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress');
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    nav.classList.toggle('scrolled', window.scrollY > 30);
    bar.style.width = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  }, { passive: true });

  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
