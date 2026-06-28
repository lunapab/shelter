(function () {
  'use strict';


  let petsData = [];

  async function loadPets() {
    const res = await fetch('pets.json');
    petsData = await res.json();
  }


  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getBreakpoint() {
    const w = window.innerWidth;
    if (w >= 1280) return 'desktop';
    if (w >= 768)  return 'tablet';
    return 'mobile';
  }

  function cardsPerView() {
    const bp = getBreakpoint();
    return bp === 'desktop' ? 3 : bp === 'tablet' ? 2 : 1;
  }

  function cardsPerPage() {
    const bp = getBreakpoint();
    return bp === 'desktop' ? 8 : bp === 'tablet' ? 6 : 3;
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }


  function createCard(pet) {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.name = pet.name;
    div.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${pet.img}" alt="${pet.name}" loading="lazy">
      </div>
      <p class="card-name">${pet.name}</p>
      <button class="btn-outline" type="button">Learn more</button>
    `;
    return div;
  }


  function initBurger() {
    const burger = document.querySelector('.burger');
    if (!burger) return;

    const overlay = document.createElement('div');
    overlay.className = 'mob-overlay';
    document.body.appendChild(overlay);

    const nav = document.createElement('nav');
    nav.className = 'mob-nav';
    nav.innerHTML = `
      <button class="mob-nav__close" aria-label="Close menu" type="button"></button>
      <ul>
        <li><a href="index.html#about">About the shelter</a></li>
        <li><a href="pets.html">Our pets</a></li>
        <li><a href="index.html#help">Help the shelter</a></li>
        <li><a href="index.html#footer">Contacts</a></li>
      </ul>
    `;
    document.body.appendChild(nav);

    const closeBtn = nav.querySelector('.mob-nav__close');

    function openMenu() {
      burger.classList.add('burger--open');
      nav.classList.add('mob-nav--open');
      overlay.classList.add('mob-overlay--open');
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      burger.classList.remove('burger--open');
      nav.classList.remove('mob-nav--open');
      overlay.classList.remove('mob-overlay--open');
      document.body.classList.remove('no-scroll');
    }

    burger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }


  function initCarousel() {
    const wrapper = document.querySelector('.friends-slider-wrapper');
    if (!wrapper) return;

    const btnPrev = wrapper.querySelector('.slider-btn--prev');
    const btnNext = wrapper.querySelector('.slider-btn--next');
    if (!btnPrev || !btnNext) return;

    let liveTrack    = wrapper.querySelector('.friends-cards');
    if (!liveTrack) return;

    let currentNames = [];
    let animating    = false;
    const DUR        = 400;

    function pickNext(n, excludeNames) {
      return shuffle(petsData.filter(p => !excludeNames.includes(p.name))).slice(0, n);
    }

    function fillTrack(el, pets) {
      el.innerHTML = '';
      pets.forEach(p => el.appendChild(createCard(p)));
    }

    (function renderInitial() {
      const pets = shuffle(petsData).slice(0, cardsPerView());
      fillTrack(liveTrack, pets);
      currentNames = pets.map(p => p.name);
    })();

    function slide(dir) {
      if (animating) return;
      animating = true;

      const nextPets = pickNext(cardsPerView(), currentNames);

      const incoming = document.createElement('div');
      incoming.className = 'friends-cards';
      fillTrack(incoming, nextPets);

      const clipZone = document.createElement('div');
      clipZone.style.cssText = 'position:relative;overflow:hidden;flex:1;min-width:0;height:' + liveTrack.offsetHeight + 'px;';

      liveTrack.parentNode.insertBefore(clipZone, liveTrack);
      clipZone.appendChild(liveTrack);
      clipZone.appendChild(incoming);

      liveTrack.style.cssText = 'position:absolute;top:0;left:0;width:100%;transition:none;transform:translateX(0);';
      incoming.style.cssText  = `position:absolute;top:0;left:0;width:100%;transition:none;transform:translateX(${dir === 'next' ? '100%' : '-100%'});`;

      incoming.getBoundingClientRect();

      const outTX = dir === 'next' ? '-100%' : '100%';
      liveTrack.style.transition = `transform ${DUR}ms ease`;
      incoming.style.transition  = `transform ${DUR}ms ease`;
      liveTrack.style.transform  = `translateX(${outTX})`;
      incoming.style.transform   = 'translateX(0)';

      setTimeout(() => {
        liveTrack.remove();

        incoming.style.cssText = '';
        clipZone.parentNode.insertBefore(incoming, clipZone);
        clipZone.remove();

        liveTrack    = incoming;
        currentNames = nextPets.map(p => p.name);
        animating    = false;
      }, DUR);
    }

    btnPrev.addEventListener('click', () => slide('prev'));
    btnNext.addEventListener('click', () => slide('next'));

    let lastBP = getBreakpoint();
    window.addEventListener('resize', debounce(() => {
      const newBP = getBreakpoint();
      if (newBP !== lastBP) {
        lastBP = newBP;
        const pets = shuffle(petsData).slice(0, cardsPerView());
        fillTrack(liveTrack, pets);
        currentNames = pets.map(p => p.name);
      }
    }, 200));
  }


  function build48() {
    // 8 pets × 6 = 48
    const n     = petsData.length; // 8
    const times = 48 / n;          // 6
    const result = [];

    for (let r = 0; r < times; r++) {
      const offset = r % n;
      for (let i = 0; i < n; i++) {
        result.push(petsData[(i + offset) % n]);
      }
    }

    for (let i = 1; i < result.length; i++) {
      if (result[i].name === result[i - 1].name) {
        for (let j = i + 1; j < result.length; j++) {
          if (result[j].name !== result[i - 1].name &&
              result[j].name !== result[i + 1]?.name) {
            [result[i], result[j]] = [result[j], result[i]];
            break;
          }
        }
      }
    }

    return result;
  }

  function initPagination() {
    let liveGrid     = document.querySelector('.pets-grid');
    const pagination = document.querySelector('.pagination');
    if (!liveGrid || !pagination) return;

    const allCards  = build48();
    let currentPage = 1;
    let animating   = false;
    const DUR       = 350;

    function totalPages() { return allCards.length / cardsPerPage(); }

    function getSlice(page) {
      const cpp = cardsPerPage();
      return allCards.slice((page - 1) * cpp, page * cpp);
    }

    function fillGrid(el, pets) {
      el.innerHTML = '';
      pets.forEach(p => el.appendChild(createCard(p)));
    }

    function goTo(page) {
      if (animating) return;
      const total = totalPages();
      if (page < 1 || page > total || page === currentPage) return;

      animating = true;
      const dir      = page > currentPage ? 1 : -1;
      const nextPets = getSlice(page);
      const parent   = liveGrid.parentNode;

      const incoming = document.createElement('div');
      incoming.className = liveGrid.className;
      fillGrid(incoming, nextPets);

      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;overflow:hidden;width:100%;';
      parent.insertBefore(wrap, liveGrid);
      wrap.appendChild(liveGrid);
      wrap.appendChild(incoming);
      wrap.style.height = liveGrid.offsetHeight + 'px';

      liveGrid.style.cssText = `position:absolute;top:0;left:0;width:100%;`;
      incoming.style.cssText = `position:absolute;top:0;left:0;width:100%;transform:translateX(${dir * 100}%);`;

      incoming.getBoundingClientRect();

      liveGrid.style.transition  = `transform ${DUR}ms ease, opacity ${DUR}ms ease`;
      incoming.style.transition  = `transform ${DUR}ms ease, opacity ${DUR}ms ease`;
      liveGrid.style.transform   = `translateX(${-dir * 60}%)`;
      liveGrid.style.opacity     = '0';
      incoming.style.transform   = 'translateX(0)';

      setTimeout(() => {
        liveGrid.remove();

        incoming.style.cssText = '';

        parent.insertBefore(incoming, wrap);
        wrap.remove();

        liveGrid    = incoming;
        currentPage = page;
        animating   = false;
        renderPagination();
      }, DUR);
    }

    function renderPagination() {
      pagination.innerHTML = '';
      const total = totalPages();

      function btn(label, page, disabled, active) {
        const b = document.createElement('button');
        b.className = 'pag-btn';
        b.innerHTML = label;
        if (disabled) { b.classList.add('pag-btn--disabled'); b.disabled = true; }
        if (active)     b.classList.add('pag-btn--active');
        if (!disabled && !active) b.addEventListener('click', () => goTo(page));
        return b;
      }

      pagination.appendChild(btn('&laquo;',  1,                currentPage === 1,     false));
      pagination.appendChild(btn('&lsaquo;', currentPage - 1,  currentPage === 1,     false));

      // Page numbers with ellipsis
      const nums = [...new Set(
        [1, currentPage - 1, currentPage, currentPage + 1, total]
          .filter(p => p >= 1 && p <= total)
      )].sort((a, b) => a - b);

      let prev = 0;
      nums.forEach(p => {
        if (p - prev > 1) {
          const dots = document.createElement('span');
          dots.className = 'pag-dots';
          dots.textContent = '…';
          pagination.appendChild(dots);
        }
        pagination.appendChild(btn(p, p, false, p === currentPage));
        prev = p;
      });

      pagination.appendChild(btn('&rsaquo;', currentPage + 1, currentPage === total, false));
      pagination.appendChild(btn('&raquo;',  total,           currentPage === total, false));
    }

    fillGrid(liveGrid, getSlice(1));
    renderPagination();

    let lastBP = getBreakpoint();
    window.addEventListener('resize', debounce(() => {
      const newBP = getBreakpoint();
      if (newBP !== lastBP) {
        lastBP = newBP;
        currentPage = 1;
        animating   = false;
        fillGrid(liveGrid, getSlice(1));
        renderPagination();
      }
    }, 200));
  }


  function initPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
      <div class="popup" role="dialog" aria-modal="true">
        <button class="popup__close" aria-label="Close popup" type="button">&times;</button>
        <div class="popup__inner">
          <div class="popup__img-wrap">
            <img class="popup__img" src="" alt="">
          </div>
          <div class="popup__info">
            <h3 class="popup__name"></h3>
            <p class="popup__breed"></p>
            <p class="popup__desc"></p>
            <ul class="popup__list"></ul>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.popup__close');
    const imgEl    = overlay.querySelector('.popup__img');
    const nameEl   = overlay.querySelector('.popup__name');
    const breedEl  = overlay.querySelector('.popup__breed');
    const descEl   = overlay.querySelector('.popup__desc');
    const listEl   = overlay.querySelector('.popup__list');

    function openPopup(petName) {
      const pet = petsData.find(p => p.name === petName);
      if (!pet) return;
      imgEl.src           = pet.img;
      imgEl.alt           = pet.name;
      nameEl.textContent  = pet.name;
      breedEl.textContent = `${pet.type} — ${pet.breed}`;
      descEl.textContent  = pet.description;
      listEl.innerHTML    = `
        <li><span class="popup__label">Age:</span> ${pet.age}</li>
        <li><span class="popup__label">Inoculations:</span> ${pet.inoculations.join(', ')}</li>
        <li><span class="popup__label">Diseases:</span> ${pet.diseases.join(', ')}</li>
        <li><span class="popup__label">Parasites:</span> ${pet.parasites.join(', ')}</li>
      `;
      overlay.classList.add('popup-overlay--open');
      document.body.classList.add('no-scroll');
    }

    function closePopup() {
      overlay.classList.remove('popup-overlay--open');
      document.body.classList.remove('no-scroll');
    }

    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });

    document.addEventListener('click', e => {
      const card = e.target.closest('.card');
      if (card && card.dataset.name) openPopup(card.dataset.name);
    });
  }


  document.addEventListener('DOMContentLoaded', async () => {
    await loadPets();
    initBurger();
    initPopup();
    initCarousel();
    initPagination();
  });

})();