const container=document.getElementById("updatesContainer");

// Pause every update video except the one passed in (optional)
function pauseOtherVideos(except){
  container.querySelectorAll('video').forEach(v=>{
    if(v!==except && !v.paused){
      v.pause();
    }
  });
}

function renderUpdates(updates){

updates.forEach(update=>{

const card=document.createElement("div");
card.className="update-card";

const close=document.createElement("span");
close.innerHTML="×";
close.className="update-close";
close.onclick=()=>{
  // stop any playing video inside this card before removing it
  card.querySelectorAll('video').forEach(v=>v.pause());
  card.remove();
};

card.appendChild(close);

card.innerHTML+=`<h3>${update.title}</h3><p>${update.text}</p>`;

if(update.image){
card.innerHTML+=`<img src="${update.image}" alt="${update.title}">`;
}

if(update.video){
const isLocalVideo=/\.(mp4|webm|mov|mkv|ogg)$/i.test(update.video);
if(isLocalVideo){
card.innerHTML+=`
<video width="100%" height="200" controls preload="metadata" playsinline poster="${update.image || ''}">
<source src="${update.video}">
Your browser does not support the video tag.
</video>`;
}else{
card.innerHTML+=`
<iframe width="100%" height="200"
src="${update.video}" allowfullscreen></iframe>`;
}
}

// Wire up behaviors for local videos on this card
const video=card.querySelector('video');
if(video){
  // Set volume to 50% and keep it unmuted
  video.muted=false;
  video.volume=0.5;

  // Hover to play from the start, unhover to pause & reset
  card.addEventListener('mouseenter',()=>{
    pauseOtherVideos(video);
    video.currentTime=0;
    video.muted=false;
    video.volume=0.5;
    video.play().catch(()=>{});
  });
  card.addEventListener('mouseleave',()=>{
    video.pause();
    video.currentTime=0;
  });

  // When this video starts by tap/click, pause & reset all others
  video.addEventListener('play',()=>{
    container.querySelectorAll('video').forEach(v=>{
      if(v!==video && !v.paused){
        v.pause();
        v.currentTime=0;
      }
    });
  });
}

container.appendChild(card);

});

}

fetch('data/content.json')
.then(res=>res.json())
.then(data=>{
if(data.updates) renderUpdates(data.updates);
})
.catch(err=>console.error('Failed to load updates:', err));