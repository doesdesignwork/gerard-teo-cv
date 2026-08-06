function renderCosts() {
  const list=document.getElementById('costList');
  const saved=JSON.parse(localStorage.getItem('taipei-costs')||'null');
  list.innerHTML=costs.map((c,i)=>{
    const min=saved?.[i]?.min??c[1], max=saved?.[i]?.max??c[2];
    return `<div class="cost-row"><span>${c[0]}</span><input type="number" min="0" step="100" value="${min}" data-cost-min="${i}" aria-label="Minimum for ${c[0]}"><span>–</span><input type="number" min="0" step="100" value="${max}" data-cost-max="${i}" aria-label="Maximum for ${c[0]}"></div>`;
  }).join('');
  list.querySelectorAll('input').forEach(i=>i.addEventListener('input',calculateCosts));
  document.getElementById('auditList').innerHTML=auditItems.map(item=>`<div class="audit-item"><span aria-hidden="true">□</span><span>${item}</span></div>`).join('');
  calculateCosts();
}

function calculateCosts() {
  const values=costs.map((_,i)=>({
    min:Number(document.querySelector(`[data-cost-min="${i}"]`).value||0),
    max:Number(document.querySelector(`[data-cost-max="${i}"]`).value||0)
  }));
  localStorage.setItem('taipei-costs',JSON.stringify(values));
  const shopping=Number(document.getElementById('shoppingBudget').value||0);
  const fx=Number(document.getElementById('fxRate').value||24.5);
  const min=values.reduce((s,v)=>s+v.min,0)+shopping;
  const max=values.reduce((s,v)=>s+v.max,0)+shopping;
  document.getElementById('costTwd').textContent=`TWD ${min.toLocaleString()}–${max.toLocaleString()}`;
  document.getElementById('costSgd').textContent=`About SGD ${Math.round(min/fx).toLocaleString()}–${Math.round(max/fx).toLocaleString()} at ${fx.toFixed(1)} TWD/SGD`;
  localStorage.setItem('taipei-fx',fx);
  localStorage.setItem('taipei-shopping',shopping);
}
document.getElementById('fxRate').value=localStorage.getItem('taipei-fx')||'24.5';
document.getElementById('shoppingBudget').value=localStorage.getItem('taipei-shopping')||'0';
document.getElementById('fxRate').addEventListener('input',calculateCosts);
document.getElementById('shoppingBudget').addEventListener('input',calculateCosts);

function renderApps() {
  document.getElementById('appList').innerHTML=apps.map(a=>`<article class="app-card"><div class="app-icon" aria-hidden="true">${a.icon}</div><div><h3>${a.name}</h3><p>${a.desc}</p></div><a class="mini-link" href="${a.url}" target="_blank" rel="noopener">Open</a></article>`).join('');
}

buildDayPicker();
drawRoutes(true);
renderItinerary();
renderCosts();
renderApps();
setTimeout(()=>map.invalidateSize(),150);
