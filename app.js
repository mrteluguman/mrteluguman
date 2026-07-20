/* ===== MrTeluguMan — shared behaviour ===== */
document.addEventListener('DOMContentLoaded', function(){

  /* Mobile slide-out menu */
  var drawer=document.getElementById('drawer');
  var openBtn=document.querySelector('.menu-btn');
  var closeBtn=document.querySelector('.drawer-close');
  function openMenu(){ if(drawer) drawer.classList.add('open'); }
  function closeMenu(){ if(drawer) drawer.classList.remove('open'); }
  if(openBtn) openBtn.addEventListener('click',openMenu);
  if(closeBtn) closeBtn.addEventListener('click',closeMenu);
  if(drawer){
    drawer.querySelector('.drawer-bg') && drawer.querySelector('.drawer-bg').addEventListener('click',closeMenu);
  }

  /* Region chips (home split) */
  var chips=document.querySelectorAll('.chip');
  var split=document.getElementById('split');
  chips.forEach(function(c){
    c.addEventListener('click',function(){
      chips.forEach(function(x){x.classList.remove('active')});
      c.classList.add('active');
      if(!split) return;
      var f=c.dataset.filter;
      split.classList.remove('only-ap','only-tg');
      if(f==='ap') split.classList.add('only-ap');
      if(f==='tg') split.classList.add('only-tg');
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });

  /* Horizontal drag on rows */
  document.querySelectorAll('.row').forEach(function(row){
    var down=false,startX,startScroll,moved;
    row.addEventListener('pointerdown',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;down=true;moved=false;startX=e.clientX;startScroll=row.scrollLeft;row.classList.add('dragging');row.setPointerCapture(e.pointerId);});
    row.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-startX;if(Math.abs(dx)>4)moved=true;row.scrollLeft=startScroll-dx;});
    function end(){down=false;row.classList.remove('dragging');}
    row.addEventListener('pointerup',end);row.addEventListener('pointercancel',end);row.addEventListener('pointerleave',end);
    row.querySelectorAll('.card').forEach(function(card){card.addEventListener('click',function(e){if(moved)e.preventDefault();});});
  });

  /* Vertical drag on state columns (desktop) */
  document.querySelectorAll('.col .stack').forEach(function(stack){
    var down=false,startY,startScroll,moved;
    stack.addEventListener('pointerdown',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;down=true;moved=false;startY=e.clientY;startScroll=stack.scrollTop;stack.classList.add('dragging');stack.setPointerCapture(e.pointerId);});
    stack.addEventListener('pointermove',function(e){if(!down)return;var dy=e.clientY-startY;if(Math.abs(dy)>4)moved=true;stack.scrollTop=startScroll-dy;});
    function end(){down=false;stack.classList.remove('dragging');}
    stack.addEventListener('pointerup',end);stack.addEventListener('pointercancel',end);stack.addEventListener('pointerleave',end);
    stack.querySelectorAll('.card').forEach(function(card){card.addEventListener('click',function(e){if(moved)e.preventDefault();});});
  });

  /* Share buttons */
  document.querySelectorAll('[data-share]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var url=window.location.href;
      var title=document.title;
      var to=btn.dataset.share;
      if(to==='whatsapp') window.open('https://wa.me/?text='+encodeURIComponent(title+' '+url),'_blank');
      else if(to==='facebook') window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url),'_blank');
      else if(to==='x') window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(title)+'&url='+encodeURIComponent(url),'_blank');
      else if(to==='copy'){ navigator.clipboard && navigator.clipboard.writeText(url); var o=btn.innerHTML; btn.innerHTML='<i class="lbl">Copied</i>'; setTimeout(function(){btn.innerHTML=o;},1500); }
    });
  });

  /* Like button (visual only until a database is connected) */
  document.querySelectorAll('.act.like').forEach(function(btn){
    btn.addEventListener('click',function(){
      var n=btn.querySelector('.n');
      var count=parseInt(n.textContent,10)||0;
      if(btn.classList.contains('liked')){btn.classList.remove('liked');n.textContent=count-1;}
      else{btn.classList.add('liked');n.textContent=count+1;}
    });
  });

});

/* ===== MrTeluguMan — live search (Netflix / Google style) ===== */
(function(){
  var INDEX=null, LOAD=null;
  function loadIndex(){
    if(LOAD) return LOAD;
    LOAD=fetch('search-index.json',{cache:'no-cache'})
      .then(function(r){return r.ok?r.json():[];})
      .then(function(d){INDEX=Array.isArray(d)?d:(d.items||[]); return INDEX;})
      .catch(function(){INDEX=[]; return INDEX;});
    return LOAD;
  }
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function byDateDesc(a,b){return String(b.date||'').localeCompare(String(a.date||''));}
  function fmtDate(d){
    if(!d) return '';
    var p=String(d).split('-'); if(p.length!==3) return d;
    var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(p[1],10)-1]||'';
    return m+' '+parseInt(p[2],10)+', '+p[0];
  }
  function score(it,terms){
    var title=(it.title||'').toLowerCase();
    var kw=(it.keywords||'').toLowerCase();
    var cat=(it.category||'').toLowerCase();
    var hay=title+' '+kw+' '+cat+' '+(it.snippet||'').toLowerCase();
    var s=0;
    for(var i=0;i<terms.length;i++){
      var t=terms[i];
      if(hay.indexOf(t)===-1) return -1;          // every word must match
      if(title.indexOf(t)===0) s+=6;
      else if(title.indexOf(t)!==-1) s+=4;
      if(kw.indexOf(t)!==-1) s+=3;
      if(cat.indexOf(t)!==-1) s+=2;
      s+=1;
    }
    return s;
  }
  function search(q){
    var terms=q.toLowerCase().split(/\s+/).filter(Boolean);
    var items=INDEX||[];
    if(!terms.length) return [];
    var out=[];
    for(var i=0;i<items.length;i++){
      var sc=score(items[i],terms);
      if(sc>=0) out.push({it:items[i],s:sc});
    }
    out.sort(function(a,b){ return b.s!==a.s ? b.s-a.s : byDateDesc(a.it,b.it); }); // relevance, then most recent
    return out.map(function(x){return x.it;});
  }
  function recent(n){ return (INDEX||[]).slice().sort(byDateDesc).slice(0,n||6); }

  var MAG='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"></circle><line x1="20.5" y1="20.5" x2="15.6" y2="15.6"></line></svg>';

  /* ---------- Header overlay ---------- */
  function buildOverlay(){
    var o=document.createElement('div');
    o.className='search-overlay'; o.id='searchOverlay';
    o.innerHTML=''
      +'<div class="so-bg"></div>'
      +'<div class="so-panel">'
      +  '<div class="so-inputwrap">'+MAG
      +    '<input class="so-input" id="soInput" type="search" placeholder="Search stories, topics, places…" autocomplete="off">'
      +    '<button class="so-close" aria-label="Close">&times;</button>'
      +  '</div>'
      +  '<div class="so-results" id="soResults"></div>'
      +'</div>';
    document.body.appendChild(o);
    return o;
  }
  function itemRow(it){
    return '<a class="so-item" href="'+esc(it.url)+'">'
      + '<span class="so-ic">'+MAG.replace('width="22" height="22"','width="16" height="16"')+'</span>'
      + '<span class="so-tx"><span class="so-ttl">'+esc(it.title)+'</span>'
      + '<span class="so-meta"><span class="so-cat">'+esc(it.category||'')+'</span>'
      + (it.date?' · '+esc(fmtDate(it.date)):'')+'</span></span></a>';
  }
  function renderOverlay(res,q){
    var box=document.getElementById('soResults');
    if(!box) return;
    if(!q){
      var r=recent(6);
      box.innerHTML='<div class="so-lbl">Recent</div>'+r.map(itemRow).join('');
      return;
    }
    if(!res.length){ box.innerHTML='<div class="so-hint">No matches for “'+esc(q)+'” yet.</div>'; return; }
    box.innerHTML='<div class="so-lbl">Results</div>'+res.map(itemRow).join('');
  }

  document.addEventListener('DOMContentLoaded',function(){
    loadIndex();
    var toggle=document.getElementById('searchToggle');
    var overlay=buildOverlay();
    var input=document.getElementById('soInput');
    var closeBtn=overlay.querySelector('.so-close');
    var bg=overlay.querySelector('.so-bg');

    function open(){ overlay.classList.add('open'); loadIndex().then(function(){ renderOverlay([], input.value.trim()); }); setTimeout(function(){input.focus();},60); }
    function close(){ overlay.classList.remove('open'); }

    if(toggle){ toggle.addEventListener('click',function(e){ e.preventDefault(); open(); }); }
    if(closeBtn) closeBtn.addEventListener('click',close);
    if(bg) bg.addEventListener('click',close);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });

    if(input){
      input.addEventListener('input',function(){
        var q=input.value.trim();
        loadIndex().then(function(){ renderOverlay(search(q),q); });
      });
      input.addEventListener('keydown',function(e){
        if(e.key==='Enter'){
          var q=input.value.trim(); if(!q) return;
          var first=overlay.querySelector('.so-results .so-item');
          if(first){ window.location.href=first.getAttribute('href'); }
          else { window.location.href='search.html?q='+encodeURIComponent(q); }
        }
      });
    }

    /* ---------- Full results page (search.html) ---------- */
    var pageInput=document.getElementById('q');
    var pageOut=document.getElementById('searchResults');
    if(pageInput && pageOut){
      function card(it){
        return '<a class="sr-item" href="'+esc(it.url)+'">'
          +'<span class="sr-ic">'+MAG.replace('width="22" height="22"','width="20" height="20"')+'</span>'
          +'<span class="sr-tx"><span class="sr-cat">'+esc(it.category||'')+'</span>'
          +'<div class="sr-ttl">'+esc(it.title)+'</div>'
          +'<div class="sr-snip">'+esc(it.snippet||'')+'</div>'
          +(it.date?'<div class="sr-date">'+esc(fmtDate(it.date))+'</div>':'')
          +'</span></a>';
      }
      function renderPage(q){
        if(!q){
          var r=recent(8);
          pageOut.innerHTML='<p class="sr-count">Recent</p><div class="sr-list">'+r.map(card).join('')+'</div>';
          return;
        }
        var res=search(q);
        if(!res.length){ pageOut.innerHTML='<p class="sr-count">No matches for “'+esc(q)+'”. Try a place, topic or section name.</p>'; return; }
        pageOut.innerHTML='<p class="sr-count">'+res.length+' result'+(res.length>1?'s':'')+' for “'+esc(q)+'”</p><div class="sr-list">'+res.map(card).join('')+'</div>';
      }
      pageInput.addEventListener('input',function(){ loadIndex().then(function(){ renderPage(pageInput.value.trim()); }); });
      var params=new URLSearchParams(window.location.search);
      var incoming=params.get('q');
      loadIndex().then(function(){
        if(incoming){ pageInput.value=incoming; }
        renderPage((incoming||'').trim());
      });
    }
  });
})();
