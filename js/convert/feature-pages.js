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
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]">Loading markets...</div>';
    const d=await get('/assets?asset_class=all');
    const a=d.assets||[];
    const active=a.filter(x=>x.is_active!==false);
    const sortedGain=active.slice().sort((x,y)=>Number(y.price_change_pct_24h||y.change_24h||0)-Number(x.price_change_pct_24h||x.change_24h||0));
    const topG=sortedGain[0];
    const topL=sortedGain[sortedGain.length-1];
    const cats=[{k:'all',l:'All'},{k:'crypto',l:'Crypto'},{k:'forex',l:'Forex'},{k:'stock',l:'Stocks'},{k:'etf',l:'ETFs'},{k:'index',l:'Indices'}];
    root.innerHTML=`<div class="mb-[12px] flex items-center gap-3"><div class="inner-back" onclick="history.back()"><i class="fa-solid fa-chevron-left"></i></div><div class="inner-title">Markets</div></div>
    <div class="grid grid-cols-3 gap-[9px] mb-[12px]">
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[12px]"><div class="text-[#555] text-[.65rem] uppercase">Total Assets</div><div class="text-white font-bold mt-1 text-blue2">${active.length}</div></div>
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[12px]"><div class="text-[#555] text-[.65rem] uppercase">Top Gainer</div><div class="text-grn font-bold mt-1">${esc(topG?.symbol||'—')} <span class="text-[.7rem]">${topG?('+'+Number(topG.price_change_pct_24h||topG.change_24h||0).toFixed(2)+'%'):''}</span></div></div>
      <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[12px]"><div class="text-[#555] text-[.65rem] uppercase">Top Loser</div><div class="text-red2 font-bold mt-1">${esc(topL?.symbol||'—')} <span class="text-[.7rem]">${topL?(Number(topL.price_change_pct_24h||topL.change_24h||0).toFixed(2)+'%'):''}</span></div></div>
    </div>
    <div class="mb-[10px]"><input id="mktSearch" type="search" placeholder="Search by name or symbol..." class="w-full bg-[#111] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white text-[.85rem] outline-none"></div>
    <div class="flex gap-2 overflow-x-auto mb-[12px]" id="mktCats">${cats.map((c,i)=>`<button type="button" data-cat="${c.k}" class="px-3 py-1.5 rounded-full text-[.75rem] whitespace-nowrap ${i===0?'bg-brand-blue text-white':'bg-[#111] border border-[#1e1e1e] text-[#555]'}">${c.l} ${c.k==='all'?active.length:active.filter(x=>String(x.asset_class||'').toLowerCase()===c.k).length}</button>`).join('')}</div>
    <div id="mktList" class="space-y-0"></div>`;
    const list=root.querySelector('#mktList');
    function render(){
      const cat=root.querySelector('#mktCats [data-cat].bg-brand-blue')?.dataset.cat||'all';
      const q=(root.querySelector('#mktSearch').value||'').toLowerCase();
      let items=active;
      if(cat!=='all') items=items.filter(x=>String(x.asset_class||'').toLowerCase()===cat);
      if(q) items=items.filter(x=>String(x.name||'').toLowerCase().includes(q)||String(x.symbol||'').toLowerCase().includes(q));
      if(!items.length){list.innerHTML='<div class="text-center py-12 text-[#555]">No assets found</div>';return;}
      list.innerHTML=items.map(x=>{
        const chg=Number(x.price_change_pct_24h||x.change_24h||0);
        const logo=x.logo_url||x.image||'';
        return `<a href="/user/trade.html?asset=${encodeURIComponent(x._id||x.symbol)}" class="flex items-center gap-3 py-3 border-b border-[#0d0d0d] no-underline">
          <div class="w-9 h-9 rounded-full bg-[#1a1a1a] overflow-hidden flex items-center justify-center shrink-0">${logo?`<img src="${esc(logo)}" class="w-full h-full object-cover" onerror="this.remove()">`:`<span class="text-[.7rem] text-[#666]">${esc(String(x.symbol||'?')[0])}</span>`}</div>
          <div class="flex-1 min-w-0"><div class="text-white text-[.9rem] font-medium truncate">${esc(x.name||x.symbol)}</div><div class="text-[#555] text-[.72rem]">${esc(x.symbol)} · ${esc(x.asset_class||'')}</div></div>
          <div class="text-right"><div class="text-white text-[.9rem] font-medium">${money(x.price||x.current_price)}</div><div class="text-[.72rem] ${chg>=0?'text-grn':'text-red2'}">${chg>=0?'+':''}${chg.toFixed(2)}%</div></div>
        </a>`;
      }).join('');
    }
    render();
    root.querySelectorAll('#mktCats [data-cat]').forEach(btn=>{
      btn.onclick=()=>{root.querySelectorAll('#mktCats [data-cat]').forEach(b=>{b.className='px-3 py-1.5 rounded-full text-[.75rem] whitespace-nowrap bg-[#111] border border-[#1e1e1e] text-[#555]';});btn.className='px-3 py-1.5 rounded-full text-[.75rem] whitespace-nowrap bg-brand-blue text-white';render();};
    });
    root.querySelector('#mktSearch').oninput=render;
  }
    async function tradePage(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]">Loading trade desk...</div>';
    const params=new URLSearchParams(location.search);
    let preAsset=params.get('asset')||params.get('id')||'';
    let assets=[], trades=[], balance=0, demoBalance=0;
    try{
      const d=await get('/assets?asset_class=all');
      assets=(d.assets||[]).filter(x=>x.is_active!==false);
    }catch(e){console.warn(e);}
    try{
      const td=await get('/trades');
      trades=Array.isArray(td.trades)?td.trades:(Array.isArray(td)?td:[]);
      balance=Number(td.balance||0);
      demoBalance=Number(td.demo_balance||0);
    }catch(e){
      // fallback balance from profile
      try{const p=await get('/profile');balance=Number(p.user?.account_bal||p.account_bal||0);}catch(_){}
    }
    if(!balance && window.__FEATURE_PROFILE__) balance=Number(window.__FEATURE_PROFILE__.account_bal||0);

    const state={
      mode:'live', // live | demo
      tradeType:'Binary', // Binary | Spot
      assetClass:'crypto',
      assetId:preAsset|| (assets[0]&&assets[0]._id) || '',
      leverage:5,
      duration:5,
      amount:0
    };

    function byClass(c){
      return assets.filter(a=>String(a.asset_class||'').toLowerCase()===String(c).toLowerCase()
        || (c==='stocks'&&['stock','stocks'].includes(String(a.asset_class||'').toLowerCase()))
        || (c==='indices'&&['index','indices'].includes(String(a.asset_class||'').toLowerCase()))
        || (c==='etfs'&&['etf','etfs'].includes(String(a.asset_class||'').toLowerCase())));
    }
    function currentAsset(){
      return assets.find(a=>String(a._id)===String(state.assetId)||String(a.symbol)===String(state.assetId))||byClass(state.assetClass)[0]||assets[0]||{};
    }
    function tvSymbol(a){
      const sym=String(a.symbol||'BTC').toUpperCase();
      const cls=String(a.asset_class||'crypto').toLowerCase();
      if(cls==='forex') return 'FX:'+sym.replace('/','');
      if(['stock','stocks'].includes(cls)) return sym;
      if(['index','indices'].includes(cls)) return sym;
      // crypto
      return 'BINANCE:'+sym+'USDT';
    }
    function fmtPct(n){const v=Number(n||0);return (v>=0?'+':'')+v.toFixed(2)+'%';}
    function tradeRow(t){
      const a=t.trading_asset_id||{};
      const name=t.asset_name||(`${a.symbol||''} — ${a.name||''}`);
      const res=String(t.result||'').toUpperCase();
      const pl=Number(t.profit_loss||0);
      const act=String(t.action||'BUY').toLowerCase();
      const demo=t.is_demo?'<span class="px-[6px] py-[2px] rounded-[5px] text-[.62rem] font-medium bg-[rgba(245,197,66,.08)] text-ylw">DEMO</span>':'';
      const resBadge=res==='WIN'?`<span class="px-[6px] py-[2px] rounded-[5px] text-[.62rem] font-medium bg-[rgba(0,212,124,.1)] text-grn">WIN</span>`
        :res==='LOSS'?`<span class="px-[6px] py-[2px] rounded-[5px] text-[.62rem] font-medium bg-[rgba(255,69,96,.1)] text-red2">LOSS</span>`
        :`<span class="px-[6px] py-[2px] rounded-[5px] text-[.62rem] font-medium bg-[rgba(245,197,66,.08)] text-ylw">PENDING</span>`;
      const plCls=pl>=0?'text-grn':'text-red2';
      const plTxt=(pl>=0?'+':'')+money(pl);
      return `<div class="px-[14px] py-[12px] border-b border-[#1a1a1a] last:border-b-0">
        <div class="flex items-center justify-between mb-[7px]">
          <div class="flex items-center gap-[6px] flex-wrap">
            <span class="font-medium text-[.86rem]">${esc(name)}</span>
            ${String(t.status)==='closed'?resBadge:''}
            ${demo}
          </div>
          <span class="font-sora font-bold text-[.86rem] flex-shrink-0 ${String(t.status)==='closed'?plCls:'text-[#555]'}">${String(t.status)==='closed'?plTxt:'—'}</span>
        </div>
        <div class="grid grid-cols-3 gap-[6px]">
          <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[8px] p-[8px]">
            <div class="text-[#444] text-[.6rem] uppercase tracking-[.05em] mb-[2px]">Amount</div>
            <div class="font-sora font-medium text-[.78rem]">${money(t.amount)}</div>
          </div>
          <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[8px] p-[8px]">
            <div class="text-[#444] text-[.6rem] uppercase tracking-[.05em] mb-[2px]">Action</div>
            <div class="text-[.78rem] font-bold uppercase ${act==='buy'||act==='long'?'text-grn':'text-red2'}">${esc(act)}</div>
          </div>
          <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[8px] p-[8px]">
            <div class="text-[#444] text-[.6rem] uppercase tracking-[.05em] mb-[2px]">Settled</div>
            <div class="text-[.72rem] text-[#555]">${esc(t.settled_by||(t.status==='open'?'—':'System'))}</div>
          </div>
        </div>
        <div class="mt-[6px] text-[.68rem] text-[#333] flex gap-[10px]">
          <span>Entry <span class="text-[#555] font-sora">${money(t.entry_price)}</span></span>
          ${t.exit_price!=null?`<span>Exit <span class="text-[#555] font-sora">${money(t.exit_price)}</span></span>`:''}
        </div>
      </div>`;
    }

    function render(){
      const a=currentAsset();
      if(a&&a._id) state.assetId=a._id;
      const classList=byClass(state.assetClass);
      const open=trades.filter(t=>String(t.status||'').toLowerCase()==='open');
      const closed=trades.filter(t=>String(t.status||'').toLowerCase()!=='open');
      const ticker=assets.slice(0,8).map(x=>{
        const ch=Number(x.price_change_pct_24h||x.change_24h||0);
        return `<div class="flex items-center gap-2 px-3 py-1.5 whitespace-nowrap text-[.75rem]">
          ${x.logo_url?`<img src="${esc(x.logo_url)}" class="w-4 h-4 rounded-full">`:''}
          <span class="text-white font-medium">${esc(x.symbol)}</span>
          <span class="text-[#aaa]">${money(x.price)}</span>
          <span class="${ch>=0?'text-grn':'text-red2'}">${fmtPct(ch)}</span>
        </div>`;
      }).join('');
      const pills=classList.slice(0,12).map(x=>`<button type="button" data-pick-asset="${x._id}" class="px-3 py-1 rounded-full text-[.72rem] border ${String(state.assetId)===String(x._id)?'border-blue2 text-blue2 bg-[rgba(74,108,247,.12)]':'border-[#1e1e1e] text-[#666]'}">${esc(x.symbol)}</button>`).join('');
      const balShow=state.mode==='demo'?demoBalance:balance;

      root.innerHTML=`
<div class="mb-[10px] flex items-center justify-between gap-3">
  <div class="flex items-center gap-3">
    <div class="inner-back" onclick="location.href='/user/markets.html'"><i class="fa-solid fa-chevron-left"></i></div>
    <div class="inner-title">Trade</div>
  </div>
  <a href="/user/trade.html" class="text-[.75rem] text-[#555]"><i class="fa-regular fa-clock mr-1"></i>History</a>
</div>

<div class="overflow-x-auto mb-3 -mx-1">
  <div class="flex items-center gap-1 min-w-max">${ticker||'<span class="text-[#555] text-sm px-2">No market data</span>'}</div>
</div>

<div class="flex gap-2 overflow-x-auto mb-3 pb-1">${pills}</div>

<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] overflow-hidden mb-3">
  <div class="px-3 py-2 border-b border-[#1a1a1a] flex items-center justify-between">
    <div class="text-[.82rem] text-white font-medium">Live Chart</div>
    <div class="text-[.7rem] text-[#555]">${esc(a.symbol||'')} · ${money(a.price)}</div>
  </div>
  <div id="tvChart" class="w-full" style="height:320px;background:#0a0a0a">
    <iframe id="tvFrame" title="chart" class="w-full h-full border-0"
      src="https://s.tradingview.com/widgetembed/?frameElementId=tvFrame&symbol=${encodeURIComponent(tvSymbol(a))}&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=0d0d0d&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&hide_top_toolbar=0&allow_symbol_change=1"></iframe>
  </div>
</div>

<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[14px] mb-3">
  <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
    <div class="flex items-center gap-2">
      <button type="button" data-mode="live" class="px-3 py-1.5 rounded-lg text-[.75rem] font-medium ${state.mode==='live'?'bg-grn text-black':'bg-[#0d0d0d] text-[#666] border border-[#1e1e1e]'}">Live</button>
      <button type="button" data-mode="demo" class="px-3 py-1.5 rounded-lg text-[.75rem] font-medium ${state.mode==='demo'?'bg-ylw text-black':'bg-[#0d0d0d] text-[#666] border border-[#1e1e1e]'}">Demo</button>
      <span class="text-[.75rem] text-[#555] ml-1">Live Bal <span class="text-grn font-medium">${money(balShow)}</span></span>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" data-ttype="Binary" class="px-3 py-1.5 rounded-lg text-[.75rem] ${state.tradeType==='Binary'?'bg-blue2 text-white':'bg-[#0d0d0d] text-[#666] border border-[#1e1e1e]'}">Binary</button>
      <button type="button" data-ttype="Spot" class="px-3 py-1.5 rounded-lg text-[.75rem] ${state.tradeType==='Spot'?'bg-blue2 text-white':'bg-[#0d0d0d] text-[#666] border border-[#1e1e1e]'}">Spot</button>
    </div>
  </div>

  <div class="text-[.65rem] text-[#555] uppercase tracking-wide mb-1.5">Asset Class</div>
  <div class="flex flex-wrap gap-2 mb-3">
    ${[['crypto','Crypto'],['forex','Forex'],['stock','Stocks'],['etf','ETFs'],['index','Indices']].map(([k,l])=>`
      <button type="button" data-aclass="${k}" class="px-3 py-1.5 rounded-full text-[.72rem] border ${state.assetClass===k?'border-blue2 text-blue2 bg-[rgba(74,108,247,.12)]':'border-[#1e1e1e] text-[#666]'}">${l}</button>`).join('')}
  </div>

  <div class="text-[.65rem] text-[#555] uppercase tracking-wide mb-1.5">Select Asset</div>
  <select id="assetSelect" class="w-full mb-3 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white text-[.85rem] outline-none">
    <option value="">— Choose an asset —</option>
    ${classList.map(x=>`<option value="${x._id}" ${String(state.assetId)===String(x._id)?'selected':''}>${esc(x.symbol)} — ${esc(x.name)} (${money(x.price)})</option>`).join('')}
  </select>

  <div class="text-[.65rem] text-[#555] uppercase tracking-wide mb-1.5">Leverage</div>
  <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
    ${[2,5,10,25,50,100].map(x=>`<button type="button" data-lev="${x}" class="py-2 rounded-[10px] text-[.8rem] border ${state.leverage===x?'border-blue2 bg-[rgba(74,108,247,.15)] text-blue2':'border-[#1e1e1e] text-[#666]'}">${x}x</button>`).join('')}
  </div>

  <div class="text-[.65rem] text-[#555] uppercase tracking-wide mb-1.5">Duration</div>
  <div class="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
    ${[[1,'1m'],[5,'5m'],[15,'15m'],[30,'30m'],[60,'1h'],[240,'4h'],[1440,'1d']].map(([v,l])=>`<button type="button" data-dur="${v}" class="py-2 rounded-[10px] text-[.8rem] border ${state.duration===v?'border-blue2 bg-[rgba(74,108,247,.15)] text-blue2':'border-[#1e1e1e] text-[#666]'}">${l}</button>`).join('')}
  </div>

  <div class="text-[.65rem] text-[#555] uppercase tracking-wide mb-1.5">Amount (USD)</div>
  <input id="tradeAmount" type="number" min="0" step="0.01" value="${state.amount||0}" class="w-full mb-3 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none" placeholder="0">

  <div class="grid grid-cols-2 gap-2">
    <button type="button" id="buyBtn" class="py-3 rounded-[12px] font-medium text-[.9rem] bg-grn text-black">↑ BUY / LONG</button>
    <button type="button" id="sellBtn" class="py-3 rounded-[12px] font-medium text-[.9rem] bg-red2 text-white">↓ SELL / SHORT</button>
  </div>
</div>

<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] overflow-hidden mb-6">
  <div class="px-[14px] py-[12px] border-b border-[#1a1a1a] flex items-center justify-between">
    <div class="text-white font-medium text-[.9rem]">My Trades</div>
    <div class="flex gap-2">
      <button type="button" data-tab="open" class="px-3 py-1 rounded-lg text-[.72rem] ${true?'bg-[rgba(74,108,247,.15)] text-blue2 border border-blue2':''}" id="tabOpen">Open (${open.length})</button>
      <button type="button" data-tab="closed" class="px-3 py-1 rounded-lg text-[.72rem] border border-[#1e1e1e] text-[#666]" id="tabClosed">Closed (${closed.length})</button>
    </div>
  </div>
  <div id="tradeList">
    ${open.length?open.map(tradeRow).join(''):`<div class="py-[40px] text-center"><i class="fa-solid fa-chart-line text-[#1e1e1e] text-[2rem] block mb-[10px]"></i><div class="text-[#333] text-[.8rem]">No open trades</div></div>`}
  </div>
</div>`;

      // bind
      root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;render();});
      root.querySelectorAll('[data-ttype]').forEach(b=>b.onclick=()=>{state.tradeType=b.dataset.ttype;render();});
      root.querySelectorAll('[data-aclass]').forEach(b=>b.onclick=()=>{
        state.assetClass=b.dataset.aclass;
        const first=byClass(state.assetClass)[0];
        state.assetId=first?first._id:'';
        render();
      });
      root.querySelectorAll('[data-pick-asset]').forEach(b=>b.onclick=()=>{state.assetId=b.dataset.pickAsset;render();});
      root.querySelectorAll('[data-lev]').forEach(b=>b.onclick=()=>{state.leverage=Number(b.dataset.lev);render();});
      root.querySelectorAll('[data-dur]').forEach(b=>b.onclick=()=>{state.duration=Number(b.dataset.dur);render();});
      const sel=root.querySelector('#assetSelect');
      if(sel) sel.onchange=()=>{state.assetId=sel.value;render();};
      const amt=root.querySelector('#tradeAmount');
      if(amt) amt.oninput=()=>{state.amount=Number(amt.value||0);};

      async function place(action){
        const asset=currentAsset();
        if(!asset||!asset._id){toast('Choose an asset',false);return;}
        const amount=Number(root.querySelector('#tradeAmount')?.value||state.amount||0);
        if(amount<=0){toast('Enter a valid amount',false);return;}
        try{
          const x=await post('/trades',{
            trading_asset_id:asset._id,
            action,
            amount,
            leverage:state.leverage,
            duration:state.duration,
            duration_minutes:state.duration,
            trade_type:state.tradeType,
            is_demo:state.mode==='demo',
            mode:state.mode,
            entry_price:asset.price
          });
          toast(x.message||'Trade placed successfully.',true);
          // reload trades
          try{
            const td=await get('/trades');
            trades=Array.isArray(td.trades)?td.trades:[];
            balance=Number(td.balance||balance);
            demoBalance=Number(td.demo_balance||demoBalance);
          }catch(_){}
          state.amount=0;
          render();
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      }
      root.querySelector('#buyBtn').onclick=()=>place('BUY');
      root.querySelector('#sellBtn').onclick=()=>place('SELL');

      const list=root.querySelector('#tradeList');
      root.querySelector('#tabOpen').onclick=()=>{
        root.querySelector('#tabOpen').className='px-3 py-1 rounded-lg text-[.72rem] bg-[rgba(74,108,247,.15)] text-blue2 border border-blue2';
        root.querySelector('#tabClosed').className='px-3 py-1 rounded-lg text-[.72rem] border border-[#1e1e1e] text-[#666]';
        list.innerHTML=open.length?open.map(tradeRow).join(''):`<div class="py-[40px] text-center"><i class="fa-solid fa-chart-line text-[#1e1e1e] text-[2rem] block mb-[10px]"></i><div class="text-[#333] text-[.8rem]">No open trades</div></div>`;
      };
      root.querySelector('#tabClosed').onclick=()=>{
        root.querySelector('#tabClosed').className='px-3 py-1 rounded-lg text-[.72rem] bg-[rgba(74,108,247,.15)] text-blue2 border border-blue2';
        root.querySelector('#tabOpen').className='px-3 py-1 rounded-lg text-[.72rem] border border-[#1e1e1e] text-[#666]';
        list.innerHTML=closed.length?closed.map(tradeRow).join(''):`<div class="py-[40px] text-center"><div class="text-[#333] text-[.8rem]">No closed trades</div></div>`;
      };
    }
    render();
  }
    
    async function copyTrading(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/experts');
    const experts=d.experts||[];
    const positions=d.positions||[];
    const activeCount=Number(d.activeCount||positions.filter(x=>x.status==='active').length);
    root.innerHTML=`<div class="mb-[14px] flex items-center gap-3">
      <div class="inner-back" onclick="history.back()"><i class="fa-solid fa-chevron-left"></i></div>
      <div class="inner-title">Copy Trading</div>
    </div>
    <div class="flex gap-4 border-b border-[#1a1a1a] mb-[14px] text-[.85rem]">
      <button type="button" id="expertTab" class="pb-2 border-b-2 border-blue2 text-white">Available Experts</button>
      <button type="button" id="positionTab" class="pb-2 border-b-2 border-transparent text-[#555]">My Active Copies${activeCount?` (${activeCount})`:''}</button>
    </div>
    <div id="copyContent"></div>`;
    const content=root.querySelector('#copyContent');
    function renderExperts(){
      if(!experts.length){ content.innerHTML='<div class="text-center py-12 text-[#555]">No experts available.</div>'; return; }
      content.innerHTML=experts.map(e=>{
        const daily=Number(e.daily_roi||0);
        const total=Number(e.total_roi||daily*Number(e.duration_days||30));
        const win=Number(e.win_rate||0);
        const min=Number(e.min_startup_capital||0);
        const initials=String(e.name||'EX').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
        return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[14px] mb-[10px]">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-[42px] h-[42px] rounded-full bg-[#1a1a1a] flex items-center justify-center text-[.72rem] text-blue2 font-semibold overflow-hidden flex-shrink-0">
              ${e.profile_picture?`<img src="${esc(e.profile_picture)}" class="w-full h-full object-cover">`:`${esc(initials)}`}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <div class="text-white font-medium text-[.9rem]">${esc(e.name)}</div>
                <span class="text-[.65rem] text-blue2 px-2 py-0.5 rounded-full bg-[rgba(74,108,247,.12)]">${esc(e.area_of_expertise||'Mixed')}</span>
              </div>
              <div class="text-[.68rem] text-[#555] mt-0.5">${Number(e.followers_count||0).toLocaleString()} followers</div>
            </div>
            <div class="text-right"><div class="text-grn font-sora font-bold text-[.95rem]">${daily.toFixed(2)}%</div><div class="text-[.62rem] text-[#555]">Daily ROI</div></div>
          </div>
          <div class="grid grid-cols-4 gap-2 text-center text-[.72rem] mb-3">
            <div><div class="text-white font-medium">${e.duration_days||30}d</div><div class="text-[#555]">Duration</div></div>
            <div><div class="text-grn font-medium">${total.toFixed(1)}%</div><div class="text-[#555]">Total ROI</div></div>
            <div><div class="text-white font-medium">${win}%</div><div class="text-[#555]">Win Rate</div></div>
            <div><div class="text-blue2 font-medium">${money(min)}</div><div class="text-[#555]">Min Cap</div></div>
          </div>
          <a href="/user/copytrader-details.html?id=${e._id}" class="block text-center py-[10px] rounded-[10px] border border-[rgba(74,108,247,.35)] text-blue2 text-[.82rem] no-underline">→ View Expert</a>
        </div>`;
      }).join('');
    }
    function renderPositions(){
      if(!positions.length){ content.innerHTML='<div class="text-center py-12 text-[#555]">No copy positions yet.</div>'; return; }
      content.innerHTML=positions.map(p=>{
        const e=p.expert||p.expert_id||{};
        const inv=Number(p.invested_amount||0);
        const profit=Number(p.accumulated_profit||p.current_profit||0);
        const adj=Number(p.admin_profit_adjustment||0);
        const payout=inv+profit+adj;
        const daily=Number(p.daily_roi_snapshot||e.daily_roi||0);
        const start=new Date(p.started_at||p.createdAt);
        const endD=new Date(p.expires_at);
        const totalDays=Math.max(1,Math.ceil((endD-start)/86400000));
        const dayNum=Math.min(totalDays,Math.max(0,Math.floor((Date.now()-start)/86400000)));
        const progress=Math.min(100,Math.max(0,(Date.now()-start)/(endD-start)*100));
        const remain=Math.max(0,totalDays-dayNum);
        const status=String(p.status||'active');
        const stColor=status==='active'?'text-grn bg-[rgba(0,212,124,.1)]':status==='settled'?'text-ylw bg-[rgba(245,197,66,.1)]':'text-[#888] bg-[#1a1a1a]';
        return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[14px] mb-[10px]">
          <div class="flex items-center gap-3 mb-3">
            <div class="flex-1"><div class="text-white font-medium">${esc(e.name||'Expert')}</div><span class="text-[.68rem] text-blue2">${esc(e.area_of_expertise||'')}</span></div>
            <span class="text-[.72rem] px-[10px] py-[4px] rounded-full ${stColor}">${esc(status.charAt(0).toUpperCase()+status.slice(1))}</span>
          </div>
          <div class="grid grid-cols-2 gap-[9px] mb-[12px]">
            <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Invested</div><div class="font-sora font-bold text-white">${money(inv)}</div></div>
            <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Profit</div><div class="font-sora font-bold text-grn">${money(profit)}</div></div>
            <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Daily ROI</div><div class="font-sora font-bold text-grn">${daily.toFixed(2)}%</div></div>
            <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Total Payout</div><div class="font-sora font-bold text-blue2">${money(payout)}</div></div>
          </div>
          <div class="mb-[12px]"><div class="w-full bg-[#1a1a1a] rounded-full h-[5px] overflow-hidden"><div class="bg-brand-blue h-[5px] rounded-full" style="width:${progress}%"></div></div>
            <div class="text-[#444] text-[.72rem] mt-[5px]">Day ${dayNum} of ${totalDays} — ${remain} days remaining</div></div>
          <a href="/user/copy-trading-position.html?id=${p._id}" class="block py-[10px] rounded-[10px] bg-brand-blue text-white text-[.82rem] font-medium text-center no-underline">View Position</a>
        </div>`;
      }).join('');
    }
    renderExperts();
    root.querySelector('#expertTab').onclick=()=>{
      root.querySelector('#expertTab').className='pb-2 border-b-2 border-blue2 text-white';
      root.querySelector('#positionTab').className='pb-2 border-b-2 border-transparent text-[#555]';
      renderExperts();
    };
    root.querySelector('#positionTab').onclick=()=>{
      root.querySelector('#positionTab').className='pb-2 border-b-2 border-blue2 text-white';
      root.querySelector('#expertTab').className='pb-2 border-b-2 border-transparent text-[#555]';
      renderPositions();
    };
  }
    async function copyDetails(){
    const root=inner();
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Expert id required',false);return;}
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]">Loading...</div>';
    const d=await get('/experts/'+encodeURIComponent(id));
    const e=d.expert||{};
    const p=d.activePosition;
    const daily=Number(e.daily_roi||0);
    const total=Number(e.total_roi||daily*Number(e.duration_days||30));
    const min=Number(e.min_startup_capital||0);
    const max=Number(e.max_capital||0);
    const initials=String(e.name||'EX').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
    let body='';
    if(p){
      const inv=Number(p.invested_amount||0);
      const profit=Number(p.accumulated_profit||0);
      const exp=p.expires_at;
      body=`<div class="bg-[#111] border border-[rgba(74,108,247,.3)] rounded-[13px] p-[15px] mb-[9px]">
        <div class="flex items-center gap-[8px] mb-[14px]"><span class="bg-[rgba(0,212,124,.1)] text-grn text-[.72rem] px-[10px] py-[3px] rounded-full">Active</span><h3 class="font-medium text-[.95rem] text-white">Your Active Position</h3></div>
        <div class="grid grid-cols-2 gap-[9px] mb-[14px]">
          <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Invested</div><div class="font-sora font-bold text-white">${money(inv)}</div></div>
          <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Profit</div><div class="font-sora font-bold text-grn">${money(profit)}</div></div>
          <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">ROI Locked</div><div class="font-sora font-bold text-grn">${daily.toFixed(2)}%</div></div>
          <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Expires</div><div class="font-sora font-bold text-white">${dt(exp)}</div></div>
        </div>
        <div class="flex items-center gap-[9px]">
          <a href="/user/copy-trading-position.html?id=${p._id}" class="flex-1 py-[12px] rounded-[12px] bg-brand-blue text-white text-[.88rem] font-medium text-center no-underline">View Position</a>
          <button type="button" id="stopExpertBtn" class="flex-1 py-[12px] rounded-[12px] bg-[rgba(255,69,96,.1)] text-red2 text-[.88rem] font-medium border border-[rgba(255,69,96,.2)]">Stop Copying</button>
        </div>
      </div>`;
    } else {
      body=`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
        <div class="text-white font-medium mb-3">Start Copying ${esc(e.name||'')}</div>
        <label class="text-[.68rem] text-[#555] uppercase">Investment Amount (USD)</label>
        <input id="copyAmount" type="number" step="0.01" min="${min}" ${max>0?`max="${max}"`:''} value="" placeholder="0.00" class="w-full mt-1 mb-2 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-3 text-white text-xl outline-none">
        <div class="text-[.72rem] text-ylw mb-3">⚠ Min ${money(min)}${max?` — Max ${money(max)}`:''}</div>
        <div class="flex justify-between text-[.78rem] mb-1"><span class="text-[#555]">Estimated Daily Profit</span><span class="text-grn" id="estDaily">$0.00</span></div>
        <div class="flex justify-between text-[.78rem] mb-4"><span class="text-[#555]">Plan Duration</span><span class="text-white">${e.duration_days||30} days</span></div>
        <button type="button" id="startCopyBtn" class="w-full py-[13px] rounded-[12px] bg-brand-blue text-white font-medium">Start Copying — ${e.duration_days||30} Day Plan</button>
      </div>`;
    }
    root.innerHTML=`<div class="mb-[14px] flex items-center gap-3">
      <div class="inner-back" onclick="location.href='/user/copy-trading.html'"><i class="fa-solid fa-chevron-left"></i></div>
      <div class="inner-title">Expert Profile</div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[14px] mb-[10px]">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-[48px] h-[48px] rounded-full bg-[#1a1a1a] flex items-center justify-center text-blue2 font-semibold overflow-hidden">${e.profile_picture?`<img src="${esc(e.profile_picture)}" class="w-full h-full object-cover">`:`${esc(initials)}`}</div>
        <div class="flex-1"><div class="text-white font-medium">${esc(e.name)} <span class="text-[.65rem] text-blue2 ml-1">${esc(e.area_of_expertise||'')}</span></div>
          <div class="text-[.68rem] text-[#555]">${Number(e.followers_count||0).toLocaleString()} followers · ${e.duration_days||30}-day plan · ${Number(e.win_rate||0)}% win rate</div></div>
        <div class="text-right"><div class="text-grn font-sora font-bold">${daily.toFixed(2)}%</div><div class="text-[.62rem] text-[#555]">Daily ROI</div></div>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-[.75rem]">
        <div class="bg-[#161616] rounded-[10px] p-2"><div class="text-grn font-medium">${daily.toFixed(2)}%</div><div class="text-[#555]">Daily ROI</div></div>
        <div class="bg-[#161616] rounded-[10px] p-2"><div class="text-white font-medium">${e.duration_days||30}d</div><div class="text-[#555]">Duration</div></div>
        <div class="bg-[#161616] rounded-[10px] p-2"><div class="text-grn font-medium">${total.toFixed(1)}%</div><div class="text-[#555]">Total ROI</div></div>
        <div class="bg-[#161616] rounded-[10px] p-2"><div class="text-blue2 font-medium">${money(min)}</div><div class="text-[#555]">Min Capital</div></div>
        <div class="bg-[#161616] rounded-[10px] p-2"><div class="text-white font-medium">${max?money(max):'—'}</div><div class="text-[#555]">Max Capital</div></div>
        <div class="bg-[#161616] rounded-[10px] p-2"><div class="text-white font-medium">${Number(e.win_rate||0)}%</div><div class="text-[#555]">Win Rate</div></div>
      </div>
    </div>${body}`;
    if(p){
      root.querySelector('#stopExpertBtn')?.addEventListener('click', async()=>{
        try{
          const x=await post('/copy/stop/'+p._id,{});
          toast(x.message||'copytrade stopped',true);
          setTimeout(()=>location.href='/user/copy-trading.html',600);
        }catch(err){toast(err.response?.data?.message||err.message,false);}
      });
    } else {
      const amt=root.querySelector('#copyAmount');
      const est=root.querySelector('#estDaily');
      amt?.addEventListener('input',()=>{ const v=Number(amt.value||0); est.textContent=money(v*daily/100); });
      root.querySelector('#startCopyBtn')?.addEventListener('click', async()=>{
        try{
          const x=await post('/copy/start/'+id,{amount:Number(amt.value||0)});
          toast(x.message||`You have started copying ${e.name}!`,true);
          setTimeout(()=>location.href='/user/copy-trading.html',700);
        }catch(err){toast(err.response?.data?.message||err.message,false);}
      });
    }
  }
    async function copyPosition(){
    const root=inner();
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Position id required',false);return;}
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]">Loading...</div>';
    const d=await get('/copy/position/'+encodeURIComponent(id));
    const p=d.position||{};
    const e=p.expert||{};
    const inv=Number(p.invested_amount||0);
    const profit=Number(p.accumulated_profit||0);
    const adj=Number(p.admin_profit_adjustment||0);
    const payout=inv+profit+adj;
    const daily=Number(p.daily_roi_snapshot||e.daily_roi||0);
    const start=new Date(p.started_at||p.createdAt);
    const endD=new Date(p.expires_at);
    const totalDays=Math.max(1,Math.ceil((endD-start)/86400000));
    const dayNum=Math.min(totalDays,Math.max(0,Math.floor((Date.now()-start)/86400000)));
    const progress=Math.min(100,Math.max(0,(Date.now()-start)/(endD-start)*100));
    const remain=Math.max(0,totalDays-dayNum);
    const status=String(p.status||'');
    root.innerHTML=`<div class="mb-[14px] flex items-center gap-3">
      <div class="inner-back" onclick="location.href='/user/copy-trading.html'"><i class="fa-solid fa-chevron-left"></i></div>
      <div class="inner-title">Position Details</div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[14px] mb-[10px]">
      <div class="flex justify-between items-center mb-3">
        <div><div class="text-white font-medium">${esc(e.name||'Expert')}</div><a href="/user/copytrader-details.html?id=${e._id||p.expert_id}" class="text-[.72rem] text-blue2 no-underline">View Expert Profile</a></div>
        <span class="text-[.72rem] px-2 py-1 rounded-full ${status==='active'?'text-grn bg-[rgba(0,212,124,.1)]':'text-ylw bg-[rgba(245,197,66,.1)]'}">${esc(status)}</span>
      </div>
      <div class="grid grid-cols-2 gap-[9px] mb-3">
        <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Invested</div><div class="font-sora font-bold text-white">${money(inv)}</div></div>
        <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Profit</div><div class="font-sora font-bold text-grn">${money(profit)}</div></div>
        <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Daily ROI</div><div class="font-sora font-bold text-grn">${daily.toFixed(2)}%</div></div>
        <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Total Payout</div><div class="font-sora font-bold text-blue2">${money(payout)}</div></div>
        <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Started</div><div class="text-white">${dt(start)}</div></div>
        <div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#444] uppercase mb-1">Expires</div><div class="text-white">${dt(endD)}</div></div>
      </div>
      <div class="mb-3"><div class="w-full bg-[#1a1a1a] rounded-full h-[5px] overflow-hidden"><div class="bg-brand-blue h-[5px]" style="width:${progress}%"></div></div>
        <div class="text-[#444] text-[.72rem] mt-1">Day ${dayNum} of ${totalDays} — ${remain} days remaining</div></div>
      ${status==='active'?`<button type="button" id="stopPosBtn" class="w-full py-[12px] rounded-[12px] bg-[rgba(255,69,96,.1)] text-red2 border border-[rgba(255,69,96,.2)] font-medium">Stop Copying</button>`:''}
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[14px]">
      <div class="text-white font-medium mb-2">Trades</div>
      <div class="text-center py-8 text-[#444] text-[.8rem]"><i class="fa-solid fa-chart-line mb-2 block text-2xl opacity-20"></i>No trades yet. Trades are generated automatically.</div>
    </div>`;
    root.querySelector('#stopPosBtn')?.addEventListener('click', async()=>{
      try{
        const x=await post('/copy/stop/'+id,{});
        toast(x.message||'copytrade stopped',true);
        setTimeout(()=>location.href='/user/copy-trading.html',600);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    });
  }
    
    async function bots(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/bots');
    const bots=d.bots||[];
    const subs=d.subscriptions||[];
    const activeCount=Number(d.activeCount||subs.filter(x=>x.status==='active').length);
    root.innerHTML=`<div class="mb-[14px]"><div class="inner-title">Bot Trading</div><p class="text-[.72rem] text-[#444] mt-0.5">Subscribe to automated trading bots and earn passive profits</p></div>
    <div class="flex gap-4 border-b border-[#1a1a1a] mb-[14px] text-[.85rem]">
      <button type="button" id="botsTab" class="pb-2 border-b-2 border-blue2 text-white">Available Bots</button>
      <button type="button" id="subsTab" class="pb-2 border-b-2 border-transparent text-[#555]">My Subscriptions${activeCount?` (${activeCount})`:''}</button>
    </div>
    <div id="botContent"></div>`;
    const c=root.querySelector('#botContent');
    function renderBots(){
      if(!bots.length){c.innerHTML='<div class="text-center py-12 text-[#555]">No bots available.</div>';return;}
      c.innerHTML=`<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[12px]">`+bots.map(b=>{
        const daily=Number(b.expected_roi||b.daily_roi||0);
        const win=Number(b.win_rate||0);
        const min=Number(b.min_investment||0);
        const interval=Number(b.trade_interval_minutes||5);
        const maxD=Number(b.max_duration_days||30);
        const strategy=esc(b.strategy_type||'Scalping');
        return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[16px] flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-full bg-[rgba(74,108,247,.12)] flex items-center justify-center text-blue2"><i class="fa-solid fa-microchip"></i></div>
              <div>
                <div class="text-white font-medium text-[.9rem]">${esc(b.name)}</div>
                <span class="text-[.65rem] px-2 py-0.5 rounded-full bg-[rgba(74,108,247,.12)] text-blue2">${strategy}</span>
              </div>
            </div>
            <div class="text-right"><div class="text-grn font-semibold text-[.95rem]">${daily.toFixed(2)}%</div><div class="text-[.65rem] text-[#555]">daily ROI</div></div>
          </div>
          <div class="grid grid-cols-4 gap-2 text-center text-[.72rem] mb-4 py-2 border-t border-b border-[#1a1a1a]">
            <div><div class="text-[#555]">Max Duration</div><div class="text-white mt-0.5">${maxD}d</div></div>
            <div><div class="text-[#555]">Win Rate</div><div class="text-white mt-0.5">${win}%</div></div>
            <div><div class="text-[#555]">Min Invest</div><div class="text-white mt-0.5">${money(min)}</div></div>
            <div><div class="text-[#555]">Interval</div><div class="text-white mt-0.5">${interval}m</div></div>
          </div>
          <a href="/user/bot-trading-details.html?id=${b._id}" class="mt-auto block text-center py-[10px] rounded-[10px] bg-[rgba(74,108,247,.12)] text-blue2 text-[.82rem] no-underline hover:bg-brand-blue hover:text-white transition-colors">View Bot →</a>
        </div>`;
      }).join('')+`</div>`;
    }
    function renderSubs(){
      if(!subs.length){
        c.innerHTML=`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-8 text-center">
          <i class="fa-solid fa-microchip" style="font-size:2.5rem;color:#333;display:block;margin-bottom:12px;"></i>
          <p class="text-[#aaa]" style="font-size:.88rem;margin-bottom:8px;">You haven't subscribed to any bots yet.</p>
          <button type="button" id="browseBotsBtn" class="text-blue2" style="font-size:.82rem;font-weight:500;background:none;border:none;cursor:pointer;">Browse Available Bots →</button>
        </div>`;
        c.querySelector('#browseBotsBtn')?.addEventListener('click',()=>{root.querySelector('#botsTab').click();});
        return;
      }
      c.innerHTML=`<div class="space-y-4">`+subs.map(s=>{
        const b=s.bot_id||s.bot||{};
        const status=String(s.status||'active');
        const stCls=status==='active'?'bg-[rgba(0,212,124,.1)] text-grn':status==='settled'?'bg-[rgba(245,197,66,.1)] text-ylw':'bg-[rgba(255,69,96,.1)] text-red2';
        return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
          <div class="flex items-center gap-3 mb-4">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(74,108,247,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-microchip" style="font-size:.9rem;color:#6e8efb;"></i></div>
            <div><h5 style="font-size:.88rem;font-weight:500;color:#fff;">${esc(b.name||'Bot')}</h5>
              <span class="bg-[rgba(74,108,247,.1)] text-blue2 px-2 py-0.5 rounded-full" style="font-size:.72rem;">${esc(b.strategy_type||'')}</span></div>
            <div class="ml-auto"><span class="${stCls} px-2.5 py-1 rounded-full" style="font-size:.72rem;font-weight:500;">${esc(status.charAt(0).toUpperCase()+status.slice(1))}</span></div>
          </div>
          <div class="grid grid-cols-4 gap-4 py-3 border-t border-[#1e1e1e]">
            <div><p style="font-size:.68rem;color:#555;">Invested</p><p style="font-size:.82rem;font-weight:600;color:#fff;">${money(s.invested_amount)}</p></div>
            <div><p style="font-size:.68rem;color:#555;">Profit</p><p style="font-size:.82rem;font-weight:600;" class="text-grn">${money(s.current_profit||s.accumulated_profit)}</p></div>
            <div><p style="font-size:.68rem;color:#555;">Daily ROI</p><p class="text-grn" style="font-size:.82rem;font-weight:600;">${Number(s.daily_roi_snapshot||b.expected_roi||0).toFixed(2)}%</p></div>
            <div><p style="font-size:.68rem;color:#555;">Expires</p><p style="font-size:.82rem;color:#fff;">${dt(s.expires_at)}</p></div>
          </div>
          <div class="flex items-center gap-3 mt-4"><a href="#" onclick="return false" class="text-blue2" style="font-size:.78rem;font-weight:500;text-decoration:none;">View Details →</a></div>
        </div>`;
      }).join('')+`</div>`;
    }
    renderBots();
    root.querySelector('#botsTab').onclick=()=>{
      root.querySelector('#botsTab').className='pb-2 border-b-2 border-blue2 text-white';
      root.querySelector('#subsTab').className='pb-2 border-b-2 border-transparent text-[#555]';
      renderBots();
    };
    root.querySelector('#subsTab').onclick=()=>{
      root.querySelector('#subsTab').className='pb-2 border-b-2 border-blue2 text-white';
      root.querySelector('#botsTab').className='pb-2 border-b-2 border-transparent text-[#555]';
      renderSubs();
    };
  }
    async function botDetails(){
    const root=inner();
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Bot id required',false);return;}
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]">Loading...</div>';
    const d=await get('/bots/'+encodeURIComponent(id));
    const b=d.bot||{};
    const s=d.subscription;
    const daily=Number(b.expected_roi||b.daily_roi||0);
    const min=Number(b.min_investment||0);
    const max=Number(b.max_investment||0);
    const maxD=Number(b.max_duration_days||30);
    const interval=Number(b.trade_interval_minutes||5);
    const win=Number(b.win_rate||0);

    let rightPanel='';
    if(s && s.status==='active'){
      rightPanel=`<div class="bg-[#111] rounded-[13px] p-[15px]" style="border:1px solid rgba(74,108,247,.3);">
        <div class="flex items-center gap-2 mb-3">
          <span class="bg-[rgba(0,212,124,.1)] text-grn px-2.5 py-1 rounded-full" style="font-size:.72rem;font-weight:500;">Active</span>
          <span class="text-[#555]" style="font-size:.72rem;">Subscription</span>
        </div>
        <div class="space-y-3">
          <div><p class="text-[#555]" style="font-size:.72rem;">Invested</p><p class="font-sora font-bold text-white" style="font-size:1.2rem;">${money(s.invested_amount)}</p></div>
          <div><p class="text-[#555]" style="font-size:.72rem;">Profit Earned</p><p class="font-sora font-bold text-grn" style="font-size:1.2rem;">${money(s.current_profit||s.accumulated_profit)}</p></div>
          <div><p class="text-[#555]" style="font-size:.72rem;">Expires</p><p class="text-white" style="font-size:.82rem;">${dt(s.expires_at)}</p></div>
        </div>
        <div class="mt-4 flex gap-2">
          <a href="#" onclick="return false" class="flex-1 text-center rounded-[10px] py-2.5" style="background:rgba(74,108,247,.1);color:#6e8efb;font-size:.82rem;font-weight:500;text-decoration:none;">View Details</a>
          <button type="button" id="stopBotBtn" class="flex-1 rounded-[10px] py-2.5" style="background:rgba(255,69,96,.1);color:#ff4560;font-size:.82rem;font-weight:500;border:none;cursor:pointer;">Stop</button>
        </div>
      </div>`;
    } else {
      rightPanel=`<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[16px]">
        <div class="text-white font-medium mb-3">Subscribe to this Bot</div>
        <form id="botSubForm" class="space-y-3">
          <div><label class="text-[.72rem] text-[#555]">Investment Amount (USD)</label>
            <input name="amount" type="number" step="0.01" min="${min}" value="${min}" required class="w-full mt-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none">
            <p class="text-[.65rem] text-[#555] mt-1">Min ${money(min)}${max?` · Max ${money(max)}`:''}</p>
          </div>
          <div><label class="text-[.72rem] text-[#555]">Duration (Days)</label>
            <input name="duration" type="number" min="1" max="${maxD}" value="${Math.min(30,maxD)}" required class="w-full mt-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white outline-none">
            <p class="text-[.65rem] text-[#555] mt-1">Max ${maxD} days</p>
          </div>
          <div class="bg-[#0d0d0d] rounded-[10px] p-3 text-[.78rem]">
            <div class="text-[#555] mb-2">Estimated Earnings</div>
            <div class="flex justify-between"><span class="text-[#666]">Daily Profit</span><span id="estDaily" class="text-grn">${money(min*daily/100)}</span></div>
            <div class="flex justify-between mt-1"><span class="text-[#666]">Total Estimated</span><span id="estTotal" class="text-grn">${money(min*daily/100*Math.min(30,maxD))}</span></div>
          </div>
          <button type="submit" class="w-full py-[12px] rounded-[12px] bg-brand-blue text-white font-medium">Subscribe Now</button>
          <p class="text-[.65rem] text-[#555] text-center">Amount will be deducted from your account balance</p>
        </form>
      </div>`;
    }

    root.innerHTML=`<div class="mb-[14px] flex items-center gap-3">
      <div class="inner-back" onclick="location.href='/user/bot-trading.html'"><i class="fa-solid fa-chevron-left"></i></div>
      <div class="inner-title">${esc(b.name||'Bot')}</div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[16px] mb-[14px]">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[rgba(74,108,247,.12)] flex items-center justify-center text-blue2"><i class="fa-solid fa-microchip"></i></div>
          <div>
            <div class="text-white font-medium">${esc(b.name)} <span class="text-[.65rem] px-2 py-0.5 rounded-full bg-[rgba(74,108,247,.12)] text-blue2 ml-1">${esc(b.strategy_type||'')}</span></div>
            <p class="text-[.78rem] text-[#666] mt-1 max-w-xl">${esc(b.description||'')}</p>
          </div>
        </div>
        <div class="text-right"><div class="text-grn font-semibold">${daily.toFixed(2)}%</div><div class="text-[.65rem] text-[#555]">daily ROI</div></div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[.75rem] border-t border-[#1a1a1a] pt-3">
        <div><div class="text-[#555]">Win Rate</div><div class="text-grn mt-0.5 font-medium">${win}%</div></div>
        <div><div class="text-[#555]">Trade Interval</div><div class="text-white mt-0.5">${interval}m</div></div>
        <div><div class="text-[#555]">Min Investment</div><div class="text-white mt-0.5">${money(min)}</div></div>
        <div><div class="text-[#555]">Max Investment</div><div class="text-white mt-0.5">${max?money(max):'—'}</div></div>
        <div><div class="text-[#555]">Max Duration</div><div class="text-white mt-0.5">${maxD} days</div></div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">
      <div class="lg:col-span-2 bg-[#111] border border-[#1e1e1e] rounded-[14px] p-[16px]">
        <div class="text-white font-medium mb-3">Recent Bot Trades</div>
        <div class="text-center py-10 text-[#555] text-[.82rem]">No trades recorded yet.</div>
      </div>
      <div>${rightPanel}</div>
    </div>`;

    const form=root.querySelector('#botSubForm');
    if(form){
      const amt=form.querySelector('[name=amount]');
      const dur=form.querySelector('[name=duration]');
      const upd=()=>{
        const a=Number(amt.value||0), days=Number(dur.value||0);
        const dayP=a*daily/100;
        root.querySelector('#estDaily').textContent=money(dayP);
        root.querySelector('#estTotal').textContent=money(dayP*days);
      };
      amt.addEventListener('input',upd); dur.addEventListener('input',upd);
      form.onsubmit=async e=>{
        e.preventDefault();
        const body={amount:Number(amt.value),duration:Number(dur.value)};
        try{
          const x=await post('/bots/subscribe/'+id, body);
          toast(x.message||(`You have subscribed to ${b.name}!`),true);
          setTimeout(()=>location.href='/user/bot-trading.html',700);
        }catch(ex){toast(ex.response?.data?.message||ex.message,false);}
      };
    }
    const stopBtn=root.querySelector('#stopBotBtn');
    if(stopBtn && s){
      stopBtn.onclick=async()=>{
        if(!confirm('Stop this subscription? Your balance will be returned.'))return;
        try{
          const x=await post('/bots/stop/'+s._id,{});
          toast(x.message||(`Subscription stopped. ${money(s.invested_amount)} credited to your balance.`),true);
          setTimeout(()=>location.href='/user/bot-trading.html',700);
        }catch(ex){toast(ex.response?.data?.message||ex.message,false);}
      };
    }
  }
    
    async function mining(){
    const root=inner();
    showDynamicMain();
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]">Loading mining...</div>';
    let d;
    try{d=await get('/mining');}catch(e){toast(e.message,false);return;}
    const plans=d.plans||[];
    const subs=d.subscriptions||[];
    const active=subs.filter(x=>String(x.status)==='active');
    const totalEarn=Number(d.totalEarnings||active.reduce((s,x)=>s+Number(x.accumulated_profit||0),0));
    const activeInvest=active.reduce((s,x)=>s+Number(x.invested_amount||0),0);

    function daysLeft(exp){
      if(!exp) return 0;
      const ms=new Date(exp)-Date.now();
      return Math.max(0, Math.ceil(ms/86400000));
    }
    function progress(s){
      const start=new Date(s.started_at).getTime();
      const end=new Date(s.expires_at).getTime();
      if(!start||!end||end<=start) return 0;
      return Math.min(100, Math.max(0, ((Date.now()-start)/(end-start))*100));
    }
    function color(p){return p.icon_color||'#4a6cf7';}

    function planCard(p){
      const c=color(p);
      const monthly=(Number(p.daily_roi_percentage||0)*30).toFixed(1);
      return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px] mb-[9px]" data-plan-card="${p._id}">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-3">
            <div class="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center" style="background:${c}22;border:1px solid ${c}44">
              <i class="fa-solid fa-microchip" style="color:${c}"></i>
            </div>
            <div>
              <div class="text-white font-medium text-[.95rem]">${esc(p.name)}</div>
              <div class="text-[#555] text-[.72rem]">${esc(p.hashrate||'')}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-grn font-bold text-[.95rem]">${Number(p.daily_roi_percentage||0).toFixed(2)}%</div>
            <div class="text-[#555] text-[.62rem]">Daily ROI</div>
          </div>
        </div>
        <p class="text-[#666] text-[.76rem] mb-3">${esc(p.description||'')}</p>
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-[10px] text-center">
            <div class="text-[#555] text-[.6rem] uppercase mb-1">Min</div>
            <div class="text-blue2 font-sora font-medium text-[.85rem]">${money(p.min_investment)}</div>
          </div>
          <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-[10px] text-center">
            <div class="text-[#555] text-[.6rem] uppercase mb-1">Duration</div>
            <div class="text-white font-sora font-medium text-[.85rem]">${Number(p.duration_days||0)}d</div>
          </div>
          <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-[10px] text-center">
            <div class="text-[#555] text-[.6rem] uppercase mb-1">Monthly</div>
            <div class="text-grn font-sora font-medium text-[.85rem]">${monthly}%</div>
          </div>
        </div>
        <button type="button" data-start-mine="${p._id}" class="w-full py-[12px] rounded-[10px] bg-blue2 text-white text-[.88rem] font-medium">Start Mining</button>
        <div class="hidden mt-3 pt-3 border-t border-[#1a1a1a]" data-mine-form="${p._id}">
          <div class="text-[.8rem] text-[#888] mb-2">Subscribe to <span class="text-white font-medium">${esc(p.name)}</span></div>
          <div class="text-[.7rem] text-[#555] mb-1">Amount (${money(p.min_investment)} – ${p.max_investment?money(p.max_investment):'∞'})</div>
          <input type="number" min="${Number(p.min_investment||0)}" step="0.01" data-mine-amount="${p._id}" class="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-white mb-2 outline-none" placeholder="${Number(p.min_investment||0)}">
          <div class="text-[.7rem] text-[#555] mb-3">Est. daily: <span class="text-grn" data-est-daily="${p._id}">$0.00</span> · Duration: ${Number(p.duration_days||0)} days</div>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" data-cancel-mine="${p._id}" class="py-2.5 rounded-[10px] border border-[#1e1e1e] text-[#888] text-[.8rem]">Cancel</button>
            <button type="button" data-confirm-mine="${p._id}" class="py-2.5 rounded-[10px] bg-blue2 text-white text-[.8rem] font-medium">Confirm</button>
          </div>
        </div>
      </div>`;
    }

    function activeCard(s){
      const p=s.mining_plan_id||{};
      const c=color(p);
      const pct=progress(s);
      const left=daysLeft(s.expires_at);
      return `<div class="mx-[18px] mb-[9px] bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
        <div class="flex items-center justify-between mb-[10px]">
          <div class="flex items-center gap-[10px]">
            <div class="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center" style="background:${c}22;border:1px solid ${c}44">
              <i class="fa-solid fa-microchip" style="color:${c}"></i>
            </div>
            <div>
              <div class="text-[.9rem] font-medium text-white">${esc(p.name||'Rig')}</div>
              <div class="text-[.75rem] text-[#444]">${esc(p.hashrate||'')}</div>
            </div>
          </div>
          <span class="text-[.65rem] font-bold px-[8px] py-[4px] rounded-[6px]" style="background:rgba(0,212,124,.1);color:#00d47c">ACTIVE</span>
        </div>
        <div class="grid grid-cols-3 gap-[9px] mb-[12px]">
          <div>
            <div class="text-[.65rem] uppercase tracking-[.07em] text-[#444] mb-[2px]">Invested</div>
            <div class="font-sora text-[.88rem] font-bold text-blue2">${money(s.invested_amount)}</div>
          </div>
          <div>
            <div class="text-[.65rem] uppercase tracking-[.07em] text-[#444] mb-[2px]">Earned</div>
            <div class="font-sora text-[.88rem] font-bold text-grn">${money(s.accumulated_profit)}</div>
          </div>
          <div>
            <div class="text-[.65rem] uppercase tracking-[.07em] text-[#444] mb-[2px]">Days Left</div>
            <div class="font-sora text-[.88rem] font-bold text-white">${left}</div>
          </div>
        </div>
        <div class="mb-[10px]">
          <div class="flex justify-between mb-[4px]">
            <div class="text-[.65rem] text-[#444]">Progress</div>
            <div class="text-[.65rem] text-[#444]">${pct.toFixed(0)}%</div>
          </div>
          <div class="h-[4px] bg-[#1a1a1a] rounded-full overflow-hidden">
            <div class="h-full rounded-full" style="width:${pct}%;background:linear-gradient(90deg,#4a6cf7,#6e8efb)"></div>
          </div>
        </div>
        <div class="flex gap-[9px]">
          <a href="/user/subscription-mining.html?id=${s._id}" class="flex-1 text-center py-[10px] rounded-[10px] text-[.8rem] font-medium text-[#6e8efb] bg-[rgba(74,108,247,.08)] border border-[rgba(74,108,247,.15)]">View Details</a>
          <button type="button" data-stop-rig="${s._id}" class="flex-1 py-[10px] rounded-[10px] text-[.8rem] font-medium text-[#ff4560] bg-[rgba(255,69,96,.08)] border border-[rgba(255,69,96,.15)]">Stop Rig</button>
        </div>
      </div>`;
    }

    root.innerHTML=`
<div class="mb-[10px] flex items-center gap-3">
  <div class="inner-back" onclick="history.back()"><i class="fa-solid fa-chevron-left"></i></div>
  <div class="inner-title">Cloud Mining</div>
</div>

<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px] mb-[9px]">
  <div class="flex items-center gap-2 mb-1">
    <div class="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center"><i class="fa-solid fa-coins text-orange-400 text-xs"></i></div>
    <div class="text-[#555] text-[.68rem] uppercase tracking-wide">Total Mining Earnings</div>
  </div>
  <div class="text-grn text-[1.4rem] font-sora font-bold">${money(totalEarn)}</div>
  <div class="grid grid-cols-2 gap-2 mt-3">
    <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-3">
      <div class="text-[#555] text-[.62rem] uppercase">Active Investment</div>
      <div class="text-white font-sora font-bold mt-1">${money(activeInvest)}</div>
    </div>
    <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-3">
      <div class="text-[#555] text-[.62rem] uppercase">Active Rigs</div>
      <div class="text-white font-sora font-bold mt-1">${active.length}</div>
    </div>
  </div>
</div>

${active.length?`<div class="h-2 bg-[#0a0a0a] border-t border-b border-[#111] my-[0]"></div>
<div class="px-[18px] pt-[16px] pb-[6px]"><div class="text-[.68rem] uppercase tracking-[.07em] text-[#444]">Your Active Rigs</div></div>
${active.map(activeCard).join('')}
<div class="h-2 bg-[#0a0a0a] border-t border-b border-[#111]"></div>`:''}

<div class="px-[0] pt-[12px] pb-[6px]"><div class="text-[.68rem] uppercase tracking-[.07em] text-[#444] mb-2">Available Plans</div></div>
${plans.length?plans.map(planCard).join(''):'<div class="text-center py-12 text-[#555]">No mining plans available.</div>'}
`;

    // bind start forms
    root.querySelectorAll('[data-start-mine]').forEach(btn=>{
      btn.onclick=()=>{
        const id=btn.dataset.startMine;
        const form=root.querySelector(`[data-mine-form="${id}"]`);
        root.querySelectorAll('[data-mine-form]').forEach(f=>f.classList.add('hidden'));
        form?.classList.remove('hidden');
      };
    });
    root.querySelectorAll('[data-cancel-mine]').forEach(btn=>{
      btn.onclick=()=>root.querySelector(`[data-mine-form="${btn.dataset.cancelMine}"]`)?.classList.add('hidden');
    });
    root.querySelectorAll('[data-mine-amount]').forEach(inp=>{
      const id=inp.dataset.mineAmount;
      const p=plans.find(x=>String(x._id)===String(id));
      const upd=()=>{
        const amt=Number(inp.value||0);
        const daily=amt*(Number(p?.daily_roi_percentage||0)/100);
        const el=root.querySelector(`[data-est-daily="${id}"]`);
        if(el) el.textContent=money(daily);
      };
      inp.oninput=upd;
    });
    root.querySelectorAll('[data-confirm-mine]').forEach(btn=>{
      btn.onclick=async()=>{
        const id=btn.dataset.confirmMine;
        const amount=Number(root.querySelector(`[data-mine-amount="${id}"]`)?.value||0);
        if(amount<=0){toast('Enter investment amount',false);return;}
        try{
          const x=await post('/mining/start',{mining_plan_id:id,amount});
          toast(x.message||'Mining subscription started! Your rig is now active.',true);
          setTimeout(()=>mining(),400);
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    });
    root.querySelectorAll('[data-stop-rig]').forEach(btn=>{
      btn.onclick=async()=>{
        if(!confirm('Stop this mining subscription?')) return;
        try{
          const x=await post('/mining/stop/'+btn.dataset.stopRig,{});
          toast(x.message||'mining rig stopped successfully',true);
          setTimeout(()=>mining(),400);
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    });
  }

async function miningSubscription(){
    const root=inner();
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Subscription id required',false);return;}
    if(root) root.innerHTML='<div class="p-8 text-center text-[#555]">Loading...</div>';
    let d;
    try{d=await get('/mining/subscription/'+id);}catch(e){toast(e.message,false);return;}
    const s=d.subscription||{};
    const p=s.mining_plan_id||{};
    const start=new Date(s.started_at).getTime();
    const end=new Date(s.expires_at).getTime();
    const progress=(!start||!end||end<=start)?0:Math.min(100,Math.max(0,((Date.now()-start)/(end-start))*100));
    const left=Math.max(0, Math.ceil((end-Date.now())/86400000));
    const c=p.icon_color||'#4a6cf7';
    const active=String(s.status)==='active';
    const payout=Number(s.invested_amount||0)+Number(s.accumulated_profit||0)+Number(s.admin_profit_adjustment||0);
    root.innerHTML=`
<div class="mb-[10px] flex items-center gap-3">
  <div class="inner-back" onclick="location.href='/user/mining.html'"><i class="fa-solid fa-chevron-left"></i></div>
  <div class="inner-title">Mining Subscription</div>
</div>
<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px] mb-3">
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-3">
      <div class="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center" style="background:${c}22;border:1px solid ${c}44"><i class="fa-solid fa-microchip" style="color:${c}"></i></div>
      <div>
        <div class="text-white font-medium">${esc(p.name||'Rig')}</div>
        <div class="text-[#555] text-[.72rem]">${esc(p.hashrate||'')}</div>
      </div>
    </div>
    <span class="text-[.65rem] font-bold px-[8px] py-[4px] rounded-[6px]" style="background:${active?'rgba(0,212,124,.1)':'rgba(255,69,96,.1)'};color:${active?'#00d47c':'#ff4560'}">${esc(String(s.status||'').toUpperCase())}</span>
  </div>
  <div class="text-[.68rem] text-[#555] mb-1">Mining Progress</div>
  <div class="flex justify-between text-[.65rem] text-[#444] mb-1"><span></span><span>${progress.toFixed(0)}%</span></div>
  <div class="h-[4px] bg-[#1a1a1a] rounded-full overflow-hidden mb-3"><div class="h-full rounded-full" style="width:${progress}%;background:linear-gradient(90deg,#4a6cf7,#6e8efb)"></div></div>
  <div class="grid grid-cols-2 gap-2 mb-3">
    <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-3"><div class="text-[#555] text-[.62rem] uppercase">Invested</div><div class="text-blue2 font-sora font-bold mt-1">${money(s.invested_amount)}</div></div>
    <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-3"><div class="text-[#555] text-[.62rem] uppercase">Earned</div><div class="text-grn font-sora font-bold mt-1">${money(s.accumulated_profit)}</div></div>
    <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-3"><div class="text-[#555] text-[.62rem] uppercase">Daily ROI</div><div class="text-white font-sora font-bold mt-1">${Number(s.daily_roi_snapshot||p.daily_roi_percentage||0).toFixed(2)}%</div></div>
    <div class="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[10px] p-3"><div class="text-[#555] text-[.62rem] uppercase">Days Left</div><div class="text-white font-sora font-bold mt-1">${left}</div></div>
  </div>
  <div class="space-y-2 text-[.8rem]">
    <div class="flex justify-between border-b border-[#1a1a1a] py-2"><span class="text-[#555]">Plan</span><span class="text-white">${esc(p.name||'')}</span></div>
    <div class="flex justify-between border-b border-[#1a1a1a] py-2"><span class="text-[#555]">Hashrate</span><span class="text-white">${esc(p.hashrate||'')}</span></div>
    <div class="flex justify-between border-b border-[#1a1a1a] py-2"><span class="text-[#555]">Started</span><span class="text-white">${s.started_at?new Date(s.started_at).toLocaleString():'—'}</span></div>
    <div class="flex justify-between border-b border-[#1a1a1a] py-2"><span class="text-[#555]">Expires</span><span class="text-white">${s.expires_at?new Date(s.expires_at).toLocaleString():'—'}</span></div>
    <div class="flex justify-between py-2"><span class="text-[#555]">Est. Total Payout</span><span class="text-grn font-medium">${money(payout)}</span></div>
  </div>
</div>
${active?`<div class="text-[.72rem] text-[#777] bg-[rgba(245,197,66,.06)] border border-[rgba(245,197,66,.12)] rounded-[10px] p-3 mb-3"><i class="fa-solid fa-circle-info text-ylw mr-1"></i> Stopping your rig early means your funds will be held until admin settlement. Completed rigs are settled automatically.</div>
<button type="button" id="stopRigBtn" class="w-full py-3 rounded-[12px] text-[.9rem] font-medium text-red2 bg-[rgba(255,69,96,.08)] border border-[rgba(255,69,96,.2)]">Stop Mining Rig</button>`:''}
`;
    if(active){
      root.querySelector('#stopRigBtn').onclick=async()=>{
        if(!confirm('Stop this mining subscription?')) return;
        try{
          const x=await post('/mining/stop/'+id,{});
          toast(x.message||'mining rig stopped successfully',true);
          setTimeout(()=>location.href='/user/mining.html',500);
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    }
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
    function adminMain(){ const main=document.querySelector('main')||document.getElementById('main-content'); if(!main)return document.body; return main.querySelector(':scope > div.p-4')||main.querySelector(':scope > div[class*="p-4"]')||main.querySelector(':scope > div')||main;
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
    const m=adminMain();
    showDynamicMain();
    if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/experts');
    const experts=d.experts||[];
    let positions=[];
    try{const cp=await get('/copy-positions'); positions=cp.positions||[];}catch(e){}
    const activeExperts=experts.filter(x=>x.is_active!==false).length;
    const activeCopiers=positions.filter(x=>x.status==='active').length;
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Manage Expert Traders</h1><p class="text-sm text-content-muted mt-1">Create and manage copy trading experts</p></div><a href="/admin/admin-experts-create.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">+ Add New Expert</a></div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">${[['TOTAL EXPERTS',experts.length,'fa-users'],['ACTIVE EXPERTS',activeExperts,'fa-circle-check'],['TOTAL ACTIVE COPIERS',activeCopiers,'fa-file-lines']].map(([l,v,ico])=>`<div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div class="flex justify-between"><div class="text-xs text-slate-500 uppercase tracking-wide">${l}</div><i class="fa-solid ${ico} text-teal-300"></i></div><div class="text-2xl font-bold text-slate-900 mt-2">${v}</div></div>`).join('')}</div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto"><div class="px-4 py-3 border-b border-slate-100 font-medium text-content">Expert Traders</div>
    <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-4 py-3">Photo</th><th>Name</th><th>Expertise</th><th>Daily ROI</th><th>Duration</th><th>Followers</th><th>Active Copiers</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    ${experts.map(e=>{const copiers=positions.filter(p=>String(p.expert_id?._id||p.expert_id||p.expert?._id)===String(e._id)&&p.status==='active').length;const active=e.is_active!==false;const photo=e.profile_picture?`<img src="${esc(e.profile_picture)}" class="w-9 h-9 rounded-full object-cover">`:`<div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">${esc(String(e.name||'?')[0])}</div>`;
    return `<tr class="border-t border-slate-100"><td class="px-4 py-3">${photo}</td><td class="font-medium text-content">${esc(e.name)}</td><td><span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${esc(e.area_of_expertise||'Mixed')}</span></td><td class="text-emerald-600 font-medium">${Number(e.daily_roi||0).toFixed(2)}%</td><td>${Number(e.duration_days||30)} days</td><td>${Number(e.followers_count||0).toLocaleString()}</td><td>${copiers}</td><td><span class="text-xs ${active?'text-emerald-600':'text-slate-400'}">${active?'Active':'Inactive'}</span></td><td class="whitespace-nowrap"><div class="flex items-center gap-1.5">
            <a href="/admin/admin-experts-view.html?id=${e._id}" class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="View"><i class="fa-regular fa-eye text-sm"></i></a>
            <a href="/admin/admin-experts-edit.html?id=${e._id}" class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Edit"><i class="fa-solid fa-pen text-sm"></i></a>
            <button type="button" data-toggle-expert="${e._id}" class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-amber-50" title="${active?'Deactivate':'Activate'}"><i class="fa-solid fa-power-off text-sm"></i></button>
            <button type="button" data-del-expert="${e._id}" class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50" title="Delete"><i class="fa-regular fa-trash-can text-sm"></i></button>
          </div></td></tr>`;}).join('')||'<tr><td colspan="9" class="py-10 text-center text-content-muted">No experts yet</td></tr>'}
    </tbody></table></div>`;
    m.querySelectorAll('[data-toggle-expert]').forEach(btn=>{btn.onclick=async()=>{try{const x=await post('/experts/'+btn.dataset.toggleExpert+'/toggle',{});toast(x.message||'Status updated',true);adminExperts();}catch(e){toast(e.message,false);}};});
    m.querySelectorAll('[data-del-expert]').forEach(btn=>{btn.onclick=async()=>{if(!confirm('Delete this expert?'))return;try{const x=await del('/experts/'+btn.dataset.delExpert);toast(x.message||'Expert deleted successfully.',true);adminExperts();}catch(e){toast(e.message,false);}};});
  }
    async function adminExpertForm(edit){
    const m=adminMain(); showDynamicMain();
    const id=edit?new URLSearchParams(location.search).get('id'):null; let e={};
    if(edit&&id){try{e=(await get('/experts/'+id)).expert||{};}catch(err){toast(err.message,false);}}
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${edit?'Edit Expert: '+esc(e.name||''):'Create New Expert'}</h1><p class="text-sm text-content-muted mt-1">${edit?'Update expert trader details':'Add a new expert trader for copy trading'}</p></div><a href="/admin/admin-experts.html" class="px-4 py-2 rounded-lg border border-border text-sm">Cancel</a></div>
    <form id="expertForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
      <div class="font-medium text-content">Basic Information</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium">Name *</span><input name="name" required value="${esc(e.name||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Area of Expertise *</span><select name="area_of_expertise" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${['Crypto','Forex','Stocks','Mixed','Commodities'].map(x=>`<option ${String(e.area_of_expertise||'Crypto')===x?'selected':''}>${x}</option>`).join('')}</select></label>
      </div>
      <label class="block text-sm"><span class="font-medium">Bio</span><textarea name="bio" rows="3" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Expert description...">${esc(e.bio||'')}</textarea></label>
      <div><div class="text-sm font-medium mb-2">Profile Picture</div>${e.profile_picture?`<img src="${esc(e.profile_picture)}" class="w-16 h-16 rounded-full object-cover mb-2">`:''}<div class="flex items-center gap-4 mb-2"><div id="expertPhotoPreview" class="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 text-xs">${e.profile_picture?`<img src="${esc(e.profile_picture)}" class="w-full h-full object-cover">`:`No photo`}</div>
        <input type="file" name="profile_picture" id="expertPhotoInput" accept="image/jpeg,image/png,image/webp" class="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100"></div>
        <p class="text-xs text-content-muted mt-1">JPG, JPEG, PNG — Max 2MB${edit?' · Leave empty to keep current photo':''}</p></div>
      <div class="font-medium text-content">Trading Configuration</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label class="block text-sm"><span class="font-medium">Daily ROI (%) *</span><input name="daily_roi" type="number" step="0.01" required value="${e.daily_roi??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Duration (days) *</span><input name="duration_days" type="number" required value="${e.duration_days??30}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Win Rate (%) *</span><input name="win_rate" type="number" step="0.01" required value="${e.win_rate??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Min Capital ($) *</span><input name="min_startup_capital" type="number" step="0.01" required value="${e.min_startup_capital??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Max Capital ($)</span><input name="max_capital" type="number" step="0.01" value="${e.max_capital??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Leave empty for no limit"></label>
        <label class="block text-sm"><span class="font-medium">Profit Share (%) *</span><input name="profit_share_percentage" type="number" step="0.01" required value="${e.profit_share_percentage??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      </div>
      <div class="font-medium text-content">Display Stats (Admin-Controlled)</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium">Followers Count</span><input name="followers_count" type="number" value="${e.followers_count??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Total ROI (%)</span><input name="total_roi" type="number" step="0.01" value="${e.total_roi??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      </div>
      <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1" ${e.is_active!==false?'checked':''}> Active</label>
      <div class="flex gap-3"><button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium">${edit?'Update Expert':'Create Expert'}</button><a href="/admin/admin-experts.html" class="px-5 py-2.5 rounded-lg border border-border text-sm">Cancel</a></div>
    </form>`;
    const photoIn=m.querySelector('#expertPhotoInput');
    if(photoIn){photoIn.addEventListener('change',()=>{const f=photoIn.files&&photoIn.files[0];const box=m.querySelector('#expertPhotoPreview');if(!box)return;if(!f){return;}const url=URL.createObjectURL(f);box.innerHTML='<img src="'+url+'" class="w-full h-full object-cover">';});}
    m.querySelector('#expertForm').onsubmit=async ev=>{
      ev.preventDefault();
      const form=ev.currentTarget; const fd=new FormData(form);
      fd.set('is_active', form.querySelector('[name=is_active]').checked?'true':'false');
      try{
        const path=edit&&id?'/experts/'+id:'/experts';
        // multipart via axios
        const cfg={headers:{'Content-Type':'multipart/form-data'}};
        let x;
        if(edit) x=(await window.api.put('/admin/dashboard/feature'+path.replace('/experts','/experts'), fd, cfg).catch(()=>null));
        // feature get/post helpers use relative feature paths with prefix
        const base=(window.api.defaults&&window.api.defaults.baseURL)||'';
        if(edit) await window.api.put('/admin/dashboard/feature/experts/'+id, fd, cfg);
        else await window.api.post('/admin/dashboard/feature/experts', fd, cfg);
        toast(edit?'Expert trader updated successfully.':'Expert created successfully.',true);
        setTimeout(()=>location.href='/admin/admin-experts.html',600);
      }catch(err){toast(err.response?.data?.message||err.message||'Save failed',false);}
    };
  }
    async function adminExpertView(){
    const m=adminMain(); showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Expert id required',false);return;}
    m.innerHTML='<div class="p-8 text-center text-content-muted">Loading...</div>';
    const d=await get('/experts/'+id); const e=d.expert||{}; const positions=d.positions||[];
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${esc(e.name||'Expert')}</h1><p class="text-sm text-content-muted mt-1">Expert trader profile and active copy positions</p></div><div class="flex gap-2"><a href="/admin/admin-experts-edit.html?id=${e._id}" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Edit Expert</a><a href="/admin/admin-experts.html" class="px-4 py-2 rounded-lg border border-border text-sm">Back to List</a></div></div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-4 flex items-center gap-4">${e.profile_picture?`<img src="${esc(e.profile_picture)}" class="w-14 h-14 rounded-full object-cover">`:`<div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-semibold">${esc(String(e.name||'?')[0])}</div>`}<div><div class="font-semibold text-lg">${esc(e.name)}</div><div class="text-sm text-content-muted"><span class="mr-2">${esc(e.area_of_expertise||'')}</span><span class="${e.is_active!==false?'text-emerald-600':'text-slate-400'}">${e.is_active!==false?'Active':'Inactive'}</span></div></div></div>
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">${[['DAILY ROI',Number(e.daily_roi||0).toFixed(2)+'%'],['DURATION',(e.duration_days||30)+' days'],['FOLLOWERS',Number(e.followers_count||0).toLocaleString()],['TOTAL ROI',Number(e.total_roi||0).toFixed(2)+'%'],['MIN CAPITAL',money(e.min_startup_capital)],['WIN RATE',Number(e.win_rate||0).toFixed(2)+'%']].map(([l,v])=>`<div class="bg-white rounded-xl border border-slate-200 p-4"><div class="text-xs text-slate-500 uppercase">${l}</div><div class="text-lg font-bold mt-1">${esc(v)}</div></div>`).join('')}</div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto"><div class="px-4 py-3 border-b border-slate-100 font-medium">Copy Positions</div>
    <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-4 py-3">User</th><th>Invested</th><th>Profit</th><th>Started</th><th>Expires</th><th>Status</th><th></th></tr></thead>
    <tbody>${positions.length?positions.map(p=>`<tr class="border-t border-slate-100"><td class="px-4 py-3">${esc(p.user_id?.name||'—')}</td><td>${money(p.invested_amount)}</td><td class="text-emerald-600">${money(p.accumulated_profit)}</td><td>${dt(p.started_at||p.createdAt)}</td><td>${dt(p.expires_at)}</td><td><span class="text-xs">${esc(p.status)}</span></td><td><a href="/admin/viewUser-copy-trades.html?id=${p._id}" class="text-primary text-sm">View</a></td></tr>`).join(''):'<tr><td colspan="7" class="py-8 text-center text-content-muted">No copy positions</td></tr>'}</tbody></table></div>`;
  }
    async function adminCopyTrades(){
    const m=adminMain(); showDynamicMain();
    if(!m){ console.error('adminMain not found'); return; }
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d={positions:[],stats:{}};
    try{ d=await get('/copy-positions'); }catch(err){ toast(err.response?.data?.message||err.message||'Failed to load copy positions',false); }
    const positions=d.positions||[]; const stats=d.stats||{};
    const active=positions.filter(x=>x.status==='active');
    const stopped=positions.filter(x=>x.status==='stopped');
    const completed=positions.filter(x=>x.status==='completed');
    const settled=positions.filter(x=>x.status==='settled');
    function rows(list){if(!list.length)return '<tr><td colspan="10" class="py-8 text-center text-content-muted">No records</td></tr>';
      return list.map(p=>{const inv=Number(p.invested_amount||0);const profit=Number(p.accumulated_profit||0);const adj=Number(p.admin_adjustment||0);const payout=inv+profit+adj;
        return `<tr class="border-t border-slate-100"><td class="px-4 py-3"><input type="checkbox" data-sel="${p._id}" class="rounded"></td><td>${esc(p.user_id?.name||'—')}<div class="text-xs text-content-muted">${esc(p.user_id?.email||'')}</div></td><td>${esc(p.expert_id?.name||p.expert?.name||'—')}</td><td>${money(inv)}</td><td class="text-emerald-600">${money(profit)}</td><td>${adj?money(adj):'—'}</td><td class="font-medium">${money(payout)}</td><td><span class="text-xs">${esc(p.status)}</span></td><td>${dt(p.started_at||p.createdAt)}</td><td><a href="/admin/viewUser-copy-trades.html?id=${p._id}" class="text-primary text-sm">View</a></td></tr>`;}).join('');}
    m.innerHTML=`<div class="mb-6"><h1 class="text-xl font-semibold text-content">Manage Copy Trades</h1><p class="text-sm text-content-muted mt-1">View and manage all user copy trading positions</p></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">${[['ACTIVE COPIES',stats.activeCopies??active.length],['TOTAL INVESTED',money(stats.totalInvested??positions.reduce((s,p)=>s+Number(p.invested_amount||0),0))],['TOTAL PROFIT',money(stats.totalProfit??positions.reduce((s,p)=>s+Number(p.accumulated_profit||0),0))],['SETTLED POSITIONS',stats.settledPositions??(settled.length+completed.length+stopped.length)]].map(([l,v])=>`<div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div class="text-xs text-slate-500 uppercase">${l}</div><div class="text-2xl font-bold mt-2">${v}</div></div>`).join('')}</div>
    <div class="flex flex-wrap gap-2 mb-4 items-center" id="copyFilters">${[['all','All'],['active','Active'],['stopped','Stopped'],['completed','Completed'],['settled','Settled']].map(([k,l],i)=>`<button type="button" data-filter="${k}" class="px-3 py-1.5 rounded-full text-sm ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600'}">${l}</button>`).join('')}<input id="copySearch" type="search" placeholder="Search user or expert..." class="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm"></div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto"><div class="px-4 py-3 border-b border-slate-100 font-medium">Copy Positions</div>
    <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-4 py-3"></th><th>User</th><th>Expert</th><th>Invested</th><th>Profit</th><th>Adjustment</th><th>Total Payout</th><th>Status</th><th>Started</th><th></th></tr></thead>
    <tbody id="copyRows">${rows(positions)}</tbody></table></div>`;
    const tbody=m.querySelector('#copyRows');
    function applyFilter(){const f=m.querySelector('#copyFilters [data-filter].bg-primary')?.dataset.filter||'all';const q=(m.querySelector('#copySearch').value||'').toLowerCase();let list=positions;if(f!=='all')list=list.filter(p=>p.status===f);if(q)list=list.filter(p=>String(p.user_id?.name||'').toLowerCase().includes(q)||String(p.expert_id?.name||p.expert?.name||'').toLowerCase().includes(q));tbody.innerHTML=rows(list);}
    m.querySelectorAll('#copyFilters [data-filter]').forEach(btn=>{btn.onclick=()=>{m.querySelectorAll('#copyFilters [data-filter]').forEach(b=>{b.className='px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600';});btn.className='px-3 py-1.5 rounded-full text-sm bg-primary text-white';applyFilter();};});
    m.querySelector('#copySearch').oninput=applyFilter;
  }
    async function adminCopyTradeView(){
    showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    let root=document.getElementById('adminDynamicRoot');
    if(!root){
      const main=document.querySelector('main');
      if(main){
        root=main.querySelector('.p-4.lg\:p-6')||main.querySelector('[class*="p-4"]')||main;
      }
    }
    if(!root) root=adminMain();
    if(!root){console.error('viewUser root missing');return;}
    if(!id){
      root.innerHTML='<div class="p-8 text-center text-content-muted">Open a position from <a class="text-primary" href="/admin/user-copy-trades.html">Copy Trades</a> (missing id).</div>';
      return;
    }
    root.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading position...</div>';
    let d;
    try{ d=await get('/copy-positions/'+encodeURIComponent(id)); }
    catch(err){
      root.innerHTML='<div class="p-8 text-center text-danger">'+(err.response?.data?.message||err.message||'Failed to load position')+'</div>';
      return;
    }
    const p=d.position||{};
    const e=p.expert_id||p.expert||{};
    const u=p.user_id||{};
    const inv=Number(p.invested_amount||0);
    const profit=Number(p.accumulated_profit||0);
    const adj=Number(p.admin_profit_adjustment!=null?p.admin_profit_adjustment:(p.admin_adjustment||0));
    const payout=inv+profit+adj;
    const daily=Number(p.daily_roi||e.daily_roi||0);
    const totalDays=Number(p.duration_days||e.duration_days||30);
    const started=p.started_at||p.createdAt;
    const expires=p.expires_at;
    const dayNum=started?Math.min(totalDays,Math.max(0,Math.floor((Date.now()-new Date(started))/86400000))):0;
    const remain=Math.max(0,totalDays-dayNum);
    const status=String(p.status||'active').toLowerCase();
    const statusCls=status==='active'?'bg-success-light text-success':status==='settled'?'bg-warning-light text-warning':status==='stopped'?'bg-danger-light text-danger':status==='completed'?'bg-info-light text-info':'bg-surface-alt text-content-secondary';
    const fmtDT=(v)=>{if(!v)return '—';try{const d=new Date(v);return d.toLocaleString(undefined,{month:'short',day:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return '—';}};
    const trades=p.simulated_trades||p.trades||d.trades||[];
    const cur=u.currency_code||'$';

    let actionsHtml='';
    if(status==='settled'){
      actionsHtml='<p class="text-sm text-content-muted">This position is settled. No further actions available.</p>';
    } else {
      actionsHtml=`<button type="button" id="settleBtn" class="w-full mb-4 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2.5 text-sm font-medium">Settle &amp; Credit User — ${money(payout)}</button>`;
      if(status==='active'){
        actionsHtml+=`<button type="button" id="forceStopBtn" class="w-full bg-danger text-white hover:bg-danger/90 rounded-lg px-4 py-2.5 text-sm font-medium">Force Stop</button>`;
      }
    }

    root.innerHTML=`
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 class="text-2xl font-semibold text-content tracking-tight">Copy Position</h1>
    <p class="mt-1 text-sm text-content-secondary">Manage copy trading position details</p>
  </div>
  <div class="flex items-center gap-3">
    <a href="/admin/user-copy-trades.html" class="bg-surface-alt text-content border border-border hover:bg-surface-alt/80 rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
      Back to Copy Trades
    </a>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <div class="bg-surface-card rounded-xl border border-border shadow-card p-6">
    <h3 class="text-base font-semibold text-content mb-4">Position Details</h3>
    <div class="space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-content-secondary">User</span>
        <div class="text-right">
          <div class="font-medium text-content">${esc(u.name||'—')}</div>
          <div class="text-xs text-content-muted">${esc(u.email||'')}</div>
        </div>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-content-secondary">Expert</span>
        <div class="flex items-center gap-2">
          ${e.profile_picture?`<img src="${esc(e.profile_picture)}" class="w-6 h-6 rounded-full object-cover" alt="">`:''}
          <span class="font-medium text-content">${esc(e.name||'—')}</span>
        </div>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-content-secondary">Expertise</span>
        <span class="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface-alt text-content-secondary">${esc(e.area_of_expertise||'—')}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-content-secondary">Status</span>
        <span class="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${statusCls}">${esc(status.charAt(0).toUpperCase()+status.slice(1))}</span>
      </div>
      <div class="flex justify-between text-sm"><span class="text-content-secondary">Started</span><span class="text-content">${esc(fmtDT(started))}</span></div>
      <div class="flex justify-between text-sm"><span class="text-content-secondary">Expires</span><span class="text-content">${esc(fmtDT(expires))}</span></div>
      <div class="flex justify-between text-sm"><span class="text-content-secondary">Days Remaining</span><span class="text-content font-medium">${remain} of ${totalDays} days</span></div>
    </div>
  </div>

  <div class="bg-surface-card rounded-xl border border-border shadow-card p-6">
    <h3 class="text-base font-semibold text-content mb-4">Financial Summary</h3>
    <div class="space-y-3">
      <div class="flex justify-between text-sm"><span class="text-content-secondary">Invested Amount</span><span class="font-medium text-content">${money(inv)}</span></div>
      <div class="flex justify-between text-sm"><span class="text-content-secondary">Daily ROI</span><span class="text-success font-medium">${daily.toFixed(2)}%</span></div>
      <div class="flex justify-between text-sm"><span class="text-content-secondary">Accumulated Profit</span><span class="text-success font-medium">${money(profit)}</span></div>
      <div class="flex justify-between text-sm"><span class="text-content-secondary">Admin Adjustment</span><span class="${adj?'font-medium text-content':'text-content-muted'}">${adj?money(adj):'—'}</span></div>
      <hr class="border-border">
      <div class="flex justify-between"><span class="text-content font-medium">Total Payout</span><span class="text-2xl text-content font-bold">${money(payout)}</span></div>
    </div>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <div class="bg-surface-card rounded-xl border border-border shadow-card p-6">
    <h3 class="text-base font-semibold text-content mb-4">Adjust Profit</h3>
    <form id="adjForm">
      <label for="admin_profit_adjustment" class="block text-sm font-medium text-content mb-1.5">Profit Adjustment ($)</label>
      <input type="number" name="admin_profit_adjustment" id="admin_profit_adjustment" value="${adj}" step="0.01" class="w-full bg-surface-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-content focus:ring-2 focus:ring-primary/30 focus:border-primary">
      <p class="text-xs text-content-muted mt-1">Positive to add, negative to deduct</p>
      <div class="mt-4">
        <label for="admin_notes" class="block text-sm font-medium text-content mb-1.5">Admin Notes</label>
        <textarea name="admin_notes" id="admin_notes" rows="3" class="w-full bg-surface-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-content placeholder:text-content-muted focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y">${esc(p.admin_notes||'')}</textarea>
      </div>
      <button type="submit" class="mt-4 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-medium">Save Adjustment</button>
    </form>
  </div>

  <div class="bg-surface-card rounded-xl border border-border shadow-card p-6" id="posActions">
    <h3 class="text-base font-semibold text-content mb-4">Position Actions</h3>
    ${actionsHtml}
  </div>
</div>

<div class="mt-6">
  <div class="bg-surface-card rounded-xl border border-border shadow-card">
    <div class="flex items-center justify-between px-5 py-4 border-b border-border">
      <h3 class="text-base font-medium text-content">Simulated Trades</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-surface-alt">
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Asset</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Class</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Direction</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Entry</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Exit</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Amount</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">P/L</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Result</th>
            <th class="text-left text-xs font-medium text-content-muted uppercase tracking-wide px-5 py-3">Time</th>
          </tr>
        </thead>
        <tbody>
          ${trades.length?trades.map(tr=>`<tr class="border-t border-border">
            <td class="px-5 py-3">${esc(tr.asset||tr.symbol||'—')}</td>
            <td class="px-5 py-3">${esc(tr.class||tr.asset_class||'—')}</td>
            <td class="px-5 py-3">${esc(tr.direction||tr.side||'—')}</td>
            <td class="px-5 py-3">${esc(tr.entry||tr.entry_price||'—')}</td>
            <td class="px-5 py-3">${esc(tr.exit||tr.exit_price||'—')}</td>
            <td class="px-5 py-3">${money(tr.amount)}</td>
            <td class="px-5 py-3 ${Number(tr.pl||tr.profit_loss||0)>=0?'text-success':'text-danger'}">${money(tr.pl||tr.profit_loss)}</td>
            <td class="px-5 py-3">${esc(tr.result||'—')}</td>
            <td class="px-5 py-3">${esc(fmtDT(tr.time||tr.createdAt))}</td>
          </tr>`).join(''):'<tr><td colspan="9" class="px-5 py-8 text-center text-content-muted">No simulated trades yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
</div>`;

    const adjForm=root.querySelector('#adjForm');
    if(adjForm){
      adjForm.onsubmit=async ev=>{
        ev.preventDefault();
        const fd=new FormData(ev.currentTarget);
        const body={
          admin_profit_adjustment: fd.get('admin_profit_adjustment'),
          admin_notes: fd.get('admin_notes')||''
        };
        try{
          const x=await post('/copy-positions/'+id+'/adjust', body);
          toast(x.message||'Profit adjustment saved',true);
          await adminCopyTradeView();
        }catch(e){toast(e.response?.data?.message||e.message||'Adjustment failed',false);}
      };
    }
    const settleBtn=root.querySelector('#settleBtn');
    if(settleBtn){
      settleBtn.onclick=async()=>{
        if(!confirm('Settle this position? '+money(payout)+' will be credited to the user.'))return;
        try{
          const x=await post('/copy-positions/'+id+'/settle',{});
          toast(x.message||('Position settled. '+money(payout)+' credited to user.'),true);
          await adminCopyTradeView();
        }catch(e){toast(e.response?.data?.message||e.message||'Settle failed',false);}
      };
    }
    const forceBtn=root.querySelector('#forceStopBtn');
    if(forceBtn){
      forceBtn.onclick=async()=>{
        if(!confirm('Force stop this active position?'))return;
        try{
          const x=await post('/copy-positions/'+id+'/force-stop',{});
          toast(x.message||'Position force-stopped.',true);
          await adminCopyTradeView();
        }catch(e){toast(e.response?.data?.message||e.message||'Force stop failed',false);}
      };
    }
  }
    
    async function adminBots(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    const d=await get('/bots');
    const bots=d.bots||[];
    const subs=d.subscriptions||[];
    const stats=d.stats||{};
    m.innerHTML=`<div class="flex items-center justify-between mb-6 flex-wrap gap-3"><div><h1 class="text-xl font-semibold text-content">Manage Trading Bots</h1><p class="text-sm text-content-muted mt-1">Create and manage AI trading bots</p></div>
      <div class="flex gap-2"><a href="/admin/bot-trading-subscriptions.html" class="px-4 py-2 rounded-lg border border-border text-sm">Subscriptions</a>
      <a href="/admin/admin-bot-trading-create.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">+ Create Bot</a></div></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${[['TOTAL BOTS',stats.totalBots??bots.length],['ACTIVE BOTS',stats.activeBots??bots.filter(x=>x.is_active).length],['ACTIVE SUBSCRIBERS',stats.activeSubscribers??subs.filter(x=>x.status==='active').length],['TOTAL INVESTED',money(stats.totalInvested??subs.reduce((s,x)=>s+Number(x.invested_amount||0),0))]].map(([l,v])=>`<div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div class="text-xs text-slate-500 uppercase">${l}</div><div class="text-2xl font-bold mt-2">${v}</div></div>`).join('')}
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <div class="px-4 py-3 border-b border-slate-100 font-medium">Trading Bots</div>
      <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50">
        <th class="px-4 py-3">Bot</th><th>Strategy</th><th>Win Rate</th><th>Daily ROI</th><th>Investment Range</th><th>Interval</th><th>Subscribers</th><th>Status</th><th>Actions</th>
      </tr></thead><tbody>
      ${bots.map(b=>{
        const subCount=subs.filter(s=>String(s.bot_id?._id||s.bot_id)===String(b._id)).length;
        const active=b.is_active!==false;
        return `<tr class="border-t border-slate-100">
          <td class="px-4 py-3"><div class="font-medium text-content">${esc(b.name)}</div><div class="text-xs text-content-muted">Max ${b.max_duration_days||30} days</div></td>
          <td><span class="text-xs px-2 py-0.5 rounded-full bg-slate-100">${esc(b.strategy_type||'')}</span></td>
          <td>${Number(b.win_rate||0).toFixed(1)}%</td>
          <td class="text-emerald-600 font-medium">${Number(b.expected_roi||0).toFixed(2)}%</td>
          <td>${money(b.min_investment)} – ${money(b.max_investment)}</td>
          <td>${b.trade_interval_minutes||5}m</td>
          <td>${subCount}</td>
          <td><span class="text-xs ${active?'text-emerald-600':'text-slate-400'}">${active?'Active':'Inactive'}</span></td>
          <td class="whitespace-nowrap"><div class="flex gap-1">
            <a href="/admin/bot-trading-edit.html?id=${b._id}" class="inline-flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600" title="Edit"><i class="fa-solid fa-pen text-sm"></i></a>
            <button type="button" data-toggle-bot="${b._id}" class="inline-flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600" title="Toggle"><i class="fa-solid fa-power-off text-sm"></i></button>
            <button type="button" data-del-bot="${b._id}" class="inline-flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 text-red-500" title="Delete"><i class="fa-regular fa-trash-can text-sm"></i></button>
          </div></td>
        </tr>`;
      }).join('')||'<tr><td colspan="9" class="py-10 text-center text-content-muted">No bots yet</td></tr>'}
      </tbody></table>
    </div>`;
    m.querySelectorAll('[data-toggle-bot]').forEach(btn=>{
      btn.onclick=async()=>{try{const x=await post('/bots/'+btn.dataset.toggleBot+'/toggle',{});toast(x.message||'Status updated',true);adminBots();}catch(e){toast(e.message,false);}};
    });
    m.querySelectorAll('[data-del-bot]').forEach(btn=>{
      btn.onclick=async()=>{if(!confirm('Delete this trading bot?'))return;try{const x=await del('/bots/'+btn.dataset.delBot);toast(x.message||'Bot deleted successfully.',true);adminBots();}catch(e){toast(e.message,false);}};
    });
  }
    async function adminBotForm(edit){
    const m=adminMain(); showDynamicMain();
    const id=edit?new URLSearchParams(location.search).get('id'):null;
    let b={};
    if(edit&&id){try{b=(await get('/bots/'+id)).bot||{};}catch(e){toast(e.message,false);}}
    const strategies=['Scalping','Day Trading','Swing Trading','Arbitrage','Market Making'];
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${edit?'Edit Bot: '+esc(b.name||''):'Create Trading Bot'}</h1><p class="text-sm text-content-muted mt-1">${edit?'Update trading bot configuration':'Configure a new AI trading bot'}</p></div><a href="/admin/admin-bot-trading.html" class="px-4 py-2 rounded-lg border border-border text-sm">Cancel</a></div>
    <form id="botForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
      <div class="font-medium">Basic Information</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium">Bot Name *</span><input name="name" required value="${esc(b.name||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="e.g. Quantum Trader AI"></label>
        <label class="block text-sm"><span class="font-medium">Strategy Type *</span><select name="strategy_type" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${strategies.map(s=>`<option ${String(b.strategy_type||'Day Trading')===s?'selected':''}>${s}</option>`).join('')}</select></label>
      </div>
      <label class="block text-sm"><span class="font-medium">Description</span><textarea name="description" rows="3" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Describe the bot's trading strategy...">${esc(b.description||'')}</textarea></label>
      <div class="font-medium">Performance Configuration</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label class="block text-sm"><span class="font-medium">Win Rate (%) *</span><input name="win_rate" type="number" step="0.01" required value="${b.win_rate??70}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Expected Daily ROI (%) *</span><input name="expected_roi" type="number" step="0.01" required value="${b.expected_roi??2.5}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Trade Interval (minutes) *</span><input name="trade_interval_minutes" type="number" required value="${b.trade_interval_minutes??5}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      </div>
      <div class="font-medium">Investment Limits</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label class="block text-sm"><span class="font-medium">Min Investment ($) *</span><input name="min_investment" type="number" step="0.01" required value="${b.min_investment??100}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Max Investment ($) *</span><input name="max_investment" type="number" step="0.01" required value="${b.max_investment??50000}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Max Duration (days) *</span><input name="max_duration_days" type="number" required value="${b.max_duration_days??90}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      </div>
      <div class="font-medium">Profit/Loss Ranges (per-trade %)</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 grid grid-cols-2 gap-3">
          <label class="block text-sm"><span class="font-medium">Min Profit (%) *</span><input name="profit_min_pct" type="number" step="0.01" required value="${b.profit_min_pct??0.5}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Max Profit (%) *</span><input name="profit_max_pct" type="number" step="0.01" required value="${b.profit_max_pct??3}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        </div>
        <div class="rounded-xl border border-red-100 bg-red-50/40 p-4 grid grid-cols-2 gap-3">
          <label class="block text-sm"><span class="font-medium">Min Loss (%) *</span><input name="loss_min_pct" type="number" step="0.01" required value="${b.loss_min_pct??0.2}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Max Loss (%) *</span><input name="loss_max_pct" type="number" step="0.01" required value="${b.loss_max_pct??1.5}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        </div>
      </div>
      <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1" ${b.is_active!==false?'checked':''}> Active (visible to users)</label>
      <div class="flex gap-3"><button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium">${edit?'Update Bot':'Create Bot'}</button><a href="/admin/admin-bot-trading.html" class="px-5 py-2.5 rounded-lg border border-border text-sm">Cancel</a></div>
    </form>`;
    m.querySelector('#botForm').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const body=Object.fromEntries(fd.entries());
      body.is_active=fd.get('is_active')==='1';
      try{
        if(edit&&id){const x=await put('/bots/'+id,body);toast(x.message||'Trading bot updated successfully.',true);}
        else{const x=await post('/bots',body);toast(x.message||'Trading bot created successfully.',true);}
        setTimeout(()=>location.href='/admin/admin-bot-trading.html',600);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }
    async function adminBotSubs(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d={};
    try{d=await get('/bot-subscriptions');}catch(e){try{d=await get('/bots');}catch(e2){toast(e2.message,false);}}
    const subs=d.subscriptions||[];
    const stats=d.stats||{};
    const active=subs.filter(x=>x.status==='active');
    function rows(list){
      if(!list.length)return '<tr><td colspan="9" class="py-8 text-center text-content-muted">No subscriptions</td></tr>';
      return list.map((s,i)=>{
        const inv=Number(s.invested_amount||0);
        const profit=Number(s.current_profit||s.accumulated_profit||0);
        const adj=Number(s.admin_adjustment||s.admin_profit_adjustment||0);
        const payout=inv+profit+adj;
        return `<tr class="border-t border-slate-100"><td class="px-4 py-3">#${i+1}</td><td>${esc(s.user_id?.name||'—')}<div class="text-xs text-content-muted">${esc(s.user_id?.email||'')}</div></td><td>${esc(s.bot_id?.name||'—')}</td><td>${money(inv)}</td><td class="text-emerald-600">${money(profit)}</td><td>${money(payout)}</td><td>${dt(s.expires_at)}</td><td><span class="text-xs">${esc(s.status)}</span></td><td><a href="/admin/bot-trading-subscriptions-view.html?id=${s._id}" class="text-primary text-sm">View</a></td></tr>`;
      }).join('');
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Bot Trading Subscriptions</h1><p class="text-sm text-content-muted mt-1">Manage user subscriptions to trading bots</p></div><a href="/admin/admin-bot-trading.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back to Bots</a></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${[['ACTIVE SUBSCRIPTIONS',stats.activeSubscribers??active.length],['TOTAL INVESTED',money(stats.totalInvested??subs.reduce((s,x)=>s+Number(x.invested_amount||0),0))],['TOTAL PROFIT',money(stats.totalProfit??subs.reduce((s,x)=>s+Number(x.current_profit||x.accumulated_profit||0),0))],['SETTLED',stats.settled??subs.filter(x=>['settled','completed','stopped'].includes(x.status)).length]].map(([l,v])=>`<div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div class="text-xs text-slate-500 uppercase">${l}</div><div class="text-2xl font-bold mt-2">${v}</div></div>`).join('')}
    </div>
    <div class="flex flex-wrap gap-2 mb-4 items-center" id="botSubFilters">
      ${[['all','All Status'],['active','Active'],['stopped','Stopped'],['completed','Completed'],['settled','Settled']].map(([k,l],i)=>`<button type="button" data-filter="${k}" class="px-3 py-1.5 rounded-full text-sm ${i===0?'bg-primary text-white':'bg-slate-100 text-slate-600'}">${l}</button>`).join('')}
      <input id="botSubSearch" type="search" placeholder="Search user or bot..." class="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <div class="px-4 py-3 border-b border-slate-100 font-medium">Subscriptions</div>
      <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-4 py-3">ID</th><th>User</th><th>Bot</th><th>Invested</th><th>Profit</th><th>Payout</th><th>Expires</th><th>Status</th><th></th></tr></thead>
      <tbody id="botSubRows">${rows(subs)}</tbody></table>
    </div>`;
    const tbody=m.querySelector('#botSubRows');
    function apply(){
      const f=m.querySelector('#botSubFilters [data-filter].bg-primary')?.dataset.filter||'all';
      const q=(m.querySelector('#botSubSearch').value||'').toLowerCase();
      let list=subs;
      if(f!=='all') list=list.filter(s=>s.status===f);
      if(q) list=list.filter(s=>String(s.user_id?.name||'').toLowerCase().includes(q)||String(s.bot_id?.name||'').toLowerCase().includes(q));
      tbody.innerHTML=rows(list);
    }
    m.querySelectorAll('#botSubFilters [data-filter]').forEach(btn=>{
      btn.onclick=()=>{m.querySelectorAll('#botSubFilters [data-filter]').forEach(b=>{b.className='px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600';});btn.className='px-3 py-1.5 rounded-full text-sm bg-primary text-white';apply();};
    });
    m.querySelector('#botSubSearch').oninput=apply;
  }
    async function adminBotSubView(){
    const m=adminMain(); showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Subscription id required',false);return;}
    m.innerHTML='<div class="p-8 text-center text-content-muted">Loading...</div>';
    let d;
    try{d=await get('/bot-subscriptions/'+id);}catch(e){toast(e.message,false);return;}
    const s=d.subscription||d.sub||{};
    const b=s.bot_id||{};
    const u=s.user_id||{};
    const inv=Number(s.invested_amount||0);
    const profit=Number(s.current_profit||s.accumulated_profit||0);
    const adjAmt=Number(s.admin_adjustment||s.admin_profit_adjustment||0);
    const payout=inv+profit+adjAmt;
    const status=String(s.status||'active').toLowerCase();
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Bot Subscription</h1><p class="text-sm text-content-muted mt-1">View subscription details and manage profit</p></div><a href="/admin/bot-trading-subscriptions.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back</a></div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="font-medium mb-3">Subscription Details</div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><div class="text-content-muted text-xs">User</div><div class="font-medium">${esc(u.name||'—')}</div><div class="text-xs text-content-muted">${esc(u.email||'')}</div></div>
            <div><div class="text-content-muted text-xs">Invested Amount</div><div class="font-medium">${money(inv)}</div></div>
            <div><div class="text-content-muted text-xs">Bot</div><div class="font-medium">${esc(b.name||'—')}</div></div>
            <div><div class="text-content-muted text-xs">Accumulated Profit</div><div class="font-medium text-emerald-600">${money(profit)}</div></div>
            <div><div class="text-content-muted text-xs">Status</div><div class="font-medium">${esc(status)}</div></div>
            <div><div class="text-content-muted text-xs">Admin Adjustment</div><div class="font-medium">${adjAmt?money(adjAmt):money(0)}</div></div>
            <div><div class="text-content-muted text-xs">Daily ROI Snapshot</div><div class="font-medium">${Number(s.daily_roi_snapshot||b.expected_roi||0).toFixed(2)}%</div></div>
            <div><div class="text-content-muted text-xs">Total Payout</div><div class="font-medium text-primary">${money(payout)}</div></div>
            <div><div class="text-content-muted text-xs">Started</div><div>${dt(s.started_at||s.createdAt)}</div></div>
            <div><div class="text-content-muted text-xs">Expires</div><div>${dt(s.expires_at)}</div></div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="font-medium mb-2">Simulated Trades (0)</div>
          <p class="text-sm text-content-muted text-center py-6">No trades yet.</p>
        </div>
      </div>
      <div class="space-y-4">
        ${status!=='settled'?`<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="font-medium mb-2">Settle Subscription</div>
          <p class="text-sm text-content-muted mb-3">Credit ${money(payout)} to user's balance and mark as settled.</p>
          <button type="button" id="settleBotSub" class="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-medium">Settle Now</button>
        </div>`:'<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-sm text-content-muted">Subscription is settled.</div>'}
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="font-medium mb-3">Profit Adjustment</div>
          <form id="botAdjForm" class="space-y-3">
            <label class="block text-sm"><span class="text-content-muted">Adjustment Amount ($)</span><input name="admin_profit_adjustment" type="number" step="0.01" value="${adjAmt}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
            <label class="block text-sm"><span class="text-content-muted">Notes</span><textarea name="admin_notes" rows="2" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${esc(s.admin_notes||'')}</textarea></label>
            <button type="submit" class="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium">Save Adjustment</button>
          </form>
        </div>
      </div>
    </div>`;
    const adjForm=m.querySelector('#botAdjForm');
    if(adjForm) adjForm.onsubmit=async e=>{
      e.preventDefault();
      const body=Object.fromEntries(new FormData(e.currentTarget).entries());
      try{const x=await put('/bot-subscriptions/'+id+'/adjust',body);toast(x.message||'Profit adjustment saved.',true);adminBotSubView();}catch(err){toast(err.response?.data?.message||err.message,false);}
    };
    const settle=m.querySelector('#settleBotSub');
    if(settle) settle.onclick=async()=>{
      if(!confirm('Confirm settlement?'))return;
      try{const x=await post('/bot-subscriptions/'+id+'/settle',{});toast(x.message||(`Subscription settled. ${money(payout)} credited to user.`),true);adminBotSubView();}catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }
    
    async function adminAssets(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading assets...</div>';
    const d=await get('/assets');
    const assets=d.assets||[];
    const classes=['crypto','forex','stock','etf','index'];
    function count(c){return assets.filter(a=>String(a.asset_class||'').toLowerCase()===c).length;}
    function rows(list){
      return list.map(a=>{
        const chg=Number(a.price_change_pct_24h||a.change_24h||0);
        const active=a.is_active!==false;
        const logo=a.logo_url||a.image||'';
        return `<tr class="border-t border-slate-100">
          <td class="px-4 py-3"><div class="flex items-center gap-2">${logo?`<img src="${esc(logo)}" class="w-7 h-7 rounded-full object-cover" onerror="this.style.display='none'">`:''}<span class="font-medium">${esc(a.name)}</span></div></td>
          <td class="font-medium">${esc(a.symbol)}</td>
          <td>${money(a.price||a.current_price)}</td>
          <td class="${chg>=0?'text-emerald-600':'text-red-500'}">${chg>=0?'+':''}${chg.toFixed(2)}%</td>
          <td><span class="text-xs px-2 py-0.5 rounded-full bg-slate-100">${esc(a.data_source||a.source||'—')}</span></td>
          <td><button type="button" data-toggle-asset="${a._id}" class="relative w-10 h-5 rounded-full ${active?'bg-primary':'bg-slate-300'}"><span class="absolute top-0.5 ${active?'right-0.5':'left-0.5'} w-4 h-4 bg-white rounded-full shadow"></span></button></td>
          <td class="text-xs text-content-muted">${dt(a.price_updated_at||a.updatedAt)}</td>
          <td class="whitespace-nowrap"><a href="/admin/edit-assets.html?id=${a._id}" class="text-primary text-sm mr-2">Edit</a><button type="button" data-del-asset="${a._id}" data-name="${esc(a.symbol||a.name)}" class="text-red-500 text-sm">Delete</button></td>
        </tr>`;
      }).join('')||'<tr><td colspan="8" class="py-10 text-center text-content-muted">No assets</td></tr>';
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6 flex-wrap gap-3"><div><h1 class="text-xl font-semibold text-content">Manage Trading Assets</h1></div>
      <div class="flex gap-2"><a href="/admin/create-assets.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">+ Add Custom Asset</a>
      <button type="button" id="refreshPrices" class="px-4 py-2 rounded-lg border border-border text-sm">↻ Refresh Prices</button></div></div>
    <div class="flex gap-4 border-b border-slate-200 mb-4 text-sm" id="assetTabs">
      ${[{k:'crypto',l:'Crypto'},{k:'forex',l:'Forex'},{k:'stock',l:'Stock'},{k:'etf',l:'Etf'},{k:'index',l:'Index'}].map((c,i)=>`<button type="button" data-class="${c.k}" class="pb-2 border-b-2 ${i===0?'border-primary text-primary':'border-transparent text-content-muted'}">${c.l} ${count(c.k)}</button>`).join('')}
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <div class="flex justify-end p-3"><input id="assetSearch" type="search" placeholder="Search:" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"></div>
      <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-4 py-3">Name</th><th>Symbol</th><th>Price</th><th>24h Change</th><th>Source</th><th>Active</th><th>Last Updated</th><th>Actions</th></tr></thead>
      <tbody id="assetRows">${rows(assets.filter(a=>String(a.asset_class||'').toLowerCase()==='crypto'))}</tbody></table>
    </div>`;
    const tbody=m.querySelector('#assetRows');
    function apply(){
      const cls=m.querySelector('#assetTabs [data-class].text-primary')?.dataset.class||'crypto';
      const q=(m.querySelector('#assetSearch').value||'').toLowerCase();
      let list=assets.filter(a=>String(a.asset_class||'').toLowerCase()===cls);
      if(q) list=list.filter(a=>String(a.name||'').toLowerCase().includes(q)||String(a.symbol||'').toLowerCase().includes(q));
      tbody.innerHTML=rows(list);
      bindRow();
    }
    function bindRow(){
      m.querySelectorAll('[data-toggle-asset]').forEach(btn=>{btn.onclick=async()=>{try{await post('/assets/'+btn.dataset.toggleAsset+'/toggle',{});adminAssets();}catch(e){toast(e.message,false);}};});
      m.querySelectorAll('[data-del-asset]').forEach(btn=>{btn.onclick=async()=>{if(!confirm('Delete this asset?\nThis action cannot be undone. Assets with open trades cannot be deleted.'))return;try{const x=await del('/assets/'+btn.dataset.delAsset);toast(x.message||(btn.dataset.name+' deleted successfully.'),true);adminAssets();}catch(e){toast(e.response?.data?.message||e.message,false);}};});
    }
    bindRow();
    m.querySelectorAll('#assetTabs [data-class]').forEach(btn=>{btn.onclick=()=>{m.querySelectorAll('#assetTabs [data-class]').forEach(b=>{b.className='pb-2 border-b-2 border-transparent text-content-muted';});btn.className='pb-2 border-b-2 border-primary text-primary';apply();};});
    m.querySelector('#assetSearch').oninput=apply;
    m.querySelector('#refreshPrices').onclick=async()=>{
      const cls=m.querySelector('#assetTabs [data-class].text-primary')?.dataset.class||'crypto';
      const btn=m.querySelector('#refreshPrices');
      const prev=btn.textContent;
      btn.disabled=true; btn.textContent='Refreshing…';
      try{
        const x=await post('/assets/refresh',{activeOnly:true, asset_class: cls});
        const failed=(x.failedAssets||(x.results||[]).filter(r=>r.asset&&r.success===false).map(r=>r.asset)||[]);
        if(failed.length){
          console.warn('[assets refresh] Category:', cls);
          console.warn('[assets refresh] Failed assets:', failed);
          (x.results||[]).filter(r=>r.asset&&r.success===false).forEach(r=>{
            console.warn(`  - ${r.asset} (${r.provider||'none'}): ${r.error||'unknown error'}`);
          });
        }
        if((x.results||[]).some(r=>r.success)){
          console.log('[assets refresh] Updated:', (x.results||[]).filter(r=>r.success).map(r=>r.asset));
        }
        toast(x.message||(x.updated?`Updated ${x.updated} ${cls} assets.`:`No ${cls} prices updated`), Boolean(x.success||x.updated));
        adminAssets();
      }catch(e){
        console.error('[assets refresh] error', e.response?.data||e);
        toast(e.response?.data?.message||e.message||'Price refresh failed',false);
      }finally{
        btn.disabled=false; btn.textContent=prev;
      }
    };
  }
    async function adminAssetForm(edit){
    const m=adminMain(); showDynamicMain();
    const id=edit?new URLSearchParams(location.search).get('id'):null;
    let a={};
    if(edit&&id){try{a=(await get('/assets/'+id)).asset||{};}catch(e){toast(e.message,false);}}
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${edit?('Edit: '+esc(a.name||'')):'Create: Assets'}</h1><p class="text-sm text-content-muted mt-1">${edit?'Update asset details, pricing, and status':'Create asset details, pricing, and status'}</p></div><a href="/admin/assets.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back to Assets</a></div>
    <form id="assetForm" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block text-sm"><span class="font-medium">Name *</span><input name="name" required value="${esc(a.name||'')}" placeholder="Avalanche" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Symbol *</span><input name="symbol" required value="${esc(a.symbol||'')}" placeholder="AVAX" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Asset Class *</span><select name="asset_class" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${['Crypto','Forex','Stock','Etf','Index'].map(c=>`<option value="${c.toLowerCase()}" ${String(a.asset_class||'').toLowerCase()===c.toLowerCase()?'selected':''}>${c}</option>`).join('')}</select></label>
          <label class="block text-sm"><span class="font-medium">Data Source</span><select name="data_source" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="coingecko" ${a.data_source==='coingecko'?'selected':''}>coingecko</option><option value="twelvedata" ${a.data_source==='twelvedata'?'selected':''}>twelvedata</option></select></label>
          <label class="block text-sm"><span class="font-medium">Price ($)</span><input name="price" type="number" step="any" value="${a.price??a.current_price??''}" placeholder="Optional — auto-fill from source" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">24h Change ($)</span><input name="change_24h" type="number" step="any" value="${a.change_24h??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">24h Change (%)</span><input name="price_change_pct_24h" type="number" step="any" value="${a.price_change_pct_24h??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">24h High ($)</span><input name="high_24h" type="number" step="any" value="${a.high_24h??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm md:col-span-2"><span class="font-medium">24h Low ($)</span><input name="low_24h" type="number" step="any" value="${a.low_24h??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <label class="block text-sm"><span class="font-medium">Logo URL</span><input name="logo_url" id="logoUrl" value="${esc(a.logo_url||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="https://..."></label>
          <div class="mt-3 h-24 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden" id="logoPreview">${a.logo_url?`<img src="${esc(a.logo_url)}" class="max-h-full object-contain">`:'Logo preview'}</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1" ${a.is_active!==false?'checked':''}> Active</label>
          <p class="text-xs text-content-muted mt-2">Inactive assets won't appear in user trading screens.</p>
          <button type="submit" class="mt-4 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium">${edit?'✓ Save Changes':'Create Asset'}</button>
          <a href="/admin/assets.html" class="mt-2 block text-center py-2.5 rounded-lg border border-border text-sm">Cancel</a>
        </div>
      </div>
    </form>`;
    const logoIn=m.querySelector('#logoUrl');
    const prev=m.querySelector('#logoPreview');
    logoIn.addEventListener('input',()=>{const u=logoIn.value.trim();prev.innerHTML=u?`<img src="${u.replace(/"/g,'')}" class="max-h-full object-contain" onerror="this.parentNode.textContent='Invalid image'">`:'Logo preview';});
    m.querySelector('#assetForm').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const body=Object.fromEntries(fd.entries());
      body.is_active=fd.get('is_active')==='1';
      try{
        if(edit&&id){const x=await put('/assets/'+id,body);toast(x.message||((body.symbol||'Asset')+' updated successfully.'),true);}
        else{const x=await post('/assets',body);toast(x.message||((body.symbol||'Asset')+' created successfully.'),true);setTimeout(()=>location.href='/admin/assets.html',600);return;}
        setTimeout(()=>location.reload(),600);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }
    async function adminTrades(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading trades...</div>';
    const d=await get('/trades');
    const trades=d.trades||[];
    function rows(list){
      return list.map((t,i)=>{
        const pl=Number(t.profit_loss||t.pl||0);
        const act=String(t.action||'buy').toUpperCase();
        const st=String(t.status||'open');
        const res=String(t.result||'').toUpperCase();
        return `<tr class="border-t border-slate-100">
          <td class="px-3 py-3">${i+1}</td>
          <td>${esc(t.user_id?.name||'—')}</td>
          <td><span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">${esc(t.trade_type||t.asset_type||'Binary')}</span>${t.is_demo?' <span class="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">DEMO</span>':''}</td>
          <td>${esc(t.asset_symbol||t.trading_asset_id?.symbol||'')} — ${esc(t.asset_name||t.trading_asset_id?.name||'')}</td>
          <td class="${act==='BUY'?'text-emerald-600':'text-red-500'} font-medium">${act}</td>
          <td>${money(t.amount)}</td>
          <td>${t.leverage||1}x</td>
          <td>${money(t.entry_price)}</td>
          <td><span class="text-xs px-2 py-0.5 rounded-full ${st==='open'?'bg-amber-50 text-amber-600':'bg-slate-100'}">${esc(st)}</span></td>
          <td class="${res==='WIN'?'text-emerald-600':res==='LOSS'?'text-red-500':''}">${esc(res||'—')}</td>
          <td class="${pl>=0?'text-emerald-600':'text-red-500'}">${pl?((pl>=0?'+':'')+money(pl)):'—'}</td>
          <td>${esc(t.settled_by||'—')}</td>
          <td class="text-xs">${dt(t.opened_at||t.createdAt)}</td>
          <td class="whitespace-nowrap"><a href="/admin/view-trade.html?id=${t._id}" class="text-primary text-sm mr-2">View</a><a href="/admin/edit-trade.html?id=${t._id}" class="text-primary text-sm">Edit</a></td>
        </tr>`;
      }).join('')||'<tr><td colspan="14" class="py-10 text-center text-content-muted">No trades</td></tr>';
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Manage Client Trades</h1></div>
      <a href="/admin/create-trade.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">+ Create Trade</a></div>
    <div class="flex gap-3 border-b border-slate-200 mb-4 text-sm overflow-x-auto" id="tradeFilters">
      ${[['all','All'],['binary','Binary'],['spot','Spot'],['open','Open'],['closed','Closed'],['demo','Demo']].map(([k,l],i)=>`<button type="button" data-f="${k}" class="pb-2 border-b-2 whitespace-nowrap ${i===0?'border-primary text-primary':'border-transparent text-content-muted'}">${l}</button>`).join('')}
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table class="w-full text-sm"><thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50"><th class="px-3 py-3">#</th><th>User</th><th>Type</th><th>Asset</th><th>Action</th><th>Amount</th><th>Leverage</th><th>Entry Price</th><th>Status</th><th>Result</th><th>P/L</th><th>Settled By</th><th>Opened</th><th>Actions</th></tr></thead>
      <tbody id="tradeRows">${rows(trades)}</tbody></table>
    </div>`;
    const tbody=m.querySelector('#tradeRows');
    function apply(){
      const f=m.querySelector('#tradeFilters [data-f].text-primary')?.dataset.f||'all';
      let list=trades;
      if(f==='binary'||f==='spot') list=list.filter(t=>String(t.trade_type||t.asset_type||'').toLowerCase()===f);
      else if(f==='open'||f==='closed') list=list.filter(t=>String(t.status||'').toLowerCase()===f);
      else if(f==='demo') list=list.filter(t=>t.is_demo);
      tbody.innerHTML=rows(list);
    }
    m.querySelectorAll('#tradeFilters [data-f]').forEach(btn=>{btn.onclick=()=>{m.querySelectorAll('#tradeFilters [data-f]').forEach(b=>{b.className='pb-2 border-b-2 whitespace-nowrap border-transparent text-content-muted';});btn.className='pb-2 border-b-2 whitespace-nowrap border-primary text-primary';apply();};});
  }
    async function adminTradeForm(edit){
    const m=adminMain(); showDynamicMain();
    const id=edit?new URLSearchParams(location.search).get('id'):null;
    let t0={}, users=[], assets=[];
    try{const d=await get('/trades');users=d.users||[];assets=d.assets||[];}catch(e){}
    if(edit&&id){try{t0=(await get('/trades/'+id)).trade||{};}catch(e){toast(e.message,false);}}
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">${edit?('Edit Trade #'+(t0._id||'').toString().slice(-4)):'Create Trade for User'}</h1></div><a href="/admin/managetrades.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back to Trades</a></div>
    <form id="tradeAdminForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-4">
      <label class="block text-sm"><span class="font-medium">Select User *</span><select name="user_id" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${users.map(u=>`<option value="${u._id}" ${String(t0.user_id?._id||t0.user_id)===String(u._id)?'selected':''}>${esc(u.name)} (${esc(u.email)})</option>`).join('')}</select></label>
      <div class="grid grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium">Trade Type *</span><select name="trade_type" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option ${t0.trade_type==='Binary'||!t0.trade_type?'selected':''}>Binary</option><option ${t0.trade_type==='Spot'?'selected':''}>Spot</option></select></label>
        <label class="inline-flex items-center gap-2 text-sm mt-6"><input type="checkbox" name="is_demo" value="1" ${t0.is_demo?'checked':''}> Demo Trade (uses demo balance)</label>
      </div>
      <label class="block text-sm"><span class="font-medium">Asset *</span><select name="trading_asset_id" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="">— Select Asset —</option>${assets.map(a=>`<option value="${a._id}" ${String(t0.trading_asset_id?._id||t0.trading_asset_id)===String(a._id)?'selected':''}>${esc(a.symbol)} — ${esc(a.name)}</option>`).join('')}</select></label>
      <div class="grid grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium">Action *</span><select name="action" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="buy" ${String(t0.action||'').toLowerCase()!=='sell'?'selected':''}>Buy</option><option value="sell" ${String(t0.action||'').toLowerCase()==='sell'?'selected':''}>Sell</option></select></label>
        <label class="block text-sm"><span class="font-medium">Leverage *</span><select name="leverage" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${[1,2,5,10,20,50,100].map(x=>`<option value="${x}" ${Number(t0.leverage||5)===x?'selected':''}>${x}x</option>`).join('')}</select></label>
      </div>
      <label class="block text-sm"><span class="font-medium">Duration (Binary only)</span><select name="duration_minutes" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${[1,5,15,30,60].map(x=>`<option value="${x}" ${Number(t0.duration_minutes||15)===x?'selected':''}>${x} Minutes</option>`).join('')}</select></label>
      <label class="block text-sm"><span class="font-medium">Amount ($) *</span><input name="amount" type="number" step="0.01" required value="${t0.amount??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      ${edit?`<div class="grid grid-cols-3 gap-4">
        <label class="block text-sm"><span class="font-medium">Status</span><select name="status" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option ${t0.status==='open'?'selected':''}>open</option><option ${t0.status==='closed'?'selected':''}>closed</option></select></label>
        <label class="block text-sm"><span class="font-medium">Result</span><select name="result" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="">—</option><option ${String(t0.result||'').toUpperCase()==='WIN'?'selected':''}>WIN</option><option ${String(t0.result||'').toUpperCase()==='LOSS'?'selected':''}>LOSS</option></select></label>
        <label class="block text-sm"><span class="font-medium">Profit/Loss (USD)</span><input name="profit_loss" type="number" step="0.01" value="${t0.profit_loss??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      </div>`:''}
      <div class="flex gap-3"><button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium">${edit?'Update Trade':'Create Trade'}</button><a href="/admin/managetrades.html" class="px-5 py-2.5 rounded-lg border border-border text-sm">Cancel</a></div>
    </form>`;
    m.querySelector('#tradeAdminForm').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const body=Object.fromEntries(fd.entries());
      body.is_demo=fd.get('is_demo')==='1';
      try{
        if(edit&&id){const x=await put('/trades/'+id,body);toast(x.message||'Trade updated successfully.',true);}
        else{const x=await post('/trades',body);toast(x.message||'Trade created successfully.',true);}
        setTimeout(()=>location.href='/admin/managetrades.html',600);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }
    async function adminTradeView(){
    const m=adminMain(); showDynamicMain();
    const id=new URLSearchParams(location.search).get('id');
    if(!id){toast('Trade id required',false);return;}
    m.innerHTML='<div class="p-8 text-center text-content-muted">Loading...</div>';
    let d; try{d=await get('/trades/'+id);}catch(e){toast(e.message,false);return;}
    const t0=d.trade||{};
    const closed=String(t0.status||'').toLowerCase()==='closed';
    const pl=Number(t0.profit_loss||0);
    const res=String(t0.result||'').toUpperCase();
    m.innerHTML=`<div class="flex items-center justify-between mb-6"><div><h1 class="text-xl font-semibold text-content">Trade Details</h1></div><a href="/admin/managetrades.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back</a></div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-2 text-sm">
        <div class="font-medium mb-2">Trade Info</div>
        <div class="flex justify-between"><span class="text-content-muted">User</span><span>${esc(t0.user_id?.name||'—')}</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Asset</span><span>${esc(t0.asset_symbol||t0.trading_asset_id?.symbol||'')} — ${esc(t0.asset_name||t0.trading_asset_id?.name||'')}</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Action</span><span>${esc(t0.action)}</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Amount</span><span>${money(t0.amount)}</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Leverage</span><span>${t0.leverage||1}x</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Entry</span><span>${money(t0.entry_price)}</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Status</span><span>${esc(t0.status)}</span></div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5" id="settleBox">
        ${closed?`<h3 class="text-base font-semibold text-content mb-4">Settlement Info</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-content-muted">Result</span><span class="font-semibold ${res==='WIN'?'text-success':'text-danger'}">${esc(res||'—')}</span></div>
            <div class="flex justify-between"><span class="text-content-muted">P/L</span><span class="font-semibold ${pl>=0?'text-success':'text-danger'}">${pl>=0?'+':''}${money(pl)}</span></div>
            <div class="flex justify-between"><span class="text-content-muted">Settled By</span><span>${esc(t0.settled_by||'Admin')}</span></div>
            <div class="flex justify-between"><span class="text-content-muted">Settled At</span><span>${dt(t0.settled_at||t0.closed_at)}</span></div>
          </div>`:`<h3 class="text-base font-semibold text-content mb-4">Settle Trade</h3>
          <form id="settleTradeForm" class="space-y-3">
            <label class="block text-sm"><span class="font-medium">Result</span><select name="result" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"><option value="WIN">WIN</option><option value="LOSS">LOSS</option></select></label>
            <label class="block text-sm"><span class="font-medium">Profit/Loss (USD)</span><input name="profit_loss" type="number" step="0.01" required class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
            <button type="submit" class="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium">Settle Trade</button>
          </form>`}
      </div>
    </div>`;
    const form=m.querySelector('#settleTradeForm');
    if(form) form.onsubmit=async e=>{
      e.preventDefault();
      const body=Object.fromEntries(new FormData(form).entries());
      try{const x=await post('/trades/'+id+'/settle',body);toast(x.message||'Profit adjusted successfully.',true);adminTradeView();}catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }
    
  async function adminMiningPlans(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading mining plans...</div>';
    let d; try{d=await get('/mining-plans');}catch(e){toast(e.message,false);return;}
    const plans=d.plans||[];
    const stats=d.stats||{};
    const totalPlans=stats.totalPlans??plans.length;
    const activePlans=stats.activePlans??plans.filter(p=>p.is_active!==false).length;
    const activeSubs=stats.activeSubscribers??0;
    const totalInvested=stats.totalInvested??0;
    m.innerHTML=`<div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div><h1 class="text-xl font-semibold text-content">Cloud Mining Plans</h1><p class="text-sm text-content-muted mt-1">Create and manage mining plans for users</p></div>
      <div class="flex gap-2">
        <a href="/admin/mining-subscriptions.html" class="px-4 py-2 rounded-lg border border-border text-sm">☰ Subscriptions</a>
        <a href="/admin/mining-plans-create.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">+ New Plan</a>
      </div>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      ${[['Total Plans',totalPlans],['Active Plans',activePlans],['Active Subscribers',activeSubs],['Total Invested',money(totalInvested)]].map(([l,v])=>`
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div class="text-xs uppercase text-content-muted tracking-wide">${l}</div>
          <div class="text-xl font-semibold text-content mt-1">${v}</div>
        </div>`).join('')}
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <div class="px-4 py-3 border-b border-slate-100 font-medium text-content">Mining Plans</div>
      <table class="w-full text-sm">
        <thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50">
          <th class="px-4 py-3">Plan</th><th>Hashrate</th><th>Daily ROI</th><th>Duration</th><th>Min / Max</th><th>Subscribers</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${plans.map(p=>`<tr class="border-t border-slate-100">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${(p.icon_color||'#4a6cf7')}22"><i class="fa-solid fa-microchip" style="color:${p.icon_color||'#4a6cf7'}"></i></div>
                <span class="font-medium">${esc(p.name)}</span>
              </div>
            </td>
            <td>${esc(p.hashrate||'—')}</td>
            <td class="text-emerald-600 font-medium">${Number(p.daily_roi_percentage||0).toFixed(2)}%</td>
            <td>${Number(p.duration_days||0)} days</td>
            <td>${money(p.min_investment)} / ${p.max_investment?money(p.max_investment):'—'}</td>
            <td>${Number(p.subscribers||p.subscriber_count||0)}</td>
            <td><span class="text-xs px-2 py-0.5 rounded-full ${p.is_active!==false?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'}">${p.is_active!==false?'Active':'Inactive'}</span></td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <a href="/admin/mining-plans-edit.html?id=${p._id}" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm text-primary hover:bg-slate-50">
                  <i class="fa-solid fa-pen text-xs"></i> Edit
                </a>
                <button type="button" data-del-plan="${p._id}" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-sm text-red-500 hover:bg-red-50">
                  <i class="fa-solid fa-trash text-xs"></i> Delete
                </button>
              </div>
            </td>
          </tr>`).join('')||'<tr><td colspan="8" class="py-10 text-center text-content-muted">No mining plans</td></tr>'}
        </tbody>
      </table>
    </div>`;
    m.querySelectorAll('[data-del-plan]').forEach(btn=>{
      btn.onclick=async()=>{
        if(!confirm('Delete this plan?')) return;
        try{
          const x=await del('/mining-plans/'+btn.dataset.delPlan);
          toast(x.message||'mining plan deleted successfully',true);
          adminMiningPlans();
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    });
  }

  async function adminMiningForm(edit){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    const id=edit?new URLSearchParams(location.search).get('id'):null;
    let p={};
    if(edit&&id){
      try{p=(await get('/mining-plans/'+id)).plan||{};}catch(e){toast(e.message,false);}
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6">
      <div><h1 class="text-xl font-semibold text-content">${edit?'Edit Mining Plan':'Create Mining Plan'}</h1>
      <p class="text-sm text-content-muted mt-1">${edit?esc(p.name||''):'Add a new cloud mining plan for users'}</p></div>
      <a href="/admin/mining-plans.html" class="px-4 py-2 rounded-lg border border-border text-sm">${edit?'Back to Plans':'Cancel'}</a>
    </div>
    <form id="minePlanForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
      <div>
        <h3 class="text-sm font-semibold text-content mb-3">Plan Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block text-sm"><span class="font-medium">Plan Name *</span><input name="name" required value="${esc(p.name||'')}" placeholder="e.g. Starter Miner" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Hashrate *</span><input name="hashrate" required value="${esc(p.hashrate||'')}" placeholder="1 TH/s" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm md:col-span-2"><span class="font-medium">Description</span><textarea name="description" rows="2" placeholder="Brief plan description shown to users..." class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${esc(p.description||'')}</textarea></label>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-content mb-3">ROI & Duration</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="block text-sm"><span class="font-medium">Daily ROI (%) *</span><input name="daily_roi_percentage" type="number" step="any" required value="${p.daily_roi_percentage??''}" placeholder="1.5" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Duration (days) *</span><input name="duration_days" type="number" required value="${p.duration_days??30}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Sort Order</span><input name="sort_order" type="number" value="${p.sort_order??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-content mb-3">Investment Limits</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block text-sm"><span class="font-medium">Minimum Investment ($) *</span><input name="min_investment" type="number" step="any" required value="${p.min_investment??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
          <label class="block text-sm"><span class="font-medium">Maximum Investment ($)</span><input name="max_investment" type="number" step="any" value="${p.max_investment||''}" placeholder="Leave blank for no limit" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-content mb-3">Appearance</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <label class="block text-sm"><span class="font-medium">Icon Color</span>
            <div class="mt-1 flex items-center gap-2"><input name="icon_color" type="color" value="${esc(p.icon_color||'#4a6cf7')}" class="h-10 w-14 rounded border border-slate-200"><span class="text-xs text-content-muted">Hex color for the plan icon</span></div>
          </label>
          <label class="inline-flex items-center gap-2 text-sm mt-4"><input type="checkbox" name="is_active" value="1" ${p.is_active!==false?'checked':''}> <span>Active — Plan is visible to users</span></label>
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <a href="/admin/mining-plans.html" class="px-4 py-2 rounded-lg border border-border text-sm">Cancel</a>
        <button type="submit" class="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium">${edit?'Save Changes':'Create Plan'}</button>
      </div>
    </form>`;
    m.querySelector('#minePlanForm').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const body=Object.fromEntries(fd.entries());
      body.is_active=fd.get('is_active')==='1';
      body.max_investment=body.max_investment===''?0:body.max_investment;
      try{
        if(edit&&id){const x=await put('/mining-plans/'+id,body);toast(x.message||'mining plan updated successfully',true);}
        else{const x=await post('/mining-plans',body);toast(x.message||'mining plan created successfully',true);}
        setTimeout(()=>location.href='/admin/mining-plans.html',500);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }

  async function adminMiningSubs(){ return adminMiningSubscriptions(); }
  async function adminMiningSubscriptions(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading subscriptions...</div>';
    let d; try{d=await get('/mining-subscriptions');}catch(e){toast(e.message,false);return;}
    const subs=d.subscriptions||[];
    const stats=d.stats||{};
    function userLabel(u){
      if(!u || typeof u!=='object') return {name:'Unknown user', email:''};
      const name = u.name || u.full_name || [u.first_name,u.last_name].filter(Boolean).join(' ') || u.username || '';
      const email = u.email || '';
      return {name: name || email || 'Unknown user', email: name ? email : ''};
    }
    function planLabel(p){
      if(!p || typeof p!=='object') return {name:'—', hashrate:''};
      return {name: p.name || '—', hashrate: p.hashrate || ''};
    }
    function rows(list){
      return list.map(s=>{
        const u=userLabel(s.user_id);
        const p=planLabel(s.mining_plan_id);
        const invested=Number(s.invested_amount||0);
        const accrued=Number(s.accumulated_profit||0);
        const adj=Number(s.admin_profit_adjustment||0);
        const payout=invested+accrued+adj;
        const st=String(s.status||'active').toLowerCase();
        const exp=s.expires_at?new Date(s.expires_at).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'—';
        return `<tr class="border-t border-slate-100" data-status="${st}">
          <td class="px-3 py-3"><input type="checkbox"></td>
          <td class="px-3 py-3">
            <div class="font-medium text-content">${esc(u.name)}</div>
            ${u.email?`<div class="text-xs text-content-muted">${esc(u.email)}</div>`:''}
          </td>
          <td class="px-3 py-3">
            <div class="font-medium text-content">${esc(p.name)}</div>
            ${p.hashrate?`<div class="text-xs text-content-muted">${esc(p.hashrate)}</div>`:''}
          </td>
          <td class="px-3 py-3">${money(invested)}</td>
          <td class="px-3 py-3 text-emerald-600">${money(accrued)}</td>
          <td class="px-3 py-3">${adj?('+'+money(adj)):('+$0.00')}</td>
          <td class="px-3 py-3 font-medium">${money(payout)}</td>
          <td class="px-3 py-3">${exp}</td>
          <td class="px-3 py-3"><span class="text-xs px-2 py-0.5 rounded-full ${st==='active'?'bg-emerald-50 text-emerald-600':st==='settled'?'bg-slate-100 text-slate-600':st==='stopped'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'}">${st.charAt(0).toUpperCase()+st.slice(1)}</span></td>
          <td class="px-3 py-3">${st!=='settled'?`<button type="button" data-settle="${s._id}" data-payout="${payout}" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/30 text-primary text-sm hover:bg-primary/5">Settle</button>`:'—'}</td>
        </tr>`;
      }).join('')||'<tr><td colspan="10" class="py-10 text-center text-content-muted">No subscriptions</td></tr>';
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div><h1 class="text-xl font-semibold text-content">Mining Subscriptions</h1><p class="text-sm text-content-muted mt-1">Manage user cloud mining subscriptions</p></div>
      <a href="/admin/mining-plans.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back to Plans</a>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      ${[['Active Subscriptions',stats.active??subs.filter(s=>s.status==='active').length],
         ['Total Invested',money(stats.totalInvested??subs.reduce((a,s)=>a+Number(s.invested_amount||0),0))],
         ['Total Profit',money(stats.totalProfit??subs.reduce((a,s)=>a+Number(s.accumulated_profit||0),0))],
         ['Settled',stats.settled??subs.filter(s=>s.status==='settled').length]
        ].map(([l,v])=>`<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><div class="text-xs uppercase text-content-muted">${l}</div><div class="text-xl font-semibold mt-1">${v}</div></div>`).join('')}
    </div>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <select id="subFilter" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="stopped">Stopped</option>
        <option value="completed">Completed</option>
        <option value="settled">Settled</option>
      </select>
      <input id="subSearch" type="search" placeholder="Search user or plan..." class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
      <button type="button" id="subFilterBtn" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Filter</button>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <div class="px-4 py-3 border-b border-slate-100 font-medium">Subscriptions</div>
      <table class="w-full text-sm">
        <thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50">
          <th class="px-3 py-3"></th><th>User</th><th>Plan</th><th>Invested</th><th>Accrued</th><th>Adj.</th><th>Payout</th><th>Expires</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody id="subRows">${rows(subs)}</tbody>
      </table>
    </div>`;
    function apply(){
      const st=m.querySelector('#subFilter').value;
      const q=(m.querySelector('#subSearch').value||'').toLowerCase();
      let list=subs.slice();
      if(st!=='all') list=list.filter(s=>String(s.status)===st);
      if(q) list=list.filter(s=>String(s.user_id?.name||'').toLowerCase().includes(q)||String(s.user_id?.email||'').toLowerCase().includes(q)||String(s.mining_plan_id?.name||'').toLowerCase().includes(q));
      m.querySelector('#subRows').innerHTML=rows(list);
      bindSettle();
    }
    function bindSettle(){
      m.querySelectorAll('[data-settle]').forEach(btn=>{
        btn.onclick=async()=>{
          const pay=Number(btn.dataset.payout||0);
          if(!confirm(`Settle #${btn.dataset.settle}? ${money(pay)} credited to user.`)) return;
          try{
            const x=await post('/mining-subscriptions/'+btn.dataset.settle+'/settle',{});
            toast(x.message||`Subscription settled. ${money(pay)} credited to user.`,true);
            adminMiningSubscriptions();
          }catch(e){toast(e.response?.data?.message||e.message,false);}
        };
      });
    }
    bindSettle();
    m.querySelector('#subFilterBtn').onclick=apply;
    m.querySelector('#subFilter').onchange=apply;
    m.querySelector('#subSearch').oninput=apply;
  }



  async function realEstatePage(){
    const root=inner()||document.querySelector('#main-content')||document.querySelector('.inner-page')||document.querySelector('.main')||document.body; showDynamicMain();
    if(!root){ toast('Page container not found',false); return; }
    root.innerHTML='<div class="p-8 text-center text-[#555]">Loading properties...</div>';
    let d; try{d=await get('/real-estate');}catch(e){toast(e.message,false);return;}
    const properties=d.properties||[];
    const balance=Number(d.balance||0);

    function tagBadge(tag){
      const t=String(tag||'').toUpperCase();
      if(t==='HOT') return '<span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[.65rem] font-bold bg-red-500 text-white">HOT</span>';
      if(t==='TOP') return '<span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[.65rem] font-bold bg-amber-400 text-black">TOP</span>';
      if(t==='NEW') return '<span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[.65rem] font-bold bg-emerald-500 text-white">NEW</span>';
      return '';
    }
    function card(p){
      const photos=1+(Array.isArray(p.room_images)?p.room_images.filter(Boolean).length:0);
      const img=p.main_image?`<img src="${esc(p.main_image)}" class="w-full h-[180px] object-cover">`:`<div class="w-full h-[180px] bg-[#1a1a1a] flex items-center justify-center text-[#333]"><i class="fa-solid fa-building text-3xl"></i></div>`;
      return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] overflow-hidden mb-4">
        <div class="relative">${img}${tagBadge(p.tag)}
          <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 text-[.7rem] text-white"><i class="fa-solid fa-camera mr-1"></i>${photos} photos</span>
        </div>
        <div class="p-4">
          <div class="font-semibold text-[.95rem] text-white">${esc(p.name)}</div>
          <div class="text-[#555] text-[.75rem] mt-0.5"><i class="fa-solid fa-location-dot mr-1"></i>${esc(p.location)}</div>
          <p class="text-[#666] text-[.78rem] mt-2 line-clamp-2">${esc(p.description||'')}</p>
          <div class="flex flex-wrap gap-3 text-[.72rem] text-[#555] mt-2">
            ${p.bedrooms?`<span><i class="fa-solid fa-bed mr-1"></i>${esc(p.bedrooms)}</span>`:''}
            ${p.bathrooms?`<span><i class="fa-solid fa-bath mr-1"></i>${esc(p.bathrooms)}</span>`:''}
            ${p.sqft?`<span><i class="fa-solid fa-ruler-combined mr-1"></i>${esc(p.sqft)}</span>`:''}
          </div>
          <div class="grid grid-cols-3 gap-2 mt-3 text-center">
            <div><div class="font-sora font-semibold text-[.85rem]">${money(p.property_value)}</div><div class="text-[#444] text-[.62rem]">Value</div></div>
            <div><div class="font-sora font-semibold text-[.85rem] text-grn">${Number(p.roi_percentage||0).toFixed(1)}% APY</div><div class="text-[#444] text-[.62rem]">Return</div></div>
            <div><div class="font-sora font-semibold text-[.85rem]">${Number(p.available_tokens != null ? p.available_tokens : (Number(p.total_tokens||0)-Number(p.tokens_sold||0))).toLocaleString()}</div><div class="text-[#444] text-[.62rem]">Available</div></div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3">
            <button type="button" data-rooms="${p._id}" class="py-2.5 rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] text-[#aaa] text-[.8rem]"><i class="fa-solid fa-images mr-1"></i> View Rooms</button>
            <button type="button" data-invest="${p._id}" class="py-2.5 rounded-[10px] bg-blue2 text-white text-[.8rem] font-medium"><i class="fa-solid fa-coins mr-1"></i> Invest Now</button>
          </div>
        </div>
      </div>`;
    }

    root.innerHTML=`
<div class="mb-2">
  <div class="text-white font-medium text-[1.05rem]">Real Estate</div>
  <div class="text-[#555] text-[.78rem]">Invest in tokenized real estate globally</div>
</div>
<div class="bg-[rgba(74,108,247,.08)] border border-[rgba(74,108,247,.2)] rounded-[10px] px-3 py-2.5 text-[.75rem] text-[#8aa0ff] mb-4">
  <i class="fa-solid fa-circle-info mr-1"></i> Invest in tokenized real estate globally. Tap any property to view details. Each token represents fractional ownership with periodic returns.
</div>
<div class="flex justify-end mb-3"><a href="/user/my-real-estate.html" class="text-[.8rem] text-blue2">My Portfolio →</a></div>
${properties.length?properties.map(card).join(''):'<div class="text-center py-16 text-[#555]">No properties available.</div>'}
<div id="reModal" class="hidden fixed inset-0 z-[100000] flex items-end sm:items-center justify-center">
  <div class="absolute inset-0 bg-black/75" data-close-modal></div>
  <div class="relative bg-[#0d0d0d] border border-[#1e1e1e] rounded-t-[18px] sm:rounded-[18px] w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-4 z-10">
    <div id="reModalBody"></div>
  </div>
</div>`;

    const modal=root.querySelector('#reModal');
    const body=root.querySelector('#reModalBody');
    function openModal(html){ body.innerHTML=html; modal.classList.remove('hidden'); }
    function closeModal(){ modal.classList.add('hidden'); body.innerHTML=''; }
    modal.querySelector('[data-close-modal]').onclick=closeModal;

    root.querySelectorAll('[data-rooms]').forEach(btn=>{
      btn.onclick=()=>{
        const p=properties.find(x=>String(x._id)===String(btn.dataset.rooms));
        if(!p) return;
        const imgs=[p.main_image,...(p.room_images||[])].filter(Boolean);
        openModal(`<div class="flex justify-between items-center mb-3"><div class="font-medium text-white">${esc(p.name)} Rooms</div><button type="button" class="text-[#888]" data-x>×</button></div>
          <div class="grid grid-cols-2 gap-2">${imgs.map(u=>`<img src="${esc(u)}" class="rounded-lg w-full h-28 object-cover">`).join('')||'<div class="text-[#555] col-span-2 text-center py-8">No photos</div>'}</div>`);
        body.querySelector('[data-x]').onclick=closeModal;
      };
    });

    root.querySelectorAll('[data-invest]').forEach(btn=>{
      btn.onclick=()=>{
        const p=properties.find(x=>String(x._id)===String(btn.dataset.invest));
        if(!p) return;
        openModal(`
          <div class="flex justify-between items-center mb-3">
            <div class="font-semibold text-white">Invest</div>
            <button type="button" class="text-[#888] text-xl" data-x>×</button>
          </div>
          <div class="bg-[#0d0d0d] border border-[#1e1e1e] rounded-[11px] p-4 mb-3">
            <div class="font-semibold text-[.9rem]">${esc(p.name)}</div>
            <div class="text-[#555] text-[.72rem] flex items-center gap-1 mb-3"><i class="fa-solid fa-location-dot"></i>${esc(p.location)}</div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div><div class="font-semibold text-[.82rem]">${money(p.property_value)}</div><div class="text-[#444] text-[.62rem]">Value</div></div>
              <div><div class="font-semibold text-[.82rem] text-grn">${Number(p.roi_percentage||0)}% APY</div><div class="text-[#444] text-[.62rem]">Return</div></div>
              <div><div class="font-semibold text-[.82rem]">${Number(p.duration_days||365)} days</div><div class="text-[#444] text-[.62rem]">Duration</div></div>
            </div>
          </div>
          <div class="bg-[#111] border border-[#1e1e1e] rounded-[9px] p-3 flex justify-between mb-3">
            <span class="text-[#666] text-[.78rem]">Available Balance</span>
            <span class="font-semibold text-[.85rem]">${money(balance)}</span>
          </div>
          <div id="reErr" class="hidden bg-red-500/10 border border-red-500/30 text-red-400 text-[.78rem] rounded-[9px] px-3 py-2 mb-2"></div>
          <label class="text-[#666] text-[.78rem] mb-1 block">Investment Amount (min ${money(p.min_investment)} — max ${p.max_investment?money(p.max_investment):'∞'})</label>
          <input id="reAmount" type="number" step="0.01" min="${Number(p.min_investment||0)}" class="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[9px] px-4 py-3 text-[.88rem] text-white mb-2 outline-none" placeholder="Enter amount in USD">
          <div class="flex gap-2 flex-wrap mb-2" id="rePresets"></div>
          <div class="text-[.74rem] text-[#666] mb-3" id="reTokens">≈ 0 tokens</div>
          <button type="button" id="reSubmit" class="w-full py-[13px] rounded-[9px] bg-[#4a6cf7] text-white font-semibold text-[.9rem]"><i class="fa-solid fa-coins"></i> Invest Now</button>
        `);
        body.querySelector('[data-x]').onclick=closeModal;
        const presets=[500,1000,2500,5000].filter(x=>x>=Number(p.min_investment||0)&&(!p.max_investment||x<=Number(p.max_investment)));
        body.querySelector('#rePresets').innerHTML=presets.map(x=>`<button type="button" data-preset="${x}" class="px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[7px] text-[.74rem] text-[#aaa]">$${x.toLocaleString()}</button>`).join('');
        const amt=body.querySelector('#reAmount');
        const tok=body.querySelector('#reTokens');
        const tp=Number(p.token_price||1)||1;
        const upd=()=>{ const a=Number(amt.value||0); tok.textContent=`≈ ${Math.floor(a/tp).toLocaleString()} tokens at ${money(tp)}/token`; };
        amt.oninput=upd;
        body.querySelectorAll('[data-preset]').forEach(b=>{ b.onclick=()=>{ amt.value=b.dataset.preset; upd(); }; });
        body.querySelector('#reSubmit').onclick=async()=>{
          const amount=Number(amt.value||0);
          const err=body.querySelector('#reErr');
          err.classList.add('hidden');
          try{
            const x=await post('/real-estate/invest',{ property_id:p._id, amount });
            toast(x.message||`Investment successful! You now own ${x.tokens||Math.floor(amount/tp)} tokens in ${p.name}.`,true);
            closeModal();
            setTimeout(()=>location.href='/user/my-real-estate.html',600);
          }catch(e){
            err.textContent=e.response?.data?.message||e.message;
            err.classList.remove('hidden');
          }
        };
      };
    });
  }

  async function myRealEstate(){
    const root=inner()||document.querySelector('#main-content')||document.querySelector('.inner-page')||document.querySelector('.main')||document.body; showDynamicMain();
    if(!root){ toast('Page container not found',false); return; }
    root.innerHTML='<div class="p-8 text-center text-[#555]">Loading portfolio...</div>';
    let d; try{d=await get('/my-real-estate');}catch(e){toast(e.message,false);return;}
    const invs=d.investments||d.subscriptions||[];
    const active=invs.filter(x=>String(x.status).toLowerCase()==='active');
    const totalInvested=Number(d.totalInvested??active.reduce((s,x)=>s+Number(x.amount||0),0));
    const totalProfit=Number(d.totalProfit??invs.reduce((s,x)=>s+Number(x.profit_earned||0),0));

    function progress(inv){
      const start=new Date(inv.started_at).getTime();
      const end=new Date(inv.expires_at).getTime();
      if(!start||!end||end<=start) return {pct:0,left:0};
      const pct=Math.min(100,Math.max(0,((Date.now()-start)/(end-start))*100));
      const left=Math.max(0,Math.ceil((end-Date.now())/86400000));
      return {pct,left};
    }
    function invCard(inv){
      const p=inv.property_id||{};
      const st=String(inv.status||'active').toLowerCase();
      const pr=progress(inv);
      return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] overflow-hidden mb-3">
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <div class="font-semibold text-[.9rem]">${esc(p.name||'Property')}</div>
            <div class="text-[#555] text-[.72rem]">${esc(p.location||'')}</div>
          </div>
          <span class="px-2 py-0.5 rounded-[6px] border text-[.7rem] font-medium ${st==='active'?'text-emerald-400 bg-emerald-500/10 border-emerald-500/20':'text-[#888] bg-[#1a1a1a] border-[#2a2a2a]'}">${st.charAt(0).toUpperCase()+st.slice(1)}</span>
        </div>
        <div class="px-4 py-4 space-y-3">
          <div class="grid grid-cols-3 gap-3 text-center">
            <div><div class="font-semibold text-[.85rem]">${money(inv.amount)}</div><div class="text-[#444] text-[.65rem] mt-0.5">Invested</div></div>
            <div><div class="font-semibold text-[.85rem] text-grn">${money(inv.profit_earned)}</div><div class="text-[#444] text-[.65rem] mt-0.5">Profit</div></div>
            <div><div class="font-semibold text-[.85rem]">${Number(inv.tokens||0)}</div><div class="text-[#444] text-[.65rem] mt-0.5">Tokens</div></div>
          </div>
          ${st==='active'?`<div>
            <div class="flex items-center justify-between text-[.72rem] text-[#555] mb-1.5"><span>Progress</span><span>${pr.left} days left</span></div>
            <div class="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden"><div class="h-full bg-[#4a6cf7] rounded-full" style="width:${pr.pct}%"></div></div>
          </div>`:''}
          <div class="flex items-center justify-between text-[.74rem]">
            <div><span class="text-[#555]">Started:</span><span class="text-[#aaa] ml-1">${inv.started_at?new Date(inv.started_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</span></div>
            <div><span class="text-[#555]">Expires:</span><span class="text-[#aaa] ml-1">${inv.expires_at?new Date(inv.expires_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</span></div>
          </div>
          ${st==='active'?`<button type="button" data-cancel="${inv._id}" class="block w-full text-center py-2.5 rounded-[9px] border border-[#2a2a2a] bg-[#1a1a1a] text-[#aaa] text-[.8rem] font-medium hover:border-red-500/40 hover:text-red-400">Cancel Investment</button>`:''}
        </div>
      </div>`;
    }

    root.innerHTML=`
<div class="mb-3">
  <div class="text-white font-medium text-[1.05rem]">My Real Estate</div>
  <div class="text-[#555] text-[.78rem]">Your property investment portfolio</div>
</div>
<div class="grid grid-cols-3 gap-2 mb-4">
  <div class="bg-[#111] border border-[#1e1e1e] rounded-[12px] p-3">
    <div class="text-[#555] text-[.62rem] uppercase">Total Invested</div>
    <div class="text-white font-sora font-bold mt-1">${money(totalInvested)}</div>
  </div>
  <div class="bg-[#111] border border-[#1e1e1e] rounded-[12px] p-3">
    <div class="text-[#555] text-[.62rem] uppercase">Total Profit</div>
    <div class="text-grn font-sora font-bold mt-1">${money(totalProfit)}</div>
  </div>
  <div class="bg-[#111] border border-[#1e1e1e] rounded-[12px] p-3">
    <div class="text-[#555] text-[.62rem] uppercase">Active</div>
    <div class="text-white font-sora font-bold mt-1">${active.length}</div>
  </div>
</div>
<a href="/user/real-estate.html" class="inline-flex items-center gap-2 text-[.8rem] text-blue2 mb-4"><i class="fa-solid fa-building"></i> Browse Properties</a>
${invs.length?invs.map(invCard).join(''):'<div class="text-center py-16 text-[#555]">No investments yet.</div>'}
`;
    root.querySelectorAll('[data-cancel]').forEach(btn=>{
      btn.onclick=async()=>{
        if(!confirm('Cancel this investment? Your capital will be returned to your account.')) return;
        try{
          const x=await post('/real-estate/cancel/'+btn.dataset.cancel,{});
          toast(x.message||'Investment cancelled. Capital returned.',true);
          setTimeout(()=>myRealEstate(),400);
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    });
  }

  async function adminRealEstate(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading properties...</div>';
    let d; try{d=await get('/real-estate-properties');}catch(e){toast(e.message,false);return;}
    const props=d.properties||[];
    const st=d.stats||{};
    const total=st.total!=null?st.total:props.length;
    const active=st.active!=null?st.active:props.filter(p=>p.is_active!==false&&String(p.status)!=='Inactive').length;
    const inactive=st.inactive!=null?st.inactive:props.filter(p=>p.is_active===false||String(p.status)==='Inactive').length;
    const investors=st.activeInvestors!=null?st.activeInvestors:0;

    function tagB(t){
      t=String(t||'').toUpperCase();
      if(t==='HOT') return '<span class="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[.65rem] font-bold tracking-wide bg-red-500 text-white shadow-sm">HOT</span>';
      if(t==='TOP') return '<span class="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[.65rem] font-bold tracking-wide bg-amber-400 text-black shadow-sm">TOP</span>';
      if(t==='NEW') return '<span class="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[.65rem] font-bold tracking-wide bg-emerald-500 text-white shadow-sm">NEW</span>';
      return '';
    }

    function fmtValue(n){
      const v=Number(n||0);
      return v.toLocaleString(undefined,{maximumFractionDigits:0});
    }

    m.innerHTML=`
<div class="flex items-center justify-between mb-6 flex-wrap gap-3">
  <div>
    <h1 class="text-xl font-semibold text-content">Real Estate Properties</h1>
    <p class="text-sm text-content-muted mt-1">Manage tokenized real estate listings</p>
  </div>
  <div class="flex items-center gap-2">
    <a href="/admin/real-estate-investments.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-sm text-content hover:bg-slate-50">
      <i class="fa-solid fa-chart-bar text-xs"></i> Investments
    </a>
    <a href="/admin/real-estate-create.html" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90">
      <i class="fa-solid fa-plus text-xs"></i> Add Property
    </a>
  </div>
</div>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between">
    <div>
      <div class="text-[.65rem] uppercase tracking-wide text-content-muted font-medium">Total Properties</div>
      <div class="text-2xl font-semibold text-content mt-1">${total}</div>
    </div>
    <div class="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><i class="fa-solid fa-building"></i></div>
  </div>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between">
    <div>
      <div class="text-[.65rem] uppercase tracking-wide text-content-muted font-medium">Active</div>
      <div class="text-2xl font-semibold text-content mt-1">${active}</div>
    </div>
    <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500"><i class="fa-solid fa-circle-check"></i></div>
  </div>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between">
    <div>
      <div class="text-[.65rem] uppercase tracking-wide text-content-muted font-medium">Inactive</div>
      <div class="text-2xl font-semibold text-content mt-1">${inactive}</div>
    </div>
    <div class="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><i class="fa-solid fa-circle-xmark"></i></div>
  </div>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between">
    <div>
      <div class="text-[.65rem] uppercase tracking-wide text-content-muted font-medium">Active Investors</div>
      <div class="text-2xl font-semibold text-content mt-1">${investors}</div>
    </div>
    <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><i class="fa-solid fa-users"></i></div>
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
  ${props.map(p=>{
    const avail=p.available_tokens!=null?p.available_tokens:(Number(p.total_tokens||0)-Number(p.tokens_sold||0));
    const isActive=p.is_active!==false&&String(p.status)!=='Inactive';
    const img=p.main_image
      ? `<img src="${esc(p.main_image)}" alt="" class="w-full h-full object-cover">`
      : `<div class="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><i class="fa-solid fa-building text-5xl"></i></div>`;
    return `<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div class="relative h-44 bg-slate-100">
        ${img}
        ${tagB(p.tag)}
        <span class="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full text-[.65rem] font-medium ${isActive?'bg-emerald-50 text-emerald-600 border border-emerald-100':'bg-slate-100 text-slate-500 border border-slate-200'}">${isActive?'Active':'Inactive'}</span>
      </div>
      <div class="p-4 flex-1 flex flex-col">
        <div class="font-semibold text-[.95rem] text-content">${esc(p.name)}</div>
        <div class="text-xs text-content-muted mt-1 flex items-center gap-1"><i class="fa-solid fa-location-dot text-[.7rem]"></i> ${esc(p.location||'—')}</div>
        <div class="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <div class="font-semibold text-sm text-content">$${fmtValue(p.property_value)}</div>
            <div class="text-[.65rem] text-content-muted mt-0.5">Value</div>
          </div>
          <div>
            <div class="font-semibold text-sm text-emerald-600">${Number(p.roi_percentage||0).toFixed(1)}% APY</div>
            <div class="text-[.65rem] text-content-muted mt-0.5">Return</div>
          </div>
          <div>
            <div class="font-semibold text-sm text-content">${Number(avail).toLocaleString()}</div>
            <div class="text-[.65rem] text-content-muted mt-0.5">Available</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4 pt-1">
          <a href="/admin/admin-real-estate-edit.html?id=${p._id}" class="text-center py-2 rounded-xl border border-slate-200 bg-white text-sm text-content hover:bg-slate-50">Edit</a>
          <button type="button" data-del-prop="${p._id}" class="py-2 rounded-xl border border-red-100 bg-red-50 text-sm text-red-500 hover:bg-red-100">Delete</button>
        </div>
      </div>
    </div>`;
  }).join('')||'<div class="col-span-full text-center py-16 text-content-muted">No properties yet. <a href="/admin/real-estate-create.html" class="text-primary">Add Property</a></div>'}
</div>`;

    m.querySelectorAll('[data-del-prop]').forEach(btn=>{
      btn.onclick=async()=>{
        if(!confirm('Delete this property?')) return;
        try{
          const x=await del('/real-estate-properties/'+btn.dataset.delProp);
          toast(x.message||'property deleted successfully',true);
          adminRealEstate();
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    });
  }

async function adminRealEstateForm(edit){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    const id=edit?new URLSearchParams(location.search).get('id'):null;
    let p={};
    if(edit&&id){ try{p=(await get('/real-estate-properties/'+id)).property||{};}catch(e){toast(e.message,false);} }
    const rooms=Array.isArray(p.room_images)?p.room_images:[];
    m.innerHTML=`<div class="flex items-center justify-between mb-6">
      <div><h1 class="text-xl font-semibold text-content">${edit?'Edit Property':'Add New Property'}</h1>
      <p class="text-sm text-content-muted mt-1">${edit?esc(p.name||''):'Create a tokenized real estate listing'}</p></div>
      <a href="/admin/admin-real-estate.html" class="px-4 py-2 rounded-lg border border-border text-sm">Back</a>
    </div>
    <form id="reForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-5xl" enctype="multipart/form-data">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium">Property Name *</span><input name="name" required value="${esc(p.name||'')}" placeholder="e.g. Luxury Miami Condo" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Location *</span><input name="location" required value="${esc(p.location||'')}" placeholder="e.g. Miami, FL, USA" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm md:col-span-2"><span class="font-medium">Description</span><textarea name="description" rows="2" placeholder="Describe the property..." class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${esc(p.description||'')}</textarea></label>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span class="text-sm font-medium">Main Property Image ${edit?'':'*'}</span>
          <div class="mt-1 flex items-start gap-3 flex-wrap">
            <img id="mainPrev" src="${esc(p.main_image||'')}" alt="" class="h-24 w-40 rounded-lg object-cover border border-slate-200 ${p.main_image?'':'hidden'} bg-slate-50">
            <input name="main_image" type="file" accept="image/*" class="block w-full text-sm" id="mainImg">
          </div>
          <p class="text-xs text-content-muted mt-1">Upload a cover image (JPG/PNG/WebP)</p>
        </div>
        <label class="block text-sm"><span class="font-medium">Tag</span>
          <select name="tag" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
            <option value="">— None —</option>
            ${['HOT','TOP','NEW'].map(t=>`<option ${String(p.tag||'').toUpperCase()===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </label>
      </div>
      <div>
        <div class="text-sm font-medium mb-2">Room Gallery Images</div>
        <div class="space-y-3">
          ${[1,2,3,4,5,6].map(i=>`<div class="flex items-center gap-3 flex-wrap">
            <span class="text-xs text-content-muted w-14">Room ${i}</span>
            <img id="roomPrev${i}" src="${esc(rooms[i-1]||'')}" class="h-12 w-16 rounded object-cover border border-slate-200 ${rooms[i-1]?'':'hidden'} bg-slate-50" alt="">
            <input name="room_${i}" type="file" accept="image/*" class="text-sm flex-1" data-room-prev="${i}">
          </div>`).join('')}
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block text-sm"><span class="font-medium">Property Value (display) *</span><input name="property_value" type="number" step="any" required value="${p.property_value??''}" placeholder="e.g. 1400000" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">ROI Percentage (APY %) *</span><input name="roi_percentage" type="number" step="any" required value="${p.roi_percentage??''}" placeholder="e.g. 12.5" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Total Tokens *</span><input name="total_tokens" type="number" required value="${p.total_tokens??''}" placeholder="e.g. 8000" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Token Price ($) *</span><input name="token_price" type="number" step="any" required value="${p.token_price??''}" placeholder="e.g. 100" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Minimum Investment ($) *</span><input name="min_investment" type="number" step="any" required value="${p.min_investment??''}" placeholder="e.g. 500" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Maximum Investment ($) *</span><input name="max_investment" type="number" step="any" required value="${p.max_investment??''}" placeholder="e.g. 50000" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">ROI Interval *</span>
          <select name="roi_interval" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
            ${['Daily','Weekly','Monthly'].map(x=>`<option ${String(p.roi_interval||'Daily')===x?'selected':''}>${x}</option>`).join('')}
          </select>
        </label>
        <label class="block text-sm"><span class="font-medium">ROI Type *</span>
          <select name="roi_type" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
            <option>Percentage of invested amount</option>
          </select>
        </label>
        <label class="block text-sm"><span class="font-medium">ROI Amount per Interval *</span><input name="roi_amount_per_interval" type="number" step="any" value="${p.roi_amount_per_interval??''}" placeholder="e.g. 1.5" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
        <label class="block text-sm"><span class="font-medium">Duration (days) *</span><input name="duration_days" type="number" required value="${p.duration_days??365}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      </div>
      <div>
        <div class="text-sm font-medium mb-2">Property Features</div>
        <div class="grid grid-cols-3 gap-3">
          <input name="bedrooms" value="${esc(p.bedrooms||'')}" placeholder="3 beds" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <input name="bathrooms" value="${esc(p.bathrooms||'')}" placeholder="2 baths" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <input name="sqft" value="${esc(p.sqft||'')}" placeholder="1850 sqft" class="rounded-lg border border-slate-200 px-3 py-2 text-sm">
        </div>
      </div>
      <label class="block text-sm max-w-xs"><span class="font-medium">Status *</span>
        <select name="status" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
          <option ${p.status!=='Inactive'?'selected':''}>Active</option>
          <option ${p.status==='Inactive'?'selected':''}>Inactive</option>
        </select>
      </label>
      <div class="flex justify-end gap-2 pt-2">
        <a href="/admin/admin-real-estate.html" class="px-4 py-2 rounded-lg border border-border text-sm">Cancel</a>
        <button type="submit" class="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium">${edit?'Update Property':'Create Property'}</button>
      </div>
    </form>`;

    function bindPreview(input, img){
      if(!input||!img) return;
      input.addEventListener('change',()=>{
        const f=input.files&&input.files[0];
        if(!f) return;
        img.src=URL.createObjectURL(f);
        img.classList.remove('hidden');
      });
    }
    bindPreview(m.querySelector('#mainImg'), m.querySelector('#mainPrev'));
    for(let i=1;i<=6;i++){
      const inp=m.querySelector(`input[data-room-prev="${i}"]`);
      const img=m.querySelector(`#roomPrev${i}`);
      bindPreview(inp, img);
    }

    m.querySelector('#reForm').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      try{
        const cfg={ headers:{ 'Content-Type':'multipart/form-data' } };
        if(edit&&id) await window.api.put('/admin/dashboard/feature/real-estate-properties/'+id, fd, cfg);
        else await window.api.post('/admin/dashboard/feature/real-estate-properties', fd, cfg);
        toast(edit?'property updated successfully':'property created successfully',true);
        setTimeout(()=>location.href='/admin/admin-real-estate.html',500);
      }catch(err){ toast(err.response?.data?.message||err.message,false); }
    };
  }

async function adminRealEstateInvestments(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading investments...</div>';
    let d; try{d=await get('/real-estate-investments');}catch(e){toast(e.message,false);return;}
    const invs=d.investments||[];
    const st=d.stats||{};
    const props=d.properties||[];
    function rows(list){
      return list.map((inv,idx)=>{
        const u=inv.user_id||{};
        const p=inv.property_id||{};
        const status=String(inv.status||'active');
        return `<tr class="border-t border-slate-100">
          <td class="px-3 py-3 text-content-muted">${list.length-idx}</td>
          <td><div class="font-medium">${esc(u.name||u.username||'—')}</div><div class="text-xs text-content-muted">${esc(u.email||'')}</div></td>
          <td><div class="font-medium">${esc(p.name||'—')}</div><div class="text-xs text-content-muted">${esc(p.location||'')}</div></td>
          <td>${money(inv.amount)}</td>
          <td>${Number(inv.tokens||0)}</td>
          <td class="text-emerald-600">${money(inv.profit_earned)}</td>
          <td><span class="text-xs px-2 py-0.5 rounded-full ${status==='active'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'}">${status.charAt(0).toUpperCase()+status.slice(1)}</span></td>
          <td>${inv.expires_at?new Date(inv.expires_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
          <td>${inv.started_at?new Date(inv.started_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
        </tr>`;
      }).join('')||'<tr><td colspan="9" class="py-10 text-center text-content-muted">No investments</td></tr>';
    }
    m.innerHTML=`<div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div><h1 class="text-xl font-semibold text-content">Real Estate Investments</h1><p class="text-sm text-content-muted mt-1">All user investments across properties</p></div>
      <a href="/admin/admin-real-estate.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Properties</a>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      ${[['Total Investments',st.total??invs.length],['Active',st.active??invs.filter(x=>x.status==='active').length],['Expired',st.expired??invs.filter(x=>x.status==='expired').length],['Total Profit Paid',money(st.totalProfit??invs.reduce((s,x)=>s+Number(x.profit_earned||0),0))]].map(([l,v])=>`
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><div class="text-xs uppercase text-content-muted">${l}</div><div class="text-xl font-semibold mt-1">${v}</div></div>`).join('')}
    </div>
    <div class="flex flex-wrap gap-2 mb-4 items-end">
      <label class="text-sm"><span class="text-content-muted text-xs">Property</span>
        <select id="fProp" class="block mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All Properties</option>
          ${props.map(p=>`<option value="${p._id}">${esc(p.name)}</option>`).join('')}
        </select>
      </label>
      <label class="text-sm"><span class="text-content-muted text-xs">Status</span>
        <select id="fStatus" class="block mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <button type="button" id="fBtn" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">Filter</button>
      <button type="button" id="fReset" class="px-4 py-2 rounded-lg border border-border text-sm">Reset</button>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50">
          <th class="px-3 py-3">#</th><th>User</th><th>Property</th><th>Amount</th><th>Tokens</th><th>Profit Earned</th><th>Status</th><th>Expires</th><th>Date</th>
        </tr></thead>
        <tbody id="invRows">${rows(invs)}</tbody>
      </table>
    </div>`;
    function apply(){
      const pid=m.querySelector('#fProp').value;
      const stv=m.querySelector('#fStatus').value;
      let list=invs.slice();
      if(pid) list=list.filter(x=>String(x.property_id?._id||x.property_id)===pid);
      if(stv) list=list.filter(x=>String(x.status)===stv);
      m.querySelector('#invRows').innerHTML=rows(list);
    }
    m.querySelector('#fBtn').onclick=apply;
    m.querySelector('#fReset').onclick=()=>{ m.querySelector('#fProp').value=''; m.querySelector('#fStatus').value=''; apply(); };
  }



  async function myLoansPage(){
    const root=inner()||document.querySelector('#main-content')||document.body; showDynamicMain();
    if(!root) return;
    root.innerHTML='<div class="p-8 text-center text-[#555]">Loading loans...</div>';
    let d; try{d=await get('/my-loans');}catch(e){toast(e.message,false);return;}
    const loans=d.loans||[];
    const st=d.stats||{};
    function statusBadge(s){
      s=String(s||'').toLowerCase();
      const map={pending:'bg-amber-500/15 text-amber-400 border-amber-500/20',active:'bg-blue-500/15 text-blue-400 border-blue-500/20',repaying:'bg-blue-500/15 text-blue-400 border-blue-500/20',completed:'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',defaulted:'bg-red-500/15 text-red-400 border-red-500/20',rejected:'bg-slate-500/15 text-slate-400 border-slate-500/20'};
      const cls=map[s]||'bg-[#1a1a1a] text-[#888] border-[#2a2a2a]';
      return `<span class="px-2 py-0.5 rounded-md border text-[.7rem] font-medium ${cls}">${s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
    }
    function repayPct(loan){
      const total=Number(loan.total_repayable||0);
      const paid=Number(loan.total_repaid||0);
      if(!total) return 0;
      return Math.min(100,(paid/total)*100);
    }
    root.innerHTML=`
<div class="flex items-center justify-between mb-4 flex-wrap gap-2">
  <div>
    <div class="text-white font-medium text-[1.05rem]">My Loans</div>
    <div class="text-[#555] text-[.78rem]">Track and manage your loan applications</div>
  </div>
  <a href="/user/apply.html" class="px-4 py-2 rounded-lg bg-blue2 text-white text-[.8rem] font-medium">Apply for Loan</a>
</div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
  ${[['Active Loans',st.active??0],['Total Borrowed',money(st.totalBorrowed)],['Total Repaid',money(st.totalRepaid)],['Pending',st.pending??0]].map(([l,v])=>`
  <div class="bg-[#111] border border-[#1e1e1e] rounded-[12px] p-3">
    <div class="text-[#555] text-[.62rem] uppercase">${l}</div>
    <div class="text-white font-sora font-bold mt-1 text-[1.05rem]">${v}</div>
  </div>`).join('')}
</div>
<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead><tr class="text-left text-[.65rem] uppercase text-[#555] border-b border-[#1e1e1e]">
        <th class="px-3 py-3">#</th><th>Plan</th><th>Amount</th><th>Duration</th><th>Repayment</th><th>Status</th><th>Date</th><th></th>
      </tr></thead>
      <tbody>
        ${loans.length?loans.map((loan,i)=>{
          const plan=loan.plan_id||{};
          const pct=repayPct(loan);
          return `<tr class="border-t border-[#1a1a1a]">
            <td class="px-3 py-3 text-[#555]">${i+1}</td>
            <td class="text-white">${esc(plan.name||'—')}</td>
            <td>${money(loan.approved_amount||loan.amount)}</td>
            <td>${loan.duration_months||0} mo</td>
            <td>
              <div class="w-24 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden"><div class="h-full bg-blue2 rounded-full" style="width:${pct}%"></div></div>
              <div class="text-[.65rem] text-[#555] mt-0.5">${pct.toFixed(1)}%</div>
            </td>
            <td>${statusBadge(loan.status)}</td>
            <td class="text-[#888] text-[.75rem]">${loan.applied_at?new Date(loan.applied_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
            <td><a href="/user/loans-details.html?id=${loan._id}" class="text-blue2 text-[.8rem]">View</a></td>
          </tr>`;
        }).join(''):'<tr><td colspan="8" class="py-12 text-center text-[#555]">No loans yet.</td></tr>'}
      </tbody>
    </table>
  </div>
</div>`;
  }

  async function applyLoanPage(){
    const root=inner()||document.querySelector('#main-content')||document.body; showDynamicMain();
    if(!root) return;
    root.innerHTML='<div class="p-8 text-center text-[#555]">Loading plans...</div>';
    let d; try{d=await get('/loan-plans');}catch(e){toast(e.message,false);return;}
    const plans=d.plans||[];
    const balance=Number(d.balance||0);
    let selected=plans[0]||null;
    function planCard(p,on){
      return `<button type="button" data-plan="${p._id}" class="text-left w-full bg-[#111] border ${on?'border-blue2':'border-[#1e1e1e]'} rounded-[12px] p-3 mb-2 hover:border-[#2a2a2a] transition">
        <div class="flex justify-between items-start gap-2">
          <div class="font-medium text-white text-[.88rem]">${esc(p.name)}</div>
          <span class="text-[.7rem] px-2 py-0.5 rounded bg-[#1a1a1a] text-[#aaa]">${Number(p.interest_rate||0).toFixed(2)}% ${esc(p.interest_type||'Simple')}</span>
        </div>
        <p class="text-[#555] text-[.72rem] mt-1 line-clamp-2">${esc(p.description||'')}</p>
        <div class="grid grid-cols-2 gap-2 mt-2 text-[.72rem] text-[#888]">
          <div>Amount: <span class="text-[#ccc]">${money(p.min_amount)} – ${money(p.max_amount)}</span></div>
          <div>Duration: <span class="text-[#ccc]">${p.min_duration} – ${p.max_duration} mo</span></div>
          <div>Fee: <span class="text-[#ccc]">${Number(p.processing_fee||0).toFixed(2)}%</span></div>
          <div>Min Balance: <span class="text-[#ccc]">${money(p.min_account_balance)}</span></div>
        </div>
        ${p.requires_collateral?`<div class="text-amber-400 text-[.68rem] mt-1">Requires ${Number(p.collateral_percentage||0)}% collateral</div>`:''}
      </button>`;
    }
    function render(){
      root.innerHTML=`
<div class="mb-3 flex items-center gap-2">
  <button type="button" onclick="history.back()" class="w-8 h-8 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#888]"><i class="fa-solid fa-chevron-left"></i></button>
  <div>
    <div class="text-white font-medium">Apply for a Loan</div>
    <div class="text-[#555] text-[.72rem]">Choose a plan, enter your details, and preview your repayment</div>
  </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div class="lg:col-span-2">
    <div class="text-[.68rem] uppercase text-[#555] mb-2 tracking-wide">Available Plans</div>
    <div id="planList">${plans.map(p=>planCard(p,selected&&String(selected._id)===String(p._id))).join('')||'<div class="text-[#555] py-8 text-center">No plans available</div>'}</div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[12px] p-4 mt-3 space-y-3">
      <div class="text-[.68rem] uppercase text-[#555]">Loan Details</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="block text-[.78rem] text-[#888]">Loan Amount ($)
          <input id="loanAmt" type="number" step="0.01" class="mt-1 w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-white" placeholder="${selected?'Min: '+Number(selected.min_amount||0):''}">
        </label>
        <label class="block text-[.78rem] text-[#888]">Duration (months)
          <input id="loanMo" type="number" class="mt-1 w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-white" placeholder="${selected?(selected.min_duration+' – '+selected.max_duration):''}">
        </label>
      </div>
      <label class="block text-[.78rem] text-[#888]">Purpose of Loan
        <textarea id="loanPurpose" rows="2" class="mt-1 w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-white" placeholder="Describe why you need this loan..."></textarea>
      </label>
      <div id="applyErr" class="hidden text-red-400 text-[.78rem]"></div>
      <button type="button" id="submitLoan" class="px-4 py-2.5 rounded-lg bg-blue2 text-white text-[.85rem] font-medium disabled:opacity-40" ${selected?'':'disabled'}>Submit Application</button>
    </div>
  </div>
  <div class="space-y-3">
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[12px] p-4">
      <div class="text-[.68rem] uppercase text-[#555] mb-2">Repayment Preview</div>
      <div id="previewBox" class="text-[#555] text-[.8rem]">Enter amount and duration to see preview</div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[12px] p-4 flex justify-between items-center">
      <div class="text-[.68rem] uppercase text-[#555]">Your Account Balance</div>
      <div class="text-white font-medium">${money(balance)}</div>
    </div>
  </div>
</div>`;
      root.querySelectorAll('[data-plan]').forEach(btn=>{
        btn.onclick=()=>{ selected=plans.find(x=>String(x._id)===String(btn.dataset.plan)); render(); };
      });
      const amt=root.querySelector('#loanAmt');
      const mo=root.querySelector('#loanMo');
      async function updatePreview(){
        if(!selected||!amt.value||!mo.value) return;
        try{
          const x=await post('/loans/preview',{ plan_id:selected._id, amount:Number(amt.value), duration_months:Number(mo.value) });
          const p=x.preview||{};
          root.querySelector('#previewBox').innerHTML=`
            <div class="space-y-1.5 text-[.82rem]">
              <div class="flex justify-between"><span class="text-[#555]">Principal</span><span class="text-white">${money(p.amount)}</span></div>
              <div class="flex justify-between"><span class="text-[#555]">Processing Fee</span><span class="text-white">${money(p.fee)}</span></div>
              <div class="flex justify-between"><span class="text-[#555]">Interest</span><span class="text-white">${money(p.interest)}</span></div>
              <div class="flex justify-between font-medium pt-1 border-t border-[#1e1e1e]"><span class="text-[#888]">Total Repayable</span><span class="text-white">${money(p.total_repayable)}</span></div>
            </div>`;
        }catch(e){ root.querySelector('#previewBox').textContent=e.response?.data?.message||e.message; }
      }
      amt?.addEventListener('change',updatePreview);
      mo?.addEventListener('change',updatePreview);
      root.querySelector('#submitLoan')?.addEventListener('click',async()=>{
        const err=root.querySelector('#applyErr');
        err.classList.add('hidden');
        try{
          const x=await post('/loans/apply',{
            plan_id:selected._id,
            amount:Number(amt.value),
            duration_months:Number(mo.value),
            purpose:root.querySelector('#loanPurpose').value
          });
          toast(x.message||'Loan application submitted successfully.',true);
          setTimeout(()=>location.href='/user/my-loans.html',600);
        }catch(e){
          err.textContent=e.response?.data?.message||e.message;
          err.classList.remove('hidden');
        }
      });
    }
    render();
  }

  async function loanDetailsPage(){
    showDynamicMain();
    const main=document.getElementById('main-content')||document.querySelector('main');
    let root=document.querySelector('#main-content .inner-page')||document.querySelector('.inner-page');
    if(!root && main){ main.innerHTML='<div class="inner-page p-4"></div>'; root=main.querySelector('.inner-page'); }
    if(!root) root=main||document.body;
    root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading loan details...</div>';
    if(main){ main.style.visibility='visible'; main.style.opacity='1'; }

    const id=new URLSearchParams(location.search).get('id');
    if(!id){
      root.innerHTML='<div class="p-8 text-center text-[#555]">Missing loan id. <a class="text-blue2" href="/user/my-loans.html">Back to My Loans</a></div>';
      return;
    }
    const flash=sessionStorage.getItem('loan_repay_flash');
    if(flash){ sessionStorage.removeItem('loan_repay_flash'); setTimeout(()=>toast(flash,true),250); }

    let d;
    try{ d=await get('/loans/'+id); }
    catch(e){
      root.innerHTML=`<div class="p-8 text-center text-red-400">${esc(e.response?.data?.message||e.message||'Failed to load loan')}<div class="mt-3"><a class="text-blue2" href="/user/my-loans.html">Back to My Loans</a></div></div>`;
      return;
    }

    const loan=d.loan||{};
    const plan=loan.plan_id||{};
    const pr=d.progress||{ paid:0, remaining:0, total:0, pct:0 };
    const next=d.nextPayment;
    const pct=Number(pr.pct||0).toFixed(1);
    const schedule=Array.isArray(loan.schedule)?loan.schedule:[];
    const balance=Number(d.balance||0);

    // payment methods for "Pay via New Deposit"
    let methods=[
      { id:'btc', name:'Bitcoin', icon:'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400' },
      { id:'usdt', name:'USDT', icon:'https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661' },
      { id:'eth', name:'Ethereum', icon:'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628' },
      { id:'sol', name:'Solana', icon:'https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756' }
    ];
    try{
      const w=await get('/wallets');
      const list=w.wallets||w.methods||w.addresses||[];
      if(Array.isArray(list)&&list.length){
        methods=list.map((m,i)=>({
          id:String(m._id||m.id||i),
          name:m.name||m.coin||m.method||'Crypto',
          icon:m.icon||m.logo||m.image||'',
          address:m.address||m.wallet_address||''
        }));
      }
    }catch(_){}

    function statusBadge(s){
      s=String(s||'').toLowerCase();
      const map={pending:'text-amber-400',active:'text-blue-400',repaying:'text-blue-400',completed:'text-emerald-400',defaulted:'text-red-400',rejected:'text-[#888]'};
      return `<span class="${map[s]||'text-[#888]'}">${s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
    }

    root.innerHTML=`
<div class="mb-4 flex items-center gap-2">
  <a href="/user/my-loans.html" class="w-8 h-8 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#888] flex items-center justify-center"><i class="fa-solid fa-chevron-left"></i></a>
  <div>
    <div class="text-white font-medium">Loan #${String(loan._id||'').slice(-4)}</div>
    <div class="text-[#555] text-[.75rem]">${esc(plan.name||'Loan')} · ${statusBadge(loan.status)}</div>
  </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div class="lg:col-span-2 space-y-3">
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-4">
      <div class="text-[.68rem] uppercase text-[#555] mb-3">Loan Details</div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[.82rem]">
        <div><div class="text-[#555] text-[.68rem]">Requested Amount</div><div class="text-white font-medium">${money(loan.amount)}</div></div>
        <div><div class="text-[#555] text-[.68rem]">Approved Amount</div><div class="text-white font-medium">${money(loan.approved_amount||0)}</div></div>
        <div><div class="text-[#555] text-[.68rem]">Duration</div><div class="text-white font-medium">${loan.duration_months||0} months</div></div>
        <div><div class="text-[#555] text-[.68rem]">Interest Rate</div><div class="text-white font-medium">${Number(loan.interest_rate||0).toFixed(2)}% ${esc(loan.interest_type||'')}</div></div>
        <div><div class="text-[#555] text-[.68rem]">Processing Fee</div><div class="text-white font-medium">${money(loan.processing_fee)}</div></div>
        <div><div class="text-[#555] text-[.68rem]">Total Repayable</div><div class="text-white font-medium">${money(loan.total_repayable)}</div></div>
        <div><div class="text-[#555] text-[.68rem]">Disbursed</div><div class="text-white font-medium">${loan.disbursed_at?new Date(loan.disbursed_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</div></div>
        <div><div class="text-[#555] text-[.68rem]">Maturity Date</div><div class="text-white font-medium">${loan.maturity_date?new Date(loan.maturity_date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</div></div>
        <div><div class="text-[#555] text-[.68rem]">Applied</div><div class="text-white font-medium">${loan.applied_at?new Date(loan.applied_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</div></div>
      </div>
      <div class="mt-3 pt-3 border-t border-[#1e1e1e] text-[.78rem]"><span class="text-[#555]">Purpose</span><div class="text-[#aaa] mt-1">${esc(loan.purpose||'—')}</div></div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] overflow-hidden">
      <div class="px-4 py-3 text-[.68rem] uppercase text-[#555] border-b border-[#1e1e1e]">Repayment Schedule</div>
      <div class="overflow-x-auto">
        <table class="w-full text-[.78rem]">
          <thead><tr class="text-left text-[#555] border-b border-[#1a1a1a]">
            <th class="px-3 py-2">#</th><th>Due Date</th><th>Principal</th><th>Interest</th><th>Total</th><th>Late Fee</th><th>Status</th><th></th>
          </tr></thead>
          <tbody id="schedBody">
            ${schedule.map((item,idx)=>{
              const st=String(item.status||'upcoming');
              const canPay=st==='upcoming'||st==='overdue';
              const sid=item._id||idx;
              const dueAmt=Number(item.total||0)+Number(item.late_fee||0);
              return `<tr class="border-t border-[#1a1a1a]" data-row="${idx}">
                <td class="px-3 py-2 text-[#555]">${idx+1}</td>
                <td>${item.due_date?new Date(item.due_date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
                <td>${money(item.principal)}</td>
                <td>${money(item.interest)}</td>
                <td>${money(item.total)}</td>
                <td>${item.late_fee?money(item.late_fee):'—'}</td>
                <td class="${st==='paid'?'text-emerald-400':st==='overdue'?'text-red-400':'text-[#888]'}">${st.charAt(0).toUpperCase()+st.slice(1)}</td>
                <td>${canPay?`<button type="button" class="open-pay px-2.5 py-1.5 rounded-lg bg-blue2 text-white text-[.72rem] font-medium whitespace-nowrap" data-idx="${idx}" data-sid="${sid}" data-amt="${dueAmt}" data-inst="${idx+1}">Pay ${money(dueAmt)}</button>`:''}</td>
              </tr>
              <tr class="pay-panel-row hidden" data-panel="${idx}">
                <td colspan="8" class="px-3 py-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
                  <div class="max-w-lg space-y-4">
                    <div class="rounded-[10px] border border-[#1e1e1e] p-4">
                      <h4 class="text-[.82rem] font-semibold text-white mb-2">Pay from Account Balance</h4>
                      <p class="text-[.78rem] text-[#aaa] mb-3">Available balance: <span class="font-medium text-white">${money(balance)}</span></p>
                      <button type="button" class="pay-balance w-full py-[11px] rounded-[10px] bg-[#4a6cf7] text-white text-[.82rem] font-medium" data-idx="${idx}" data-sid="${sid}" data-amt="${dueAmt}">
                        Pay ${money(dueAmt)} from Balance
                      </button>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="flex-1 border-t border-[#1e1e1e]"></div>
                      <span class="text-[.68rem] text-[#555] uppercase tracking-wide">or</span>
                      <div class="flex-1 border-t border-[#1e1e1e]"></div>
                    </div>
                    <div class="rounded-[10px] border border-[#1e1e1e] p-4">
                      <h4 class="text-[.82rem] font-semibold text-white mb-2">Pay via New Deposit</h4>
                      <p class="text-[.78rem] text-[#aaa] mb-3">Make a deposit using one of the methods below. Your loan payment will be applied once admin verifies the deposit.</p>
                      <div class="grid grid-cols-2 gap-2 mb-3 method-grid" data-idx="${idx}">
                        ${methods.map((m,mi)=>`
                          <button type="button" data-method="${esc(m.name)}" data-mid="${esc(m.id)}" class="method-btn flex items-center gap-2 p-3 rounded-[10px] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-all text-left">
                            ${m.icon?`<img src="${esc(m.icon)}" alt="" class="w-8 h-8 rounded object-contain bg-[#161616] p-0.5">`:`<div class="w-8 h-8 rounded bg-[#161616]"></div>`}
                            <span class="truncate text-white text-[.72rem] font-medium">${esc(m.name)}</span>
                          </button>`).join('')}
                      </div>
                      <button type="button" class="pay-deposit w-full py-[11px] rounded-[10px] bg-[#4a6cf7] text-white text-[.82rem] font-medium opacity-50" disabled data-idx="${idx}" data-sid="${sid}" data-amt="${dueAmt}" data-inst="${idx+1}">
                        Continue with Selected Method
                      </button>
                    </div>
                  </div>
                </td>
              </tr>`;
            }).join('')||'<tr><td colspan="8" class="py-8 text-center text-[#555]">No schedule yet (loan may still be pending approval)</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="space-y-3">
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
      <p class="text-[.68rem] font-medium text-[#444] uppercase tracking-wide mb-3">Repayment Progress</p>
      <div class="flex items-center justify-center mb-4">
        <div class="relative w-32 h-32">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a1a1a" stroke-width="3"></path>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4a6cf7" stroke-width="3" stroke-dasharray="${pct}, 100"></path>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center"><span class="font-sora font-bold text-white text-[1.1rem]">${pct}%</span></div>
        </div>
      </div>
      <div class="space-y-2 text-[.82rem]">
        <div class="flex justify-between"><span class="text-[#555]">Paid</span><span class="text-grn font-medium">${money(pr.paid)}</span></div>
        <div class="flex justify-between"><span class="text-[#555]">Remaining</span><span class="text-white font-medium">${money(pr.remaining)}</span></div>
        <div class="flex justify-between"><span class="text-[#555]">Total</span><span class="text-white font-medium">${money(pr.total)}</span></div>
      </div>
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]">
      <p class="text-[.68rem] font-medium text-[#444] uppercase tracking-wide mb-2">Next Payment</p>
      ${next?`<p class="font-sora font-bold text-white text-[1.2rem]">${money(next.total)}</p>
        <p class="text-[#aaa] text-[.82rem]">Due ${next.due_date?new Date(next.due_date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</p>
        ${String(next.status)==='overdue'?`<p class="text-red2 font-medium text-[.72rem] mt-1">Overdue</p>`:''}
        <button type="button" class="open-pay mt-3 w-full py-2.5 rounded-lg bg-blue2 text-white text-[.82rem] font-medium" data-idx="${Math.max(0,schedule.findIndex(x=>String(x.status)==='upcoming'||String(x.status)==='overdue'))}" data-sid="${(next&&next._id)||''}" data-amt="${Number(next.total||0)+Number(next.late_fee||0)}" data-inst="${Math.max(1,schedule.findIndex(x=>String(x.status)==='upcoming'||String(x.status)==='overdue')+1)}">Pay ${money(Number(next.total||0)+Number(next.late_fee||0))}</button>`
        :'<p class="text-[#555] text-[.8rem]">No upcoming payment</p>'}
    </div>
  </div>
</div>`;

    // Toggle pay panel (template style — not a custom modal)
    const selectedMethods={};
    root.querySelectorAll('.open-pay').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const idx=btn.dataset.idx;
        root.querySelectorAll('.pay-panel-row').forEach(r=>{
          if(r.dataset.panel===idx) r.classList.toggle('hidden');
          else r.classList.add('hidden');
        });
        // scroll panel into view
        const panel=root.querySelector(`.pay-panel-row[data-panel="${idx}"]`);
        panel?.scrollIntoView({ behavior:'smooth', block:'nearest' });
      });
    });

    root.querySelectorAll('.method-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const grid=btn.closest('.method-grid');
        const idx=grid.dataset.idx;
        grid.querySelectorAll('.method-btn').forEach(b=>{
          b.classList.remove('border-blue2','bg-[rgba(74,108,247,.1)]','ring-1','ring-blue2');
          b.classList.add('border-[#1e1e1e]');
        });
        btn.classList.add('border-blue2','bg-[rgba(74,108,247,.1)]','ring-1','ring-blue2');
        btn.classList.remove('border-[#1e1e1e]');
        selectedMethods[idx]=btn.dataset.method;
        const cont=root.querySelector(`.pay-deposit[data-idx="${idx}"]`);
        if(cont){ cont.disabled=false; cont.classList.remove('opacity-50'); }
      });
    });

    root.querySelectorAll('.pay-balance').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const amt=Number(btn.dataset.amt||0);
        if(!confirm(`Deduct ${money(amt)} from your account balance?`)) return;
        try{
          const x=await post('/loans/'+id+'/repay',{
            schedule_id: btn.dataset.sid,
            amount: amt
          });
          sessionStorage.setItem('loan_repay_flash', x.message||`Payment of ${money(amt)} recorded successfully.`);
          toast(x.message||'Payment recorded successfully.',true);
          setTimeout(()=>loanDetailsPage(),500);
        }catch(e){ toast(e.response?.data?.message||e.message,false); }
      });
    });

    root.querySelectorAll('.pay-deposit').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const idx=btn.dataset.idx;
        const method=selectedMethods[idx];
        if(!method){ toast('Select a payment method',false); return; }
        const amt=Number(btn.dataset.amt||0);
        btn.disabled=true;
        const prev=btn.textContent;
        btn.textContent='Redirecting...';
        try{
          // Same as normal deposit: store draft → go to payment.html for address + proof
          const x=await post('/loans/'+id+'/repay-deposit',{
            amount: amt,
            method,
            payment_method: method,
            schedule_id: btn.dataset.sid,
            installment: btn.dataset.inst
          });
          const dest=(x.redirect)||'/user/payment.html';
          location.href=dest;
        }catch(e){
          btn.disabled=false;
          btn.textContent=prev;
          toast(e.response?.data?.message||e.message,false);
        }
      });
    });
  }

async function adminLoanPlans(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d; try{d=await get('/loan-plans');}catch(e){toast(e.message,false);return;}
    const plans=d.plans||[];
    const loans=d.loans||[];
    const st=d.stats||{};
    let tab='plans';

    function loanRows(list){
      return list.map(loan=>{
        const u=loan.user_id||{};
        const p=loan.plan_id||{};
        const status=String(loan.status||'');
        const actions = status==='pending'
          ? `<a href="/admin/loans-view.html?id=${loan._id}" class="text-primary text-sm mr-2">View</a>
             <button type="button" data-approve="${loan._id}" class="text-emerald-600 text-sm">Approve</button>`
          : `<a href="/admin/loans-view.html?id=${loan._id}" class="text-primary text-sm">View</a>`;
        return `<tr class="border-t border-slate-100">
          <td class="px-3 py-3"><div class="font-medium">${esc(u.name||u.username||'—')}</div><div class="text-xs text-content-muted">${esc(u.email||'')}</div></td>
          <td>${esc(p.name||'—')}</td>
          <td>${money(loan.approved_amount||loan.amount)}</td>
          <td>${Number(loan.interest_rate||0).toFixed(2)}%</td>
          <td>${loan.duration_months||0} mo</td>
          <td>${money(loan.total_repayable)}</td>
          <td>${money(loan.total_repaid)}</td>
          <td><span class="text-xs px-2 py-0.5 rounded-full ${status==='pending'?'bg-amber-50 text-amber-600':status==='defaulted'?'bg-red-50 text-red-600':status==='completed'?'bg-emerald-50 text-emerald-600':'bg-blue-50 text-blue-600'}">${status.charAt(0).toUpperCase()+status.slice(1)}</span></td>
          <td class="text-xs text-content-muted">${loan.applied_at?new Date(loan.applied_at).toLocaleDateString():'—'}</td>
          <td>${actions}</td>
        </tr>`;
      }).join('')||'<tr><td colspan="10" class="py-10 text-center text-content-muted">No loans</td></tr>';
    }

    function render(){
      const pendingN=loans.filter(x=>x.status==='pending').length;
      m.innerHTML=`
<div class="flex items-center justify-between mb-6 flex-wrap gap-3">
  <div><h1 class="text-xl font-semibold text-content">Manage Loans</h1><p class="text-sm text-content-muted mt-1">Manage loan plans and applications</p></div>
</div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  ${[['Total Disbursed',money(st.totalDisbursed),'fa-sack-dollar'],['Outstanding',money(st.outstanding),'fa-scale-balanced'],['Total Collected',money(st.totalCollected),'fa-circle-check'],['Pending / Defaulted',st.pendingDefaulted||((st.pending||0)+' / '+(st.defaulted||0)),'fa-triangle-exclamation']].map(([l,v,ico])=>`
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex justify-between">
    <div><div class="text-[.65rem] uppercase text-content-muted">${l}</div><div class="text-xl font-semibold mt-1">${v}</div></div>
    <div class="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><i class="fa-solid ${ico}"></i></div>
  </div>`).join('')}
</div>
<div class="flex gap-4 border-b border-slate-200 mb-4 text-sm overflow-x-auto">
  ${[['plans','Loan Plans'],['pending','Pending '+(pendingN||'')],['active','Active'],['completed','Completed'],['defaulted','Defaulted'],['all','All']].map(([k,l])=>`
  <button type="button" data-tab="${k}" class="pb-2 border-b-2 ${tab===k?'border-primary text-primary':'border-transparent text-content-muted'} whitespace-nowrap">${l}</button>`).join('')}
</div>
<div id="tabBody"></div>`;
      const body=m.querySelector('#tabBody');
      if(tab==='plans'){
        body.innerHTML=`
<div class="flex justify-between items-center mb-3">
  <div class="font-medium text-content">Loan Plans</div>
  <a href="/admin/loan-plans-create.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">+ Create Plan</a>
</div>
<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
  <table class="w-full text-sm">
    <thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50">
      <th class="px-3 py-3">#</th><th>Name</th><th>Rate (APR)</th><th>Amount Range</th><th>Duration</th><th>Fee</th><th>Active Loans</th><th>Status</th><th>Actions</th>
    </tr></thead>
    <tbody>
      ${plans.map((p,i)=>`<tr class="border-t border-slate-100">
        <td class="px-3 py-3 text-content-muted">${i+1}</td>
        <td class="font-medium">${esc(p.name)}</td>
        <td>${Number(p.interest_rate||0).toFixed(2)}% (${esc(p.interest_type||'Simple')})</td>
        <td>${money(p.min_amount)} – ${money(p.max_amount)}</td>
        <td>${p.min_duration}–${p.max_duration} mo</td>
        <td>${Number(p.processing_fee||0).toFixed(2)}%</td>
        <td>${p.active_loans||0}</td>
        <td><span class="text-xs ${p.is_active!==false?'text-emerald-600':'text-slate-400'}">${p.is_active!==false?'Active':'Inactive'}</span></td>
        <td class="space-x-2">
          <a href="/admin/loan-plans-edit.html?id=${p._id}" class="px-2 py-1 rounded border border-slate-200 text-xs">Edit</a>
          <button type="button" data-toggle="${p._id}" class="px-2 py-1 rounded border border-amber-200 text-amber-600 text-xs">${p.is_active!==false?'Deactivate':'Activate'}</button>
        </td>
      </tr>`).join('')||'<tr><td colspan="9" class="py-10 text-center text-content-muted">No plans</td></tr>'}
    </tbody>
  </table>
</div>`;
      } else {
        let list=loans;
        if(tab==='pending') list=loans.filter(x=>x.status==='pending');
        else if(tab==='active') list=loans.filter(x=>['active','repaying'].includes(x.status));
        else if(tab==='completed') list=loans.filter(x=>x.status==='completed');
        else if(tab==='defaulted') list=loans.filter(x=>x.status==='defaulted');
        body.innerHTML=`<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-xs text-slate-500 uppercase bg-slate-50">
              <th class="px-3 py-3">User</th><th>Plan</th><th>Amount</th><th>Rate</th><th>Duration</th><th>Total Repayable</th><th>Repaid</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr></thead>
            <tbody>${loanRows(list)}</tbody>
          </table>
        </div>`;
      }
      m.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ tab=b.dataset.tab; render(); });
      m.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=async()=>{
        try{ const x=await post('/loan-plans/'+b.dataset.toggle+'/toggle',{}); toast(x.message,true); adminLoanPlans(); }
        catch(e){toast(e.response?.data?.message||e.message,false);}
      });
      m.querySelectorAll('[data-approve]').forEach(b=>b.onclick=async()=>{
        if(!confirm('Approve this loan and credit funds?')) return;
        try{ const x=await post('/loans/'+b.dataset.approve+'/approve',{}); toast(x.message||'Loan approved, schedule generated, and funds credited.',true); adminLoanPlans(); }
        catch(e){toast(e.response?.data?.message||e.message,false);}
      });
    }
    render();
  }

  async function adminLoanPlanForm(edit){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    const id=edit?new URLSearchParams(location.search).get('id'):null;
    let p={};
    if(edit&&id){ try{p=(await get('/loan-plans/'+id)).plan||{};}catch(e){toast(e.message,false);} }
    m.innerHTML=`
<div class="mb-6"><h1 class="text-xl font-semibold text-content">${edit?'Edit Loan Plan: '+esc(p.name||''):'Create Loan Plan'}</h1></div>
<form id="loanPlanForm" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-3xl">
  <label class="block text-sm"><span class="font-medium">Plan Name *</span>
    <input name="name" required value="${esc(p.name||'')}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
  <label class="block text-sm"><span class="font-medium">Description</span>
    <textarea name="description" rows="2" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">${esc(p.description||'')}</textarea></label>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block text-sm"><span class="font-medium">Minimum Amount ($) *</span><input name="min_amount" type="number" step="any" required value="${p.min_amount??100}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
    <label class="block text-sm"><span class="font-medium">Maximum Amount ($) *</span><input name="max_amount" type="number" step="any" required value="${p.max_amount??50000}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
    <label class="block text-sm"><span class="font-medium">Interest Rate (APR %) *</span><input name="interest_rate" type="number" step="any" required value="${p.interest_rate??5}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
    <label class="block text-sm"><span class="font-medium">Interest Type *</span>
      <select name="interest_type" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
        <option ${p.interest_type!=='Compound'?'selected':''}>Simple</option>
        <option ${p.interest_type==='Compound'?'selected':''}>Compound</option>
      </select></label>
    <label class="block text-sm"><span class="font-medium">Min Duration (months) *</span><input name="min_duration" type="number" required value="${p.min_duration??1}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
    <label class="block text-sm"><span class="font-medium">Max Duration (months) *</span><input name="max_duration" type="number" required value="${p.max_duration??60}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
  </div>
  <div class="text-sm font-medium text-content">Eligibility & Limits</div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label class="block text-sm"><span class="font-medium">Max Active Loans Per User *</span><input name="max_active_loans" type="number" required value="${p.max_active_loans??1}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
    <label class="block text-sm"><span class="font-medium">Min Account Balance ($) *</span><input name="min_account_balance" type="number" step="any" required value="${p.min_account_balance??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
  </div>
  <div class="text-sm font-medium text-content">Fees & Penalties</div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <label class="block text-sm"><span class="font-medium">Processing Fee (%) *</span><input name="processing_fee" type="number" step="any" required value="${p.processing_fee??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
    <label class="block text-sm"><span class="font-medium">Grace Period (days) *</span><input name="grace_period_days" type="number" required value="${p.grace_period_days??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
    <label class="block text-sm"><span class="font-medium">Late Fee (%) *</span><input name="late_fee" type="number" step="any" required value="${p.late_fee??0}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
  </div>
  <div class="text-sm font-medium text-content">Collateral</div>
  <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="requires_collateral" ${p.requires_collateral?'checked':''}> Requires Collateral</label>
  <label class="block text-sm max-w-sm"><span class="font-medium">Collateral Percentage (%)</span><input name="collateral_percentage" type="number" step="any" value="${p.collateral_percentage??''}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Percentage of loan amount frozen from user's balance"></label>
  <div class="flex gap-2 pt-2">
    <button type="submit" class="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium">${edit?'Update Plan':'Create Plan'}</button>
    <a href="/admin/loan-plans.html" class="px-4 py-2 rounded-lg border border-border text-sm">Cancel</a>
  </div>
</form>`;
    m.querySelector('#loanPlanForm').onsubmit=async e=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const body=Object.fromEntries(fd.entries());
      body.requires_collateral = !!fd.get('requires_collateral');
      try{
        if(edit&&id) await put('/loan-plans/'+id, body);
        else await post('/loan-plans', body);
        toast(edit?'loan plan updated successfully':'loan plan created successfully',true);
        setTimeout(()=>location.href='/admin/loan-plans.html',500);
      }catch(err){toast(err.response?.data?.message||err.message,false);}
    };
  }

  async function adminLoanView(){
    const m=adminMain(); showDynamicMain(); if(!m)return;
    const id=new URLSearchParams(location.search).get('id');
    if(!id){ m.innerHTML='<div class="p-8 text-content-muted">Missing loan id</div>'; return; }
    m.innerHTML='<div class="p-8 text-center text-content-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d; try{d=await get('/loans/'+id);}catch(e){toast(e.message,false);return;}
    const loan=d.loan||{};
    const u=loan.user_id||{};
    const plan=loan.plan_id||{};
    const elig=d.eligibility||[];
    const pending=loan.status==='pending';
    const active=['active','repaying'].includes(loan.status);
    m.innerHTML=`
<div class="flex items-center justify-between mb-6 flex-wrap gap-3">
  <div>
    <h1 class="text-xl font-semibold text-content">Loan #${String(loan._id).slice(-4)} Details</h1>
    <p class="text-sm text-content-muted mt-1">Loan application details and actions</p>
  </div>
  <a href="/admin/loan-plans.html" class="px-4 py-2 rounded-lg border border-border text-sm">← Back to Loans</a>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
    <div class="font-medium mb-3">Loan Summary</div>
    <div class="space-y-2 text-sm">
      ${[['Loan ID','#'+String(loan._id).slice(-4)],['Plan',plan.name||'—'],['Requested Amount',money(loan.amount)],['Interest Rate',Number(loan.interest_rate||0).toFixed(2)+'% APR ('+(loan.interest_type||'Simple')+')'],['Duration',(loan.duration_months||0)+' months'],['Processing Fee',money(loan.processing_fee)],['Total Repayable',money(loan.total_repayable)],['Total Repaid',money(loan.total_repaid)],['Status',loan.status],['Applied',loan.applied_at?new Date(loan.applied_at).toLocaleString():'—'],['Monthly income',money(loan.monthly_income)],['Purpose',loan.purpose||'—']].map(([k,v])=>`
      <div class="flex justify-between border-b border-slate-50 py-2"><span class="text-content-muted">${k}</span><span class="font-medium text-right max-w-[60%]">${esc(String(v))}</span></div>`).join('')}
    </div>
  </div>
  <div class="space-y-4">
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div class="font-medium mb-3">Applicant</div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between"><span class="text-content-muted">Name</span><span>${esc(u.name||u.username||'—')}</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Email</span><span>${esc(u.email||'—')}</span></div>
        <div class="flex justify-between"><span class="text-content-muted">Account Balance</span><span>${money(u.account_bal)}</span></div>
      </div>
    </div>
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div class="font-medium mb-3">Eligibility Checks</div>
      <div class="space-y-2 text-sm">
        ${elig.map(e=>`<div class="flex justify-between gap-2">
          <span class="${e.pass?'text-emerald-600':'text-red-500'} text-xs font-medium">${e.pass?'PASS':'FAIL'}</span>
          <span class="flex-1 text-content-muted">${esc(e.label)}</span>
          <span class="text-xs text-content-muted">${esc(e.detail||'')}</span>
        </div>`).join('')||'<div class="text-content-muted text-sm">—</div>'}
      </div>
    </div>
    ${pending?`<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
      <div class="font-medium">Actions</div>
      <label class="block text-sm"><span class="text-content-muted">Approved Amount</span>
        <input id="apprAmt" type="number" step="0.01" value="${loan.amount}" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></label>
      <button type="button" id="btnApprove" class="w-full py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">Approve & Disburse</button>
      <hr class="border-slate-100">
      <label class="block text-sm"><span class="text-content-muted">Rejection Reason *</span>
        <textarea id="rejReason" rows="2" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"></textarea></label>
      <button type="button" id="btnReject" class="w-full py-2 rounded-lg bg-red-500 text-white text-sm font-medium">Reject Application</button>
    </div>`:''}
    ${active?`<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div class="font-medium mb-3">Risk Actions</div>
      <button type="button" id="btnDefault" class="w-full py-2 rounded-lg border border-red-200 text-red-600 text-sm">Mark as Defaulted</button>
    </div>`:''}
  </div>
</div>`;
    m.querySelector('#btnApprove')?.addEventListener('click',async()=>{
      try{
        const x=await post('/loans/'+id+'/approve',{ approved_amount:Number(m.querySelector('#apprAmt').value) });
        toast(x.message||'Loan approved, schedule generated, and funds credited.',true);
        setTimeout(()=>adminLoanView(),500);
      }catch(e){toast(e.response?.data?.message||e.message,false);}
    });
    m.querySelector('#btnReject')?.addEventListener('click',async()=>{
      const reason=m.querySelector('#rejReason').value.trim();
      if(!reason){toast('Rejection reason is required',false);return;}
      try{
        const x=await post('/loans/'+id+'/reject',{ rejection_reason:reason });
        toast(x.message||'Loan application rejected.',true);
        setTimeout(()=>adminLoanView(),500);
      }catch(e){toast(e.response?.data?.message||e.message,false);}
    });
    m.querySelector('#btnDefault')?.addEventListener('click',async()=>{
      if(!confirm('Are you sure you want to mark this loan as defaulted?')) return;
      try{
        const x=await post('/loans/'+id+'/default',{});
        toast(x.message||'Loan marked as defaulted.',true);
        setTimeout(()=>adminLoanView(),500);
      }catch(e){toast(e.response?.data?.message||e.message,false);}
    });
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
      if(page==='user-copy-trades.html'||page==='copy-trades.html')return adminCopyTrades();
      if(page==='viewuser-copy-trades.html')return adminCopyTradeView();
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
      if(page==='admin-real-estate.html')return adminRealEstate();
      if(page==='real-estate-create.html')return adminRealEstateForm(false);
      if(page==='admin-real-estate-edit.html')return adminRealEstateForm(true);
      if(page==='real-estate-investments.html')return adminRealEstateInvestments();
      if(page==='admin-stock-shares.html')return adminStockShares();
      if(page==='stock-shares-trades.html')return adminStockTrades();
      if(page==='stock-shares-user.html')return adminStockUser();
      if(page==='stock-shares-positions-edit.html')return adminStockPosEdit();
      if(page==='loan-plans.html')return adminLoanPlans();
      if(page==='loan-plans-create.html')return adminLoanPlanForm(false);
      if(page==='loan-plans-edit.html')return adminLoanPlanForm(true);
      if(page==='loans-view.html')return adminLoanView();
    }
    catch(e){
      toast(e.message,false)
    }
    finally{
      showDynamicMain()
    }
  }
    
  // ===================== STOCK SHARES =====================
  async function stocksPage(){
    showDynamicMain();
    const root=document.querySelector('#main-content .inner-page')||document.querySelector('.inner-page')||document.getElementById('main-content');
    if(!root) return;
    root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading stocks...</div>';
    let d; try{d=await get('/stocks');}catch(e){root.innerHTML=`<div class="p-8 text-center text-red-400">${esc(e.message)}</div>`;return;}
    const stocks=d.stocks||[];
    function card(s){
      const ch=Number(s.price_change_pct_24h||s.change_24h||0);
      const up=ch>=0;
      const logo=s.logo_url?`<img src="${esc(s.logo_url)}" class="w-9 h-9 rounded-full object-cover" alt="">`:`<div class="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[.7rem] font-bold text-white">${esc(String(s.symbol||'').slice(0,2))}</div>`;
      return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-4 flex flex-col gap-3">
        <div class="flex items-center gap-3">
          ${logo}
          <div class="min-w-0">
            <div class="font-semibold text-white text-[.9rem] truncate">${esc(s.symbol)}</div>
            <div class="text-[#555] text-[.72rem] truncate">${esc(s.name||'')}</div>
          </div>
        </div>
        <div>
          <div class="font-sora font-semibold text-white text-[1.05rem]">${money(s.price)}</div>
          <div class="text-[.75rem] ${up?'text-grn':'text-red2'}">${up?'+':''}${ch.toFixed(2)}%</div>
        </div>
        <a href="/user/stock-detail.html?id=${s._id}" class="mt-auto block text-center py-2.5 rounded-lg bg-blue2 text-white text-[.82rem] font-medium">Trade</a>
      </div>`;
    }
    root.innerHTML=`
<div class="mb-4">
  <h1 class="text-white font-medium text-[1.15rem]">Stock Shares</h1>
  <p class="text-[#555] text-[.8rem]">Buy and sell fractional shares of real stocks</p>
</div>
<div class="flex gap-2 mb-4">
  <a href="/user/stock-portfolio.html" class="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#aaa] text-[.78rem]"><i class="fa-solid fa-chart-pie mr-1"></i> My Portfolio</a>
  <a href="/user/stock-history.html" class="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#aaa] text-[.78rem]"><i class="fa-solid fa-clock-rotate-left mr-1"></i> Trade History</a>
</div>
<div class="mb-4">
  <input id="stockSearch" type="search" placeholder="Search stocks by name or symbol..." class="w-full bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-white text-[.85rem] outline-none">
</div>
<div id="stockGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  ${stocks.length?stocks.map(card).join(''):'<div class="col-span-full text-center text-[#555] py-12">No stocks available</div>'}
</div>`;
    const grid=root.querySelector('#stockGrid');
    root.querySelector('#stockSearch').oninput=function(){
      const q=this.value.trim().toLowerCase();
      const filtered=stocks.filter(s=>!q||String(s.symbol).toLowerCase().includes(q)||String(s.name).toLowerCase().includes(q));
      grid.innerHTML=filtered.length?filtered.map(card).join(''):'<div class="col-span-full text-center text-[#555] py-12">No matches</div>';
    };
  }

  async function stockHistoryPage(){
    showDynamicMain();
    const root=document.querySelector('#main-content .inner-page')||document.querySelector('.inner-page')||document.getElementById('main-content');
    if(!root) return;
    root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading history...</div>';
    let filter='all';
    async function load(){
      let d; try{d=await get('/stocks/history?type='+filter);}catch(e){root.innerHTML=`<div class="p-8 text-center text-red-400">${esc(e.message)}</div>`;return;}
      const trades=d.trades||[];
      root.innerHTML=`
<div class="mb-4">
  <h1 class="text-white font-medium text-[1.15rem]">Stock Trade History</h1>
  <p class="text-[#555] text-[.8rem]">Your buy and sell activity</p>
</div>
<div class="flex gap-2 mb-4">
  <a href="/user/stocks.html" class="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#aaa] text-[.78rem]"><i class="fa-solid fa-chart-line mr-1"></i> Browse Stocks</a>
  <a href="/user/stock-portfolio.html" class="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#aaa] text-[.78rem]"><i class="fa-solid fa-chart-pie mr-1"></i> My Portfolio</a>
</div>
<div class="flex gap-2 mb-4" id="histFilters">
  ${['all','Buys','Sells'].map(t=>{
    const v=t==='all'?'all':t.slice(0,-1).toUpperCase();
    const on=(filter==='all'&&t==='all')||filter===v;
    return `<button data-f="${v}" class="px-3 py-1.5 rounded-lg text-[.78rem] font-medium ${on?'bg-blue2 text-white':'bg-[#111] border border-[#1e1e1e] text-[#aaa]'}">${t==='all'?'All':t}</button>`;
  }).join('')}
</div>
<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-[#161616]"><tr>
        <th class="px-5 py-3 text-left text-xs font-semibold text-[#555] uppercase">Stock</th>
        <th class="px-5 py-3 text-center text-xs font-semibold text-[#555] uppercase">Type</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Shares</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Price/Share</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Total</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Fee</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Date</th>
      </tr></thead>
      <tbody class="divide-y divide-[#1e1e1e]">
        ${trades.length?trades.map(t=>{
          const isBuy=String(t.type).toUpperCase()==='BUY';
          const logo=t.logo_url?`<img src="${esc(t.logo_url)}" class="w-8 h-8 rounded-full object-cover">`:`<div class="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[.65rem] font-bold">${esc(String(t.symbol||'').slice(0,2))}</div>`;
          return `<tr class="hover:bg-[#161616]/50">
            <td class="px-5 py-4"><div class="flex items-center gap-3">${logo}<div><p class="font-medium text-white">${esc(t.symbol)}</p><p class="text-xs text-[#555]">${esc(t.name||'')}</p></div></div></td>
            <td class="px-5 py-4 text-center"><span class="px-2 py-0.5 text-xs font-medium rounded ${isBuy?'bg-grn/10 text-grn':'bg-red2/10 text-red2'}">${isBuy?'BUY':'SELL'}</span></td>
            <td class="px-5 py-4 text-right text-white">${Number(t.shares||0).toFixed(4)}</td>
            <td class="px-5 py-4 text-right text-[#aaa]">${money(t.price)}</td>
            <td class="px-5 py-4 text-right text-white font-medium">${money(t.total)}</td>
            <td class="px-5 py-4 text-right text-[#555]">${money(t.fee||0)}</td>
            <td class="px-5 py-4 text-right text-[#555]">${t.createdAt?new Date(t.createdAt).toLocaleString(undefined,{month:'short',day:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</td>
          </tr>`;
        }).join(''):'<tr><td colspan="7" class="py-12 text-center text-[#555]">No trades yet</td></tr>'}
      </tbody>
    </table>
  </div>
</div>`;
      root.querySelectorAll('#histFilters [data-f]').forEach(b=>{
        b.onclick=()=>{ filter=b.dataset.f; load(); };
      });
    }
    await load();
  }

  async function stockPortfolioPage(){
    showDynamicMain();
    const root=document.querySelector('#main-content .inner-page')||document.querySelector('.inner-page')||document.getElementById('main-content');
    if(!root) return;
    root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading portfolio...</div>';
    let d; try{d=await get('/stocks/portfolio');}catch(e){root.innerHTML=`<div class="p-8 text-center text-red-400">${esc(e.message)}</div>`;return;}
    const st=d.stats||{};
    const positions=d.positions||[];
    const pl=Number(st.totalPl||0);
    root.innerHTML=`
<div class="mb-4">
  <h1 class="text-white font-medium text-[1.15rem]">Stock Portfolio</h1>
  <p class="text-[#555] text-[.8rem]">Your stock share holdings and performance</p>
</div>
<div class="flex gap-2 mb-4">
  <a href="/user/stocks.html" class="px-3 py-1.5 rounded-lg bg-blue2 text-white text-[.78rem]"><i class="fa-solid fa-chart-line mr-1"></i> Browse Stocks</a>
  <a href="/user/stock-history.html" class="px-3 py-1.5 rounded-lg bg-[#111] border border-[#1e1e1e] text-[#aaa] text-[.78rem]"><i class="fa-solid fa-clock-rotate-left mr-1"></i> Trade History</a>
</div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
  <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-4"><div class="text-[.68rem] text-[#555] uppercase mb-1">Total Invested</div><div class="font-sora font-semibold text-white text-lg">${money(st.totalInvested)}</div></div>
  <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-4"><div class="text-[.68rem] text-[#555] uppercase mb-1">Current Value</div><div class="font-sora font-semibold text-white text-lg">${money(st.currentValue)}</div></div>
  <div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-4"><div class="text-[.68rem] text-[#555] uppercase mb-1">Total P/L</div><div class="font-sora font-semibold text-lg ${pl>=0?'text-grn':'text-red2'}">${pl>=0?'+':''}${money(pl)}</div></div>
</div>
${positions.length?`
<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-[#161616]"><tr>
        <th class="px-5 py-3 text-left text-xs font-semibold text-[#555] uppercase">Stock</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Shares</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Avg Cost</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Current Price</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Market Value</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">P/L</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-[#555] uppercase">Action</th>
      </tr></thead>
      <tbody class="divide-y divide-[#1e1e1e]">
        ${positions.map(p=>{
          const ppl=Number(p.pl||0); const pp=Number(p.pl_pct||0);
          const logo=p.logo_url?`<img src="${esc(p.logo_url)}" class="w-8 h-8 rounded-full object-cover">`:`<div class="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[.65rem] font-bold">${esc(String(p.symbol||'').slice(0,2))}</div>`;
          const id=p.asset_id||p.symbol;
          return `<tr class="hover:bg-[#161616]/50">
            <td class="px-5 py-4"><div class="flex items-center gap-3">${logo}<div><p class="font-medium text-white">${esc(p.symbol)}</p><p class="text-xs text-[#555]">${esc(p.name||'')}</p></div></div></td>
            <td class="px-5 py-4 text-right text-white">${Number(p.shares||0).toFixed(4)}</td>
            <td class="px-5 py-4 text-right text-[#aaa]">${money(p.avg_cost)}</td>
            <td class="px-5 py-4 text-right text-white">${money(p.current_price)}</td>
            <td class="px-5 py-4 text-right text-white font-medium">${money(p.market_value)}</td>
            <td class="px-5 py-4 text-right"><span class="font-medium ${ppl>=0?'text-grn':'text-red2'}">${ppl>=0?'+':''}${money(ppl)}</span><span class="block text-xs ${ppl>=0?'text-grn':'text-red2'}">${ppl>=0?'+':''}${pp.toFixed(2)}%</span></td>
            <td class="px-5 py-4 text-right"><a href="/user/stock-detail.html?id=${id}" class="text-xs font-medium text-blue2">Trade</a></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
</div>`:`
<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-12 text-center">
  <i class="fa-solid fa-chart-column text-4xl text-[#333] mb-3"></i>
  <h3 class="text-white font-semibold mb-1">No positions yet</h3>
  <p class="text-sm text-[#555] mb-4">Start building your portfolio by buying stocks.</p>
  <a href="/user/stocks.html" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue2 text-white rounded-[10px]">Browse Stocks</a>
</div>`}`;
  }

  async function stockDetailPage(){
    showDynamicMain();
    const root=document.querySelector('#main-content .inner-page')||document.querySelector('.inner-page')||document.getElementById('main-content');
    if(!root) return;
    const id=new URLSearchParams(location.search).get('id');
    if(!id){ root.innerHTML='<div class="p-8 text-center text-[#555]">Missing stock id. <a class="text-blue2" href="/user/stocks.html">Back</a></div>'; return; }
    root.innerHTML='<div class="p-8 text-center text-[#555]"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d; try{d=await get('/stocks/'+id);}catch(e){root.innerHTML=`<div class="p-8 text-center text-red-400">${esc(e.message)}</div>`;return;}
    const s=d.stock||{};
    const pos=d.position;
    const hasPos=!!(pos && Number(pos.shares||0)>0);
    const availShares=hasPos?Number(pos.shares||0):0;
    const bal=Number(d.balance||0);
    const ch=Number(s.price_change_pct_24h||s.change_24h||0);
    const up=ch>=0;
    const price=Number(s.price||0);
    const logo=s.logo_url?`<img src="${esc(s.logo_url)}" class="w-12 h-12 rounded-full object-cover">`:`<div class="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center font-bold">${esc(String(s.symbol||'').slice(0,2))}</div>`;
    const stockLabel=esc(s.symbol||s.name||'this stock');
    let side='buy';

    const buyFormHtml=`
      <div id="buyForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-[#aaa] mb-1.5">Amount (USD)</label>
          <input type="number" id="tradeAmt" step="0.01" min="1" placeholder="Enter dollar amount..."
            class="w-full bg-[#161616] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"/>
        </div>
        <div class="bg-[#161616] rounded-[10px] p-4 mb-4">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-[#555]">You will receive</span>
            <span class="text-white font-medium" id="recvShares">—</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-[#555]">Price per share</span>
            <span class="text-white">${money(price)}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-[#555]">Available balance</span>
            <span class="text-white">${money(bal)}</span>
          </div>
        </div>
        <button type="button" id="tradeBtn" class="w-full bg-grn hover:bg-grn/90 text-black rounded-[10px] py-2.5 text-sm font-medium transition-colors">Buy ${esc(s.symbol||'')}</button>
      </div>`;

    const sellFormHtml=hasPos?`
      <div id="sellForm">
        <div class="mb-4">
          <label class="block text-sm font-medium text-[#aaa] mb-1.5">Shares to sell</label>
          <div class="relative">
            <input type="number" id="sellShares" step="0.00000001" min="0.00000001" max="${availShares}" placeholder="Enter shares..."
              class="w-full bg-[#161616] border border-[#1e1e1e] rounded-[10px] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-blue pr-16"/>
            <button type="button" id="sellMaxBtn" class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-blue2 hover:text-brand-blue px-2 py-1">MAX</button>
          </div>
          <p class="text-xs text-[#555] mt-1">Available: ${availShares.toFixed(6)} shares</p>
        </div>
        <div class="bg-[#161616] rounded-[10px] p-4 mb-4">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-[#555]">You will receive</span>
            <span class="text-white font-medium" id="sellRecv">—</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-[#555]">Current price</span>
            <span class="text-white">${money(price)}</span>
          </div>
        </div>
        <button type="button" id="sellBtn" class="w-full bg-red2 hover:bg-red2/90 text-white rounded-[10px] py-2.5 text-sm font-medium transition-colors">Sell ${esc(s.symbol||'')}</button>
      </div>`:`
      <div id="sellEmpty" class="text-center py-8">
        <p class="text-[#555] text-sm">You don't hold any shares of ${stockLabel}.</p>
        <p class="text-[#555] text-xs mt-1">Buy some shares first to start selling.</p>
      </div>`;

    root.innerHTML=`
<a href="/user/stocks.html" class="inline-flex items-center gap-1 text-[#888] text-[.82rem] mb-4"><i class="fa-solid fa-chevron-left"></i> Back to Stocks</a>
<div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-4 mb-4 flex items-center gap-4">
  ${logo}
  <div>
    <div class="text-white font-medium text-lg">${esc(s.name||s.symbol)}</div>
    <div class="text-[#555] text-[.8rem]">${esc(s.symbol)}</div>
    <div class="font-sora font-semibold text-white text-[1.4rem] mt-1">${money(s.price)} <span class="text-[.85rem] font-medium ${up?'text-grn':'text-red2'}">${up?'+':''}${ch.toFixed(2)}%</span></div>
    <div class="text-[#555] text-[.72rem] mt-1">High: ${money(s.high_24h)} · Low: ${money(s.low_24h)} · Vol: ${Number(s.volume_24h||0).toLocaleString()}</div>
  </div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div class="lg:col-span-2 bg-[#111] border border-[#1e1e1e] rounded-[13px] p-6">
    <div class="flex gap-1 mb-6 bg-[#161616] rounded-[10px] p-1">
      <button id="tabBuy" type="button" class="flex-1 py-2 text-sm font-medium rounded-md transition-colors bg-grn text-white">Buy</button>
      <button id="tabSell" type="button" class="flex-1 py-2 text-sm font-medium rounded-md transition-colors text-[#aaa] hover:text-white">Sell</button>
    </div>
    <div id="tradePanel">${buyFormHtml}</div>
  </div>
  <div class="space-y-4">
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-4">
      <div class="text-[.72rem] text-[#555] uppercase mb-3">Your Position</div>
      ${hasPos?`<div class="space-y-2 text-[.85rem]">
        <div class="flex justify-between"><span class="text-[#555]">Shares</span><span class="text-white font-medium">${availShares.toFixed(6)}</span></div>
        <div class="flex justify-between"><span class="text-[#555]">Avg cost</span><span class="text-white">${money(pos.avg_cost||pos.avgCost)}</span></div>
        <div class="flex justify-between"><span class="text-[#555]">Invested</span><span class="text-white">${money(pos.total_invested||pos.invested)}</span></div>
        <div class="flex justify-between"><span class="text-[#555]">Market value</span><span class="text-white">${money(availShares*price)}</span></div>
        <div class="flex justify-between"><span class="text-[#555]">P/L</span><span class="${(availShares*price-Number(pos.total_invested||0))>=0?'text-grn':'text-red2'} font-medium">${money(availShares*price-Number(pos.total_invested||0))}</span></div>
      </div>`:'<p class="text-[#555] text-[.8rem]">No open position</p>'}
    </div>
    <div class="bg-[#111] border border-[#1e1e1e] rounded-[14px] p-4">
      <div class="text-[.72rem] text-[#555] uppercase mb-3">Recent Trades</div>
      ${(d.recentTrades||[]).length?(d.recentTrades||[]).map(t=>`<div class="flex justify-between text-[.78rem] py-1.5 border-b border-[#1a1a1a] last:border-0"><span class="${String(t.type)==='BUY'?'text-grn':'text-red2'} font-medium">${esc(t.type)}</span><span class="text-[#aaa]">${Number(t.shares).toFixed(4)} @ ${money(t.price)}</span><span class="text-[#555]">${t.createdAt?new Date(t.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric'}):''}</span></div>`).join(''):'<p class="text-[#555] text-[.8rem]">No recent trades</p>'}
    </div>
  </div>
</div>`;

    const panel=root.querySelector('#tradePanel');
    function showBuy(){
      side='buy';
      root.querySelector('#tabBuy').className='flex-1 py-2 text-sm font-medium rounded-md transition-colors bg-grn text-white';
      root.querySelector('#tabSell').className='flex-1 py-2 text-sm font-medium rounded-md transition-colors text-[#aaa] hover:text-white';
      panel.innerHTML=buyFormHtml;
      const amt=root.querySelector('#tradeAmt');
      const recv=root.querySelector('#recvShares');
      const btn=root.querySelector('#tradeBtn');
      function updateRecv(){
        const a=Number(amt.value||0);
        if(a>0&&price>0) recv.textContent=(a/price).toFixed(6)+' shares';
        else recv.textContent='—';
      }
      amt.oninput=updateRecv;
      btn.onclick=async()=>{
        const a=Number(amt.value||0);
        if(a<=0){toast('Enter amount',false);return;}
        try{
          const x=await post('/stocks/'+s._id+'/buy',{amount:a});
          toast(x.message||'Success',true);
          setTimeout(()=>stockDetailPage(),600);
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    }
    function showSell(){
      side='sell';
      root.querySelector('#tabSell').className='flex-1 py-2 text-sm font-medium rounded-md transition-colors bg-red2 text-white';
      root.querySelector('#tabBuy').className='flex-1 py-2 text-sm font-medium rounded-md transition-colors text-[#aaa] hover:text-white';
      panel.innerHTML=sellFormHtml;
      if(!hasPos) return;
      const sh=root.querySelector('#sellShares');
      const recv=root.querySelector('#sellRecv');
      const maxBtn=root.querySelector('#sellMaxBtn');
      const btn=root.querySelector('#sellBtn');
      function updateRecv(){
        const n=Number(sh.value||0);
        if(n>0&&price>0) recv.textContent=money(n*price);
        else recv.textContent='—';
      }
      sh.oninput=updateRecv;
      maxBtn.onclick=()=>{ sh.value=String(availShares); updateRecv(); };
      btn.onclick=async()=>{
        const n=Number(sh.value||0);
        if(n<=0){toast('Enter shares to sell',false);return;}
        if(n>availShares+1e-12){toast('Not enough shares',false);return;}
        try{
          const x=await post('/stocks/'+s._id+'/sell',{shares:n});
          toast(x.message||'Success',true);
          setTimeout(()=>stockDetailPage(),600);
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    }
    root.querySelector('#tabBuy').onclick=showBuy;
    root.querySelector('#tabSell').onclick=showSell;
    showBuy();
  }

async function adminStockShares(){
    showDynamicMain();
    const root=document.getElementById('main-content')||document.querySelector('main');
    if(!root) return;
    root.innerHTML='<div class="p-8 text-center text-gray-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d; try{d=await get('/stocks');}catch(e){root.innerHTML=`<div class="p-8 text-center text-red-500">${esc(e.message)}</div>`;return;}
    const st=d.stats||{};
    const stocks=d.stocks||[];
    root.innerHTML=`
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-xl font-semibold text-gray-900">Stock Shares</h1>
    <p class="text-sm text-gray-500">Manage stock listings and user positions</p>
  </div>
  <a href="/admin/stock-shares-trades.html" class="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50">All Trades</a>
</div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Total Stocks</div><div class="text-xl font-semibold">${st.totalStocks||0}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Active Stocks</div><div class="text-xl font-semibold">${st.activeStocks||0}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Total Holders</div><div class="text-xl font-semibold">${st.totalHolders||0}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Total Invested</div><div class="text-xl font-semibold">${money(st.totalInvested)}</div></div>
</div>
<div class="bg-white border rounded-xl overflow-hidden">
  <div class="px-5 py-3 border-b font-medium">All Stocks</div>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 text-xs uppercase"><tr>
        <th class="px-4 py-3 text-left">Stock</th><th class="px-4 py-3 text-right">Price</th><th class="px-4 py-3 text-right">24h Change</th>
        <th class="px-4 py-3 text-right">Holders</th><th class="px-4 py-3 text-right">Total Shares</th><th class="px-4 py-3 text-right">Total Invested</th><th class="px-4 py-3 text-right">Status</th>
      </tr></thead>
      <tbody class="divide-y">
        ${stocks.map(s=>{
          const ch=Number(s.price_change_pct_24h||s.change_24h||0);
          const logo=s.logo_url?`<img src="${esc(s.logo_url)}" class="w-8 h-8 rounded-full">`:`<div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">${esc(String(s.symbol||'').slice(0,2))}</div>`;
          return `<tr>
            <td class="px-4 py-3"><div class="flex items-center gap-2">${logo}<div><div class="font-medium">${esc(s.symbol)}</div><div class="text-xs text-gray-400">${esc(s.name||'')}</div></div></div></td>
            <td class="px-4 py-3 text-right">${money(s.price)}</td>
            <td class="px-4 py-3 text-right ${ch>=0?'text-green-600':'text-red-500'}">${ch>=0?'+':''}${ch.toFixed(2)}%</td>
            <td class="px-4 py-3 text-right">${s.holders||0}</td>
            <td class="px-4 py-3 text-right">${Number(s.total_shares||0).toFixed(4)}</td>
            <td class="px-4 py-3 text-right">${money(s.total_invested)}</td>
            <td class="px-4 py-3 text-right"><span class="px-2 py-0.5 rounded-full text-xs ${s.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}">${esc(s.status||'Active')}</span></td>
          </tr>`;
        }).join('')||'<tr><td colspan="7" class="py-10 text-center text-gray-400">No stocks</td></tr>'}
      </tbody>
    </table>
  </div>
</div>`;
  }

  async function adminStockTrades(){
    showDynamicMain();
    const root=document.getElementById('main-content')||document.querySelector('main');
    if(!root) return;
    root.innerHTML='<div class="p-8 text-center text-gray-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let filter='all';
    async function load(){
      let d; try{d=await get('/stocks/trades?type='+filter);}catch(e){root.innerHTML=`<div class="p-8 text-red-500">${esc(e.message)}</div>`;return;}
      const trades=d.trades||[];
      root.innerHTML=`
<div class="flex items-center justify-between mb-6">
  <div><h1 class="text-xl font-semibold">All Stock Trades</h1><p class="text-sm text-gray-500">View all user stock buy/sell activity</p></div>
  <a href="/admin/admin-stock-shares.html" class="px-3 py-2 text-sm border rounded-lg bg-white">Back to Stocks</a>
</div>
<div class="flex gap-2 mb-4" id="tf">
  ${[['all','All'],['BUY','Buys'],['SELL','Sells']].map(([v,l])=>`<button data-f="${v}" class="px-3 py-1.5 rounded-lg text-sm ${filter===v?'bg-blue-600 text-white':'bg-gray-100 text-gray-600'}">${l}</button>`).join('')}
</div>
<div class="bg-white border rounded-xl overflow-hidden">
  <div class="px-5 py-3 border-b font-medium">Trade History</div>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
        <th class="px-4 py-3 text-left">User</th><th class="px-4 py-3 text-left">Stock</th><th class="px-4 py-3 text-center">Type</th>
        <th class="px-4 py-3 text-right">Shares</th><th class="px-4 py-3 text-right">Price</th><th class="px-4 py-3 text-right">Total</th>
        <th class="px-4 py-3 text-right">Fee</th><th class="px-4 py-3 text-right">Date</th><th class="px-4 py-3 text-right">Actions</th>
      </tr></thead>
      <tbody class="divide-y">
        ${trades.map(t=>{
          const isBuy=String(t.type)==='BUY';
          const logo=t.logo_url?`<img src="${esc(t.logo_url)}" class="w-7 h-7 rounded-full">`:'';
          return `<tr>
            <td class="px-4 py-3"><div class="font-medium">${esc(t.user_name||'User')}</div><div class="text-xs text-gray-400">${esc(t.user_email||'')}</div></td>
            <td class="px-4 py-3"><div class="flex items-center gap-2">${logo}<span class="font-medium">${esc(t.symbol)}</span></div></td>
            <td class="px-4 py-3 text-center"><span class="px-2 py-0.5 rounded text-xs font-medium ${isBuy?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}">${esc(t.type)}</span></td>
            <td class="px-4 py-3 text-right">${Number(t.shares||0).toFixed(4)}</td>
            <td class="px-4 py-3 text-right">${money(t.price)}</td>
            <td class="px-4 py-3 text-right">${money(t.total)}</td>
            <td class="px-4 py-3 text-right">${money(t.fee||0)}</td>
            <td class="px-4 py-3 text-right text-gray-500">${t.createdAt?new Date(t.createdAt).toLocaleString(undefined,{month:'short',day:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</td>
            <td class="px-4 py-3 text-right"><a href="/admin/stock-shares-user.html?userId=${t.user_id}" class="px-2 py-1 border rounded text-xs">Portfolio</a></td>
          </tr>`;
        }).join('')||'<tr><td colspan="9" class="py-10 text-center text-gray-400">No trades</td></tr>'}
      </tbody>
    </table>
  </div>
</div>`;
      root.querySelectorAll('#tf [data-f]').forEach(b=>b.onclick=()=>{filter=b.dataset.f;load();});
    }
    await load();
  }

  async function adminStockUser(){
    showDynamicMain();
    const root=document.getElementById('main-content')||document.querySelector('main');
    if(!root) return;
    const userId=new URLSearchParams(location.search).get('userId')||new URLSearchParams(location.search).get('id');
    if(!userId){root.innerHTML='<div class="p-8 text-center text-gray-400">Missing userId</div>';return;}
    root.innerHTML='<div class="p-8 text-center text-gray-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d; try{d=await get('/stocks/user/'+userId);}catch(e){root.innerHTML=`<div class="p-8 text-red-500">${esc(e.message)}</div>`;return;}
    const u=d.user||{};
    const st=d.stats||{};
    const positions=d.positions||[];
    const stocks=d.stocks||[];
    const pl=Number(st.totalPl||0);
    root.innerHTML=`
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-xl font-semibold">Stock Positions</h1>
    <p class="text-sm text-gray-500">${esc(u.fullname||'User')} ${u.email?'('+esc(u.email)+')':''}</p>
  </div>
  <a href="/admin/stock-shares-trades.html" class="px-3 py-2 text-sm border rounded-lg bg-white">User Trades</a>
</div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Total Invested</div><div class="text-xl font-semibold">${money(st.totalInvested)}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Current Value</div><div class="text-xl font-semibold">${money(st.currentValue)}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Total P&L</div><div class="text-xl font-semibold ${pl>=0?'text-green-600':'text-red-500'}">${pl>=0?'+':''}${money(pl)}</div></div>
</div>
<div class="bg-white border rounded-xl p-5 mb-6">
  <h3 class="font-medium mb-1">Add Position (No Balance Debit)</h3>
  <p class="text-xs text-gray-400 mb-3">Creates an open holding without changing the user balance.</p>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
    <div>
      <label class="text-xs text-gray-500">Stock Asset</label>
      <select id="apStock" class="w-full border rounded-lg px-3 py-2 text-sm">
        <option value="">Select stock...</option>
        ${stocks.map(s=>`<option value="${s._id}" data-price="${s.price}">${esc(s.symbol)} — ${esc(s.name||'')}</option>`).join('')}
      </select>
    </div>
    <div>
      <label class="text-xs text-gray-500">Shares</label>
      <input id="apShares" type="number" step="any" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0">
    </div>
    <div>
      <label class="text-xs text-gray-500">Avg Buy Price ($)</label>
      <input id="apAvg" type="number" step="any" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0">
    </div>
    <button id="apBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">+ Add Position</button>
  </div>
</div>
<div class="bg-white border rounded-xl overflow-hidden">
  <div class="px-5 py-3 border-b font-medium">Holdings</div>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
        <th class="px-4 py-3 text-left">Stock</th><th class="px-4 py-3 text-right">Shares</th><th class="px-4 py-3 text-right">Avg Cost</th>
        <th class="px-4 py-3 text-right">Current Price</th><th class="px-4 py-3 text-right">Invested</th><th class="px-4 py-3 text-right">Value</th>
        <th class="px-4 py-3 text-right">P&L</th><th class="px-4 py-3 text-right">Actions</th>
      </tr></thead>
      <tbody class="divide-y">
        ${positions.map(p=>{
          const ppl=Number(p.pl||0);
          const logo=p.logo_url?`<img src="${esc(p.logo_url)}" class="w-7 h-7 rounded-full">`:'';
          return `<tr>
            <td class="px-4 py-3"><div class="flex items-center gap-2">${logo}<div><div class="font-medium">${esc(p.symbol)}</div><div class="text-xs text-gray-400">${esc(p.name||'')}</div></div></div></td>
            <td class="px-4 py-3 text-right">${Number(p.shares).toFixed(4)}</td>
            <td class="px-4 py-3 text-right">${money(p.avg_cost)}</td>
            <td class="px-4 py-3 text-right">${money(p.current_price)}</td>
            <td class="px-4 py-3 text-right">${money(p.total_invested)}</td>
            <td class="px-4 py-3 text-right">${money(p.market_value)}</td>
            <td class="px-4 py-3 text-right ${ppl>=0?'text-green-600':'text-red-500'}">${ppl>=0?'+':''}${money(ppl)} (${Number(p.pl_pct||0).toFixed(1)}%)</td>
            <td class="px-4 py-3 text-right space-x-1">
              <a href="/admin/stock-shares-positions-edit.html?id=${p._id}&userId=${userId}" class="px-2 py-1 border rounded text-xs">Edit</a>
              <button data-del="${p._id}" class="px-2 py-1 border border-red-200 text-red-600 rounded text-xs">Delete</button>
            </td>
          </tr>`;
        }).join('')||'<tr><td colspan="8" class="py-10 text-center text-gray-400">No open positions</td></tr>'}
      </tbody>
    </table>
  </div>
</div>`;
    const apStock=root.querySelector('#apStock');
    const apAvg=root.querySelector('#apAvg');
    apStock.onchange=()=>{ const o=apStock.selectedOptions[0]; if(o&&o.dataset.price) apAvg.value=o.dataset.price; };
    root.querySelector('#apBtn').onclick=async()=>{
      try{
        const x=await post('/stocks/user/'+userId+'/positions',{
          asset_id: apStock.value,
          shares: Number(root.querySelector('#apShares').value||0),
          avg_cost: Number(apAvg.value||0)
        });
        toast(x.message||'Position added',true);
        setTimeout(()=>adminStockUser(),500);
      }catch(e){toast(e.response?.data?.message||e.message,false);}
    };
    root.querySelectorAll('[data-del]').forEach(b=>{
      b.onclick=async()=>{
        if(!confirm('Delete this stock position?')) return;
        try{
          const x=await del('/stocks/positions/'+b.dataset.del);
          toast(x.message||'Stock position deleted successfully',true);
          setTimeout(()=>adminStockUser(),500);
        }catch(e){toast(e.response?.data?.message||e.message,false);}
      };
    });
  }

  async function adminStockPosEdit(){
    showDynamicMain();
    const root=document.getElementById('main-content')||document.querySelector('main');
    if(!root) return;
    const id=new URLSearchParams(location.search).get('id');
    const userId=new URLSearchParams(location.search).get('userId')||'';
    if(!id){root.innerHTML='<div class="p-8 text-center text-gray-400">Missing position id</div>';return;}
    root.innerHTML='<div class="p-8 text-center text-gray-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading...</div>';
    let d; try{d=await get('/stocks/positions/'+id);}catch(e){root.innerHTML=`<div class="p-8 text-red-500">${esc(e.message)}</div>`;return;}
    const p=d.position||{};
    const u=d.user||{};
    const uname=u.name||[u.firstname,u.lastname].filter(Boolean).join(' ')||u.username||'User';
    const pl=Number(p.pl||0);
    root.innerHTML=`
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-xl font-semibold">Edit Position — ${esc(p.symbol)}</h1>
    <p class="text-sm text-gray-500">${esc(p.symbol)} — ${esc(uname)}</p>
  </div>
  <a href="/admin/stock-shares-user.html?userId=${userId||p.user_id}" class="px-3 py-2 text-sm border rounded-lg bg-white">Back to Portfolio</a>
</div>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Current Price</div><div class="text-xl font-semibold">${money(p.current_price)}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Current Value</div><div class="text-xl font-semibold">${money(p.market_value)}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">Unrealized P&L</div><div class="text-xl font-semibold ${pl>=0?'text-green-600':'text-red-500'}">${pl>=0?'+':''}${money(pl)}</div></div>
  <div class="bg-white border rounded-xl p-4"><div class="text-xs text-gray-400 uppercase mb-1">P&L %</div><div class="text-xl font-semibold">${Number(p.pl_pct||0).toFixed(2)}%</div></div>
</div>
<div class="bg-white border rounded-xl p-5 max-w-xl">
  <h3 class="font-medium mb-1">Adjust Position</h3>
  <p class="text-xs text-gray-400 mb-4">Changes are logged as STOCK_ADMIN_ADJUST in the transaction ledger. This does not affect the user's account balance.</p>
  <label class="block text-xs text-gray-500 mb-1">Shares</label>
  <input id="edShares" type="number" step="any" value="${Number(p.shares||0)}" class="w-full border rounded-lg px-3 py-2 text-sm mb-3">
  <label class="block text-xs text-gray-500 mb-1">Average Buy Price ($)</label>
  <input id="edAvg" type="number" step="any" value="${Number(p.avg_cost||0)}" class="w-full border rounded-lg px-3 py-2 text-sm mb-3">
  <label class="block text-xs text-gray-500 mb-1">Total Invested ($)</label>
  <input id="edInv" type="number" step="any" value="${Number(p.total_invested||0)}" class="w-full border rounded-lg px-3 py-2 text-sm mb-4">
  <div class="flex gap-2">
    <button id="edSave" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Update Position</button>
    <a href="/admin/stock-shares-user.html?userId=${userId||p.user_id}" class="px-4 py-2 border rounded-lg text-sm">Cancel</a>
  </div>
</div>`;
    const edShares=root.querySelector('#edShares');
    const edAvg=root.querySelector('#edAvg');
    const edInv=root.querySelector('#edInv');
    function syncInv(){ edInv.value=(Number(edShares.value||0)*Number(edAvg.value||0)).toFixed(4); }
    edShares.oninput=syncInv; edAvg.oninput=syncInv;
    root.querySelector('#edSave').onclick=async()=>{
      try{
        const x=await put('/stocks/positions/'+id,{
          shares: Number(edShares.value||0),
          avg_cost: Number(edAvg.value||0),
          total_invested: Number(edInv.value||0)
        });
        toast(x.message||'Position updated successfully',true);
        setTimeout(()=>adminStockPosEdit(),500);
      }catch(e){toast(e.response?.data?.message||e.message,false);}
    };
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
      else if(page==='trade.html')await tradePage();
      if(page==='markets.html')await markets();
      else if(page==='copy-trading.html')await copyTrading();
      else if(page==='copytrader-details.html')await copyDetails();
      else if(page==='copy-trading-position.html')await copyPosition();
      else if(page==='bot-trading.html')await bots();
      else if(page==='bot-trading-details.html')await botDetails();
      else if(page==='mining.html')await mining();
      else if(page==='subscription-mining.html')await miningSubscription();
      else if(page==='real-estate.html')await realEstatePage();
      else if(page==='my-real-estate.html')await myRealEstate();
      else if(page==='my-loans.html')await myLoansPage();
      else if(page==='apply.html')await applyLoanPage();
      else if(page==='loans-details.html')await loanDetailsPage();
      else if(page==='stocks.html')await stocksPage();
      else if(page==='stock-history.html')await stockHistoryPage();
      else if(page==='stock-portfolio.html')await stockPortfolioPage();
      else if(page==='stock-detail.html')await stockDetailPage();
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
