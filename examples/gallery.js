const films = [...document.querySelectorAll('video[data-ratio]')];
const switches = [...document.querySelectorAll('[data-language]')];
const status = document.querySelector('[role=status]');
const toggle = document.querySelector('[data-play-toggle]');
const base = document.body.dataset.filmBase ?? 'tidekeeper/';
let language = switches.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.language ?? 'en';
let playRequest = 0;
let starting = false;
let groupPlaying = true;
let buffering = false;
const edition = () => language === 'zh' ? 'Chinese' : 'English';
const say = text => { if (status) status.textContent = text; };
const refreshToggle = () => {
  if (toggle) toggle.textContent = buffering || starting || films.some(film => !film.paused) ? 'Pause all' : 'Play all';
};

async function playTogether(restart = false) {
  const request = ++playRequest;
  starting = true;
  groupPlaying = true;
  buffering = false;
  say(`Loading three ${edition()} films…`);
  for (const film of films) {
    film.muted = true;
    if (film.error) film.load();
    if (restart) film.currentTime = 0;
  }
  const results = await Promise.allSettled(films.map(film => film.play()));
  // A language change or pause cancels the previous group's pending play.
  if (request !== playRequest) return;
  starting = false;
  if (results.some(result => result.status === 'rejected')) {
    groupPlaying = false;
    films.forEach(film => film.pause());
    say(films.some(film => film.error)
      ? 'A film could not load. Select Replay together to retry, or use its download link.'
      : 'Autoplay is unavailable. Select Play all, or use each film’s play button.');
  } else {
    // Align slower-loading media once all three films have started.
    const time = Math.min(...films.map(film => film.currentTime));
    for (const film of films) if (Math.abs(film.currentTime - time) > 0.15) film.currentTime = time;
    say(`${edition()} · 24 seconds · Muted · Playing all three on repeat`);
  }
  refreshToggle();
}

function pauseTogether() {
  playRequest++;
  starting = false;
  groupPlaying = false;
  buffering = false;
  films.forEach(film => film.pause());
  refreshToggle();
  say(`${edition()} · All three paused`);
}

function choose(next) {
  pauseTogether();
  language = next;
  switches.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  for (const film of films) {
    const ratio = film.dataset.ratio;
    const folder = `${base}tidekeeper-${language}-${ratio}/`;
    film.src = folder + 'film.mp4';
    film.poster = folder + 'poster.png';
    film.setAttribute('aria-label', `Tidekeeper ${edition()} ${ratio} 24 seconds`);
    film.load();
    document.querySelectorAll(`[data-download="${ratio}"]`).forEach(link => { link.href = folder + 'film.mp4'; });
    document.querySelectorAll(`[data-report="${ratio}"]`).forEach(link => { link.href = folder + 'layout-audit.json'; });
  }
  document.querySelectorAll('[data-scene]').forEach(img => { img.src = `${base}tidekeeper-${language}-square/scene-${img.dataset.scene}.jpg`; });
  const contact = document.querySelector('[data-contact]');
  if (contact) contact.src = `${base}${language}-scenes.jpg`;
  void playTogether(true);
}

switches.forEach(button => button.addEventListener('click', () => choose(button.dataset.language)));
toggle?.addEventListener('click', () => {
  if (buffering || starting || films.some(film => !film.paused)) pauseTogether();
  else void playTogether();
});
document.querySelector('[data-restart]')?.addEventListener('click', () => { void playTogether(true); });

for (const film of films) {
  film.addEventListener('play', refreshToggle);
  film.addEventListener('pause', () => {
    if (groupPlaying && !starting && !buffering) {
      groupPlaying = false;
      say(`${edition()} · Individual playback · Replay together to compare`);
    }
    refreshToggle();
  });
  film.addEventListener('error', () => {
    pauseTogether();
    say('A film could not load. Select Replay together to retry, or use its download link.');
  });
  film.addEventListener('waiting', () => {
    if (!groupPlaying || starting || film.seeking || film.readyState >= 3) return;
    buffering = true;
    films.forEach(video => video.pause());
    say('Buffering… All three will continue together.');
  });
  film.addEventListener('canplay', () => {
    if (buffering && groupPlaying && films.every(video => video.readyState >= 3)) void playTogether();
  });
}

// Correct drift after buffering without fighting a pause, scrub or loop wrap.
setInterval(() => {
  if (!groupPlaying || document.hidden || !films.length || films.some(film => film.paused || film.seeking || film.readyState < 3)) return;
  const first = films[0];
  for (const film of films.slice(1)) {
    const difference = Math.abs(film.currentTime - first.currentTime);
    const drift = Math.min(difference, first.duration - difference);
    if (drift > 0.25) film.currentTime = first.currentTime;
  }
}, 1000);

void playTogether(true);
