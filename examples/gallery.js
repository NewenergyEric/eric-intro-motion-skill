const films=[...document.querySelectorAll('video[data-ratio]')];
const switches=[...document.querySelectorAll('[data-language]')];
const status=document.querySelector('[role=status]');
let language='zh';
const base=document.body.dataset.filmBase??'tidekeeper/';
function choose(next){
 language=next;
 switches.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 for(const video of films){
  video.pause();const ratio=video.dataset.ratio,folder=`${base}tidekeeper-${language}-${ratio}/`;
  video.src=folder+'film.mp4';video.poster=folder+'poster.png';video.setAttribute('aria-label',`Tidekeeper ${language==='zh'?'中文':'English'} ${ratio} 24 seconds`);video.load();
  const download=document.querySelector(`[data-download="${ratio}"]`);if(download)download.href=folder+'film.mp4';
  const report=document.querySelector(`[data-report="${ratio}"]`);if(report)report.href=folder+'layout-audit.json';
 }
 document.querySelectorAll('[data-scene]').forEach(img=>{img.src=`${base}tidekeeper-${language}-square/scene-${img.dataset.scene}.jpg`;});
 const contact=document.querySelector('[data-contact]');if(contact)contact.src=`${base}${language}-scenes.jpg`;
 if(status)status.textContent=language==='zh'?'已切换为中文 · 24 秒完整成片':'English selected · complete 24-second films';
}
switches.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.language)));
document.querySelector('[data-play-all]')?.addEventListener('click',async()=>{
 for(const film of films){film.pause();film.currentTime=0;}
 const results=await Promise.allSettled(films.map(film=>film.play()));
 if(status)status.textContent=results.some(result=>result.status==='rejected')?'浏览器未同时播放全部视频，请使用每支影片的播放按钮。':'正在播放三种构图 · 24 秒';
});
for(const film of films){
 film.addEventListener('error',()=>{if(status)status.textContent='视频加载失败，请重试或使用下载链接。';});
 film.addEventListener('ended',()=>{if(status&&films.every(v=>v.ended))status.textContent=language==='zh'?'完整影片已播完 · 24 秒':'Full playback complete · 24 seconds';});
}
