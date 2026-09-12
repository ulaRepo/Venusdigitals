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
    const main=document.querySelector('main');
    if(main){
      main.dataset.featureDynamic='1';
      main.style.visibility='hidden'
    }
  }
    function showDynamicMain(){
    const main=document.querySelector('main');
    if(main)main.style.visibility='visible'
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
    const walletLogo=n=>({
    "MetaMask":"/temp/wallet/metamask.webp","Trust Wallet":"/temp/wallet/trust-wallet.webp","Coinbase Wallet":"/temp/wallet/coinbase-wallet.webp",Phantom:"/temp/wallet/phantom.webp",Exodus:"/temp/wallet/exodus.svg",Ledger:"/temp/wallet/other.png",OKX:"/temp/wallet/okx.webp",Binance:"/temp/wallet/binance.jpg",Rabby:"/temp/wallet/rabby.webp",Tangem:"/temp/wallet/tangem.svg",Arculus:"/temp/wallet/arculus.svg",Namo:"/temp/wallet/namo.webp",DCent:"/temp/wallet/dcent.svg"
  }
  [n]||'/temp/wallet/other.png');
    async function userWallet(){
    const root=inner();
    if(!root)return;
    let d;
    try{
      d=await get('/wallets')
    }
    catch(e){
      if(e.message.includes('disabled')){
        location.replace('/user/dashboard.html');
        return
      }
      toast(e.message,false);
      return
    }
    const connected=d.connected||[], count=connected.length, settings=d;
    root.innerHTML=shell('Wallet Connect','Manage your connected cryptocurrency wallets')+`<div class="space-y-[9px]"><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] overflow-hidden"><div class="flex items-center justify-between p-[15px] border-b border-[#1e1e1e]"><div><p class="text-[.88rem] font-medium text-white">My Connected Wallets</p><p class="text-[.72rem] text-[#555]">${count} of 10 slots used</p></div><div class="flex items-center gap-1.5">${Array.from({length:10},(_,i)=>`<span style="width:9px;height:9px;border-radius:50%;background:${i<count?'#4a6cf7':'#1e1e1e'};border:1px solid ${i<count?'#4a6cf7':'#333'}"></span>`).join('')}</div></div><div>${connected.length?connected.map(w=>`<div class="flex items-center justify-between p-[15px] border-b border-[#161616]"><div class="flex items-center gap-3"><div class="w-[44px] h-[44px] rounded-[12px] bg-[#1a1a1a] flex items-center justify-center overflow-hidden"><img src="${esc(w.walletLogo||walletLogo(w.walletName))}" alt="${esc(w.walletName)}" class="w-[44px] h-[44px] object-contain"></div><div><p class="text-[.88rem] font-medium text-white">${
      esc(w.walletName)
    }
    </p><p class="text-[.72rem] text-[#555]">Connected ${
      dt(w.connectedAt)
    }
    </p></div></div><span class="inline-flex items-center gap-1.5 text-[.68rem] font-medium px-2.5 py-1 rounded-[20px]" style="background:rgba(0,212,124,.1);color:#00d47c;border:1px solid rgba(0,212,124,.2)"><span style="width:6px;height:6px;border-radius:50%;background:#00d47c"></span>Active</span></div>`).join(''):`<div class="text-center py-12 px-5 text-[#444]"><i class="fa-solid fa-wallet text-[2rem] block mb-[10px] opacity-20"></i><p class="text-[.84rem] font-medium text-[#fff] mb-1">No Wallets Connected</p><p class="text-[.78rem]">Connect your first cryptocurrency wallet to start earning daily rewards.</p></div>`}</div></div><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.68rem] text-[#444] uppercase tracking-[.07em] mb-[10px]">Popular Wallets</div><div class="grid grid-cols-2 sm:grid-cols-3 gap-[9px]">${walletCatalog.map(w=>{const yes=connected.some(x=>x.walletKey===w.name.toLowerCase());return `<button type="button" data-wallet="${esc(w.name)}" ${
      yes||count>=10?'disabled':''
    }
     class="relative flex items-center gap-2 p-[10px] rounded-[10px] border ${yes?'border-[rgba(0,212,124,.3)] opacity-50':'border-[#1e1e1e] hover:border-[#333]'} text-left"><img src="${w.logo}" class="w-[30px] h-[30px] object-contain"><span class="text-[.76rem] text-white">${
      esc(w.name)
    }
    </span>${
      yes?'<span class="absolute right-2 top-2 text-grn text-[.65rem]"><i class="fa-solid fa-check"></i></span>':''
    }
    </button>`}).join('')}</div></div><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.68rem] text-[#444] uppercase tracking-[.07em] mb-[10px]">Connection Summary</div><div class="grid grid-cols-3 gap-[9px]"><div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#555]">Active Wallets</div><div class="text-white font-bold text-[1rem]">${count}</div></div><div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#555]">Available Slots</div><div class="text-white font-bold text-[1rem]">${10-count}</div></div><div class="bg-[#161616] rounded-[10px] p-[10px]"><div class="text-[.68rem] text-[#555]">Est. Daily Earnings</div><div class="text-grn font-bold text-[1rem]">${money(count*Number(d.dailyEarningPerWallet||3000),'$')}</div></div></div><div class="mt-3"><div class="flex justify-between text-[.68rem] text-[#555] mb-1"><span>Capacity</span><span>${count}/10</span></div><div class="h-[5px] bg-[#1a1a1a] rounded-full overflow-hidden"><div style="width:${count*10}%;height:100%;background:#4a6cf7"></div></div></div></div><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[.68rem] text-[#444] uppercase tracking-[.07em] mb-[8px]">Earning Rewards</div><p class="text-[.76rem] text-[#666]">Min Balance Required: <span class="text-white">${money(d.minBalance||0)}</span></p><p class="text-[.76rem] text-[#666] mt-1">Daily Reward: <span class="text-grn">${money(d.dailyEarningPerWallet||3000,'$')}</span></p></div></div>`;
        root.querySelectorAll('[data-wallet]').forEach(btn=>btn.addEventListener('click',()=>walletForm(btn.dataset.wallet)));

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
    function planCard(p){
    const min=Number((p.min_price??p.min)||0),max=Number((p.max_price??p.max)||0),rate=Number((p.increment_amount??p.return??p.maxr)||0);
    return `<div class="bg-[#111] rounded-[13px] overflow-hidden border border-[#1e1e1e] p-[15px]"><div class="flex items-center justify-between"><div><div class="text-white font-medium text-[.95rem]">${esc(p.name)}</div><div class="text-[#555] text-[.72rem] mt-1">${esc(p.tag||'Investment Plan')}</div></div><i class="fa-solid fa-chart-bar text-blue2"></i></div><div class="grid grid-cols-2 gap-[9px] my-[14px]"><div class="bg-[#161616] rounded-[9px] p-[10px]"><div class="text-[#444] text-[.65rem]">MIN</div><div class="text-white font-bold">${money(min)}</div></div><div class="bg-[#161616] rounded-[9px] p-[10px]"><div class="text-[#444] text-[.65rem]">MAX</div><div class="text-white font-bold">${max?money(max):'Unlimited'}</div></div><div class="bg-[#161616] rounded-[9px] p-[10px]"><div class="text-[#444] text-[.65rem]">RETURN</div><div class="text-grn font-bold">${rate}%</div></div><div class="bg-[#161616] rounded-[9px] p-[10px]"><div class="text-[#444] text-[.65rem]">DURATION</div><div class="text-white font-bold">${esc(p.expiration||`${
      p.duration||30
    }
     Days`)}</div></div></div><button data-invest="${p._id}" class="w-full py-[10px] rounded-[10px] bg-brand-blue text-white font-medium">Invest Now</button></div>`
  }
    async function userPlans(){
    const root=inner();
    const d=await get('/plans');
    root.innerHTML=shell('Investment Plans',`${d.plans.length} plans available`)+`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[9px]">${d.plans.length?d.plans.map(planCard).join(''):'<div class="col-span-full text-center py-12 text-[#555]">No investment plans are available.</div>'}</div>`;
    root.querySelectorAll('[data-invest]').forEach(b=>b.onclick=()=>openInvest(d.plans.find(p=>String(p._id)===b.dataset.invest),d.plans))
  }
    function openInvest(p,allPlans=[]){
    if(!p)return;
    const old=document.getElementById('featureInvestDrawer');
    if(old)old.remove();
    const min=Number((p.min_price??p.min)||0),max=Number((p.max_price??p.max)||0),rate=Number((p.increment_amount??p.return??p.maxr)||0);
    const bg=document.createElement('div');
    bg.id='featureInvestDrawer';
    bg.innerHTML=`<div class="feature-drawer-backdrop"></div><aside class="feature-invest-drawer"><div class="flex items-center justify-between p-[14px] border-b border-[#1e1e1e]"><div class="text-white font-medium">Invest in Plan</div><button id="closeInvest" class="text-[#777] text-xl">×</button></div><form id="investFeatureForm" class="p-[18px] space-y-[10px]"><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[#444] text-[.68rem] uppercase mb-[10px]">Select Investment Plan</div><select id="investPlan" class="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] p-[11px] text-white">${allPlans.map(x=>`<option value="${x._id}" ${
      String(x._id)===String(p._id)?'selected':''
    }
    >${
      esc(x.name)
    }
    </option>`).join('')}</select></div><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[#444] text-[.68rem] uppercase mb-[10px]">Quick Amount</div><div class="flex flex-wrap gap-[6px]">${[100,250,500,1000,1500,2000].map(x=>`<button type="button" data-quick="${x}" class="flex-1 min-w-[70px] py-[7px] text-[.75rem] text-[#aaa] rounded-[8px] bg-[#1a1a1a] border border-[#222]">${
      money(x)
    }
    </button>`).join('')}</div></div><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[#444] text-[.68rem] uppercase mb-[10px]">Enter Amount</div><input id="investAmount" type="number" min="${min}" ${max>0?`max="${max}"`:''} step="0.01" required class="w-full bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] p-[12px] text-white text-xl" placeholder="0.00"><div class="flex justify-between mt-2 text-[.72rem] text-[#555]"><span>Min: ${money(min)}</span><span>Max: ${max?money(max):'Unlimited'}</span></div></div><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[#444] text-[.68rem] uppercase mb-[10px]">Your Investment Details</div><div class="space-y-2 text-[.8rem]"><div class="flex justify-between"><span class="text-[#555]">Name of Plan</span><span class="text-white">${esc(p.name)}</span></div><div class="flex justify-between"><span class="text-[#555]">Plan Price</span><span class="text-white">${money(p.price)}</span></div><div class="flex justify-between"><span class="text-[#555]">Duration</span><span class="text-white">${esc(p.expiration||`${
      p.duration||30
    }
     Days`)}</span></div><div class="flex justify-between"><span class="text-[#555]">Return</span><span class="text-grn">${rate}%</span></div><div class="flex justify-between"><span class="text-[#555]">Payment Method</span><span class="text-white">Account Balance</span></div></div></div><button class="w-full py-[12px] rounded-[10px] bg-brand-blue text-white font-medium">Confirm Investment</button></form></aside>`;
    document.body.appendChild(bg);
    const close=()=>bg.remove();
    bg.querySelector('.feature-drawer-backdrop').onclick=close;
    bg.querySelector('#closeInvest').onclick=close;
    bg.querySelectorAll('[data-quick]').forEach(x=>x.onclick=()=>bg.querySelector('#investAmount').value=x.dataset.quick);
    bg.querySelector('#investPlan').onchange=()=>{
      const selected=allPlans.find(x=>String(x._id)===bg.querySelector('#investPlan').value);
      if(selected){
        close();
        openInvest(selected,allPlans)
      }
    };
    bg.querySelector('#investFeatureForm').onsubmit=async e=>{
      e.preventDefault();
      try{
        const d=await post('/investments',{
          plan_id:p._id,amount:Number(bg.querySelector('#investAmount').value)
        });
        close();
        toast(d.message,true);
        notify('Plan Activated',d.message);
        await userPlans()
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    function investmentRow(i){
    const p=i.plan||{
    };
    return `<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[14px] flex items-center gap-3"><div class="flex-1"><div class="text-white font-medium">${esc(p.name||'Investment')}</div><div class="text-[#555] text-[.72rem] mt-1">${esc(i.active)} · ${money(i.amount)}</div></div><div class="text-right"><div class="text-grn text-[.8rem]">${money(i.profit_earned)}</div><div class="text-[#555] text-[.68rem]">Profit</div></div><a class="text-blue2" href="/user/plan-details.html?id=${encodeURIComponent(i._id)}"><i class="fa-solid fa-chevron-right"></i></a></div>`
  }
    async function myPlans(){
    const root=inner();
    const d=await get('/myplans');
    root.innerHTML=shell('My Plans','Manage your investment plans')+`<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">${[['Total Invested',money(d.totalInvested)],['Total Profit',money(d.totalProfit)],['Active Plans',d.activePlans]].map(x=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><p class="text-[.68rem] text-[#444] uppercase tracking-[.07em] mb-1">${
      x[0]
    }
    </p><p class="text-white text-xl font-bold">${
      x[1]
    }
    </p></div>`).join('')}</div><div class="space-y-[9px]">${d.investments.length?d.investments.map(investmentRow).join(''):'<div class="text-center py-12 text-[#555]">No investment history.</div>'}</div>`
  }
    async function planDetails(){
    const root=inner(),id=new URLSearchParams(location.search).get('id');
    if(!id){
      toast('Investment id is required.',false);
      return
    }
    const d=await get('/investments/'+encodeURIComponent(id)),i=d.investment,p=i.plan||{
    };
    const duration=new Date(i.expire_date)-new Date(i.activated_at||i.createdAt);
    const progress=Math.min(100,Math.max(0,(Date.now()-new Date(i.activated_at||i.createdAt))/duration*100));
    const projected=Number(i.amount||0)+Number(i.profit_earned||0);
    root.innerHTML=shell(p.name||'Plan Details')+`<div class="grid grid-cols-2 gap-[9px] mb-[9px]">${[['Invested',money(i.amount)],['Profit',money(i.profit_earned)],['Projected Total ROI',money(projected)],['Status',i.active]].map(x=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="text-[#444] text-[.68rem] uppercase mb-1">${
      x[0]
    }
    </div><div class="text-white font-bold">${
      x[1]
    }
    </div></div>`).join('')}</div><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex justify-between text-[.72rem] text-[#555] mb-2"><span>Investment Progress</span><span>${progress.toFixed(0)}%</span></div><div class="h-[5px] bg-[#1a1a1a] rounded-full overflow-hidden"><div style="width:${progress}%;height:100%;background:#4a6cf7"></div></div><div class="grid grid-cols-2 gap-3 mt-4 text-[.78rem]"><div><span class="text-[#555]">Started</span><div class="text-white">${dt(i.activated_at||i.createdAt)}</div></div><div><span class="text-[#555]">Expires</span><div class="text-white">${dt(i.expire_date)}</div></div></div></div>${i.active==='yes'?'<button id="cancelPlan" class="mt-3 w-full py-[11px] rounded-[10px] bg-[rgba(255,69,96,.1)] border border-[rgba(255,69,96,.2)] text-red2">Cancel Plan</button>':''}`;
    const c=document.getElementById('cancelPlan');
    if(c)c.onclick=async()=>{
      if(!confirm('Cancel this investment?'))return;
      try{
        const x=await post('/investments/'+encodeURIComponent(id)+'/cancel',{
        });
        toast(x.message,true);
        location.href='/user/myplans.html'
      }
      catch(e){
        toast(e.message,false)
      }
    }
  }
    async function cards(){
    const root=inner(),d=await get('/cards');
    root.innerHTML=shell('My Cards','Manage your digital cards')+`<div class="space-y-[9px]">${d.cards.length?d.cards.map(c=>`<div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px]"><div class="flex justify-between"><div><div class="text-white font-medium">${
      esc(c.card_type_id?.name||c.cardType?.name||'Card')
    }
    </div><div class="text-[#555] text-[.72rem] mt-1">${
      esc(c.masked_number||'•••• •••• •••• ••••')
    }
    </div></div><span class="text-[.68rem] px-2 py-1 rounded-full bg-[rgba(0,212,124,.1)] text-grn">${
      esc(c.status)
    }
    </span></div>${
      c.status==='active'?`<div class="grid grid-cols-2 gap-3 mt-4 text-[.76rem]"><div><span class="text-[#555]">Expiry</span><div class="text-white">${esc(c.expiry_display||'--/--')}</div></div><div><span class="text-[#555]">Balance</span><div class="text-white">${money(c.balance)}</div></div></div>`:''
    }
    </div>`).join(''):'<div class="text-center py-12 text-[#555]">No cards yet.</div>'}<a href="/user/apply-card.html" class="block w-full py-[11px] rounded-[10px] bg-brand-blue text-white text-center">Apply for Your First Card</a></div>`
  }
    async function applyCard(){
    const root=inner(),d=await get('/card-types');
    root.innerHTML=shell('Apply for a Card','Choose a card type')+`<form id="applyCardFeature" class="space-y-[9px]"><div class="grid grid-cols-1 md:grid-cols-2 gap-[9px]">${d.cardTypes.length?d.cardTypes.map(t=>`<label class="block cursor-pointer"><input type="radio" name="card_type_id" value="${t._id}" class="sr-only peer" required><div class="bg-[#111] border border-[#1e1e1e] rounded-[13px] p-[15px] peer-checked:border-blue2"><div class="text-white font-medium">${
      esc(t.name)
    }
    </div><div class="text-[#555] text-[.72rem] mt-1">${
      esc(t.type)
    }
     · ${
      esc(t.network)
    }
    </div><div class="text-grn text-[.82rem] mt-3">Fee: ${
      money(t.fee||t.issuance_fee)
    }
    </div><div class="text-[#666] text-[.72rem] mt-1">${
      esc(t.description||'')
    }
    </div></div></label>`).join(''):'<div class="text-center py-12 text-[#555]">No active card types are available.</div>'}</div><input name="card_holder" class="w-full bg-[#111] border border-[#1e1e1e] rounded-[10px] p-[12px] text-white" placeholder="Card holder name" required><input name="shipping_address" class="w-full bg-[#111] border border-[#1e1e1e] rounded-[10px] p-[12px] text-white" placeholder="Shipping address"><button class="w-full py-[11px] rounded-[10px] bg-brand-blue text-white">Submit Application</button></form>`;
    root.querySelector('#applyCardFeature').onsubmit=async e=>{
      e.preventDefault();
      const f=new FormData(e.currentTarget);
      try{
        const x=await post('/cards',{
          card_type_id:f.get('card_type_id'),card_holder:f.get('card_holder'),shipping_address:f.get('shipping_address')
        });
        toast(x.message,true);
        notify('Card Application Submitted',x.message);
        location.href='/user/cards.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
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
    const m=adminMain(),d=await get('/plans');
    m.innerHTML=adminShell('Investment Plans','Manage system investment plans')+`<div class="flex justify-end"><a href="/admin/new-plan.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">New Plan</a></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">${d.plans.length?d.plans.map(p=>`<div class="bg-surface-card rounded-xl border border-border shadow-card p-5"><div class="flex justify-between"><div><h3 class="font-semibold text-content">${
      esc(p.name)
    }
    </h3><p class="text-xs text-content-muted mt-1">${
      esc(p.tag||p.type||'Main')
    }
    </p></div><span class="text-xs ${p.status==='active'?'text-success':'text-danger'}">${
      esc(p.status)
    }
    </span></div><div class="grid grid-cols-2 gap-3 mt-4 text-sm"><div><span class="text-content-muted">Min</span><div class="text-content font-medium">${
      money(p.min_price??p.min)
    }
    </div></div><div><span class="text-content-muted">Max</span><div class="text-content font-medium">${
      p.max_price||p.max?money(p.max_price??p.max):'Unlimited'
    }
    </div></div><div><span class="text-content-muted">Return</span><div class="text-success font-medium">${
      p.increment_amount??p.return??p.maxr??0
    }
    %</div></div><div><span class="text-content-muted">Duration</span><div class="text-content font-medium">${
      esc(p.expiration||`${p.duration} Days`)
    }
    </div></div></div><div class="flex gap-2 mt-5"><a href="/admin/edit-plan.html?id=${p._id}" class="flex-1 text-center px-3 py-2 rounded-lg border border-border text-content text-sm">Edit</a><button data-del-plan="${p._id}" class="px-3 py-2 rounded-lg bg-danger/10 text-danger text-sm">Delete</button></div></div>`).join(''):'<div class="col-span-full text-center py-16 text-content-muted">No investment plans have been created.</div>'}</div>`;
    m.querySelectorAll('[data-del-plan]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Delete this investment plan?'))return;
      try{
        const x=await del('/plans/'+b.dataset.delPlan);
        toast(x.message,true);
        await adminPlans()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminPlanForm(edit){
    const m=adminMain(),id=edit?new URLSearchParams(location.search).get('id'):null;
    let p={
    };
    if(edit){
      const d=await get('/plans/'+id);
      p=d.plan
    }
    m.innerHTML=adminShell(edit?'Update Plan':'Add Investment Plan','Configure investment plan')+`<form id="adminPlanForm" class="bg-surface-card rounded-xl border border-border shadow-card p-6 space-y-5"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${[['name','Plan Name','text',p.name||''],['price','Plan Price ($)','number',p.price||0],['min_price','Min Deposit','number',(p.min_price??p.min)||0],['max_price','Max Deposit','number',(p.max_price??p.max)||0],['minr','Min Return','number',(p.minr??p.min_return)||0],['maxr','Max Return','number',(p.maxr??p.max_return)||0],['duration','Duration','number',p.duration||30],['expiration','Expiration','text',p.expiration||'30 Days'],['tag','Tag','text',p.tag||''],['t_interval','Increment Interval','text',p.increment_interval||'Daily'],['t_type','Increment Type','text',p.increment_type||'Percentage'],['t_amount','Increment Amount','number',(p.increment_amount??p.return)||0]].map(x=>`<label class="text-sm text-content-secondary">${
      x[1]
    }
    <input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content"></label>`).join('')}</div><label class="flex items-center gap-2 text-sm text-content"><input name="status" type="checkbox" ${p.status!=='inactive'?'checked':''}> Active</label><div class="flex gap-3"><button class="px-4 py-2 rounded-lg bg-primary text-white">${edit?'Update Plan':'Create Plan'}</button><a href="/admin/plans.html" class="px-4 py-2 rounded-lg border border-border text-content">Cancel</a></div></form>`;
    m.querySelector('#adminPlanForm').onsubmit=async e=>{
      e.preventDefault();
      const b=Object.fromEntries(new FormData(e.currentTarget));
      b.status=e.currentTarget.status.checked;
      try{
        const x=edit?await put('/plans/'+id,b):await post('/plans',b);
        toast(x.message,true);
        location.href='/admin/plans.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminCards(){
    const m=adminMain(),d=await get('/cards');
    m.innerHTML=adminShell('Digital Cards','Manage card types and user applications')+statCards([['Pending',d.stats.pending],['Active Cards',d.stats.active],['Frozen',d.stats.frozen],['Card Types',d.stats.types]])+`<div class="flex justify-end"><a href="/admin/cards-create.html" class="px-4 py-2 rounded-lg bg-primary text-white text-sm">New Card Type</a></div><div class="bg-surface-card rounded-xl border border-border shadow-card p-5"><h2 class="font-semibold text-content mb-4">Card Types</h2><div class="space-y-3">${d.types.map(t=>`<div class="flex items-center justify-between border-b border-border pb-3"><div><div class="font-medium text-content">${
      esc(t.name)
    }
    </div><div class="text-xs text-content-muted">${
      esc(t.type)
    }
     · ${
      esc(t.network)
    }
     · Fee ${
      money(t.fee)
    }
    </div></div><div class="flex gap-2"><a href="/admin/cards-edit.html?id=${t._id}" class="text-sm text-primary">Edit</a><button data-cardtoggle="${t._id}" class="text-sm ${t.is_active?'text-danger':'text-success'}">${
      t.is_active?'Disable':'Enable'
    }
    </button></div></div>`).join('')}</div></div><div class="bg-surface-card rounded-xl border border-border shadow-card p-5"><h2 class="font-semibold text-content mb-4">Applications</h2><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-content-muted text-left"><th class="py-2">User</th><th>Card</th><th>Status</th><th></th></tr></thead><tbody>${d.cards.map(c=>`<tr class="border-t border-border"><td class="py-3">${
      esc(c.user_id?.name||'—')
    }
    </td><td>${
      esc(c.card_type_id?.name||'—')
    }
    </td><td>${
      esc(c.status)
    }
    </td><td><a class="text-primary" href="/admin/cards-view.html?id=${c._id}">View</a></td></tr>`).join('')}</tbody></table></div></div>`;
    m.querySelectorAll('[data-cardtoggle]').forEach(b=>b.onclick=async()=>{
      try{
        const x=await post('/card-types/'+b.dataset.cardtoggle+'/toggle',{
        });
        toast(x.message,true);
        await adminCards()
      }
      catch(e){
        toast(e.message,false)
      }
    })
  }
    async function adminCardForm(edit){
    const m=adminMain(),id=edit?new URLSearchParams(location.search).get('id'):null;
    let t={
    };
    if(edit)t=(await get('/card-types/'+id)).type;
    m.innerHTML=adminShell(edit?'Edit Card Type':'Create Card Type','Configure card type details')+`<form id="cardTypeForm" class="bg-surface-card rounded-xl border border-border shadow-card p-6 space-y-4">${[['name','Name','text',t.name||''],['type','Card Type','text',t.type||'Physical'],['network','Network','text',t.network||'Visa'],['fee','Fee','number',t.fee||0],['delivery_days','Delivery Days','number',t.delivery_days||0],['description','Description','text',t.description||'']].map(x=>`<label class="text-sm text-content-secondary">${
      x[1]
    }
    <input name="${x[0]}" type="${x[2]}" value="${esc(x[3])}" class="mt-1.5 w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-content"></label>`).join('')}<label class="flex gap-2 text-sm text-content"><input name="is_active" type="checkbox" ${t.is_active!==false?'checked':''}> Active</label><button class="px-4 py-2 rounded-lg bg-primary text-white">${edit?'Update Card Type':'Create Card Type'}</button></form>`;
    m.querySelector('#cardTypeForm').onsubmit=async e=>{
      e.preventDefault();
      const b=Object.fromEntries(new FormData(e.currentTarget));
      b.is_active=e.currentTarget.is_active.checked;
      try{
        const x=edit?await put('/card-types/'+id,b):await post('/card-types',b);
        toast(x.message,true);
        location.href='/admin/admin-cards.html'
      }
      catch(err){
        toast(err.message,false)
      }
    }
  }
    async function adminCardView(){
    const m=adminMain(),id=new URLSearchParams(location.search).get('id'),d=await get('/cards/'+id),c=d.card;
    m.innerHTML=adminShell(`Card #${id}`,'Card details, actions, and transaction history')+`<div class="bg-surface-card rounded-xl border border-border shadow-card p-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">${[['User',c.user_id?.name],['Email',c.user_id?.email],['Card Type',c.card_type_id?.name],['Holder',c.card_holder],['Number',c.masked_number||c.card_number],['Expiry',c.expiry_display||'--/--'],['Status',c.status],['Balance',money(c.balance)]].map(x=>`<div><span class="text-content-muted">${
      x[0]
    }
    </span><div class="text-content font-medium mt-1">${
      esc(x[1]??'—')
    }
    </div></div>`).join('')}</div><div class="flex flex-wrap gap-2 mt-6">${c.status==='pending'?`<button id="approveCard" class="px-4 py-2 rounded-lg bg-success text-white">Approve & Issue Card</button><button id="rejectCard" class="px-4 py-2 rounded-lg bg-danger text-white">Reject Application</button>`:`<a href="/admin/cards-edit-user.html?id=${c._id}" class="px-4 py-2 rounded-lg border border-border text-content">Edit Card Details</a>${
      c.status==='frozen'?'<button id="unfreezeCard" class="px-4 py-2 rounded-lg bg-success text-white">Unfreeze Card</button>':'<button id="freezeCard" class="px-4 py-2 rounded-lg bg-warning text-white">Freeze Card</button>'
    }
    <button id="cancelCard" class="px-4 py-2 rounded-lg bg-danger text-white">Cancel Card</button>`}</div>${c.status==='active'?'<div class="mt-6 bg-surface-card border border-border rounded-xl p-5"><h3 class="font-semibold text-content mb-3">Fund Card</h3><p class="text-sm text-content-muted">Card balance can be managed from the card account.</p></div>':''}</div>`;
    m.querySelector('#approveCard')?.addEventListener('click',async()=>{
      try{
        const x=await post('/cards/'+id+'/approve',{
        });
        toast(x.message,true);
        await adminCardView()
      }
      catch(e){
        toast(e.message,false)
      }
    });
    m.querySelector('#rejectCard')?.addEventListener('click',async()=>{
      try{
        const x=await post('/cards/'+id+'/reject',{
        });
        toast(x.message,true);
        await adminCardView()
      }
      catch(e){
        toast(e.message,false)
      }
    });
    m.querySelector('#freezeCard')?.addEventListener('click',async()=>{
      try{
        const x=await post('/cards/'+id+'/freeze',{
        });
        toast(x.message,true);
        await adminCardView()
      }
      catch(e){
        toast(e.message,false)
      }
    });
    m.querySelector('#unfreezeCard')?.addEventListener('click',async()=>{
      try{
        const x=await post('/cards/'+id+'/unfreeze',{
        });
        toast(x.message,true);
        await adminCardView()
      }
      catch(e){
        toast(e.message,false)
      }
    });
    m.querySelector('#cancelCard')?.addEventListener('click',async()=>{
      if(!confirm('Cancel this card? This cannot be undone.'))return;
      try{
        const x=await post('/cards/'+id+'/cancel',{
        });
        toast(x.message,true);
        await adminCardView()
      }
      catch(e){
        toast(e.message,false)
      }
    })
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
