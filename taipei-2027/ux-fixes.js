(function(){
  const picker=document.getElementById('mapDayPicker');
  if(!picker) return;
  const labels={
    0:{kicker:'Route',date:'All days'},
    1:{kicker:'Day 1',date:'Fri 20'},
    2:{kicker:'Day 2',date:'Sat 21'},
    3:{kicker:'Day 3',date:'Sun 22'},
    4:{kicker:'Day 4',date:'Mon 23'}
  };
  function enhance(){
    picker.querySelectorAll('.seg-btn').forEach(btn=>{
      const day=Number(btn.dataset.day);
      const l=labels[day];
      if(!l||btn.dataset.enhanced==='1') return;
      btn.innerHTML=`<span class="day-kicker">${l.kicker}</span><span class="day-date">${l.date}</span>`;
      btn.setAttribute('aria-label',day===0?'Show the complete trip route':`Show ${l.kicker}, ${l.date} August route`);
      btn.title=day===0?'Show all itinerary days':`Show ${l.kicker} on the map`;
      btn.dataset.enhanced='1';
    });
  }
  new MutationObserver(enhance).observe(picker,{childList:true,subtree:true});
  enhance();
})();
