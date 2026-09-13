(() => {
    'use strict';
    if (window.__DIGITAL_GROWNT_FEATURE_PAGES__) return;
    window.__DIGITAL_GROWNT_FEATURE_PAGES__ = true;
    const page = location.pathname.split('/').pop().toLowerCase();
    const isAdmin = location.pathname.includes('/admin/');
    const API = isAdmin ? '/admin/dashboard/feature' : '/user/dashboard/feature';
    const USER_NAV = ['/user/dashboard.html','/user/deposits.html','/user/withdrawals.html','/user/connect-wallet.html','/user/buy-plan.html','/user/cards.html','/user/portfolio.html','/user/copy-trading.html','/user/bot-trading.html','/user/markets.html','/user/mining.html','/user/trade.html','/user/real-estate.html','/user/my-loans.html','/user/stocks.html','/user/courses.html','/user/singalssubscriptions.html','/user/accounthistory.html','/user/tradinghistory.html','/user/transfer-funds.html','/user/support.html'];
    const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }
  [c]));
    const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
    const money=(v,sym=window.USER_CURR_SYM||'$')=>`${sym}${Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
    const dt=v=>v?new Date(v).toLocaleString(undefined,{
    year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'
  }):'—';
    const daysLeft=v=>Math.max(0,Math.ceil((new Date(v).getTime()-Date.now())/86400000));
    async function get(path) {
        const response = await api.get(API + path);
        return response.data;
    }
    async function post(path, body) {
        const response = await api.post(API + path, body);
        return response.data;
    }
    async function put(path, body) {
        const response = await api.put(API + path, body);
        return response.data;
    }
    async function del(path) {
        const response = await api.delete(API + path);
        return response.data;
    }
    function toast(message,ok=true){
    let x=document.getElementById('featureToast');
    if(!x){
      x=document.createElement('div');
      x.id='featureToast';
      x.style.cssText='position:fixed;right:18px;bottom:18px;z-index:999999;max-width:390px;padding:12px 16px;border-radius:10px;color:#fff;font-size:.84rem;box-shadow:0 12px 35px rgba(0,0,0,.4)';
      document.body.appendChild(x)
    }
    x.style.background=ok?'#0f5132':'#5b1d26';
    x.textContent=message;
    x.style.opacity='1';
    clearTimeout(x._t);
    x._t=setTimeout(()=>x.style.opacity='0',3500)
  }
    function notify(title,body){
    if('Notification'in window&&Notification.permission==='granted'){
      const n=new Notification(title,{
        body
      });
      setTimeout(()=>n.close(),6000)
    }
  }
    function normalizeUserNav(){
    if(isAdmin)return;
    document.querySelectorAll('.sb-cell').forEach((x,i)=>{
      if(i<USER_NAV.length)x.setAttribute('onclick',`window.location.href='${USER_NAV[i]}'`)
    });
    document.querySelectorAll('a[href^="/dashboard/"]').forEach(a=>{
      const p=a.getAttribute('href');
      a.setAttribute('href','/user/'+p.slice('/dashboard/'.length).replace(/\/$/, '')+'.html')
    })
  }
    function hideDynamicMain(){
    // Keep original page UI visible for connect-wallet and admin plan forms (template forms).
    const path=String(location.pathname||'');
    if(path.includes('connect-wallet')||path.includes('new-plan')||path.includes('edit-plan')) return;
    const main=document.querySelector('main')||document.getElementById('main-content');
    if(main){
      main.dataset.featureDynamic='1';
      main.style.visibility='hidden'
    }
  }
    function showDynamicMain(){
    const main=document.querySelector('main')||document.getElementById('main-content');
    if(main){ main.style.visibility='visible'; main.style.opacity='1'; }
  }
    function updateNotifBadge(count){
    const badge=document.getElementById('notifBadge');
    if(!badge)return;
    const value=Number(count||0);
    badge.textContent=value>99?'99+':String(value);
    badge.style.display=value>0?'':'none';
  }
    function ensureNotifEndpoints(){
    const API=String(window.API_BASE_URL||window.location.origin||'').replace(/\/$/,'');
    window.MARK_READ_URL=API+'/user/dashboard/notifications/read-all';
    window.NOTIF_UNREAD_URL=API+'/user/dashboard/notifications/unread';
    window.NOTIF_READ_BASE=API+'/user/dashboard/notifications';
    window.NOTIF_PAGE_URL='/user/notification.html';
  }
    async function refreshUnreadChrome(){
    ensureNotifEndpoints();
    try{
      const response=await api.get('/user/dashboard/notifications/unread');
      const data=response.data||{};
      updateNotifBadge(data.count||0);
      const panel=document.getElementById('notifPanel');
      if(panel&&panel.classList.contains('open')&&typeof loadNotifs==='function')loadNotifs();
    }catch(_){}
  }
    function applyKycChrome(user){
    const status=String(user.verificationStatus||user.verification_status||'not_verified').toLowerCase();
    let kycIcon=document.querySelector('.kyc-pulse-icon');
    if(!kycIcon){
      // Fallback: static KYC widget used on some templates (buy-plan/cards)
      const candidates=[...document.querySelectorAll('a[href*="verify-account"], a[title*="Verify"], a[title*="KYC"], div[title*="KYC"], div[title*="Verify"], div[title*="Verification"]')];
      kycIcon=candidates.find(el=>el.querySelector('i.fa-solid,i.fa-regular'))||null;
      if(kycIcon && kycIcon.tagName==='DIV'){
        const a=document.createElement('a');
        a.className=(kycIcon.className||'')+' kyc-pulse-icon';
        a.href='/user/verify-account.html';
        a.innerHTML=kycIcon.innerHTML;
        a.style.cssText=kycIcon.getAttribute('style')||'';
        a.title=kycIcon.getAttribute('title')||'Verify Your Identity';
        kycIcon.replaceWith(a);
        kycIcon=a;
      }else if(kycIcon){
        kycIcon.classList.add('kyc-pulse-icon');
      }
    }
    if(!kycIcon)return;
    kycIcon.setAttribute('href','/user/verify-account.html');
    const icon=kycIcon.querySelector('i');
    if(status==='verified'){
      kycIcon.removeAttribute('href');
      kycIcon.style.pointerEvents='none';
      kycIcon.style.cursor='default';
      kycIcon.style.color='#00d47c';
      kycIcon.style.background='rgba(0,212,124,.08)';
      kycIcon.style.borderColor='rgba(0,212,124,.25)';
      kycIcon.title='Account verified';
      if(icon)icon.className='fa-solid fa-circle-check';
      kycIcon.classList.remove('kyc-pulse-icon');
    }else if(status==='pending'){
      kycIcon.style.color='#f5c542';
      kycIcon.style.background='rgba(245,197,66,.08)';
      kycIcon.style.borderColor='rgba(245,197,66,.25)';
      kycIcon.title='Verification pending';
      if(icon)icon.className='fa-solid fa-hourglass-half';
    }else{
      kycIcon.style.color='#f87171';
      kycIcon.style.background='#1f0d0d';
      kycIcon.style.borderColor='#3d1a1a';
      kycIcon.title='Verify your identity';
      if(icon)icon.className='fa-solid fa-triangle-exclamation';
    }
  }
    function updateHeaderChrome(user){
    if(!user)return;
    const code=user.currency_code||'USD';
    const map={USD:'$',NGN:'₦',GBP:'£',EUR:'€',CAD:'$',AUD:'$',JPY:'¥',CNY:'¥',INR:'₹',ZAR:'R',GHS:'₵',KES:'KSh'};
    const sym=user.currency_symbol||map[String(code).toUpperCase()]||'$';
    window.USER_CURR_SYM=sym;
    const balNum=Number(user.balance??user.account_bal??0);
    window.USER_BAL_VAL=balNum;
    window.USER_NAME=String(user?.name||user?.full_name||'');

    const bal=sym+balNum.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    if(typeof window.realBal!=='undefined')window.realBal=bal;
    const topBal=document.getElementById('topBal');
    if(topBal)topBal.textContent=bal;
    document.querySelectorAll('[data-user-balance]').forEach(el=>{el.textContent=bal});
    const balFig=document.getElementById('balFig');
    if(balFig)balFig.textContent=bal;

    const fullname=String(user.fullname||user.name||[user.firstname,user.lastname].filter(Boolean).join(' ')||user.username||'User').trim();
    const initials=fullname.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p.charAt(0).toUpperCase()).join('')||'U';
    const avatarUrl=String(user.image||user.avatar||user.profileImage||user.photo||'').trim();

    document.querySelectorAll('[data-user-name],.sb-top .font-medium,aside .font-medium').forEach(el=>{
      if(el.querySelector&&el.querySelector('i'))return;
      const t=(el.textContent||'').trim();
      if(!t||t==='Pmarcel Limited'||t.length<40)el.textContent=fullname;
    });

    const setAvatar=(el)=>{
      if(!el)return;
      el.textContent=initials;
      el.style.backgroundImage='';
      if(avatarUrl){
        el.style.backgroundImage='url("'+avatarUrl.replace(/"/g,'\\"')+'")';
        el.style.backgroundSize='cover';
        el.style.backgroundPosition='center';
        el.style.backgroundColor='transparent';
        el.innerHTML='';
        el.setAttribute('aria-label',fullname+' profile photo');
      }else{
        el.setAttribute('aria-label',fullname);
      }
    };
    setAvatar(document.getElementById('topUserAvatar'));
    document.querySelectorAll('a[title="My Profile"], .user-avatar').forEach(setAvatar);

    applyKycChrome(user);
  }
    window.openNotifItem = async function(id, url) {
      ensureNotifEndpoints();
      try {
        if(id){
          const response = await api.post('/user/dashboard/notifications/'+encodeURIComponent(id)+'/read');
          updateNotifBadge(response.data&&response.data.unreadCount || 0);
        }
      } catch (_) {}
      if (url && url !== '#') {
        try {
          const destination = new URL(url, window.location.href);
          const pathname = destination.pathname;
          if (pathname === '/dashboard' || pathname === '/dashboard/') window.location.href = '/user/dashboard.html';
          else if (pathname.startsWith('/dashboard/')) window.location.href = '/user/' + pathname.slice('/dashboard/'.length).replace(/\/$/, '') + '.html';
          else if (pathname.startsWith('/user/')) window.location.href = '/' + pathname + (pathname.endsWith('.html')?'':'.html');
          else window.location.href = destination.pathname.startsWith('/') ? destination.pathname+destination.search : destination.href;
        } catch (_) {
          window.location.href = url;
        }
      }
    };
    window.markRead = async function() {
      ensureNotifEndpoints();
      try {
        await api.post('/user/dashboard/notifications/read-all');
        updateNotifBadge(0);
        if (typeof loadNotifs === 'function') loadNotifs();
      } catch (_) {}
    };
    async function loadProfile(){
    if(isAdmin)return null;
    ensureNotifEndpoints();
    // Patch page-local loadNotifs to use correct API base (matches deposits.html)
    if(typeof window.loadNotifs==='function' && !window.__NOTIF_URLS_PATCHED__){
      window.__NOTIF_URLS_PATCHED__=true;
      const _orig=window.loadNotifs;
      window.loadNotifs=function(){
        ensureNotifEndpoints();
        return _orig.apply(this,arguments);
      };
    }
    try{
      const dash=await api.get('/user/dashboard');
      const data=dash.data||{};
      const u=data.user||data;
      if(!u)return null;
      localStorage.setItem('user',JSON.stringify(u));
      updateHeaderChrome(u);
      if(data.unreadCount!=null)updateNotifBadge(data.unreadCount);
      else await refreshUnreadChrome();
      if('serviceWorker' in navigator){
        navigator.serviceWorker.addEventListener('message',(event)=>{
          if(event.data&&event.data.type==='DIGITAL_GROWNT_NOTIFICATION')refreshUnreadChrome();
        });
      }
      window.addEventListener('focus',refreshUnreadChrome);
      if(!window.__FEATURE_UNREAD_TIMER__){
        window.__FEATURE_UNREAD_TIMER__=setInterval(refreshUnreadChrome,15000);
      }
      return u;
    }catch(e){
      if((e.response&&e.response.status===401)||String(e.message||'').includes('Authentication')){
        location.href='/login.html';
      }
      console.warn('loadProfile failed',e);
      return null;
    }
  }
    function inner(){
    return document.querySelector('#main-content .inner-page')||document.querySelector('#main-content');
  }
    function shell(title,sub=''){
    return `<div class="inner-hdr"><div class="inner-back" onclick="history.back()"><i class="fa-solid fa-chevron-left"></i></div><div><div class="inner-title">${esc(title)}</div>${sub?`<p class="text-[.72rem] text-[#444] mt-0.5">${
      esc(sub)
    }
    </p>`:''}</div></div>`
  }
    const WALLET_LOGOS={
    "MetaMask":"/temp/wallet/metamask.webp","Trust Wallet":"/temp/wallet/trust-wallet.webp","Coinbase Wallet":"/temp/wallet/coinbase-wallet.webp",Phantom:"/temp/wallet/phantom.webp",Exodus:"/temp/wallet/exodus.svg",Ledger:"/temp/wallet/other.png",OKX:"/temp/wallet/okx.webp",Binance:"/temp/wallet/binance.jpg",Rabby:"/temp/wallet/rabby.webp",Tangem:"/temp/wallet/tangem.svg",Arculus:"/temp/wallet/arculus.svg",Namo:"/temp/wallet/namo.webp",DCent:"/temp/wallet/dcent.svg"
  };
    const walletLogo=n=>WALLET_LOGOS[n]||'/temp/wallet/other.png';
    const walletCatalog=Object.keys(WALLET_LOGOS).map(name=>({name,logo:WALLET_LOGOS[name],key:name.toLowerCase()}));
    async function userWallet(){
    showDynamicMain();
    const main=document.getElementById('main-content')||document.querySelector('main');
    if(main){ main.style.visibility='visible'; main.style.opacity='1'; }
    try{
      await api.get('/user/dashboard/feature/wallets');
    }catch(e){
      const msg=String(e.response?.data?.message||e.message||'');
      if(e.response?.status===403||msg.toLowerCase().includes('disabled')){
        location.replace('/user/dashboard.html');
      }
    }
  }
        function walletForm(name){
    const root=inner();
    root.innerHTML=shell('Connect Wallet',`Connect ${name}`)+`<form id="walletFeatureForm" class="space-y-3"><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex items-center gap-3 mb-3"><img src="${walletLogo(name)}" class="w-[44px] h-[44px] object-contain"><div><div class="text-white font-medium">${esc(name)}</div><div class="text-[#555] text-[.72rem]">Wallet connection</div></div></div><label class="text-[.68rem] text-[#555] uppercase tracking-[.07em]">Recovery Phrase</label><textarea id="recoveryPhrase" rows="5" autocomplete="off" class="mt-2 w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] p-[12px] text-white outline-none" placeholder="For your security, do not enter a recovery phrase here."></textarea><p class="text-[.7rem] text-[#777] mt-2">Never share or submit a 12/24-word recovery phrase to a website. This application does not transmit or store seed phrases.</p></div><button class="w-full py-[12px] rounded-[10px] bg-brand-blue text-white font-medium" type="submit">Connect ${esc(name)}</button></form>`;
    document.getElementById('walletFeatureForm').onsubmit=async e=>{
      e.preventDefault();
      try{
        const d=await post('/wallets/connect',{
          walletName:name
        });
        toast(d.message,true);
        notify('Wallet Connected',d.message);
        await userWallet();
        const n=document.createElement('div');
        n.className='flex items-start gap-[10px] rounded-[9px] px-[12px] py-[10px] mb-[9px]';
        n.style='background:rgba(0,212,124,.10);border:1px solid rgba(0,212,124,.35);color:#00d47c';
        n.innerHTML='<i class="fa-solid fa-circle-check mt-[2px]"></i><p class="flex-1 text-[.82rem] font-medium">'+esc(d.message)+'</p>';
        root.insertBefore(n,root.children[1]||root.firstChild)
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    function planIntervalLabel(p){
    const t=String(p.topup_type||p.increment_type||p.interval||'').toLowerCase();
    if(t.includes('minute'))return 'Every 10 Minutes';
    if(t.includes('hour'))return 'Hourly';
    if(t.includes('week'))return 'Weekly';
    if(t.includes('month'))return 'Monthly';
    return 'Daily';
  }
    function planRate(p){
    return Number(p.increment_amount??p.return??p.maxr??p.max_return??p.min_return??0);
  }
    function planCard(p){
    const min=Number((p.min_price??p.min)||0);
    const max=Number((p.max_price??p.max)||0);
    const rate=planRate(p);
    const tag=String(p.tag||p.type||'').toLowerCase();
    const isVip=tag.includes('vip')||tag.includes('premium')||rate>=30;
    const isPopular=tag.includes('popular')||tag.includes('starter');
    const border=isVip?'border-[rgba(0,212,124,.35)]':'border-[#1e1e1e]';
    const icon=isVip?'fa-star':(isPopular?'fa-bolt':'fa-layer-group');
    const iconColor=isVip?'text-grn':(isPopular?'text-ylw':'text-blue2');
    const perLabel=planIntervalLabel(p);
    const sample=min||100;
    const perEarn=sample*rate/100;
    const monthly=perEarn*(perLabel.includes('Minute')?24*6:perLabel.includes('Hour')?24:30);
    return `<div class="bg-[#0d0d0d] rounded-[16px] overflow-hidden border ${border} p-[18px] flex flex-col">
      <div class="text-center mb-[14px]">
        <div class="w-[42px] h-[42px] rounded-full bg-[#161616] flex items-center justify-center mx-auto mb-[10px]"><i class="fa-solid ${icon} ${iconColor}"></i></div>
        <div class="text-white font-medium text-[1rem]">${esc(p.name)}</div>
        <div class="text-[.68rem] mt-1 ${isVip?'text-grn':isPopular?'text-ylw':'text-[#666]'}">${esc(p.tag||'regular')}</div>
        <div class="mt-[12px] font-sora text-[1.6rem] font-light ${isVip?'text-grn':'text-blue2'}">${rate}%</div>
        <div class="text-[.72rem] text-[#555] mt-1">${esc(perLabel)}</div>
      </div>
      <div class="space-y-[8px] text-[.78rem] mb-[14px]">
        <div class="flex justify-between text-[#555]"><span>MINIMUM</span><span class="text-white">${money(min)}</span></div>
        <div class="flex justify-between text-[#555]"><span>MAXIMUM</span><span class="text-white">${max?money(max):'Unlimited'}</span></div>
        <div class="flex justify-between text-[#555]"><span>DURATION</span><span class="text-white">${esc(p.expiration||`${p.duration||30} Days`)}</span></div>
      </div>
      <div class="bg-[#111] border border-[#1a1a1a] rounded-[12px] p-[12px] mb-[14px]">
        <div class="text-[.65rem] text-[#444] uppercase tracking-[.06em] mb-[8px]">Calculate Returns</div>
        <input data-calc-input="${p._id}" data-rate="${rate}" data-interval="${esc(perLabel)}" type="number" value="${sample}" class="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-[12px] py-[10px] text-white outline-none mb-[8px]">
        <div class="flex justify-between text-[.72rem]"><span class="text-[#555]">Per ${esc(perLabel.replace(/^Every /,''))}</span><span class="text-grn" data-calc-per="${p._id}">${money(perEarn)}</span></div>
        <div class="flex justify-between text-[.72rem] mt-1"><span class="text-[#555]">Est. Monthly</span><span class="text-grn" data-calc-month="${p._id}">${money(monthly)}</span></div>
      </div>
      <button data-invest="${p._id}" class="mt-auto w-full py-[12px] rounded-[12px] bg-brand-blue text-white font-medium hover:opacity-90">Invest Now</button>
    </div>`;
  }
    async function userPlans(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading plans...</div>';
    const d=await get('/plans');
    const plans=d.plans||[];
    root.innerHTML=`<div class="flex items-center justify-between mb-[18px]">
      <div class="flex items-center gap-3">
        <div class="inner-back" onclick="history.back()"><i class="fa-solid fa-chevron-left"></i></div>
        <div>
          <div class="inner-title">Investment Plans</div>
          <p class="text-[.72rem] text-[#444] mt-0.5">${plans.length} plans available</p>
        </div>
      </div>
      <a href="/user/myplans.html" class="text-[.78rem] text-[#aaa] border border-[#1e1e1e] rounded-full px-3 py-1.5 no-underline">My Plans</a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">${plans.length?plans.map(planCard).join(''):'<div class="col-span-full text-center py-12 text-[#555]">No investment plans are available.</div>'}</div>`;
    root.querySelectorAll('[data-calc-input]').forEach(inp=>{
      const sync=()=>{
        const rate=Number(inp.dataset.rate||0);
        const v=Number(inp.value||0);
        const per=v*rate/100;
        const interval=String(inp.dataset.interval||'');
        const monthly=per*(interval.includes('Minute')?24*6:interval.includes('Hour')?24:30);
        const id=inp.dataset.calcInput;
        const perEl=root.querySelector(`[data-calc-per="${id}"]`);
        const moEl=root.querySelector(`[data-calc-month="${id}"]`);
        if(perEl)perEl.textContent=money(per);
        if(moEl)moEl.textContent=money(monthly);
      };
      inp.addEventListener('input',sync);
    });
    root.querySelectorAll('[data-invest]').forEach(b=>b.onclick=()=>openInvest(plans.find(p=>String(p._id)===b.dataset.invest),plans));
  }
    function openInvest(p,allPlans=[]){
    if(!p)return;
    const old=document.getElementById('featureInvestDrawer');
    if(old)old.remove();
    const bal=Number(window.USER_BAL_VAL||0);
    const min0=Number((p.min_price??p.min)||0);
    const max0=Number((p.max_price??p.max)||0);
    const rate0=planRate(p);
    const bg=document.createElement('div');
    bg.id='featureInvestDrawer';
    bg.innerHTML=`<div class="feature-drawer-backdrop"></div>
    <aside class="feature-invest-drawer">
      <div class="flex items-center justify-between p-[14px] border-b border-[#1e1e1e]">
        <div class="text-white font-medium">Invest in Plan</div>
        <button type="button" id="closeInvest" class="text-[#777] text-xl">×</button>
      </div>
      <form id="investFeatureForm" class="p-[18px] space-y-[12px] overflow-y-auto" style="max-height:calc(100vh - 60px)">
        <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
          <div class="text-[#444] text-[.68rem] uppercase mb-[10px]">Select Investment Plan</div>
          <select id="investPlan" class="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] p-[11px] text-white">${allPlans.map(x=>`<option value="${x._id}" ${String(x._id)===String(p._id)?'selected':''}>${esc(x.name)}</option>`).join('')}</select>
        </div>
        <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
          <div class="text-[#444] text-[.68rem] uppercase mb-[10px]">Enter Amount</div>
          <div class="flex items-center rounded-[14px] px-[15px] py-[12px]" style="background:#0d0d0d;border:1px solid #1e1e1e;">
            <span class="font-sora text-[1.4rem] font-[300] text-[#333] mr-[4px]">$</span>
            <input id="investAmount" type="number" step="0.01" required class="flex-1 border-none outline-none font-sora text-[1.4rem] font-[300] w-full" style="background:transparent;color:#fff" value="${min0||''}" placeholder="0.00">
          </div>
          <div class="flex justify-between mt-[8px] text-[.72rem] text-[#555]"><span id="investMinLbl">Min: ${money(min0)}</span><span id="investMaxLbl">Max: ${max0?money(max0):'Unlimited'}</span></div>
        </div>
        <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
          <div class="text-[#444] text-[.68rem] uppercase mb-[10px]">Payment Method</div>
          <div class="w-full flex items-center gap-[14px] px-[15px] py-[14px] rounded-[13px]" style="background:rgba(74,108,247,.06);border:1px solid #4a6cf7;">
            <div class="w-[44px] h-[44px] rounded-[12px] bg-[#1a1a1a] flex items-center justify-center"><i class="fa-solid fa-wallet text-[#6e8efb]"></i></div>
            <div class="flex-1"><div class="text-white text-[.88rem] font-[500]">Account Balance</div><div class="text-[#555] text-[.78rem] font-sora mt-[1px]" id="investBalLbl">${money(bal)}</div></div>
            <div class="w-[20px] h-[20px] rounded-full flex items-center justify-center" style="background:rgba(74,108,247,.15);border:1px solid rgba(74,108,247,.4);"><i class="fa-solid fa-check text-[#6e8efb] text-[.6rem]"></i></div>
          </div>
        </div>
        <div class="rounded-[12px] overflow-hidden" style="background:#111;border:1px solid #1e1e1e;" id="investDetailsBox"></div>
        <div id="investError" class="text-[.78rem] text-red2 hidden"></div>
        <button type="submit" id="investSubmitBtn" class="w-full py-[14px] rounded-[12px] text-[.95rem] font-[500] bg-brand-blue text-white">Confirm & Invest</button>
      </form>
    </aside>`;
    document.body.appendChild(bg);
    requestAnimationFrame(()=>bg.classList.add('open'));
    const planSelect=bg.querySelector('#investPlan');
    const amountInput=bg.querySelector('#investAmount');
    const details=bg.querySelector('#investDetailsBox');
    const err=bg.querySelector('#investError');
    function currentPlan(){return allPlans.find(x=>String(x._id)===String(planSelect.value))||p;}
    function renderDetails(){
      const cp=currentPlan();
      const min=Number((cp.min_price??cp.min)||0);
      const max=Number((cp.max_price??cp.max)||0);
      const rate=planRate(cp);
      const amt=Number(amountInput.value||0);
      bg.querySelector('#investMinLbl').textContent='Min: '+money(min);
      bg.querySelector('#investMaxLbl').textContent='Max: '+(max?money(max):'Unlimited');
      amountInput.min=min;
      if(max>0)amountInput.max=max; else amountInput.removeAttribute('max');
      details.innerHTML=`<div class="px-[14px] py-[10px]" style="border-bottom:1px solid #161616;"><div class="text-[#444] text-[.68rem] uppercase tracking-[.07em]">Your Investment Details</div></div>
        ${[['Name of Plan',esc(cp.name)],['Plan Price',money(min)],['Duration',esc(cp.expiration||`${cp.duration||30} Days`)],['Profit',rate+'% '+planIntervalLabel(cp)],['Min Deposit',money(min)],['Max Deposit',max?money(max):'Unlimited'],['Min Return',(cp.min_return??rate)+'%'],['Max Return',(cp.max_return??rate)+'%'],['Bonus',money(cp.gift_bonus||cp.bonus||0)],['Payment Method','Account Balance']].map(([k,v])=>`<div class="flex items-center justify-between px-[14px] py-[10px]" style="border-bottom:1px solid #161616;"><span class="text-[#444] text-[.81rem]">${k}</span><span class="text-white text-[.81rem] font-[500]">${v}</span></div>`).join('')}
        <div class="flex items-center justify-between px-[14px] py-[12px]"><span class="text-[#aaa] text-[.88rem] font-[500]">Amount to Invest</span><span class="font-sora text-[1.2rem] font-[700] text-blue2">${money(amt)}</span></div>`;
    }
    planSelect.onchange=()=>{
      const cp=currentPlan();
      const min=Number((cp.min_price??cp.min)||0);
      amountInput.value=min||'';
      renderDetails();
    };
    amountInput.oninput=renderDetails;
    renderDetails();
    bg.querySelector('#closeInvest').onclick=()=>bg.remove();
    bg.querySelector('.feature-drawer-backdrop').onclick=()=>bg.remove();
    bg.querySelector('#investFeatureForm').onsubmit=async e=>{
      e.preventDefault();
      err.classList.add('hidden');
      const cp=currentPlan();
      const amount=Number(amountInput.value||0);
      const min=Number((cp.min_price??cp.min)||0);
      const max=Number((cp.max_price??cp.max)||0);
      const balance=Number(window.USER_BAL_VAL||0);
      if(amount<min){err.textContent=`Minimum investment is ${money(min)}`;err.classList.remove('hidden');return;}
      if(max>0&&amount>max){err.textContent=`Maximum investment is ${money(max)}`;err.classList.remove('hidden');return;}
      if(amount>balance){err.textContent=`Insufficient balance. Your available balance is ${money(balance)}`;err.classList.remove('hidden');return;}
      const btn=bg.querySelector('#investSubmitBtn');
      btn.disabled=true;btn.textContent='Processing…';
      try{
        const x=await post('/investments',{plan_id:cp._id,amount});
        toast(x.message||'Investment successful.',true);
        bg.remove();
        if(typeof loadProfile==='function')await loadProfile();
        await userPlans();
      }catch(ex){
        err.textContent=ex.response?.data?.message||ex.message||'Investment failed';
        err.classList.remove('hidden');
        btn.disabled=false;btn.textContent='Confirm & Invest';
      }
    };
  }
    async function myPlans(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/myplans');
    const rows=d.investments||[];
    const totalInvested=Number(d.totalInvested||0);
    const totalProfit=Number(d.totalProfit||0);
    const activeCount=Number(d.activePlans!=null?d.activePlans:(d.activeCount!=null?d.activeCount:rows.filter(x=>String(x.active).toLowerCase()==='yes'||x.active===true).length));
    root.innerHTML=`<div class="mb-[18px]"><div class="inner-title">My Plans</div><p class="text-[.72rem] text-[#444] mt-0.5">Manage your active investment plans</p></div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-[10px] mb-[16px]">
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.65rem] text-[#555] uppercase mb-2">Total Invested</div><div class="text-white font-sora text-[1.3rem]">${money(totalInvested)}</div></div>
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.65rem] text-[#555] uppercase mb-2">Total Profit</div><div class="text-white font-sora text-[1.3rem]">${money(totalProfit)}</div></div>
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.65rem] text-[#555] uppercase mb-2">Active Plans</div><div class="text-white font-sora text-[1.3rem]">${activeCount}</div></div>
    </div>
    <div class="flex items-center justify-between mb-[12px]"><a href="/user/buy-plan.html" class="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-blue text-white text-[.8rem] no-underline"><i class="fa-solid fa-plus"></i> Browse Plans</a></div>
    <div class="space-y-[8px]">${rows.length?rows.map(r=>{
      const p=r.plan||{};
      const active=String(r.active).toLowerCase()==='yes'||r.active===true;
      const start=r.activated_at||r.createdAt;
      const end=r.expire_date;
      const leftMs=end?new Date(end)-Date.now():0;
      const daysLeft=Math.max(0,Math.ceil(leftMs/86400000));
      const dur=new Date(end)-new Date(start);
      const prog=dur>0?Math.min(100,Math.max(0,(Date.now()-new Date(start))/dur*100)):0;
      return `<a href="/user/plan-details.html?id=${r._id}" class="block no-underline bg-[#111] border border-[#1e1e1e] rounded-[13px] px-[14px] py-[12px] hover:border-[#2a2a2a]">
        <div class="flex items-center gap-3">
          <div class="w-[36px] h-[36px] rounded-[10px] bg-[#1a1a1a] flex items-center justify-center text-blue2"><i class="fa-solid fa-layer-group"></i></div>
          <div class="flex-1 min-w-0">
            <div class="text-white text-[.9rem] font-medium">${esc(p.name||'Plan')}</div>
            <div class="text-[.72rem] text-[#555]">${money(r.amount)} invested</div>
          </div>
          <div class="hidden sm:block flex-1 px-3">
            <div class="text-[.65rem] text-[#555] mb-1">Progress ${daysLeft} days left</div>
            <div class="h-[4px] bg-[#1a1a1a] rounded-full overflow-hidden"><div class="h-full bg-[#4a6cf7]" style="width:${prog}%"></div></div>
          </div>
          <div class="text-right mr-2">
            <div class="text-grn text-[.8rem]">${money(r.profit_earned||0)}</div>
            <div class="text-[.65rem] text-[#555]">${dt(start)} – ${dt(end)}</div>
          </div>
          <span class="text-[.68rem] px-2 py-1 rounded-full ${active?'text-grn bg-[rgba(0,212,124,.1)]':'text-[#888] bg-[#1a1a1a]'}">${active?'Active':'Expired'}</span>
          <i class="fa-solid fa-chevron-right text-[#444] text-[.75rem]"></i>
        </div>
      </a>`;
    }).join(''):'<div class="text-center py-12 text-[#555]">No investments yet.</div>'}</div>`;
  }
    async function planDetails(){
    const root=inner();
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Investment id is required.',false);return;}
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/investments/'+encodeURIComponent(id));
    const i=d.investment||{};
    const p=i.plan||{};
    const active=String(i.active).toLowerCase()==='yes'||i.active===true;
    const start=new Date(i.activated_at||i.createdAt);
    const endD=new Date(i.expire_date);
    const duration=Math.max(1,endD-start);
    const progress=Math.min(100,Math.max(0,(Date.now()-start)/duration*100));
    const dayNum=Math.min(Math.ceil((Date.now()-start)/86400000), Math.ceil(duration/86400000));
    const totalDays=Math.max(1,Math.ceil(duration/86400000));
    const invested=Number(i.amount||0);
    const profit=Number(i.profit_earned||0);
    const rate=planRate(p);
    const projected=invested + (invested*rate/100*totalDays);
    root.innerHTML=`<div class="flex items-center justify-between mb-[16px]">
      <div class="flex items-center gap-3">
        <div class="inner-back" onclick="location.href='/user/myplans.html'"><i class="fa-solid fa-chevron-left"></i></div>
        <div>
          <div class="inner-title">${esc(p.name||'Plan Details')}</div>
          <p class="text-[.72rem] text-[#444] mt-0.5">${esc(planIntervalLabel(p))} for ${esc(i.inv_duration||p.expiration||(totalDays+' Days'))}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[.68rem] px-2 py-1 rounded-full ${active?'text-grn bg-[rgba(0,212,124,.1)]':'text-[#888] bg-[#1a1a1a]'}">${active?'Active':'Expired'}</span>
        ${active?`<button id="cancelPlanBtn" class="text-[.72rem] text-red2 border border-[rgba(255,69,96,.3)] rounded-full px-3 py-1">Cancel Plan</button>`:''}
      </div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px] mb-[10px]">
      <div class="flex justify-between text-[.72rem] text-[#555] mb-2"><span>Investment Progress</span><span>Day ${dayNum} of ${totalDays}</span></div>
      <div class="h-[6px] bg-[#1a1a1a] rounded-full overflow-hidden mb-2"><div class="h-full bg-[#4a6cf7]" style="width:${progress}%"></div></div>
      <div class="flex justify-between text-[.65rem] text-[#444]"><span>${dt(start)}</span><span>${progress.toFixed(0)}%</span><span>${dt(endD)}</span></div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-[10px] mb-[10px]">
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.65rem] text-[#555] uppercase mb-2">Invested Amount</div><div class="text-white font-sora text-[1.2rem]">${money(invested)}</div></div>
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.65rem] text-[#555] uppercase mb-2">Profit Earned</div><div class="text-white font-sora text-[1.2rem]">${money(profit)}</div></div>
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.65rem] text-[#555] uppercase mb-2">Total Return</div><div class="text-white font-sora text-[1.2rem]">${money(invested+profit)}</div></div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px] mb-[10px]">
      <div class="text-[.8rem] text-white mb-3">Earnings Summary</div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-[8px] text-[.75rem]">
        <div><div class="text-[#555]">ROI ${esc(planIntervalLabel(p))}</div><div class="text-grn mt-1">${money(invested*rate/100)}</div></div>
        <div><div class="text-[#555]">Payments Received</div><div class="text-white mt-1">${Number(i.payments_count||0)}</div></div>
        <div><div class="text-[#555]">Projected Total ROI</div><div class="text-blue2 mt-1">${money(projected)}</div></div>
        <div><div class="text-[#555]">Next Payout</div><div class="text-white mt-1">${active?dt(new Date(Date.now()+3600000)):'—'}</div></div>
      </div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
      <div class="text-[.8rem] text-white mb-3">Plan Information</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-[10px] text-[.78rem]">
        <div><div class="text-[#555]">Duration</div><div class="text-white mt-1">${esc(i.inv_duration||p.expiration||(totalDays+' Days'))}</div></div>
        <div><div class="text-[#555]">Start Date</div><div class="text-white mt-1">${dt(start)}</div></div>
        <div><div class="text-[#555]">End Date</div><div class="text-white mt-1">${dt(endD)}</div></div>
        <div><div class="text-[#555]">Min Return</div><div class="text-white mt-1">${p.min_return??rate}%</div></div>
        <div><div class="text-[#555]">Max Return</div><div class="text-white mt-1">${p.max_return??rate}%</div></div>
        <div><div class="text-[#555]">ROI Interval</div><div class="text-white mt-1">${esc(planIntervalLabel(p))}</div></div>
      </div>
    </div>`;
    const cancelBtn=root.querySelector('#cancelPlanBtn');
    if(cancelBtn){
      cancelBtn.onclick=async()=>{
        if(!confirm('Cancel this investment plan?'))return;
        try{
          const x=await post('/investments/'+encodeURIComponent(id)+'/cancel',{});
          toast(x.message||'Plan cancelled',true);
          location.href='/user/myplans.html';
        }catch(e){toast(e.message,false);}
      };
    }
  }
    async function cards(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/cards');
    const list=d.cards||[];
    const isRevealed=s=>['active','frozen'].includes(String(s||'').toLowerCase());
    function networkOf(c){
      const n=String(c.card_type_id?.network||c.cardType?.network||c.network||c.card_type_id?.name||c.cardType?.name||'').toLowerCase();
      if(n.includes('master')) return 'mastercard';
      return 'visa';
    }
    function last4(c){
      const num=String(c.card_number||c.masked_number||'').replace(/\D/g,'');
      if(num.length>=4) return num.slice(-4);
      return '••••';
    }
    function expiry(c){
      if(c.expiry_display) return c.expiry_display;
      if(c.expiry_month&&c.expiry_year){
        const mm=String(c.expiry_month).padStart(2,'0');
        const yy=String(c.expiry_year).slice(-2);
        return mm+'/'+yy;
      }
      return '••/••';
    }
    function cardFace(c){
      const net=networkOf(c);
      const revealed=isRevealed(c.status);
      const holder=esc(c.card_holder||'CARD HOLDER');
      const status=String(c.status||'pending');
      const stColor=status==='active'?'#00d47c':status==='pending'?'#f5c542':status==='frozen'?'#3B7BFF':'#ff4560';
      const bg=net==='mastercard'
        ? 'background:linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%);'
        : 'background:linear-gradient(135deg,#0b1d4a 0%,#1a3a8a 45%,#2b5cff 100%);';
      const brand=net==='mastercard'
        ? `<div class="flex items-center" style="height:36px"><span style="width:28px;height:28px;border-radius:50%;background:#eb001b;display:inline-block"></span><span style="width:28px;height:28px;border-radius:50%;background:#f79e1b;display:inline-block;margin-left:-10px;opacity:.95"></span></div>`
        : `<div style="font-family:Sora,sans-serif;font-weight:700;font-size:1.15rem;letter-spacing:.08em;color:#fff">VISA</div>`;
      const numberLine=revealed
        ? `•••• •••• •••• ${last4(c)}`
        : `•••• •••• •••• ••••`;
      const expLine=revealed ? expiry(c) : '••/••';
      return `<div class="rounded-[18px] p-[20px] text-white relative overflow-hidden shadow-lg" style="${bg} min-height:190px">
        <div class="absolute -right-8 -top-8 w-[120px] h-[120px] rounded-full opacity-10" style="background:#fff"></div>
        <div class="flex justify-between items-start mb-6">
          <div class="w-[42px] h-[32px] rounded-[6px] bg-gradient-to-br from-[#f5d76e] to-[#c9a227] opacity-90"></div>
          ${brand}
        </div>
        <div class="font-mono tracking-[.18em] text-[1.05rem] mb-5">${numberLine}</div>
        <div class="flex justify-between items-end">
          <div>
            <div class="text-[.58rem] uppercase tracking-[.12em] text-white/50 mb-1">Card Holder</div>
            <div class="text-[.82rem] font-medium tracking-wide uppercase">${holder}</div>
          </div>
          <div class="text-right">
            <div class="text-[.58rem] uppercase tracking-[.12em] text-white/50 mb-1">Expires</div>
            <div class="text-[.82rem] font-mono">${expLine}</div>
          </div>
        </div>
        <div class="mt-3"><span class="text-[.65rem] px-2 py-0.5 rounded-full" style="color:${stColor};background:rgba(0,0,0,.25);border:1px solid ${stColor}55">${esc(status.charAt(0).toUpperCase()+status.slice(1))}</span></div>
      </div>`;
    }
    root.innerHTML=`<div class="flex items-center justify-between mb-[18px] flex-wrap gap-3">
      <div><div class="inner-title">My Cards</div><p class="text-[.72rem] text-[#444] mt-0.5">Manage your virtual and physical debit cards</p></div>
      <a href="/user/apply-card.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue text-white text-[.82rem] no-underline font-medium">+ Apply for Card</a>
    </div>
    ${list.length?`<div class="grid grid-cols-1 md:grid-cols-2 gap-[14px]">${list.map(c=>`<div>
        ${cardFace(c)}
        <button type="button" class="w-full mt-3 py-[10px] rounded-[10px] border border-[#1e1e1e] text-[#888] text-[.82rem]" onclick="return false">View Details</button>
      </div>`).join('')}</div>`:`<div class="text-center py-20">
      <div class="w-[64px] h-[64px] mx-auto mb-4 rounded-[14px] bg-[#111] border border-[#1e1e1e] flex items-center justify-center text-[#333] text-[1.6rem]"><i class="fa-regular fa-credit-card"></i></div>
      <p class="text-[#555] text-[.9rem] mb-5">You don't have any cards yet.</p>
      <a href="/user/apply-card.html" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue text-white text-[.88rem] no-underline font-medium">Apply for Your First Card</a>
    </div>`}`;
  }
    async function applyCard(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading card types...</div>';
    const d=await get('/card-types');
    const types=(d.cardTypes||[]).filter(t=>t.is_active!==false);
    const fullName=(window.USER_NAME||document.querySelector('.sb-name')?.textContent||'').trim();
    root.innerHTML=`<div class="mb-[18px] flex items-center gap-3">
      <div class="inner-back" onclick="location.href='/user/cards.html'"><i class="fa-solid fa-chevron-left"></i></div>
      <div><div class="inner-title">Apply for a Card</div><p class="text-[.72rem] text-[#444] mt-0.5">Choose a card type and fill in your details</p></div>
    </div>
    <form id="applyCardFeature" class="space-y-[14px]">
      <div class="text-[.68rem] text-[#555] uppercase tracking-[.07em]">Select a Card Type</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px]" id="cardTypeGrid">
        ${types.length?types.map(t=>{
          const fee=Number(t.fee??t.issuance_fee??0);
          const feeLbl=fee>0?money(fee)+' fee':'Free';
          return `<label class="block cursor-pointer">
            <input type="radio" name="card_type_id" value="${t._id}" class="sr-only peer" required>
            <div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[16px] h-full peer-checked:border-blue2 peer-checked:bg-[rgba(74,108,247,.06)] transition-all">
              <div class="flex justify-between items-start gap-2 mb-2">
                <div class="text-white font-medium">${esc(t.name)}</div>
                <span class="text-[.68rem] px-2 py-0.5 rounded-full ${fee>0?'bg-[rgba(74,108,247,.15)] text-blue2':'bg-[rgba(0,212,124,.12)] text-grn'}">${feeLbl}</span>
              </div>
              <div class="text-[.72rem] text-[#555] mb-2">${esc(t.network||'')} · ${esc(t.type||'')}</div>
              <p class="text-[.78rem] text-[#666] leading-relaxed">${esc(t.description||'')}</p>
              ${t.delivery_days?`<div class="text-[.72rem] text-[#555] mt-3"><i class="fa-regular fa-clock mr-1"></i>Delivery: ~${esc(t.delivery_days)} days</div>`:''}
            </div>
          </label>`;
        }).join(''):'<div class="col-span-full text-[#555] py-8 text-center">No card types available.</div>'}
      </div>
      <div id="applyCardFormPanel" class="hidden bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[16px] space-y-[12px]">
        <div class="text-[.68rem] text-[#555] uppercase tracking-[.07em]">Card Details</div>
        <div><label class="text-[.72rem] text-[#666]">Card Holder Name</label><input name="card_holder" id="applyCardHolder" required class="w-full mt-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none" placeholder="Full name on card"></div>
        <div><label class="text-[.72rem] text-[#666]">Street Address</label><input name="street" class="w-full mt-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none" placeholder="Street address"></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-[.72rem] text-[#666]">City</label><input name="city" class="w-full mt-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none"></div>
          <div><label class="text-[.72rem] text-[#666]">Postcode</label><input name="postcode" class="w-full mt-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none"></div>
        </div>
        <div><label class="text-[.72rem] text-[#666]">Country</label><input name="country" class="w-full mt-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none" value="Nigeria"></div>
        <div id="applyCardErr" class="text-red2 text-[.78rem] hidden"></div>
        <button type="submit" class="w-full py-[13px] rounded-[12px] bg-brand-blue text-white font-medium">Submit Application</button>
      </div>
    </form>`;
    const panel=root.querySelector('#applyCardFormPanel');
    const holder=root.querySelector('#applyCardHolder');
    function showForm(){
      panel.classList.remove('hidden');
      if(holder && !holder.value){
        const name=(window.USER_NAME||document.querySelector('.sb-name')?.textContent||fullName||'').trim();
        if(name) holder.value=name;
      }
      panel.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
    root.querySelectorAll('input[name="card_type_id"]').forEach(r=>{
      r.addEventListener('change', showForm);
    });
    // if profile loads late, try fill once more
    setTimeout(()=>{
      if(holder && !holder.value && window.USER_NAME) holder.value=String(window.USER_NAME).trim();
    },800);
    root.querySelector('#applyCardFeature').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const body=Object.fromEntries(fd.entries());
      if(!body.card_type_id){
        const err=root.querySelector('#applyCardErr');
        panel.classList.remove('hidden');
        err.textContent='Please select a card type.';
        err.classList.remove('hidden');
        return;
      }
      body.shipping_address={street:body.street,city:body.city,postcode:body.postcode,country:body.country};
      const err=root.querySelector('#applyCardErr');
      try{
        const x=await post('/cards',body);
        toast(x.message||'Card application submitted. Pending review.',true);
        setTimeout(()=>location.href='/user/cards.html',700);
      }catch(ex){
        err.textContent=ex.response?.data?.message||ex.message||'Application failed';
        err.classList.remove('hidden');
        panel.classList.remove('hidden');
      }
    };
  }
    
    async function markets(){
    const root=inner(),d=await get('/assets?asset_class=all'),a=d.assets||[];
    const cats=['all','crypto','forex','stock','etf','index'];
    root.innerHTML=shell('Markets')+`<div class="grid grid-cols-3 gap-[9px] mb-[12px]">${[['Total Assets',a.length],['Top Gainer',a.slice().sort((x,y)=>Number(y.price_change_pct_24h||y.change_24h)-Number(x.price_change_pct_24h||x.change_24h))[0]?.symbol||'—'],['Top Loser',a.slice().sort((x,y)=>Number(x.price_change_pct_24h||x.change_24h)-Number(y.price_change_pct_24h||y.change_24h))[0]?.symbol||'—']].map(x=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[12px]"><div class="text-[#555] text-[.65rem] uppercase">${
      x[0]
    }
    </div><div class="text-white font-bold mt-1">${
      x[1]
    }
    </div></div>`).join('')}</div><div class="flex gap-2 overflow-x-auto mb-3">${cats.map(c=>`<button data-cat="${c}" class="px-3 py-1.5 rounded-full border border-[#1e1e1e] text-[#777] text-[.72rem]">${
      c[0].toUpperCase()+c.slice(1)
    }
    </button>`).join('')}</div><div id="marketAssets" class="space-y-[7px]"></div>`;
    const render=xs=>document.getElementById('marketAssets').innerHTML=xs.length?xs.map(x=>`<div onclick="location.href='/user/trade.html'" class="bg-[#111] border border-[#1e1e1e] rounded-[11px] p-[12px] flex items-center gap-3 cursor-pointer"><div class="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">${x.logo_url?`<img src="${esc(x.logo_url)}" class="w-full h-full object-cover">`:esc(String(x.symbol||'?').slice(0,1))}</div><div class="flex-1"><div class="text-white text-[.84rem]">${esc(x.name)}</div><div class="text-[#555] text-[.68rem]">${esc(x.symbol)}</div></div><div class="text-right"><div class="text-white text-[.82rem]">${money(x.price,'$')}</div><div class="text-[.68rem] ${Number(x.price_change_pct_24h||x.change_24h)>=0?'text-grn':'text-red2'}">${Number(x.price_change_pct_24h||x.change_24h)>=0?'+':''}${Number(x.price_change_pct_24h||x.change_24h).toFixed(2)}%</div></div></div>`).join(''):'<div class="text-center py-12 text-[#555]">No assets in this class</div>';
    render(a);
    root.querySelectorAll('[data-cat]').forEach(b=>b.onclick=async()=>{
      const x=await get('/assets?asset_class='+b.dataset.cat);
      render(x.assets||[])
    })
  }
    async function copyTrading(){
        const root=inner(), d=await get('/experts');
        root.innerHTML=shell('Copy Trading','Follow experienced traders')+`<div class="flex gap-2 mb-3"><button id="expertTab" class="px-3 py-2 rounded-lg bg-blue2 text-white text-[.75rem]">Experts</button><button id="positionTab" class="px-3 py-2 rounded-lg bg-[#111] text-[#777] text-[.75rem]">My Active Copies${d.activeCount?` (${
      d.activeCount
    })`:''}</button></div><div id="copyContent"></div>`;
        const content=root.querySelector('#copyContent');
        function experts(){
            if(!d.experts.length){
        content.innerHTML='<div class="text-center py-12 text-[#555]">No experts available.</div>';
        return;
      }
            content.innerHTML=`<div class="grid grid-cols-1 md:grid-cols-2 gap-[9px]">${d.experts.map(e=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex items-center gap-3"><img src="${esc(e.profile_picture||'/temp/wallet/other.png')}" class="w-10 h-10 rounded-full object-cover"><div><div class="text-white font-medium">${
        esc(e.name)
      }
      </div><div class="text-[#555] text-[.7rem]">${
        esc(e.area_of_expertise)
      }
      </div></div></div><div class="grid grid-cols-3 gap-2 mt-4 text-center"><div><div class="text-grn font-bold">${
        num(e.daily_roi)
      }
      %</div><div class="text-[#555] text-[.62rem]">Daily ROI</div></div><div><div class="text-white font-bold">${
        num(e.win_rate)
      }
      %</div><div class="text-[#555] text-[.62rem]">Win Rate</div></div><div><div class="text-white font-bold">${
        num(e.duration_days)
      }
      </div><div class="text-[#555] text-[.62rem]">Days</div></div></div><a href="/user/copytrader-details.html?id=${e._id}" class="block mt-4 text-center py-2 rounded-lg bg-brand-blue text-white text-[.78rem]">View Expert</a></div>`).join('')}</div>`;

    }
        function positions(){
            if(!d.positions.length){
        content.innerHTML=`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[32px] text-center"><i class="fa-solid fa-users text-[#2a2a2a] text-[2.5rem] mb-[12px] block"></i><p class="text-[#aaa] text-[.88rem] mb-[12px]">You are not copying any experts yet.</p><button id="browseExperts" class="text-blue2 text-[.82rem]">Browse Experts</button></div>`;
        content.querySelector('#browseExperts').onclick=experts;
        return;
      }
            content.innerHTML=`<div class="space-y-[9px]">${d.positions.map(p=>{const progress=Math.min(100,Math.max(0,(Date.now()-new Date(p.started_at))/((new Date(p.expires_at)-new Date(p.started_at))||1)*100));const payout=Number(p.invested_amount)+Number(p.accumulated_profit)+Number(p.admin_profit_adjustment||0);return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex justify-between"><div class="text-white font-medium">${
        esc(p.expert?.name||'Expert')
      }
      </div><span class="text-grn text-[.68rem]">${
        esc(p.status)
      }
      </span></div><div class="grid grid-cols-3 gap-2 mt-3 text-[.76rem]"><div><span class="text-[#555]">Invested</span><div class="text-white">${
        money(p.invested_amount)
      }
      </div></div><div><span class="text-[#555]">Profit</span><div class="text-grn">${
        money(p.accumulated_profit)
      }
      </div></div><div><span class="text-[#555]">Payout</span><div class="text-white">${
        money(payout)
      }
      </div></div></div><div class="mt-3 h-[5px] bg-[#1a1a1a] rounded-full"><div style="width:${progress}%;height:100%;background:#4a6cf7"></div></div><a href="/user/copy-trading-position.html?id=${p._id}" class="block mt-3 text-center py-2 rounded-lg bg-brand-blue text-white text-[.78rem]">View Position</a></div>`}).join('')}</div>`;

    }
        experts();
        root.querySelector('#expertTab').onclick=experts;
        root.querySelector('#positionTab').onclick=positions;

  }
    async function copyDetails(){
    const root=inner(),id=new URLSearchParams(location.search).get('id'),d=await get('/experts/'+id),e=d.expert,p=d.activePosition;
    root.innerHTML=shell(e.name,e.area_of_expertise)+`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex items-center gap-3"><img src="${esc(e.profile_picture||'/temp/wallet/other.png')}" class="w-14 h-14 rounded-full object-cover"><div><div class="text-white font-medium">${esc(e.name)}</div><div class="text-[#555] text-[.72rem]">${esc(e.bio||'')}</div></div></div><div class="grid grid-cols-2 gap-3 mt-4">${[['Daily ROI',e.daily_roi+'%'],['Duration',e.duration_days+' days'],['Total ROI',e.total_roi+'%'],['Min Capital',money(e.min_startup_capital)],['Max Capital',money(e.max_capital)],['Win Rate',e.win_rate+'%']].map(x=>`<div class="bg-[#161616] rounded-lg p-3"><div class="text-[#555] text-[.68rem]">${
      x[0]
    }
    </div><div class="text-white font-bold mt-1">${
      x[1]
    }
    </div></div>`).join('')}</div>${p?`<div class="mt-4 bg-[rgba(0,212,124,.05)] border border-[rgba(0,212,124,.2)] rounded-lg p-3"><div class="text-grn font-medium">Your Active Position</div><div class="text-[#aaa] text-[.76rem] mt-2">Invested ${
      money(p.invested_amount)
    }
     · Profit ${
      money(p.accumulated_profit)
    }
    </div><a class="block mt-3 text-center py-2 rounded-lg bg-brand-blue text-white" href="/user/copy-trading-position.html?id=${p._id}">View Position</a></div>`:`<form id="copyStart" class="mt-4"><label class="text-[#555] text-[.68rem]">Investment Amount</label><input name="amount" type="number" min="${e.min_startup_capital}" ${
      e.max_capital?`max="${e.max_capital}"`:''
    }
     required class="w-full mt-2 bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-3 text-white"><div id="dailyProfit" class="text-grn text-[.78rem] mt-2">Estimated Daily Profit: ${
      money(0)
    }
    </div><button class="mt-3 w-full py-3 rounded-lg bg-brand-blue text-white">Start Copying — ${
      e.duration_days
    }
     Day Plan</button></form>`}</div>`;
    const f=root.querySelector('#copyStart');
    if(f){
      const a=f.amount,dp=f.querySelector('#dailyProfit');
      a.oninput=()=>dp.textContent='Estimated Daily Profit: '+money(Number(a.value||0)*Number(e.daily_roi||0)/100);
      f.onsubmit=async ev=>{
        ev.preventDefault();
        try{
          const x=await post('/copy/start/'+id,{
            amount:Number(a.value)
          });
          toast(x.message,true);
          notify('Started Copying Expert',x.message);
          location.href='/user/copy-trading.html'
        }
        catch(err){
          toast(err.message,false)
        }
      }
    }
  }
    async function copyPosition(){
    const root=inner(),id=new URLSearchParams(location.search).get('id'),d=await get('/copy/position/'+id),p=d.position,e=p.expert;
    const progress=Math.min(100,Math.max(0,(Date.now()-new Date(p.started_at))/((new Date(p.expires_at)-new Date(p.started_at))||1)*100));
    const payout=Number(p.invested_amount)+Number(p.accumulated_profit)+Number(p.admin_profit_adjustment||0);
    root.innerHTML=shell(e?.name||'Copy Position')+`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="grid grid-cols-2 gap-[9px]">${[['Invested',money(p.invested_amount)],['Profit',money(p.accumulated_profit)],['Daily ROI',Number(p.daily_roi_snapshot||0)+'%'],['Total Payout',money(payout)],['Started',dt(p.started_at)],['Expires',dt(p.expires_at)]].map(x=>`<div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[#555] text-[.68rem]">${
      x[0]
    }
    </div><div class="text-white font-bold mt-1">${
      x[1]
    }
    </div></div>`).join('')}</div><div class="mt-4"><div class="flex justify-between text-[.68rem] text-[#555] mb-1"><span>Day ${Math.floor(progress*Number(e?.duration_days||30)/100)} of ${Number(e?.duration_days||30)}</span><span>${Math.max(0,daysLeft(p.expires_at))} days remaining</span></div><div class="h-[5px] bg-[#1a1a1a] rounded-full"><div style="width:${progress}%;height:100%;background:#4a6cf7"></div></div></div>${p.status==='active'?'<button id="stopCopy" class="w-full mt-4 py-3 rounded-lg bg-[rgba(255,69,96,.1)] text-red2 border border-[rgba(255,69,96,.2)]">Stop Copying</button>':''}</div>`;
    root.querySelector('#stopCopy')?.addEventListener('click',async()=>{
      if(!confirm('Are you sure you want to stop the active position?'))return;
      try{
        const x=await post('/copy/stop/'+id,{
        });
        toast(x.message,true);
        location.href='/user/copy-trading.html'
      }
      catch(err){
        toast(err.message,false)
      }
    })
  }
    async function bots(){
        const root=inner(),d=await get('/bots');
        root.innerHTML=shell('Bot Trading','Automated trading strategies')+`<div class="flex gap-2 mb-3"><button id="botsTab" class="px-3 py-2 rounded-lg bg-blue2 text-white text-[.75rem]">Bots</button><button id="subsTab" class="px-3 py-2 rounded-lg bg-[#111] text-[#777] text-[.75rem]">My Subscriptions${d.activeCount?` (${
      d.activeCount
    })`:''}</button></div><div id="botContent"></div>`;
        const c=root.querySelector('#botContent');
        function renderBots(){
            if(!d.bots.length){
        c.innerHTML='<div class="text-center py-12 text-[#555]">No bots available.</div>';
        return;
      }
            c.innerHTML=`<div class="grid grid-cols-1 md:grid-cols-2 gap-[9px]">${d.bots.map(b=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-white font-medium">${
        esc(b.name)
      }
      </div><div class="text-[#555] text-[.72rem] mt-1">${
        esc(b.strategy_type)
      }
      </div><div class="grid grid-cols-3 gap-2 mt-4 text-center"><div><div class="text-grn">${
        b.expected_roi||b.daily_roi||0
      }
      %</div><div class="text-[#555] text-[.62rem]">Daily ROI</div></div><div><div class="text-white">${
        b.win_rate||0
      }
      %</div><div class="text-[#555] text-[.62rem]">Win Rate</div></div><div><div class="text-white">${
        b.max_duration_days||30
      }
      </div><div class="text-[#555] text-[.62rem]">Days</div></div></div><a href="/user/bot-trading-details.html?id=${b._id}" class="block mt-4 text-center py-2 rounded-lg bg-brand-blue text-white text-[.78rem]">View Bot</a></div>`).join('')}</div>`;

    }
        function renderSubs(){
            if(!d.subscriptions.length){
        c.innerHTML='<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-8 text-center"><i class="fa-solid fa-microchip text-[2.5rem] text-[#333]"></i><p class="text-[#aaa] mt-3">You have not subscribed to any bots yet.</p></div>';
        return;
      }
            c.innerHTML=`<div class="space-y-[9px]">${d.subscriptions.map(s=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex justify-between"><div class="text-white font-medium">${
        esc(s.bot_id?.name||'Bot')
      }
      </div><span class="text-grn text-[.68rem]">${
        esc(s.status)
      }
      </span></div><div class="grid grid-cols-3 gap-2 mt-3 text-[.76rem]"><div><span class="text-[#555]">Invested</span><div class="text-white">${
        money(s.invested_amount)
      }
      </div></div><div><span class="text-[#555]">Profit</span><div class="text-grn">${
        money(s.current_profit)
      }
      </div></div><div><span class="text-[#555]">Payout</span><div class="text-white">${
        money(Number(s.invested_amount)+Number(s.current_profit)+Number(s.admin_profit_adjustment||0))
      }
      </div></div></div></div>`).join('')}</div>`;

    }
        renderBots();
    root.querySelector('#botsTab').onclick=renderBots;
    root.querySelector('#subsTab').onclick=renderSubs;

  }
    async function botDetails(){
    const root=inner(),id=new URLSearchParams(location.search).get('id'),d=await get('/bots/'+id),b=d.bot,s=d.subscription;
    root.innerHTML=shell(b.name,b.strategy_type)+`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[#aaa] text-[.78rem] leading-6">${esc(b.description||'')}</div><div class="grid grid-cols-2 gap-3 mt-4">${[['Daily ROI',b.expected_roi||b.daily_roi||0+'%'],['Win Rate',(b.win_rate||0)+'%'],['Min Investment',money(b.min_investment)],['Max Investment',money(b.max_investment)],['Duration',(b.max_duration_days||30)+' days'],['Interval',(b.trade_interval_minutes||60)+' min']].map(x=>`<div class="bg-[#161616] rounded-lg p-3"><div class="text-[#555] text-[.68rem]">${
      x[0]
    }
    </div><div class="text-white font-bold mt-1">${
      x[1]
    }
    </div></div>`).join('')}</div>${s?`<div class="mt-4 bg-[rgba(0,212,124,.05)] border border-[rgba(0,212,124,.2)] rounded-lg p-3"><div class="text-grn">Active Subscription</div><div class="text-[#aaa] text-[.76rem] mt-2">${
      money(s.invested_amount)
    }
     invested · ${
      money(s.current_profit)
    }
     profit</div><button id="stopBot" class="mt-3 w-full py-2 rounded-lg bg-[rgba(255,69,96,.1)] text-red2">Stop Subscription</button></div>`:`<form id="botStart" class="mt-4"><input name="amount" type="number" min="${b.min_investment}" ${
      b.max_investment?`max="${b.max_investment}"`:''
    }
     required class="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-3 text-white" placeholder="Investment amount"><button class="mt-3 w-full py-3 rounded-lg bg-brand-blue text-white">Start Subscription</button></form>`}</div>`;
    root.querySelector('#botStart')?.addEventListener('submit',async e=>{
      e.preventDefault();
      try{
        const x=await post('/bots/subscribe/'+id,{
          amount:Number(e.currentTarget.amount.value)
        });
        toast(x.message,true);
        location.href='/user/bot-trading.html'
      }
      catch(err){
        toast(err.message,false)
      }
    });
    root.querySelector('#stopBot')?.addEventListener('click',async()=>{
      if(!confirm('Stop this bot subscription?'))return;
      try{
        const x=await post('/bots/stop/'+s._id,{
        });
        toast(x.message,true);
        location.href='/user/bot-trading.html'
      }
      catch(err){
        toast(err.message,false)
      }
    })
  }
    async function mining(){
    const root=inner(),d=await get('/mining');
    const active=d.subscriptions.filter(x=>x.status==='active');
    root.innerHTML=shell('Cloud Mining','Mine digital assets with managed rigs')+`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px] mb-[9px]"><div class="text-[#444] text-[.68rem] uppercase">Total Mining Earnings</div><div class="text-grn text-xl font-bold mt-1">${money(d.totalEarnings)}</div><div class="grid grid-cols-2 gap-2 mt-3"><div class="bg-[#161616] p-3 rounded-lg"><div class="text-[#555] text-[.68rem]">Active Investment</div><div class="text-white font-bold">${money(active.reduce((s,x)=>s+Number(x.invested_amount||0),0))}</div></div><div class="bg-[#161616] p-3 rounded-lg"><div class="text-[#555] text-[.68rem]">Active Rigs</div><div class="text-white font-bold">${active.length}</div></div></div></div><div class="space-y-[9px]">${d.plans.length?d.plans.map(p=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex justify-between"><div><div class="text-white font-medium">${
      esc(p.name)
    }
    </div><div class="text-[#555] text-[.72rem]">${
      esc(p.hashrate)
    }
    </div></div><div class="text-grn font-bold">${
      p.daily_roi_percentage
    }
    %</div></div><p class="text-[#666] text-[.76rem] mt-3">${
      esc(p.description||'')
    }
    </p><div class="grid grid-cols-3 gap-2 mt-3 text-center"><div class="bg-[#161616] p-2 rounded"><div class="text-[#555] text-[.62rem]">Min</div><div class="text-white">${
      money(p.min_investment)
    }
    </div></div><div class="bg-[#161616] p-2 rounded"><div class="text-[#555] text-[.62rem]">Max</div><div class="text-white">${
      p.max_investment?money(p.max_investment):'Unlimited'
    }
    </div></div><div class="bg-[#161616] p-2 rounded"><div class="text-[#555] text-[.62rem]">Duration</div><div class="text-white">${
      p.duration_days
    }
     days</div></div></div><button data-mine="${p._id}" class="w-full mt-3 py-2 rounded-lg bg-brand-blue text-white">Start Mining</button></div>`).join(''):'<div class="text-center py-12 text-[#555]">No mining plans available.</div>'}</div>${active.length?`<div class="mt-5"><div class="text-[#444] text-[.68rem] uppercase mb-2">Active Rigs</div><div class="space-y-2">${
      active.map(s=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-3"><div class="flex justify-between"><div class="text-white">${esc(s.mining_plan_id?.name||'Mining Plan')}</div><span class="text-grn text-[.68rem]">active</span></div><div class="text-[#666] text-[.72rem] mt-2">Invested ${money(s.invested_amount)} · Earned ${money(s.accumulated_profit)} · ${daysLeft(s.expires_at)} days left</div><div class="h-[5px] bg-[#1a1a1a] rounded-full mt-2"><div style="width:${Math.min(100,Math.max(0,(Date.now()-new Date(s.started_at))/((new Date(s.expires_at)-new Date(s.started_at))||1)*100))}%;height:100%;background:#4a6cf7"></div></div><div class="flex gap-2 mt-3"><a class="flex-1 text-center py-2 rounded-lg bg-brand-blue text-white text-[.75rem]" href="/user/subscription-mining.html?id=${s._id}">View Details</a><button data-stopmine="${s._id}" class="flex-1 py-2 rounded-lg bg-[rgba(255,69,96,.1)] text-red2 text-[.75rem]">Stop Rig</button></div></div>`).join('')
    }
    </div></div>`:''}`;
    root.querySelectorAll('[data-mine]').forEach(b=>b.onclick=()=>mineForm(d.plans.find(p=>String(p._id)===b.dataset.mine)));
    root.querySelectorAll('[data-stopmine]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Do you want to close this rig?'))return;
      try{
        const x=await post('/mining/stop/'+b.dataset.stopmine,{
        });
        toast(x.message,true);
        await mining()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    function mineForm(p){
    const a=prompt(`Enter amount for ${p.name} (${money(p.min_investment)} minimum):`);
    if(a===null)return;
    post('/mining/start',{
      mining_plan_id:p._id,amount:Number(a)
    }).then(x=>{
      toast(x.message,true);
      notify('Mining Subscription Started',x.message);
      mining()
    }).catch(e=>toast(e.message,false))
  }
    async function miningSubscription(){
    const root=inner(),id=new URLSearchParams(location.search).get('id'),d=await get('/mining/subscription/'+id),s=d.subscription,p=s.mining_plan_id,progress=Math.min(100,Math.max(0,(Date.now()-new Date(s.started_at))/((new Date(s.expires_at)-new Date(s.started_at))||1)*100));
    root.innerHTML=shell(p?.name||'Mining Subscription')+`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="grid grid-cols-2 gap-3">${[['Invested',money(s.invested_amount)],['Earned',money(s.accumulated_profit)],['Daily ROI',s.daily_roi_snapshot+'%'],['Days Left',daysLeft(s.expires_at)]].map(x=>`<div class="bg-[#161616] rounded-lg p-3"><div class="text-[#555] text-[.68rem]">${
      x[0]
    }
    </div><div class="text-white font-bold mt-1">${
      x[1]
    }
    </div></div>`).join('')}</div><div class="mt-4 text-[.72rem] text-[#555]">Mining Progress ${progress.toFixed(0)}%</div><div class="h-[5px] bg-[#1a1a1a] rounded-full mt-1"><div style="width:${progress}%;height:100%;background:#4a6cf7"></div></div></div>`
  }
    async function dashboard(){
    const d=await get('/assets?asset_class=all'),root=document.getElementById('topAssetsContainer');
    if(!root)return;
    const render=xs=>root.innerHTML=xs.length?xs.slice(0,12).map(a=>`<div class="asset-row flex items-center gap-[14px] py-[14px] px-[18px] border-b border-[#0d0d0d] cursor-pointer" onclick="location.href='/user/trade.html'"><div class="w-[44px] h-[44px] rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">${a.logo_url?`<img src="${esc(a.logo_url)}" class="w-full h-full object-cover">`:esc(String(a.symbol||'?').slice(0,1))}</div><div class="flex-1"><div class="text-white font-medium">${esc(a.name)}</div><div class="text-[#555] text-[.72rem]">${esc(a.symbol)}</div></div><div class="text-right"><div class="text-white">${money(a.price,'$')}</div><div class="${Number(a.price_change_pct_24h||a.change_24h)>=0?'text-grn':'text-red2'} text-[.7rem]">${Number(a.price_change_pct_24h||a.change_24h)>=0?'+':''}${Number(a.price_change_pct_24h||a.change_24h).toFixed(2)}%</div></div></div>`).join(''):'<div class="text-center py-10 text-[#555]">No active assets are available.</div>';
    render(d.assets||[]);
    document.querySelectorAll('[data-asset-class],.asset-filter-pill').forEach(b=>b.onclick=async()=>{
      const c=b.dataset.assetClass||b.dataset.class||'all';
      try{
        const x=await get('/assets?asset_class='+encodeURIComponent(c));
        render(x.assets||[])
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    /* ---------------- ADMIN PAGE RENDERING ---------------- */
    function adminMain(){
    const main=document.querySelector('main');
    if(!main)return null;
    return main.querySelector(':scope > div.p-4')||main.querySelector(':scope > div[class*="p-4"]')||main
  }
    const adminShell=(title,sub)=>`<div class="flex items-center justify-between"><div><h1 class="text-xl font-semibold text-content">${esc(title)}</h1><p class="text-sm text-content-muted mt-1">${esc(sub||'')}</p></div></div>`;
    function statCards(items){
    return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">${items.map(x=>`<div class="bg-surface-card rounded-xl border border-border shadow-card p-4"><div class="text-xs text-content-muted uppercase tracking-wide">${
      esc(x[0])
    }
    </div><div class="text-2xl font-bold text-content mt-1">${
      esc(x[1])
    }
    </div></div>`).join('')}</div>`
  }
    async function adminPlans(){
    const m=adminMain();
    showDynamicMain();
    if(!m)return;
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Investment Plans</h1><p class="text-sm text-content-muted mt-1">Manage system investment plans</p></div><a href="/admin/new-plan.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium shadow-sm">+ New plan</a></div><div id="adminPlansGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"><div class="col-span-full text-center py-12 text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading plans...</div></div>`;
    const d=await get('/plans');
    const plans=d.plans||[];
    const grid=m.querySelector('#adminPlansGrid');
    if(!plans.length){
      grid.innerHTML='<div class="col-span-full text-center py-12 text-content-muted">No investment plans yet. Create one to get started.</div>';
      return;
    }
    grid.innerHTML=plans.map(p=>{
      const min=Number(p.min_price??p.min??0);
      const max=Number(p.max_price??p.max??0);
      const minr=Number(p.min_return??p.minr??0);
      const maxr=Number(p.max_return??p.maxr??p.return??p.increment_amount??0);
      const gift=Number(p.gift??p.gift_bonus??0);
      const tag=String(p.tag||p.type||'');
      const price=Number(p.price??min);
      return `<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
        <div class="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">${esc(p.name)} ${tag?`<span class="ml-1 inline-flex text-[.65rem] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">${esc(tag)}</span>`:''}</h3>
            <div class="text-2xl font-bold text-blue-600 mt-2">${money(price)}</div>
          </div>
        </div>
        <div class="space-y-2 text-sm text-slate-600 flex-1">
          <div class="flex justify-between"><span>Min Deposit</span><span class="font-medium text-slate-900">${money(min)}</span></div>
          <div class="flex justify-between"><span>Max Deposit</span><span class="font-medium text-slate-900">${max?money(max):'Unlimited'}</span></div>
          <div class="flex justify-between"><span>Min Return</span><span class="font-medium text-slate-900">${minr}%</span></div>
          <div class="flex justify-between"><span>Max Return</span><span class="font-medium text-slate-900">${maxr}%</span></div>
          <div class="flex justify-between"><span>Gift Bonus</span><span class="font-medium text-slate-900">${money(gift)}</span></div>
          <div class="flex justify-between"><span>Duration</span><span class="font-medium text-slate-900">${esc(p.expiration||`${p.duration||30} Days`)}</span></div>
        </div>
        <div class="flex gap-2 mt-5">
          <a href="/admin/edit-plan.html?id=${p._id}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm"><i class="fa-solid fa-pen text-[.7rem]"></i> Edit</a>
          <button type="button" data-del-plan="${p._id}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm"><i class="fa-solid fa-trash text-[.7rem]"></i> Delete</button>
        </div>
      </div>`;
    }).join('');
    grid.querySelectorAll('[data-del-plan]').forEach(btn=>{
      btn.onclick=async()=>{
        if(!confirm('Delete this investment plan?'))return;
        try{
          const x=await del('/plans/'+btn.dataset.delPlan);
          toast(x.message||'Investment Plan deleted Successfully!',true);
          adminPlans();
        }catch(e){toast(e.message,false);}
      };
    });
  }
    async function adminPlanForm(isEdit){
    const m=adminMain();
    showDynamicMain();
    if(!m)return;
    // Keep original template form markup if present; only wire submit + fill edit values.
    const form=document.querySelector('form[action*="addplan"], form[action*="editplan"], form#planForm, main form.role-form, main form[method="post"]');
    // Prefer the main content form (not logout)
    let planForm=null;
    document.querySelectorAll('form').forEach(f=>{
      if(f.dataset.authLogout)return;
      if(f.querySelector('[name="name"]')||f.querySelector('#name')) planForm=f;
    });
    if(!planForm){
      // fallback: build template-matching form
      m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${isEdit?'Edit Investment Plan':'Add Investment Plan'}</h1></div><a href="/admin/plans.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back</a></div>
      <form id="planForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <label class="block text-sm"><span class="font-medium text-slate-700">Plan Name *</span><input name="name" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Enter Plan name"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Plan Price ($) *</span><input name="price" type="number" step="0.01" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Enter Plan price"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Plan Minimum Price ($) *</span><input name="min_price" type="number" step="0.01" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Enter Plan minimum price"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Plan Maximum Price ($) *</span><input name="max_price" type="number" step="0.01" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Enter Plan maximum price"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Minimum Return (%) *</span><input name="minr" type="number" step="0.01" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Enter minimum return"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Maximum Return (%) *</span><input name="maxr" type="number" step="0.01" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Enter maximum return"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Gift Bonus ($)</span><input name="gift" type="number" step="0.01" value="0" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Plan Tag</span><input name="tag" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Popular, VIP, etc"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Top up Interval</span><select name="t_interval" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option>Monthly</option><option>Weekly</option><option>Daily</option><option>Hourly</option><option>Every 10 Minutes</option></select></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Top up Type</span><select name="t_type" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option>Percentage</option><option>Fixed</option></select></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Top up Amount (in % or $) *</span><input name="t_amount" type="number" step="0.01" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="top up amount"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Investment Duration *</span><input name="expiration" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="eg 1 Days, 2 Weeks, 1 Months"></label>
        <div class="md:col-span-2"><button type="submit" class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium">${isEdit?'Update Plan':'Add Plan'}</button></div>
      </form>`;
      planForm=m.querySelector('#planForm');
    } else {
      // reveal main content
      showDynamicMain();
    }

    let planId=new URLSearchParams(location.search).get('id');
    if(isEdit && planId){
      try{
        const d=await get('/plans/'+encodeURIComponent(planId));
        const p=d.plan||{};
        const set=(n,v)=>{const el=planForm.querySelector(`[name="${n}"]`); if(el) el.value=v??'';};
        set('name',p.name); set('price',p.price??p.min_price??p.min);
        set('min_price',p.min_price??p.min); set('max_price',p.max_price??p.max);
        set('minr',p.minr??p.min_return); set('maxr',p.maxr??p.max_return??p.return??p.increment_amount);
        set('gift',p.gift??p.gift_bonus??0); set('tag',p.tag||'');
        set('t_interval',p.increment_interval||p.t_interval||'Daily');
        set('t_type',p.increment_type||p.t_type||'Percentage');
        set('t_amount',p.increment_amount??p.t_amount??p.return??p.maxr);
        set('expiration',p.expiration||`${p.duration||30} Days`);
      }catch(e){toast(e.message,false);}
    }

    planForm.addEventListener('submit', async e=>{
      e.preventDefault();
      const fd=new FormData(planForm);
      const body=Object.fromEntries(fd.entries());
      // map return from t_amount if needed
      body.return=body.t_amount;
      body.increment_amount=body.t_amount;
      try{
        let x;
        if(isEdit && planId){
          x=await put('/plans/'+encodeURIComponent(planId), body);
          toast(x.message||'Plan Successfully Updated',true);
        } else {
          x=await post('/plans', body);
          toast(x.message||'Plan created successfully',true);
        }
        setTimeout(()=>{ location.href='/admin/plans.html'; }, 600);
      }catch(err){
        toast(err.response?.data?.message||err.message||'Save failed',false);
      }
    });
  }
    async function adminCards(){
    const m=adminMain();
    showDynamicMain();
    if(!m)return;
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Digital Cards</h1><p class="text-sm text-content-muted mt-1">Manage digital card types and user applications</p></div><a href="/admin/cards-create.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">+ New Card Type</a></div><div class="text-center py-10 text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>`;
    const d=await get('/cards');
    const types=d.types||[];
    const cards=d.cards||[];
    const stats=d.stats||{pending:0,active:0,frozen:0,types:types.length};
    const apps=cards.filter(c=>c.status==='pending');
    const active=cards.filter(c=>c.status==='active');
    const frozen=cards.filter(c=>c.status==='frozen');
    const rejected=cards.filter(c=>c.status==='rejected'||c.status==='cancelled');
    function rowsFor(list){
      if(!list.length)return '<tr><td colspan="6" class="py-8 text-center text-content-muted">No records</td></tr>';
      return list.map(c=>`<tr class="border-t border-border"><td class="py-3">${esc(c.user_id?.name||'—')}</td><td>${esc(c.card_type_id?.name||'—')}</td><td>${esc(c.card_holder||'—')}</td><td><span class="text-xs px-2 py-0.5 rounded-full bg-surface-alt">${esc(c.status)}</span></td><td class="text-content-muted text-xs">${dt(c.createdAt)}</td><td><a href="/admin/cards-view.html?id=${c._id}" class="text-primary text-sm">View</a></td></tr>`).join('');
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Digital Cards</h1><p class="text-sm text-content-muted mt-1">Manage digital card types and user applications</p></div><a href="/admin/cards-create.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">+ New Card Type</a></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${[['PENDING',stats.pending,'fa-clock'],['ACTIVE CARDS',stats.active,'fa-credit-card'],['FROZEN',stats.frozen,'fa-snowflake'],['CARD TYPES',stats.types,'fa-layer-group']].map(([l,v,ico])=>`<div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div class="flex justify-between items-start"><div class="text-xs text-slate-500 uppercase tracking-wide">${l}</div><i class="fa-solid ${ico} text-slate-300"></i></div><div class="text-2xl font-bold text-slate-900 mt-2">${v}</div></div>`).join('')}
    </div>
    <div class="flex gap-4 border-b border-border mb-4 text-sm overflow-x-auto" id="cardTabs">
      <button type="button" data-tab="types" class="pb-2 border-b-2 border-primary text-primary font-medium">Card Types</button>
      <button type="button" data-tab="apps" class="pb-2 border-b-2 border-transparent text-content-muted">Applications ${apps.length?`<span class="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full">${apps.length}</span>`:''}</button>
      <button type="button" data-tab="active" class="pb-2 border-b-2 border-transparent text-content-muted">Active</button>
      <button type="button" data-tab="frozen" class="pb-2 border-b-2 border-transparent text-content-muted">Frozen</button>
      <button type="button" data-tab="rejected" class="pb-2 border-b-2 border-transparent text-content-muted">Rejected</button>
    </div>
    <div id="tab-types" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-4 py-3">#</th><th>Name</th><th>Type</th><th>Network</th><th>Fee</th><th>Cards</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${types.map((t,i)=>{
        const count=cards.filter(c=>String(c.card_type_id?._id||c.card_type_id)===String(t._id)).length;
        const active=t.is_active!==false;
        return `<tr class="border-t border-slate-100"><td class="px-4 py-3">${i+1}</td><td class="font-medium">${esc(t.name)}</td><td>${esc(t.type||'')}</td><td>${esc(t.network||'')}</td><td>${money(t.fee??t.issuance_fee??0)}</td><td>${count}</td><td><span class="text-xs ${active?'text-emerald-600':'text-slate-400'}">${active?'Active':'Inactive'}</span></td><td class="space-x-2"><a href="/admin/cards-edit.html?id=${t._id}" class="text-xs px-2 py-1 rounded border border-slate-200">Edit</a><button type="button" data-toggle-type="${t._id}" data-active="${active?1:0}" class="text-xs px-2 py-1 rounded border border-slate-200">${active?'Disable':'Enable'}</button></td></tr>`;
      }).join('')||'<tr><td colspan="8" class="py-8 text-center text-content-muted">No card types</td></tr>'}</tbody></table>
    </div>
    ${[['apps',apps],['active',active],['frozen',frozen],['rejected',rejected]].map(([id,list])=>`<div id="tab-${id}" class="hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-4 py-3">Client</th><th>Card</th><th>Holder</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${rowsFor(list)}</tbody></table></div>`).join('')}`;
    m.querySelectorAll('#cardTabs [data-tab]').forEach(btn=>{
      btn.onclick=()=>{
        m.querySelectorAll('#cardTabs [data-tab]').forEach(b=>{b.classList.remove('border-primary','text-primary','font-medium');b.classList.add('border-transparent','text-content-muted');});
        btn.classList.add('border-primary','text-primary','font-medium');
        btn.classList.remove('border-transparent','text-content-muted');
        ['types','apps','active','frozen','rejected'].forEach(id=>{
          const el=m.querySelector('#tab-'+id);
          if(el) el.classList.toggle('hidden', id!==btn.dataset.tab);
        });
      };
    });
    m.querySelectorAll('[data-toggle-type]').forEach(btn=>{
      btn.onclick=async()=>{
        try{
          const x=await put('/card-types/'+btn.dataset.toggleType,{is_active:btn.dataset.active!=='1'});
          toast(x.message||(btn.dataset.active==='1'?'Card type disabled.':'Card type enabled.'),true);
          adminCards();
        }catch(e){toast(e.message,false);}
      };
    });
  }
    async function adminCardForm(edit){
    const m=adminMain();
    showDynamicMain();
    if(!m)return;
    const id=edit?new URLSearchParams(location.search).get('id'):null;
    let t={};
    if(edit&&id){
      try{t=(await get('/card-types/'+id)).type||{};}catch(e){toast(e.message,false);}
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${edit?'Edit Card Type':'Create Card Type'}</h1><p class="text-sm text-content-muted mt-1">Configure card type details</p></div><a href="/admin/admin-cards.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back to Types</a></div>
    <form id="cardTypeForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-4">
      <label class="block text-sm"><span class="font-medium text-slate-700">Name *</span><input name="name" required value="${esc(t.name||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="e.g. Standard Virtual Card"></label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium text-slate-700">Card Type *</span><select name="type" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option ${t.type==='Virtual'?'selected':''}>Virtual</option><option ${t.type==='Physical'||!t.type?'selected':''}>Physical</option></select></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Network *</span><select name="network" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option ${t.network==='Visa'||!t.network?'selected':''}>Visa</option><option ${t.network==='Mastercard'?'selected':''}>Mastercard</option></select></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Issuance Fee ($) *</span><input name="fee" type="number" step="0.01" value="${t.fee??t.issuance_fee??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium text-slate-700">Delivery Days (physical only)</span><input name="delivery_days" type="number" value="${t.delivery_days||''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="e.g. 7"></label>
      </div>
      <label class="block text-sm"><span class="font-medium text-slate-700">Description</span><textarea name="description" rows="3" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${esc(t.description||'')}</textarea></label>
      <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1" ${t.is_active!==false?'checked':''}> Active (visible to users)</label>
      <div class="flex gap-3 pt-2"><button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium">${edit?'Save Changes':'Create Card Type'}</button><a href="/admin/admin-cards.html" class="px-5 py-2.5 rounded-lg border border-border text-sm">Cancel</a></div>
    </form>`;
    m.querySelector('#cardTypeForm').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const body=Object.fromEntries(fd.entries());
      body.is_active=fd.get('is_active')==='1';
      try{
        if(edit&&id){const x=await put('/card-types/'+id,body);toast(x.message||'Card type updated successfully.',true);}
        else{const x=await post('/card-types',body);toast(x.message||'Card type created successfully.',true);}
        setTimeout(()=>location.href='/admin/admin-cards.html',600);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }
    async function adminCardView(){
    const m=adminMain();
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Card id required',false);return;}
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/cards/'+id);
    const c=d.card||{};
    const name=c.card_type_id?.name||'Card';
    const status=c.status||'pending';
    let actions='';
    if(status==='pending'){
      actions=`<button data-act="approve" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Approve & Issue Card</button>
        <button data-act="reject" class="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm">Reject Application</button>`;
    } else if(status==='active'){
      actions=`<button data-act="freeze" class="px-4 py-2 rounded-lg border border-border text-sm">Freeze Card</button>
        <button data-act="cancel" class="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm">Cancel Card</button>`;
    } else if(status==='frozen'){
      actions=`<button data-act="unfreeze" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Unfreeze Card</button>
        <button data-act="cancel" class="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm">Cancel Card</button>`;
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${esc(name)}</h1><p class="text-sm text-content-muted mt-1">Card details and actions</p></div><a href="/admin/admin-cards.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back</a></div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        ${[['User',c.user_id?.name],['Email',c.user_id?.email],['Holder',c.card_holder],['Status',status],['Number',c.masked_number||c.card_number||'—'],['Expiry',c.expiry_display||((c.expiry_month&&c.expiry_year)?`${c.expiry_month}/${c.expiry_year}`:'—')],['CVV',c.cvv||'—'],['Balance',money(c.balance||0)],['Issued',dt(c.issued_at)],['Expires',dt(c.expires_at)]].map(([k,v])=>`<div><div class="text-content-muted text-xs uppercase mb-1">${k}</div><div class="text-content font-medium">${esc(v??'—')}</div></div>`).join('')}
      </div>
      <div class="flex flex-wrap gap-2 mt-6">
        <a href="/admin/cards-edit-user.html?id=${c._id}" class="px-4 py-2 rounded-lg border border-border text-sm">Edit Card Details</a>
        ${actions}
      </div>
    </div>`;
    m.querySelectorAll('[data-act]').forEach(btn=>{
      btn.onclick=async()=>{
        const act=btn.dataset.act;
        if(act==='cancel' && !confirm('Cancel this card? This cannot be undone.'))return;
        try{
          const x=await post('/cards/'+id+'/'+act,{});
          toast(x.message||'Done',true);
          adminCardView();
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    });
  }
    async function adminCardEditUser(){
    const m=adminMain();
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Card id required',false);return;}
    m.innerHTML='<div class="p-8 text-center text-content-muted">Loading...</div>';
    const d=await get('/cards/'+id);
    const c=d.card||{};
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Edit Card</h1></div><a href="/admin/cards-view.html?id=${id}" class="px-4 py-2 rounded-lg border border-border text-sm">Cancel</a></div>
    <form id="editUserCardForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-xl space-y-4">
      <label class="block text-sm"><span class="font-medium">Card Holder</span><input name="card_holder" value="${esc(c.card_holder||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      <label class="block text-sm"><span class="font-medium">Card Number</span><input name="card_number" value="${esc(c.card_number||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono"></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block text-sm"><span class="font-medium">Expiry Month</span><input name="expiry_month" value="${c.expiry_month||''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Expiry Year</span><input name="expiry_year" value="${c.expiry_year||''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      </div>
      <label class="block text-sm"><span class="font-medium">CVV</span><input name="cvv" value="${esc(c.cvv||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      <label class="block text-sm"><span class="font-medium">Balance ($)</span><input name="balance" type="number" step="0.01" value="${c.balance||0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      <label class="block text-sm"><span class="font-medium">Status</span><select name="status" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${['pending','active','frozen','cancelled','rejected'].map(s=>`<option value="${s}" ${c.status===s?'selected':''}>${s}</option>`).join('')}</select></label>
      <button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm">Save Changes</button>
    </form>`;
    m.querySelector('#editUserCardForm').onsubmit=async e=>{
      e.preventDefault();
      const body=Object.fromEntries(new FormData(e.currentTarget).entries());
      try{
        const x=await put('/cards/'+id,body);
        toast(x.message||'Card updated successfully.',true);
        setTimeout(()=>location.href='/admin/cards-view.html?id='+id,600);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }
    async function adminExperts(){
        const m=adminMain(),d=await get('/experts');
        const stats=[['Total Experts',d.experts.length],['Active Experts',d.experts.filter(x=>x.is_active).length],['Inactive Experts',d.experts.filter(x=>!x.is_active).length],['Total Followers',d.experts.reduce((s,x)=>s+Number(x.followers_count||0),0)]];
        m.innerHTML=adminShell('Manage Expert Traders','Create and manage copy trading experts')+statCards(stats)+`<div class="flex justify-end"><a href="/admin/admin-experts-create.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Add New Expert</a></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">${d.experts.map(e=>`<div class="bg-surface-card rounded-xl border border-border p-5"><div class="flex items-center gap-3"><img src="${esc(e.profile_picture||'/temp/wallet/other.png')}" class="w-10 h-10 rounded-full object-cover"><div><div class="font-medium text-content">${
      esc(e.name)
    }
    </div><div class="text-xs text-content-muted">${
      esc(e.area_of_expertise)
    }
    </div></div></div><div class="grid grid-cols-3 gap-2 mt-4 text-center text-sm"><div><div class="text-success">${
      e.daily_roi
    }
    %</div><div class="text-content-muted text-xs">ROI</div></div><div><div class="text-content">${
      e.win_rate
    }
    %</div><div class="text-content-muted text-xs">Win</div></div><div><div class="text-content">${
      e.duration_days
    }
    </div><div class="text-content-muted text-xs">Days</div></div></div><div class="flex gap-2 mt-4"><a href="/admin/admin-experts-view.html?id=${e._id}" class="text-primary text-sm px-2 py-2">View</a><a href="/admin/admin-experts-edit.html?id=${e._id}" class="flex-1 text-center text-sm px-3 py-2 rounded-lg border border-border">Edit</a><button data-expert-toggle="${e._id}" class="px-3 py-2 rounded-lg ${e.is_active?'text-danger':'text-success'}">${
      e.is_active?'Disable':'Enable'
    }
    </button></div></div>`).join('')}</div>`;
        m.querySelectorAll('[data-expert-toggle]').forEach(btn=>btn.onclick=async()=>{
      try{
        const x=await post('/experts/'+btn.dataset.expertToggle+'/toggle',{
        });
        toast(x.message,true);
        await adminExperts()
      }
      catch(e){
        toast(e.message,false)
      }
    });

  }
    async function adminExpertForm(edit){
    const m=adminMain(),id=edit?new URLSearchParams(location.search).get('id'):null;
    let e={
    };
    if(edit)e=(await get('/experts/'+id)).expert;
    m.innerHTML=adminShell(edit?'Edit Expert':'Create New Expert','Expert trader profile')+`<form id="expertForm" class="bg-surface-card rounded-xl border border-border p-6 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${[['name','Name','text',e.name||''],['area_of_expertise','Area of Expertise','text',e.area_of_expertise||''],['profile_picture','Profile Picture','text',e.profile_picture||''],['daily_roi','Daily ROI','number',e.daily_roi||0],['duration_days','Duration Days','number',e.duration_days||30],['win_rate','Win Rate','number',e.win_rate||0],['min_startup_capital','Min Startup Capital','number',e.min_startup_capital||0],['max_capital','Max Capital','number',e.max_capital||0],['profit_share_percentage','Profit Share %','number',e.profit_share_percentage||0],['followers_count','Followers','number',e.followers_count||0],['total_roi','Total ROI','number',e.total_roi||0]].map(x=>`<label class="text-sm text-content-secondary">${
      x[1]
    }
    <input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content"></label>`).join('')}</div><label class="text-sm text-content-secondary">Bio<textarea name="bio" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content">${esc(e.bio||'')}</textarea></label><label class="flex gap-2 text-sm text-content"><input name="is_active" type="checkbox" ${e.is_active!==false?'checked':''}> Active</label><button class="px-4 py-2 rounded-lg bg-primary text-white">${edit?'Update Expert':'Create Expert'}</button></form>`;
    m.querySelector('#expertForm').onsubmit=async ev=>{
      ev.preventDefault();
      const b=Object.fromEntries(new FormData(ev.currentTarget));
      b.is_active=ev.currentTarget.is_active.checked;
      try{
        const x=edit?await put('/experts/'+id,b):await post('/experts',b);
        toast(x.message,true);
        location.href='/admin/admin-experts.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminBots(){
        const m=adminMain(),d=await get('/bots');
        const stats=[['Total Bots',d.stats.totalBots],['Active Bots',d.stats.activeBots],['Active Subscribers',d.stats.activeSubscribers],['Total Invested',money(d.stats.totalInvested)]];
        m.innerHTML=adminShell('Manage Trading Bots','Create and manage AI trading bots')+statCards(stats)+`<div class="flex justify-end gap-2"><a href="/admin/bot-trading-subscriptions.html" class="px-4 py-2 rounded-lg border border-border text-content text-sm">Subscriptions</a><a href="/admin/admin-bot-trading-create.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Create Bot</a></div><div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">Bot</th><th>Strategy</th><th>Win Rate</th><th>Daily ROI</th><th>Range</th><th>Interval</th><th>Status</th><th>Actions</th></tr></thead><tbody>${d.bots.map(b=>`<tr class="border-t border-border"><td class="py-3 text-content">${
      esc(b.name)
    }
    </td><td>${
      esc(b.strategy_type)
    }
    </td><td>${
      b.win_rate
    }
    %</td><td>${
      b.expected_roi||b.daily_roi||0
    }
    %</td><td>${
      money(b.min_investment)
    }
     - ${
      money(b.max_investment)
    }
    </td><td>${
      b.trade_interval_minutes
    }
    m</td><td>${
      b.is_active?'Active':'Inactive'
    }
    </td><td class="flex gap-2 py-3"><a class="text-primary" href="/admin/bot-trading-edit.html?id=${b._id}">Edit</a><button data-bot-toggle="${b._id}" class="text-warning">Toggle</button><button data-bot-del="${b._id}" class="text-danger">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
        m.querySelectorAll('[data-bot-toggle]').forEach(btn=>btn.onclick=async()=>{
      try{
        const x=await post('/bots/'+btn.dataset.botToggle+'/toggle',{
        });
        toast(x.message,true);
        adminBots()
      }
      catch(e){
        toast(e.message,false)
      }
    });
        m.querySelectorAll('[data-bot-del]').forEach(btn=>btn.onclick=async()=>{
      if(!confirm('Delete this bot?'))return;
      try{
        const x=await del('/bots/'+btn.dataset.botDel);
        toast(x.message,true);
        adminBots()
      }
      catch(e){
        toast(e.message,false)
      }
    });

  }
    async function adminBotForm(edit){
    const m=adminMain(),id=edit?new URLSearchParams(location.search).get('id'):null;
    let b={
    };
    if(edit)b=(await get('/bots/'+id)).bot;
    m.innerHTML=adminShell(edit?'Edit Trading Bot':'Create Trading Bot','Configure a trading bot')+`<form id="botForm" class="bg-surface-card rounded-xl border border-border p-6 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${[['name','Bot Name','text',b.name||''],['strategy_type','Strategy Type','text',b.strategy_type||'Scalping'],['win_rate','Win Rate','number',b.win_rate||0],['expected_roi','Expected ROI','number',b.expected_roi||0],['trade_interval_minutes','Trade Interval Minutes','number',b.trade_interval_minutes||60],['min_investment','Min Investment','number',b.min_investment||0],['max_investment','Max Investment','number',b.max_investment||0],['max_duration_days','Max Duration Days','number',b.max_duration_days||30],['profit_min_pct','Profit Min %','number',b.profit_min_pct||0],['profit_max_pct','Profit Max %','number',b.profit_max_pct||0],['loss_min_pct','Loss Min %','number',b.loss_min_pct||0],['loss_max_pct','Loss Max %','number',b.loss_max_pct||0]].map(x=>`<label class="text-sm text-content-secondary">${
      x[1]
    }
    <input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content"></label>`).join('')}</div><label class="text-sm text-content-secondary">Description<textarea name="description" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content">${esc(b.description||'')}</textarea></label><label class="flex gap-2 text-sm text-content"><input name="is_active" type="checkbox" ${b.is_active!==false?'checked':''}> Active</label><button class="px-4 py-2 rounded-lg bg-primary text-white">${edit?'Update Bot':'Create Bot'}</button></form>`;
    m.querySelector('#botForm').onsubmit=async e=>{
      e.preventDefault();
      const x=Object.fromEntries(new FormData(e.currentTarget));
      x.is_active=e.currentTarget.is_active.checked;
      try{
        const r=edit?await put('/bots/'+id,x):await post('/bots',x);
        toast(r.message,true);
        location.href='/admin/admin-bot-trading.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminBotSubs(){
    const m=adminMain(),d=await get('/bot-subscriptions');
    const s=d.subscriptions;
    m.innerHTML=adminShell('Bot Trading Subscriptions','Manage user subscriptions to trading bots')+statCards([['Active Subscriptions',s.filter(x=>x.status==='active').length],['Total Invested',money(s.reduce((a,x)=>a+Number(x.invested_amount||0),0))],['Total Profit',money(s.reduce((a,x)=>a+Number(x.current_profit||0),0))],['Settled',s.filter(x=>x.status==='settled').length]])+`<div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">User</th><th>Bot</th><th>Invested</th><th>Profit</th><th>Status</th><th></th></tr></thead><tbody>${s.map(x=>`<tr class="border-t border-border"><td class="py-3">${
      esc(x.user_id?.name)
    }
    </td><td>${
      esc(x.bot_id?.name)
    }
    </td><td>${
      money(x.invested_amount)
    }
    </td><td>${
      money(x.current_profit)
    }
    </td><td>${
      esc(x.status)
    }
    </td><td><a class="text-primary" href="/admin/bot-trading-subscriptions-view.html?id=${x._id}">View</a></td></tr>`).join('')}</tbody></table></div>`
  }
    async function adminBotSubView(){
    const m=adminMain(),id=new URLSearchParams(location.search).get('id'),d=await get('/bot-subscriptions/'+id),s=d.subscription;
    m.innerHTML=adminShell(`Bot Subscription #${id}`,'View subscription details and manage profit')+`<div class="bg-surface-card rounded-xl border border-border p-6"><div class="grid grid-cols-2 gap-4 text-sm">${[['User',s.user_id?.name],['Bot',s.bot_id?.name],['Invested',money(s.invested_amount)],['Profit',money(s.current_profit)],['Adjustment',money(s.admin_profit_adjustment)],['Status',s.status],['Started',dt(s.started_at)],['Expires',dt(s.expires_at)]].map(x=>`<div><div class="text-content-muted">${
      x[0]
    }
    </div><div class="text-content font-medium mt-1">${
      esc(x[1])
    }
    </div></div>`).join('')}</div><form id="botAdjust" class="mt-6 space-y-3"><input name="admin_profit_adjustment" type="number" value="${s.admin_profit_adjustment||0}" class="w-full bg-surface-card border border-border rounded-lg p-2 text-content" placeholder="Profit Adjustment"><textarea name="admin_notes" class="w-full bg-surface-card border border-border rounded-lg p-2 text-content" placeholder="Notes">${esc(s.admin_notes||'')}</textarea><button class="px-4 py-2 rounded-lg border border-border text-content">Save Profit Adjustment</button></form>${s.status!=='settled'?'<button id="settleBot" class="mt-3 px-4 py-2 rounded-lg bg-primary text-white">Settle Now</button>':''}</div>`;
    m.querySelector('#botAdjust').onsubmit=async e=>{
      e.preventDefault();
      try{
        const x=await put('/bot-subscriptions/'+id+'/adjust',Object.fromEntries(new FormData(e.currentTarget)));
        toast(x.message,true);
        adminBotSubView()
      }
      catch(err){
        toast(err.message,false)
      }
    };
    m.querySelector('#settleBot')?.addEventListener('click',async()=>{
      if(!confirm('Confirm settlement?'))return;
      try{
        const x=await post('/bot-subscriptions/'+id+'/settle',{
        });
        toast(x.message,true);
        adminBotSubView()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminAssets(){
    const m=adminMain(),d=await get('/assets');
    const a=d.assets||[];
    m.innerHTML=adminShell('Manage Trading Assets','Manage database-backed market assets')+`<div class="flex flex-wrap justify-end gap-2"><button id="refreshAllAssets" class="px-4 py-2 rounded-lg border border-border text-content text-sm">Refresh Live Prices</button><a href="/admin/create-assets.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Add Custom Asset</a></div>${statCards([['Crypto',a.filter(x=>x.asset_class==='crypto').length],['Forex',a.filter(x=>x.asset_class==='forex').length],['Stock',a.filter(x=>['stock','stocks'].includes(x.asset_class)).length],['Total',a.length]])}<div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">Name</th><th>Symbol</th><th>Class</th><th>Provider</th><th>Price</th><th>24h</th><th>Updated</th><th>Status</th><th>Actions</th></tr></thead><tbody>${a.map(x=>`<tr class="border-t border-border"><td class="py-3 text-content">${esc(x.name)}</td><td>${esc(x.symbol)}</td><td>${esc(x.asset_class)}</td><td>${esc(x.data_source||'manual')}</td><td>${money(x.price,'$')}</td><td>${Number(x.price_change_pct_24h??x.change_24h??0).toFixed(2)}%</td><td>${dt(x.updatedAt)}</td><td>${x.is_active?'Active':'Inactive'}</td><td class="flex flex-wrap gap-2 py-3"><button data-asset-refresh="${x._id}" class="text-primary">Refresh</button><a class="text-primary" href="/admin/edit-assets.html?id=${x._id}">Edit</a><button data-asset-toggle="${x._id}" class="text-warning">Toggle</button><button data-asset-del="${x._id}" class="text-danger">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
    m.querySelector('#refreshAllAssets').onclick=async()=>{
      const button=m.querySelector('#refreshAllAssets');
      button.disabled=true;
      button.textContent='Refreshing...';
      try{
        const x=await post('/assets/refresh',{});
        toast(x.message||`Updated ${x.updated||0} assets.`,x.success!==false);
        await adminAssets();
      }
      catch(e){
        toast(e.message,false);
        button.disabled=false;
        button.textContent='Refresh Live Prices';
      }
    };
    m.querySelectorAll('[data-asset-refresh]').forEach(b=>b.onclick=async()=>{
      b.disabled=true;
      try{
        const x=await post('/assets/'+b.dataset.assetRefresh+'/refresh',{});
        toast(x.message,true);
        await adminAssets();
      }
      catch(e){
        toast(e.message,false);
        b.disabled=false;
      }
    });
    m.querySelectorAll('[data-asset-toggle]').forEach(b=>b.onclick=async()=>{
      try{
        const x=await post('/assets/'+b.dataset.assetToggle+'/toggle',{});
        toast(x.message,true);
        adminAssets();
      }
      catch(e){
        toast(e.message,false)
      }
    });
    m.querySelectorAll('[data-asset-del]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Delete this asset?'))return;
      try{
        const x=await del('/assets/'+b.dataset.assetDel);
        toast(x.message,true);
        adminAssets();
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminAssetForm(edit){
    const m=adminMain(),id=edit?new URLSearchParams(location.search).get('id'):null;
    let a={};
    if(edit)a=(await get('/assets/'+id)).asset;
    m.innerHTML=adminShell(edit?'Edit Asset':'Create Asset','Asset details, live pricing provider, and status')+`<form id="assetForm" class="bg-surface-card rounded-xl border border-border p-6 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${[['name','Name','text',a.name||''],['symbol','Symbol','text',a.symbol||''],['asset_class','Asset Class','text',a.asset_class||'crypto'],['price','Manual Price ($)','number',a.price||0],['change_24h','24h Change %','number',(a.price_change_pct_24h??a.change_24h)||0],['data_source','Data Source','text',a.data_source||'manual'],['coingecko_id','CoinGecko ID','text',a.coingecko_id||''],['twelvedata_symbol','Twelve Data Symbol','text',a.twelvedata_symbol||''],['external_id','Fallback Source ID','text',a.external_id||''],['logo_url','Logo URL','text',a.logo_url||'']].map(x=>`<label class="text-sm text-content-secondary">${x[1]}<input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content"></label>`).join('')}</div><div class="rounded-lg border border-border p-4 text-sm text-content-secondary"><p><strong class="text-content">Live provider setup:</strong> use <span class="text-content">coingecko</span> with a CoinGecko ID such as <span class="text-content">bitcoin</span> for crypto, or <span class="text-content">twelvedata</span> with a Twelve Data symbol such as <span class="text-content">AAPL</span> or <span class="text-content">EUR/USD</span> for supported instruments.</p><p class="mt-2">If a provider is configured, the backend refresh service will overwrite the stored live price.</p></div><label class="flex gap-2 text-sm text-content"><input name="is_active" type="checkbox" ${a.is_active!==false?'checked':''}> Active</label><button class="px-4 py-2 rounded-lg bg-primary text-white">${edit?'Save Changes':'Create Asset'}</button></form>`;
    m.querySelector('#assetForm').onsubmit=async e=>{
      e.preventDefault();
      const b=Object.fromEntries(new FormData(e.currentTarget));
      b.is_active=e.currentTarget.is_active.checked;
      try{
        const x=edit?await put('/assets/'+id,b):await post('/assets',b);
        toast(x.message,true);
        location.href='/admin/assets.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminMiningPlans(){
    const m=adminMain(),d=await get('/mining-plans');
    m.innerHTML=adminShell('Cloud Mining Plans','Create and manage mining plans')+statCards([['Total Plans',d.stats.totalPlans],['Active Plans',d.stats.activePlans],['Active Subscribers',d.stats.activeSubscribers],['Total Invested',money(d.stats.totalInvested)]])+`<div class="flex justify-end gap-2"><a href="/admin/mining-subscriptions.html" class="px-4 py-2 rounded-lg border border-border text-content text-sm">Subscriptions</a><a href="/admin/mining-plans-create.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">New Plan</a></div><div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">Plan</th><th>Hashrate</th><th>ROI</th><th>Duration</th><th>Range</th><th>Status</th><th>Actions</th></tr></thead><tbody>${d.plans.map(p=>`<tr class="border-t border-border"><td class="py-3 text-content">${
      esc(p.name)
    }
    </td><td>${
      esc(p.hashrate)
    }
    </td><td>${
      p.daily_roi_percentage
    }
    %</td><td>${
      p.duration_days
    }
    d</td><td>${
      money(p.min_investment)
    }
     - ${
      money(p.max_investment)
    }
    </td><td>${
      p.is_active?'Active':'Inactive'
    }
    </td><td><a class="text-primary mr-3" href="/admin/mining-plans-edit.html?id=${p._id}">Edit</a><button data-mine-del="${p._id}" class="text-danger">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
    m.querySelectorAll('[data-mine-del]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Delete this plan?'))return;
      try{
        const x=await del('/mining-plans/'+b.dataset.mineDel);
        toast(x.message,true);
        adminMiningPlans()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminMiningForm(edit){
    const m=adminMain(),id=edit?new URLSearchParams(location.search).get('id'):null;
    let p={
    };
    if(edit)p=(await get('/mining-plans/'+id)).plan;
    m.innerHTML=adminShell(edit?'Edit Mining Plan':'Create Mining Plan','Cloud mining plan configuration')+`<form id="mineForm" class="bg-surface-card rounded-xl border border-border p-6 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${[['name','Plan Name','text',p.name||''],['hashrate','Hashrate','text',p.hashrate||''],['daily_roi_percentage','Daily ROI %','number',p.daily_roi_percentage||0],['duration_days','Duration Days','number',p.duration_days||30],['sort_order','Sort Order','number',p.sort_order||0],['min_investment','Min Investment','number',p.min_investment||0],['max_investment','Max Investment','number',p.max_investment||0],['icon_color','Icon Color','text',p.icon_color||'']].map(x=>`<label class="text-sm text-content-secondary">${
      x[1]
    }
    <input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content"></label>`).join('')}</div><textarea name="description" class="w-full bg-surface-card border border-border rounded-lg p-3 text-content" placeholder="Description">${esc(p.description||'')}</textarea><label class="flex gap-2 text-sm text-content"><input name="is_active" type="checkbox" ${p.is_active!==false?'checked':''}> Active</label><button class="px-4 py-2 rounded-lg bg-primary text-white">${edit?'Update Plan':'Create Plan'}</button></form>`;
    m.querySelector('#mineForm').onsubmit=async e=>{
      e.preventDefault();
      const b=Object.fromEntries(new FormData(e.currentTarget));
      b.is_active=e.currentTarget.is_active.checked;
      try{
        const x=edit?await put('/mining-plans/'+id,b):await post('/mining-plans',b);
        toast(x.message,true);
        location.href='/admin/mining-plans.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminMiningSubs(){
    const m=adminMain(),d=await get('/mining-subscriptions'),s=d.subscriptions;
    m.innerHTML=adminShell('Mining Subscriptions','Manage user cloud mining subscriptions')+statCards([['Active Subscriptions',d.stats.active],['Total Invested',money(d.stats.totalInvested)],['Total Profit',money(d.stats.totalProfit)],['Settled',s.filter(x=>x.status==='settled').length]])+`<div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">User</th><th>Plan</th><th>Invested</th><th>Earned</th><th>Status</th><th>Action</th></tr></thead><tbody>${s.map(x=>`<tr class="border-t border-border"><td class="py-3">${
      esc(x.user_id?.name)
    }
    </td><td>${
      esc(x.mining_plan_id?.name)
    }
    </td><td>${
      money(x.invested_amount)
    }
    </td><td>${
      money(x.accumulated_profit)
    }
    </td><td>${
      esc(x.status)
    }
    </td><td>${
      x.status!=='settled'?`<button data-settle-mine="${x._id}" class="text-primary">Settle</button>`:''
    }
    </td></tr>`).join('')}</tbody></table></div>`;
    m.querySelectorAll('[data-settle-mine]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Confirm settlement?'))return;
      try{
        const x=await post('/mining-subscriptions/'+b.dataset.settleMine+'/settle',{
        });
        toast(x.message,true);
        adminMiningSubs()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminWallets(){
    const m=adminMain(),d=await get('/wallet-connections');
    m.innerHTML=adminShell('Managers Connect Wallets','View and manage user wallet connections')+`<div class="flex justify-end"><a href="/admin/mwalletsettings.html" class="px-4 py-2 rounded-lg border border-border text-content text-sm">Settings</a></div><div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">Client</th><th>Email</th><th>Wallet</th><th>Status</th><th></th></tr></thead><tbody>${d.wallets.map(w=>`<tr class="border-t border-border"><td class="py-3">${
      esc(w.user_id?.name)
    }
    </td><td>${
      esc(w.user_id?.email)
    }
    </td><td>${
      esc(w.walletName)
    }
    </td><td>${
      esc(w.status)
    }
    </td><td><button data-wallet-del="${w._id}" class="text-danger">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
    m.querySelectorAll('[data-wallet-del]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Delete wallet?\nThis action cannot be undone.'))return;
      try{
        const x=await del('/wallet-connections/'+b.dataset.walletDel);
        toast(x.message,true);
        adminWallets()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminWalletSettings(){
    const m=adminMain(),d=await get('/wallet-settings'),s=d.settings;
    m.innerHTML=adminShell('Wallet Connect Settings','Configure wallet connection parameters')+`<form id="walletSettingsForm" class="bg-surface-card rounded-xl border border-border p-6 space-y-4"><label class="text-sm text-content-secondary">Min Balance<input name="min_balance" type="number" value="${s.min_balance||0}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg p-2 text-content"></label><label class="text-sm text-content-secondary">Return (Profit)<input name="min_return" type="number" value="${s.daily_reward||0}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg p-2 text-content"></label><label class="text-sm text-content-secondary">Turn On/Off<select name="wallet_status" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg p-2 text-content"><option value="on" ${s.wallet_status==='on'?'selected':''}>On</option><option value="off" ${s.wallet_status==='off'?'selected':''}>Off</option></select></label><button class="px-4 py-2 rounded-lg bg-primary text-white">Save Settings</button></form>`;
    m.querySelector('#walletSettingsForm').onsubmit=async e=>{
      e.preventDefault();
      try{
        const x=await put('/wallet-settings',Object.fromEntries(new FormData(e.currentTarget)));
        toast(x.message,true)
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminTrades(){
    const m=adminMain(),d=await get('/trades'),t=d.trades;
    m.innerHTML=adminShell('Manage Client Trades','View, create, edit and settle client trades')+`<div class="flex justify-end"><a href="/admin/create-trade.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Create Trade</a></div><div class="flex gap-2 mb-4">${['All','Binary','Spot','Open','Closed','Demo'].map(x=>`<button data-trade-filter="${x}" class="px-3 py-1.5 rounded-full border border-border text-xs text-content-secondary">${
      x
    }
    </button>`).join('')}</div><div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">User</th><th>Type</th><th>Asset</th><th>Action</th><th>Amount</th><th>Leverage</th><th>Entry Price</th><th>Status</th><th>Result</th><th>P/L</th><th>Opened</th><th>Actions</th></tr></thead><tbody id="tradeRows"></tbody></table></div>`;
    const rows=m.querySelector('#tradeRows'),render=xs=>rows.innerHTML=xs.map(x=>`<tr class="border-t border-border"><td class="py-3">${esc(x.user_id?.name)}</td><td>${esc(x.asset_type)}</td><td>${esc(x.asset_name||x.trading_asset_id?.symbol)}</td><td>${esc(x.action)}</td><td>${money(x.amount)}</td><td>${x.leverage}x</td><td>${money(x.entry_price,'$')}</td><td>${esc(x.status)}</td><td>${esc(x.result||'—')}</td><td class="${Number(x.profit_loss)>=0?'text-success':'text-danger'}">${Number(x.profit_loss)>=0?'+':''}${money(x.profit_loss)}</td><td>${dt(x.opened)}</td><td><a class="text-primary mr-2" href="/admin/view-trade.html?id=${x._id}">View</a><a class="text-primary" href="/admin/edit-trade.html?id=${x._id}">Edit</a></td></tr>`).join('');
    render(t);
    m.querySelectorAll('[data-trade-filter]').forEach(b=>b.onclick=()=>{
      const f=b.dataset.tradeFilter;
      render(t.filter(x=>f==='All'||x.asset_type===f||x.status===f.toLowerCase()))
    })
  }
    async function adminTradeForm(edit){
    const m=adminMain(),id=edit?new URLSearchParams(location.search).get('id'):null,d=await get('/trades'+(edit?'/'+id:'')),t=edit?d.trade:{
    };
    const users=edit?[]:d.users||[],assets=edit?[]:d.assets||[];
    m.innerHTML=adminShell(edit?'Edit Trade':'Create Trade','Trade configuration')+`<form id="tradeForm" class="bg-surface-card rounded-xl border border-border p-6 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><label class="text-sm text-content-secondary">User<select name="user_id" class="mt-1.5 w-full border border-border rounded-lg p-2 bg-surface-card text-content">${edit?`<option value="${t.user_id?._id||t.user_id}" selected>${
      esc(t.user_id?.name||'Current User')
    }
    </option>`:users.map(u=>`<option value="${u._id}">${
      esc(u.name)
    }
     (${
      esc(u.email)
    })</option>`).join('')}</select></label><label class="text-sm text-content-secondary">Asset<select name="trading_asset_id" class="mt-1.5 w-full border border-border rounded-lg p-2 bg-surface-card text-content">${edit?`<option value="${t.trading_asset_id?._id||t.trading_asset_id}" selected>${
      esc(t.trading_asset_id?.symbol||t.asset_name)
    }
    </option>`:assets.map(a=>`<option value="${a._id}">${
      esc(a.name)
    }
     (${
      esc(a.symbol)
    })</option>`).join('')}</select></label>${[['asset_type','Type','text',t.asset_type||'Binary'],['asset_name','Asset Name','text',t.asset_name||''],['action','Action','text',t.action||'BUY'],['amount','Amount','number',t.amount||0],['leverage','Leverage','number',t.leverage||1],['duration','Duration','number',t.duration||0],['entry_price','Entry Price','number',t.entry_price||0],['profit_loss','P/L','number',t.profit_loss||0]].map(x=>`<label class="text-sm text-content-secondary">${
      x[1]
    }
    <input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full border border-border rounded-lg p-2 bg-surface-card text-content"></label>`).join('')}</div><label class="text-sm text-content-secondary">Status<select name="status" class="mt-1.5 w-full border border-border rounded-lg p-2 bg-surface-card text-content"><option value="open" ${t.status==='open'?'selected':''}>Open</option><option value="closed" ${t.status==='closed'?'selected':''}>Closed</option></select></label><button class="px-4 py-2 rounded-lg bg-primary text-white">${edit?'Update Trade':'Create Trade'}</button></form>`;
    m.querySelector('#tradeForm').onsubmit=async e=>{
      e.preventDefault();
      try{
        const x=edit?await put('/trades/'+id,Object.fromEntries(new FormData(e.currentTarget))):await post('/trades',Object.fromEntries(new FormData(e.currentTarget)));
        toast(x.message,true);
        location.href='/admin/managetrades.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminTradeView(){
        const m=adminMain(),id=new URLSearchParams(location.search).get('id'),d=await get('/trades/'+id),t=d.trade;
        let action='';
        if(t.status!=='closed') action=`<form id="settleTrade" class="mt-6 space-y-3"><input name="profit_loss" type="number" step="0.01" value="${t.profit_loss||0}" class="w-full border border-border rounded-lg p-2 bg-surface-card text-content"><select name="result" class="w-full border border-border rounded-lg p-2 bg-surface-card text-content"><option value="WIN">WIN</option><option value="LOSS">LOSS</option></select><button class="px-4 py-2 rounded-lg bg-primary text-white">Settle Trade</button></form>`;
        else action=`<div class="mt-6 bg-surface-card border border-border rounded-xl p-5"><h3 class="font-semibold text-content mb-3">Settlement Info</h3><p class="text-content">Result: ${esc(t.result)}</p><p class="text-content mt-2">P/L: ${money(t.profit_loss)}</p><p class="text-content mt-2">Settled By: ${esc(t.settled_by||'Admin')}</p><p class="text-content mt-2">Settled At: ${dt(t.settled_at)}</p></div>`;
        const fields=[['User',t.user_id?.name],['Type',t.asset_type],['Asset',t.asset_name||t.trading_asset_id?.symbol],['Action',t.action],['Amount',money(t.amount)],['Leverage',(t.leverage||1)+'x'],['Entry Price',money(t.entry_price,'$')],['Status',t.status],['Result',t.result||'—'],['P/L',money(t.profit_loss)],['Opened',dt(t.opened)],['Settled At',dt(t.settled_at)]];
        m.innerHTML=adminShell(`Trade #${id}`,'Trade details')+`<div class="bg-surface-card rounded-xl border border-border p-6"><div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">${fields.map(x=>`<div><span class="text-content-muted">${
      x[0]
    }
    </span><div class="text-content font-medium mt-1">${
      esc(x[1])
    }
    </div></div>`).join('')}</div>${action}</div>`;
        m.querySelector('#settleTrade')?.addEventListener('submit',async e=>{
      e.preventDefault();
      try{
        const x=await post('/trades/'+id+'/settle',Object.fromEntries(new FormData(e.currentTarget)));
        toast(x.message,true);
        adminTradeView()
      }
      catch(err){
        toast(err.message,false)
      }
    });

  }
    async function adminInvestmentList(){
    const m=adminMain(),d=await get('/active-investments'),rows=d.investments||[];
    m.innerHTML=adminShell('Active Investments','Monitor currently active investment plans')+`<div class="bg-surface-card rounded-xl border border-border p-5 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">Client name</th><th>Investment Plan</th><th>Amount Invested</th><th>Duration</th><th>ROI</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(i=>`<tr class="border-t border-border"><td class="py-3">${
      esc(i.user?.name||'—')
    }
    </td><td>${
      esc(i.plan?.name||'—')
    }
    </td><td>${
      money(i.amount)
    }
    </td><td>${
      esc(i.inv_duration||'—')
    }
    </td><td>${
      money(i.profit_earned)
    }
    </td><td>${
      esc(i.active)
    }
    </td><td><a class="text-primary" href="/admin/active-investments-view.html?id=${i._id}">View</a></td></tr>`).join('')}</tbody></table></div>`
  }
    async function adminInvestmentView(){
    const m=adminMain(),id=new URLSearchParams(location.search).get('id'),d=await get('/investments/'+id),i=d.investment;
    m.innerHTML=adminShell(`${i.plan?.name||'Investment'} Investment`,'Investment details')+`<div class="bg-surface-card rounded-xl border border-border p-6"><div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">${[['Client',i.user?.name],['Email',i.user?.email],['Plan',i.plan?.name],['Amount',money(i.amount)],['Status',i.active],['Duration',i.inv_duration],['Profit',money(i.profit_earned)],['Created',dt(i.createdAt)],['Expire At',dt(i.expire_date)]].map(x=>`<div><div class="text-content-muted">${
      x[0]
    }
    </div><div class="text-content font-medium mt-1">${
      esc(x[1])
    }
    </div></div>`).join('')}</div>${i.active==='yes'?'<button id="settleInvestment" class="mt-6 px-4 py-2 rounded-lg bg-primary text-white">Settle Investment</button>':''}</div>`;
    m.querySelector('#settleInvestment')?.addEventListener('click',async()=>{
      if(!confirm('Confirm investment settlement?'))return;
      try{
        const x=await post('/investments/'+id+'/settle',{
        });
        toast(x.message,true);
        adminInvestmentView()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminExpertView(){
    const m=adminMain(),id=new URLSearchParams(location.search).get('id'),d=await get('/experts/'+id),e=d.expert,positions=d.positions||[];
    m.innerHTML=adminShell(e.name,'Expert trader profile and active copy positions')+`<div class="bg-surface-card rounded-xl border border-border p-6"><div class="flex items-center gap-4"><img src="${esc(e.profile_picture||'/temp/wallet/other.png')}" class="w-16 h-16 rounded-full object-cover"><div><h2 class="text-lg font-semibold text-content">${esc(e.name)}</h2><p class="text-sm text-content-muted">${esc(e.area_of_expertise)}</p></div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">${[['Daily ROI',e.daily_roi+'%'],['Total ROI',e.total_roi+'%'],['Win Rate',e.win_rate+'%'],['Followers',e.followers_count]].map(x=>`<div class="bg-surface-alt rounded-lg p-3"><div class="text-xs text-content-muted">${
      x[0]
    }
    </div><div class="text-content font-bold mt-1">${
      esc(x[1])
    }
    </div></div>`).join('')}</div></div><div class="bg-surface-card rounded-xl border border-border p-6 mt-4"><h3 class="font-semibold text-content mb-4">Active Copy Positions</h3><div class="space-y-2">${positions.length?positions.map(p=>`<div class="border-b border-border pb-3"><div class="flex justify-between"><span class="text-content">${
      esc(p.user_id?.name)
    }
    </span><span class="text-success">${
      esc(p.status)
    }
    </span></div><div class="text-sm text-content-muted mt-1">Invested ${
      money(p.invested_amount)
    }
     · Profit ${
      money(p.accumulated_profit)
    }
    </div></div>`).join(''):'<div class="text-content-muted">No copy positions.</div>'}</div></div>`
  }
    async function adminCardEditUser(){
    const m=adminMain(),id=new URLSearchParams(location.search).get('id'),d=await get('/cards/'+id),c=d.card;
    m.innerHTML=adminShell('Edit Card Details','Update issued card information')+`<form id="cardEditUser" class="bg-surface-card rounded-xl border border-border p-6 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${[['card_holder','Card Holder','text',c.card_holder||''],['card_number','Card Number','text',c.card_number||''],['expiry_month','Expiry Month','number',c.expiry_month||''],['expiry_year','Expiry Year','number',c.expiry_year||''],['cvv','CVV','text',c.cvv||''],['balance','Balance','number',c.balance||0]].map(x=>`<label class="text-sm text-content-secondary">${
      x[1]
    }
    <input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full border border-border rounded-lg p-2 bg-surface-card text-content"></label>`).join('')}</div><button class="px-4 py-2 rounded-lg bg-primary text-white">Save Card</button></form>`;
    m.querySelector('#cardEditUser').onsubmit=async e=>{
      e.preventDefault();
      try{
        const x=await put('/cards/'+id,Object.fromEntries(new FormData(e.currentTarget)));
        toast(x.message,true);
        location.href='/admin/cards-view.html?id='+id
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function routeAdmin(){
    try{
      if(page==='plans.html')return adminPlans();
      if(page==='new-plan.html')return adminPlanForm(false);
      if(page==='edit-plan.html')return adminPlanForm(true);
      if(page==='admin-cards.html')return adminCards();
      if(page==='cards-create.html')return adminCardForm(false);
      if(page==='cards-edit.html')return adminCardForm(true);
      if(page==='cards-view.html')return adminCardView();
      if(page==='cards-edit-user.html')return adminCardEditUser();
      if(page==='admin-experts.html')return adminExperts();
      if(page==='admin-experts-create.html')return adminExpertForm(false);
      if(page==='admin-experts-edit.html')return adminExpertForm(true);
      if(page==='admin-experts-view.html')return adminExpertView();
      if(page==='admin-bot-trading.html')return adminBots();
      if(page==='admin-bot-trading-create.html')return adminBotForm(Boolean(new URLSearchParams(location.search).get('id')));
      if(page==='bot-trading-edit.html')return adminBotForm(true);
      if(page==='bot-trading-subscriptions.html')return adminBotSubs();
      if(page==='bot-trading-subscriptions-view.html')return adminBotSubView();
      if(page==='assets.html')return adminAssets();
      if(page==='create-assets.html')return adminAssetForm(false);
      if(page==='edit-assets.html')return adminAssetForm(true);
      if(page==='managetrades.html')return adminTrades();
      if(page==='create-trade.html')return adminTradeForm(false);
      if(page==='edit-trade.html')return adminTradeForm(true);
      if(page==='view-trade.html')return adminTradeView();
      if(page==='mining-plans.html')return adminMiningPlans();
      if(page==='mining-plans-create.html')return adminMiningForm(false);
      if(page==='mining-plans-edit.html')return adminMiningForm(true);
      if(page==='mining-subscriptions.html')return adminMiningSubs();
      if(page==='mwalletconnect.html')return adminWallets();
      if(page==='mwalletsettings.html')return adminWalletSettings();
      if(page==='active-investments.html')return adminInvestmentList();
      if(page==='active-investments-view.html')return adminInvestmentView();
    }
    catch(e){
      toast(e.message,false)
    }
    finally{
      showDynamicMain()
    }
  }
    async function routeUser(){
    try{
      if(page==='dashboard.html')await dashboard();
      else if(page==='connect-wallet.html')await userWallet();
      else if(page==='buy-plan.html')await userPlans();
      else if(page==='myplans.html')await myPlans();
      else if(page==='plan-details.html')await planDetails();
      else if(page==='cards.html')await cards();
      else if(page==='apply-card.html')await applyCard();
      else if(page==='markets.html')await markets();
      else if(page==='copy-trading.html')await copyTrading();
      else if(page==='copytrader-details.html')await copyDetails();
      else if(page==='copy-trading-position.html')await copyPosition();
      else if(page==='bot-trading.html')await bots();
      else if(page==='bot-trading-details.html')await botDetails();
      else if(page==='mining.html')await mining();
      else if(page==='subscription-mining.html')await miningSubscription();
    }
    catch(e){
      toast(e.message,false)
    }
    finally{
      showDynamicMain()
    }
  }
    function injectStyle(){
    const s=document.createElement('style');
    s.textContent='.feature-invest-drawer{position:fixed;top:0;right:0;bottom:0;width:25vw;min-width:340px;max-width:560px;background:#0d0d0d;border-left:1px solid #1e1e1e;z-index:100001;overflow-y:auto}.feature-drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);z-index:100000}.feature-invest-drawer{z-index:100001}@media(max-width:767px){.feature-invest-drawer{width:100%;min-width:0;max-width:none}}';
    document.head.appendChild(s)
  }
    document.addEventListener('DOMContentLoaded',async()=>{
    injectStyle();
    normalizeUserNav();
    hideDynamicMain();
    if(!isAdmin)await loadProfile();
    if(isAdmin)await routeAdmin();
    else await routeUser()
  });
})();
