const updates = [

{
title:"🔥 Epic Ranked Win",
text:"Clutched the final fight using Shadow Assassin.",
image:"images/shadow_assassin.jpeg"
},

{
title:"🎥 Gameplay Highlight",
text:"Watch this insane Honor of Kings outplay.",
video:"https://www.youtube.com/embed/mJHB6Tpxc0c"
},

{
title:"💜 Thank You",
text:"Thanks for supporting NyxVoid Plays!"
}

];

const container=document.getElementById("updatesContainer");

updates.forEach(update=>{

const card=document.createElement("div");
card.className="update-card";

const close=document.createElement("span");
close.innerHTML="×";
close.className="update-close";
close.onclick=()=>card.remove();

card.appendChild(close);

card.innerHTML+=`<h3>${update.title}</h3><p>${update.text}</p>`;

if(update.image){
card.innerHTML+=`<img src="${update.image}">`;
}

if(update.video){
card.innerHTML+=`
<iframe width="100%" height="200"
src="${update.video}" allowfullscreen></iframe>`;
}

container.appendChild(card);

});