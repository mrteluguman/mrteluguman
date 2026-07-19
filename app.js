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
    row.addEventListener('pointerdown',function(e){down=true;moved=false;startX=e.clientX;startScroll=row.scrollLeft;row.classList.add('dragging');row.setPointerCapture(e.pointerId);});
    row.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-startX;if(Math.abs(dx)>4)moved=true;row.scrollLeft=startScroll-dx;});
    function end(){down=false;row.classList.remove('dragging');}
    row.addEventListener('pointerup',end);row.addEventListener('pointercancel',end);row.addEventListener('pointerleave',end);
    row.querySelectorAll('.card').forEach(function(card){card.addEventListener('click',function(e){if(moved)e.preventDefault();});});
    row.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){row.scrollLeft+=e.deltaY;e.preventDefault();}},{passive:false});
  });

  /* Vertical drag on state columns (desktop) */
  document.querySelectorAll('.col .stack').forEach(function(stack){
    var down=false,startY,startScroll,moved;
    stack.addEventListener('pointerdown',function(e){down=true;moved=false;startY=e.clientY;startScroll=stack.scrollTop;stack.classList.add('dragging');stack.setPointerCapture(e.pointerId);});
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
