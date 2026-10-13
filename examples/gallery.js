const films=[...document.querySelectorAll('video[data-ratio]')];
const switches=[...document.querySelectorAll('[data-language]')];
const status=document.querySelector('[role=status]');
let language=switches.find(button=>button.getAttribute('aria-pressed')==='true')?.dataset.language??'en';
const base=document.body.dataset.filmBase??'tidekeeper/';
function choose(next){
 language=next;
 switches.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 for(const video of films){
  video.pause();const ratio=video.dataset.ratio,folder=`${base}tidekeeper-${language}-${ratio}/`;
  video.src=folder+'film.mp4';video.poster=folder+'poster.png';video.setAttribute('aria-label',`Tidekeeper ${language==='zh'?'Chinese':'English'} ${ratio} 24 seconds`);video.load();
  const download=document.querySelector(`[data-download="${ratio}"]`);if(download)download.href=folder+'film.mp4';
  const report=document.querySelector(`[data-report="${ratio}"]`);if(report)report.href=folder+'layout-audit.json';
 }
 document.querySelectorAll('[data-scene]').forEach(img=>{img.src=`${base}tidekeeper-${language}-square/scene-${img.dataset.scene}.jpg`;});
 const contact=document.querySelector('[data-contact]');if(contact)contact.src=`${base}${language}-scenes.jpg`;
 if(status)status.textContent=`${language==='zh'?'Chinese':'English'} selected · complete 24-second films`;
}
switches.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.language)));
document.querySelector('[data-play-all]')?.addEventListener('click',async()=>{
 for(const film of films){film.pause();film.currentTime=0;}
 const results=await Promise.allSettled(films.map(film=>film.play()));
 if(status)status.textContent=results.some(result=>result.status==='rejected')?'Your browser could not play all films together. Use each film’s play button.':'Playing all three formats · 24 seconds';
});
for(const film of films){
 film.addEventListener('error',()=>{if(status)status.textContent='The film could not load. Please retry or use the download link.';});
 film.addEventListener('ended',()=>{if(status&&films.every(v=>v.ended))status.textContent='Full playback complete · 24 seconds';});
}
