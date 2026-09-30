const PRODUCTS=[
 {id:"assam-morning",name:"Assam Morning",type:"Black",price:420,color:"#7A3E1D",notes:"Malty and bold, good with milk."},
 {id:"darjeeling-first-flush",name:"Darjeeling First Flush",type:"Black",price:690,color:"#A8662B",notes:"Light, floral, muscatel finish."},
 {id:"sencha-green",name:"Sencha Green",type:"Green",price:540,color:"#5E8B3A",notes:"Grassy and fresh. Steep at 75°C."},
 {id:"jasmine-pearls",name:"Jasmine Pearls",type:"Green",price:760,color:"#8FA34B",notes:"Hand-rolled leaves scented with jasmine."},
 {id:"masala-chai",name:"Masala Chai",type:"Spiced",price:380,color:"#9C4A24",notes:"Cardamom, ginger, clove and cinnamon."},
 {id:"tulsi-ginger",name:"Tulsi Ginger",type:"Herbal",price:350,color:"#4F7A5A",notes:"Caffeine-free, warming and bright."},
 {id:"chamomile-calm",name:"Chamomile Calm",type:"Herbal",price:320,color:"#C9A13B",notes:"Soft, honeyed, for the evening."},
 {id:"kashmiri-kahwa",name:"Kashmiri Kahwa",type:"Spiced",price:580,color:"#B5712E",notes:"Green tea with saffron and almond."}
];
const rupees=n=>"₹"+n.toLocaleString("en-IN");
const store={
 get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},
 set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
const getCart=()=>store.get("cart",[]);
const setCart=c=>{store.set("cart",c);updateCount()};
function addToCart(id,qty){const c=getCart();const i=c.find(x=>x.id===id);i?i.qty+=qty:c.push({id,qty});setCart(c)}
function updateCount(){const n=getCart().reduce((s,x)=>s+x.qty,0);document.querySelectorAll(".cart-count").forEach(el=>el.textContent=n)}
function header(){
 const user=store.get("user",null);
 document.getElementById("site-header").innerHTML=`<div class="wrap">
 <a class="logo" href="index.html" id="nav-home">Leaf &amp; Kettle</a>
 <nav class="main" aria-label="Main">
  <a href="shop.html" id="nav-shop">Shop</a>
  ${user?`<span class="meta" id="nav-user">Hi, ${user.name}</span><a href="#" id="nav-logout">Log out</a>`:`<a href="login.html" id="nav-login">Log in</a>`}
  <a href="cart.html" class="cart-link" id="nav-cart">Cart<span class="cart-count">0</span></a>
 </nav></div>`;
 const lo=document.getElementById("nav-logout");
 if(lo)lo.onclick=e=>{e.preventDefault();localStorage.removeItem("user");location.href="index.html"};
 updateCount();
}
function card(p){return `<article class="product" data-testid="product-${p.id}">
 <a href="product.html?id=${p.id}" class="swatch" style="background:${p.color}" aria-hidden="true" tabindex="-1">${p.type}</a>
 <h3><a href="product.html?id=${p.id}" id="link-${p.id}">${p.name}</a></h3>
 <div class="meta">${p.notes}</div>
 <div class="price">${rupees(p.price)} <span class="meta">/ 100 g</span></div>
 <button class="btn small" id="add-${p.id}" data-add="${p.id}">Add to cart</button></article>`}
function bindAdd(root){root.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{addToCart(b.dataset.add,1);b.textContent="Added";setTimeout(()=>b.textContent="Add to cart",1200)})}
function setError(id,msg){const el=document.getElementById(id+"-err");if(el)el.textContent=msg||"";return !msg}
document.addEventListener("DOMContentLoaded",()=>{
 header();
 const page=document.body.dataset.page;
 const $=id=>document.getElementById(id);
 if(page==="home"){$("featured").innerHTML=PRODUCTS.slice(0,4).map(card).join("");bindAdd($("featured"))}
 if(page==="shop"){
  const params=new URLSearchParams(location.search);let current=params.get("type")||"All";
  const types=["All",...new Set(PRODUCTS.map(p=>p.type))];
  const render=()=>{
   $("filters").innerHTML=types.map(t=>`<button id="filter-${t.toLowerCase()}" aria-pressed="${t===current}" data-type="${t}">${t}</button>`).join("");
   $("filters").querySelectorAll("button").forEach(b=>b.onclick=()=>{current=b.dataset.type;history.replaceState(null,"",current==="All"?"shop.html":"shop.html?type="+current);render()});
   const list=PRODUCTS.filter(p=>current==="All"||p.type===current);
   $("products").innerHTML=list.map(card).join("");bindAdd($("products"));
  };render();
 }
 if(page==="product"){
  const p=PRODUCTS.find(x=>x.id===new URLSearchParams(location.search).get("id"));
  if(!p){$("detail").innerHTML=`<p class="empty">This tea isn't in our shop. <a href="shop.html">Browse all teas</a>.</p>`;return}
  document.title=p.name+" | Leaf & Kettle";
  $("detail").innerHTML=`<div class="swatch" style="background:${p.color}">${p.type}</div>
  <div><h1>${p.name}</h1><p class="meta" style="margin-top:10px">${p.notes}</p>
  <p class="price" style="margin-top:16px;font-size:1.3rem">${rupees(p.price)} <span class="meta">/ 100 g</span></p>
  <div class="qty"><label for="qty" style="margin:0">Quantity</label><input type="number" id="qty" min="1" max="20" value="1"></div>
  <button class="btn" id="add-to-cart">Add to cart</button> <a class="btn secondary" href="cart.html" id="go-to-cart">View cart</a>
  <p id="added-msg" class="notice" hidden>Added to your cart.</p></div>`;
  $("add-to-cart").onclick=()=>{const q=Math.max(1,Math.min(20,parseInt($("qty").value)||1));addToCart(p.id,q);$("added-msg").hidden=false};
 }
 if(page==="cart"){
  const render=()=>{
   const c=getCart();
   if(!c.length){$("cart").innerHTML=`<p class="empty">Your cart is empty. <a href="shop.html" id="empty-shop">Browse teas</a> to add some.</p>`;return}
   let total=0;
   const rows=c.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);const line=p.price*i.qty;total+=line;
    return `<tr data-testid="cart-row-${p.id}"><td>${p.name}</td><td><input type="number" min="1" max="20" value="${i.qty}" id="qty-${p.id}" data-qty="${p.id}" style="width:80px" aria-label="Quantity for ${p.name}"></td><td>${rupees(line)}</td><td><button class="btn secondary small" id="remove-${p.id}" data-remove="${p.id}">Remove</button></td></tr>`}).join("");
   $("cart").innerHTML=`<table class="cart"><thead><tr><th>Tea</th><th>Qty</th><th>Price</th><th></th></tr></thead><tbody>${rows}</tbody></table>
   <div class="summary"><div class="total" id="cart-total">Total ${rupees(total)}</div><a class="btn" href="checkout.html" id="checkout-btn">Go to checkout</a></div>`;
   document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{setCart(getCart().filter(x=>x.id!==b.dataset.remove));render()});
   document.querySelectorAll("[data-qty]").forEach(inp=>inp.onchange=()=>{const c=getCart();const it=c.find(x=>x.id===inp.dataset.qty);it.qty=Math.max(1,Math.min(20,parseInt(inp.value)||1));setCart(c);render()});
  };render();
 }
 if(page==="login"){
  $("login-form").addEventListener("submit",e=>{e.preventDefault();
   const email=$("email").value.trim(),pw=$("password").value;
   let ok=setError("email",/^\S+@\S+\.\S+$/.test(email)?"":"Enter a valid email address.");
   ok=setError("password",pw.length>=6?"":"Password must be at least 6 characters.")&&ok;
   if(!ok)return;
   store.set("user",{email,name:email.split("@")[0]});
   location.href=new URLSearchParams(location.search).get("next")||"shop.html";
  });
 }
 if(page==="checkout"){
  const c=getCart();
  if(!c.length){$("checkout").innerHTML=`<p class="empty">Your cart is empty. <a href="shop.html">Browse teas</a> before checking out.</p>`;return}
  const user=store.get("user",null);
  if(!user){$("login-notice").hidden=false}
  else $("co-email").value=user.email;
  const total=c.reduce((s,i)=>s+PRODUCTS.find(p=>p.id===i.id).price*i.qty,0);
  $("order-summary").innerHTML=c.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return `<p>${p.name} × ${i.qty} <span style="float:right">${rupees(p.price*i.qty)}</span></p>`}).join("")+`<p class="total" style="margin-top:14px">Total ${rupees(total)}</p>`;
  $("checkout-form").addEventListener("submit",e=>{e.preventDefault();
   const v=id=>$(id).value.trim();
   let ok=true;
   ok=setError("co-name",v("co-name")?"":"Enter your full name.")&&ok;
   ok=setError("co-email",/^\S+@\S+\.\S+$/.test(v("co-email"))?"":"Enter a valid email address.")&&ok;
   ok=setError("co-address",v("co-address").length>=5?"":"Enter your street address.")&&ok;
   ok=setError("co-city",v("co-city")?"":"Enter your city.")&&ok;
   ok=setError("co-pin",/^\d{6}$/.test(v("co-pin"))?"":"PIN code must be 6 digits.")&&ok;
   ok=setError("co-card",/^\d{16}$/.test(v("co-card").replace(/\s/g,""))?"":"Card number must be 16 digits.")&&ok;
   if(!ok)return;
   const order={id:"LK"+Date.now().toString().slice(-6),total,name:v("co-name")};
   store.set("lastOrder",order);setCart([]);location.href="confirmation.html";
  });
 }
 if(page==="confirmation"){
  const o=store.get("lastOrder",null);
  $("confirm").innerHTML=o?`<h1>Order placed</h1><p style="margin-top:14px">Thanks, ${o.name}. Your order <strong id="order-id">${o.id}</strong> for ${rupees(o.total)} is on its way.</p><p style="margin-top:24px"><a class="btn" href="shop.html" id="continue-shopping">Continue shopping</a></p>`:`<p class="empty">No recent order found. <a href="shop.html">Browse teas</a>.</p>`;
 }
});
