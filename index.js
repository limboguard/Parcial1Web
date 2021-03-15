const DATA =
  "https://gist.githubusercontent.com/josejbocanegra/9a28c356416badb8f9173daf36d1460b/raw/5ea84b9d43ff494fcbf5c5186544a18b42812f09/restaurant.json";

const TABLE_CONTAINER = `
<table class="table table-striped">
  <thead>
    <tr>
      <th scope="col">Item</th>
      <th scope="col">Qty.</th>
      <th scope="col">Description</th>
      <th scope="col">Unit Price</th>
      <th scope="col">Amount</th>
      <th scope="col">Modify</th>
    </tr>
  </thead>
  <tbody id="table-body"></tbody>
  <caption>
    <p id="total-price"><strong>Total: $ xxx</strong></p>
    <div id="order-buttons">
      <button type="button" class="btn btn-outline-dark" id="cancel-order" data-bs-toggle="modal" data-bs-target="#modal">Cancel</button>
      <button type="button" class="btn btn-outline-dark" id="confirm-order"> Confirm Order </button>
    </div>
  </caption>
</table>`;

let data = [];
let cartItems = [];
let currCat = "Burguers";
let onShoppingCart = false;

async function readJSON(url) {
  return axios
    .get(url)
    .then(res => {
      return res.data;
    })
    .catch(err => console.error(err));
}

function createCategories() {
  const nav = document.querySelector("#categories-nav");
  nav.innerHTML = data.map(d => `<li class="nav-item"><a class="nav-link" href="#">${d.name}</a></li>`).join("\n");
  document.querySelector("#category-title").innerHTML = currCat;

  nav.querySelectorAll(".nav-link").forEach(el => el.addEventListener("click", changeCat));
}

function changeCat(ev) {
  currCat = ev.target.innerHTML;

  document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
  ev.target.classList.add("active");

  document.querySelector("#category-title").innerHTML = currCat;
  onShoppingCart = false;
  changeItems();
}

function changeItems() {
  document.querySelector("#main-container").innerHTML = `
    <div class="row row-cols-4" id="card-grid"></div>
  `;
  const cards = document.querySelector("#card-grid");
  cards.innerHTML = data
    .find(d => d.name === currCat)
    .products.map(
      p =>
        `<div class="col card-col">
          <div class="card h-100">
            <img src="${p.image}" height="200px" class="card-img-top" alt="${p.name}" />
            <div class="card-body">
              <h5 class="card-title">${p.name}</h5>
              <p class="card-text">${p.description}</p>
              <div class="item-footer">
                <p><strong>$ ${p.price}</strong></p>
                <button class="btn btn-dark add-to-cart" id="${p.name}">Add to cart</button>
              </div>
            </div>
          </div>
        </div>`
    )
    .join("\n");

  document.querySelectorAll(".add-to-cart").forEach(el => el.addEventListener("click", ev => addToCart(ev.target.id)));
}

function addToCart(itemName, remove) {
  if (remove) {
    const index = cartItems
      .slice()
      .reverse()
      .findIndex(it => itemName === it.name);
    cartItems.splice(cartItems.length - index - 1, 1);
  } else {
    cartItems.push(data.find(cat => cat.name === currCat).products.find(it => it.name === itemName));
  }
  document.querySelector("#cart-counter").innerHTML = cartItems.length + " items";
  if (onShoppingCart) {
    updateOrderTable();
  }
}

function getShoppingCart() {
  cart = new Map();
  cartItems.forEach(it => {
    let value = cart.get(it.name);
    if (!value) {
      value = { description: it.name, quantity: 1, unitPrice: it.price, amount: it.price };
    } else {
      value = {
        ...value,
        quantity: value.quantity + 1,
        amount: value.amount + it.price,
      };
    }
    cart.set(it.name, value);
  });

  return Array.from(cart.values());
}

function updateOrderTable() {
  document.querySelector("#table-body").innerHTML = getShoppingCart()
    .map(
      (it, index) =>
        `<tr>
          <th scope="row">${index + 1}</th>
          <td>${it.quantity}</td>
          <td>${it.description}</td>
          <td>${it.unitPrice}</td>
          <td>${it.amount.toFixed(2)}</td>
          <td id="${it.description}">
            <button type="button" class="btn btn-secondary add-item">+</button>
            <button type="button" class="btn btn-secondary remove-item">-</button>
          </td>
        </tr>`
    )
    .join("\n");

  document
    .querySelectorAll(".add-item")
    .forEach(el => el.addEventListener("click", ev => addToCart(ev.target.parentElement.id)));

  document
    .querySelectorAll(".remove-item")
    .forEach(el => el.addEventListener("click", ev => addToCart(ev.target.parentElement.id, true)));
}

function goToShoppingCart() {
  onShoppingCart = true;
  document.querySelector("#category-title").innerHTML = "Order detail";
  document.querySelector("#main-container").innerHTML = TABLE_CONTAINER;
  document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));

  document.querySelector("#delete-products").addEventListener("click", () => (cartItems = []));
  document
    .querySelector("#confirm-order")
    .addEventListener("click", () => console.log(cartItems.map((it, i) => ({ ...it, item: i }))));
  updateOrderTable();
}

readJSON(DATA).then(response => {
  data = response;
  currCat = data[0].name;
  createCategories();
  changeItems();
  document.querySelector("#shopping-cart").addEventListener("click", goToShoppingCart);
});
