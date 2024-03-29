const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productDOM = document.querySelector("#products-dom");
let cart = [];
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch(
        "https://65e9056c4bb72f0a9c50a950.mockapi.io/products"
      );
      let data = await result.json();
      let products = data;

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += ` <div class="col-lg-4 col-md-6">
            <div class="product">
              <div class="product-image">
                <img
                  src="./images/product-${item.id}.jpg"
                  alt="product"
                  class="img-fluid"
                />
              </div>
              <div class="product-hover">
                <span class="product-title">${item.title}</span>
                <span class="product-price">${item.price} $</span>
                <button class="btn-add-to-cart" data-id=${item.id}>
                  <i class="fa-solid fa-bag-shopping"></i>
                </button>
              </div>
            </div>
          </div>`;
    });
    productDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      console.log("ID:", id);
      console.log("In Cart:", inCart);
      if (inCart) {
        button.disabled = true;
        button.style.opacity = ".4";
      } else {
        button.addEventListener("click", (event) => {
          event.target.disabled = true;
          event.target.style.opacity = ".4";
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          this.addCartItem(cartItem);
          this.showCart();
          this.updateButtons(); // Yeniden düğmeleri güncelle
        });
      }
    });
  }

  saveCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.forEach((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const li = document.createElement("li");
    li.classList.add("cart-list-item");
    li.innerHTML = ` <div class="cart-left">
                      <div class="cart-left-image">
                        <img src="./images/product-${item.id}.jpg" alt="product" class="img-fluid" />
                      </div>
                      <div class="cart-left-info">
                        <a href="#" class="cart-left-info-title">${item.title}</a>
                        <span class="cart-left-info-price">${item.price} $</span>
                      </div>
                    </div>
                    <div class="cart-right">
                      <div class="cart-right-quantity">
                        <button class="quantity-minus" data-id=${item.id}>
                          <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.amount}</span>
                        <button class="quantity-plus" data-id=${item.id}>
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                      <div class="cart-right-remove">
                        <button class="cart-remove-btn" data-id=${item.id}>
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>`;
    cartContent.appendChild(li);
  }

  showCart() {
    cartBtn.click();
  }

  setupApp() {
    cart = Storage.getCart();
    this.saveCartValues(cart);
    this.populateCart(cart);
  }

  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("cart-remove-btn")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        removeItem.parentElement.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (event.target.classList.contains("quantity-minus")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.saveCartValues(cart);
          lowerAmount.nextElementSibling.innerText = tempItem.amount;
        } else {
          lowerAmount.parentElement.parentElement.parentElement.remove();
          this.removeItem(id); // this.lowerAmount(id); yerine this.removeItem(id); kullanıyoruz.
        }
      } else if (event.target.classList.contains("quantity-plus")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.saveCartValues(cart);
        addAmount.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }

  clearCart() {
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    cart = [];
    this.saveCartValues(cart);
    Storage.saveCart(cart);
    this.updateButtons(); // Düğmeleri güncelle
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.saveCartValues(cart);
    Storage.saveCart(cart);
    this.updateButtons(); // Güncellemeyi ekledik
  }

  updateButtons() {
    buttonsDOM.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.disabled = true;
        button.style.opacity = "0.4"; // Buton opaklık değeri
        button.querySelector("i").style.opacity = "0.4"; // İçindeki ikon opaklık değeri
      } else {
        button.disabled = false;
        button.style.opacity = "1"; // Buton opaklık değeri
        button.querySelector("i").style.opacity = "1"; // İçindeki ikon opaklık değeri
      }
    });
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setupApp();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
