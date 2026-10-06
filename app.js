const coins = [
  {id:"bitcoin",name:"Bitcoin",ticker:"BTC",icon:"₿",price:67240.21,change:2.41},
  {id:"ethereum",name:"Ethereum",ticker:"ETH",icon:"Ξ",price:2481.36,change:1.87},
  {id:"litecoin",name:"Litecoin",ticker:"LTC",icon:"Ł",price:97.42,change:-0.62},
  {id:"ripple",name:"XRP",ticker:"XRP",icon:"X",price:2.91,change:3.12},
  {id:"solana",name:"Solana",ticker:"SOL",icon:"S",price:151.84,change:4.22},
  {id:"binancecoin",name:"BNB",ticker:"BNB",icon:"B",price:612.48,change:0.91},
  {id:"dogecoin",name:"Dogecoin",ticker:"DOGE",icon:"Ð",price:0.18,change:-1.11},
  {id:"cardano",name:"Cardano",ticker:"ADA",icon:"A",price:0.62,change:1.42}
];

let selected = coins[0];
let balance = 10000;
let pnl = 0;
let trades = [];
let slotsByCoin = {};
let timers = new Map();

const $ = s => document.querySelector(s);

function money(v){ return "₹"+Number(v).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}); }

function renderCoins(filter=""){
  const grid=$("#coinGrid");
  grid.innerHTML="";
  coins.filter(c => (c.name+c.ticker).toLowerCase().includes(filter.toLowerCase())).forEach(c=>{
    const el=document.createElement("article");
    el.className="coin glass";
    el.innerHTML=`
      <div class="coin-top">
        <div class="coin-icon">${c.icon}</div>
        <div class="tag">30 SEC</div>
      </div>
      <div class="coin-name">${c.name}</div>
      <div class="ticker">${c.ticker}</div>
      <div class="coin-price">$${c.price.toLocaleString()}</div>
      <div class="coin-change ${c.change>=0?'positive':'result-loss'}">${c.change>=0?'+':''}${c.change}%</div>
      <button class="coin-btn">Open Trade</button>`;
    el.onclick=()=>selectCoin(c);
    grid.appendChild(el);
  });
}

function selectCoin(c){
  selected=c;
  $("#selectedName").innerHTML=`${c.name} <span>${c.ticker}</span>`;
  $("#selectedPrice").textContent="$"+c.price.toLocaleString();
  renderSlots();
}

function renderSlots(){
  const used=slotsByCoin[selected.id]||0;
  $("#activeSlots").textContent=`${used} / 5`;
  $("#slots").innerHTML=Array.from({length:5},(_,i)=>`<span class="slot ${i<used?'filled':''}"></span>`).join("");
}

function updatePotential(){
  const amount=Math.max(0,Number($("#amount").value)||0);
  const rate=Number($("#returnRate").value)||0;
  $("#potential").textContent=money(amount*(1+rate/100));
}

function startTrade(){
  const amount=Number($("#amount").value);
  const rate=Number($("#returnRate").value);
  const used=slotsByCoin[selected.id]||0;
  if(amount<10) return alert("Minimum practice amount is ₹10.");
  if(used>=5) return alert("Maximum 5 open slots are allowed for this coin.");
  if(amount>balance) return alert("Insufficient practice balance.");

  balance-=amount;
  slotsByCoin[selected.id]=used+1;
  renderSlots();
  $("#balance").textContent=money(balance);

  const trade={
    id:crypto.randomUUID(), coin:selected, amount, rate,
    started:Date.now(), status:"Running"
  };
  trades.unshift(trade);
  renderHistory();

  const end=Date.now()+30000;
  const tick=()=>{
    const left=Math.max(0,end-Date.now());
    const row=document.getElementById(trade.id);
    if(row){
      row.querySelector(".countdown").textContent=Math.ceil(left/1000)+"s";
    }
    if(left<=0){
      clearInterval(timer);
      timers.delete(trade.id);
      finishTrade(trade);
    }
  };
  const timer=setInterval(tick,250);
  timers.set(trade.id,timer);
  tick();
}

function finishTrade(trade){
  /*
    This project intentionally keeps the outcome deterministic for UI testing:
    every practice position settles as a win. It must remain clearly disclosed
    as simulation/practice if used this way.
  */
  const profit=trade.amount*trade.rate/100;
  const payout=trade.amount+profit;
  balance+=payout;
  pnl+=profit;
  slotsByCoin[trade.coin.id]=Math.max(0,(slotsByCoin[trade.coin.id]||1)-1);
  trade.status="Won";
  trade.profit=profit;
  trade.payout=payout;
  $("#balance").textContent=money(balance);
  $("#pnl").textContent=money(pnl);
  renderSlots();
  renderHistory();
}

function renderHistory(){
  const box=$("#history");
  if(!trades.length){box.innerHTML='<div class="empty">No practice trades yet.</div>';return;}
  box.innerHTML=trades.slice(0,20).map(t=>`
    <div class="history-row" id="${t.id}">
      <div><strong>${t.coin.name}</strong><br><span class="muted">${t.coin.ticker} · ₹${t.amount.toLocaleString("en-IN")} · ${t.rate}%</span></div>
      <div class="countdown">${t.status==="Running"?"30s":t.status}</div>
      <div class="${t.status==="Won"?"result-win":"muted"}">${t.status==="Won"?"+"+money(t.profit):"Running"}</div>
    </div>`).join("");
}

async function tryMarketApi(){
  // API adapter: replace this endpoint with your server-side market service.
  // Keeping API keys server-side is recommended.
  try{
    const url="https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,ripple,solana,binancecoin,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true";
    const res=await fetch(url,{headers:{accept:"application/json"}});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const data=await res.json();
    const map={bitcoin:"bitcoin",ethereum:"ethereum",litecoin:"litecoin",ripple:"ripple",solana:"solana",binancecoin:"binancecoin",dogecoin:"dogecoin",cardano:"cardano"};
    coins.forEach(c=>{
      const d=data[map[c.id]];
      if(d){c.price=d.usd;c.change=Number(d.usd_24h_change||0).toFixed(2);}
    });
    $("#apiStatus").innerHTML="<i></i> Market API Live";
    renderCoins($("#search").value);
    selectCoin(selected);
  }catch(e){
    $("#apiStatus").innerHTML="<i style='background:#ffb020'></i> API Offline";
  }
}

$("#search").addEventListener("input",e=>renderCoins(e.target.value));
$("#amount").addEventListener("input",updatePotential);
$("#returnRate").addEventListener("change",updatePotential);
$("#placeTrade").addEventListener("click",startTrade);
$("#clearHistory").addEventListener("click",()=>{
  trades.forEach(t=>{if(timers.has(t.id)) clearInterval(timers.get(t.id));});
  trades=[]; slotsByCoin={}; pnl=0; $("#pnl").textContent=money(0); renderSlots(); renderHistory();
});

renderCoins();
selectCoin(selected);
updatePotential();
tryMarketApi();
