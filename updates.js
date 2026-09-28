const container=document.getElementById("updatesContainer");

function renderUpdates(updates){

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

}

fetch('data/content.json')
.then(res=>res.json())
.then(data=>{
if(data.updates) renderUpdates(data.updates);
})
.catch(err=>console.error('Failed to load updates:', err));