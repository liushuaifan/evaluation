const API = (() => {
  const InventoryURL = "http://localhost:3000/inventory";
  const cartURL = "http://localhost:3000/cart";
  const getCart = () => fetch(cartURL).then((data) => data.json());

  const getInventory = () => fetch(InventoryURL).then((data) => data.json());

  const addToCart = () => fetch(cartURL).then((data) => data.json());

  const postToDo = (todo) => {
    return fetch(cartURL, {
        method: "POST",
        body: JSON.stringify(todo),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((data) => data.json());
};

  const updateCart = (id, newAmount)  => {
    return fetch(cartURL+ "/" + id, {
        method: "PATCH",
        body: JSON.stringify(newAmount),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((data) => data.json());
  };

  const deleteFromCart = (id) =>
  fetch(cartURL + "/" + id, { method: "DELETE" }).then((data) => data.json());

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    postToDo,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;


    constructor() {
      this.#inventory = [];
      this.#cart = [];

    }
    get cart() {
      return this.#cart;
    }



    get inventory() {

      return this.#inventory;
    }

    set cart(newCart) {
      console.log("setter cart");
      this.#cart = newCart;
      //update view
      this.#onChange();
    }

    set inventory(newInventory) {
      // console.log("setter invent");
      this.#inventory = newInventory;
      this.#onChange();
    }



    subscribe(cb) {
      this.#onChange = cb;
    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    postToDo,

  } = API;

  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    postToDo
  };
})();

const View = (() => {
  const inventoryEL = document.querySelector(".inventory-container ul");
  const addbuttonEL = document.querySelectorAll(".add-btn");
  const deletebuttonEL = document.querySelectorAll(".delete-btn");
  const cartValue = document.querySelectorAll(".cartValue");
  const cartEl = document.querySelector(".cart-wrapper ul");
  const checkoutEL = document.querySelector(".checkout-btn");

  const renderInventory = (todos) => {
    let todoTemp = "";
    todos.forEach((todo) => {
        const content = todo.content;
        const liTemp = `<li todo-id="${todo.id}" todo-content="${todo.content}" > <span>${content}</span> <button class="delete-btn" >-</button><p class = "cartValue" id = "${todo.id}"> 1 </p> <button class="add-btn" >+</button> <button class="addTocart" >add to cart</button></li>`;
        todoTemp += liTemp;

    });
    inventoryEL.innerHTML = todoTemp;
  };

  const renderCart = (todos) => {
    let todoTemp = "";
    todos.forEach((todo) => {
        const content = todo.content;
        const amount = todo.amount;
        const liTemp = `<li todos-id="${todo.id}"><span>${content} ${"*"} ${amount}</span> <button class="deletecartbtn" >delete</button> </li>` ;
        todoTemp += liTemp;
    });
    cartEl.innerHTML = todoTemp;
  };




  return {
    inventoryEL,
    renderInventory,
    addbuttonEL,
    deletebuttonEL,
    cartValue,
    renderCart,
    cartEl,
    checkoutEL
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = () => {
    model.getInventory().then((data) => {

      state.inventory = data;
  });

  model.getCart().then((data) => {
    state.cart = data;
});
  };
  const increaseAmount = () => {
      View.inventoryEL.addEventListener("click",(event)=>{
        if (event.target.className !== "add-btn" && event.target.className !== "delete-btn") return;
        // console.log("add");
        // console.log(event.target.className);
        event.preventDefault();
        const id = event.target.parentNode.getAttribute("todo-id");
        // console.log(id);
        const curValue = Number(document.getElementById(id).innerHTML);
        // console.log(curValue);
        const Content = document.getElementById(id);
        if(event.target.className === "add-btn") Content.innerHTML = curValue + 1;
        if(event.target.className === "delete-btn" && curValue > 0) Content.innerHTML = curValue - 1;
      })
  };

  


  const handleAddToCart = () => {
    View.inventoryEL.addEventListener("click",(event)=>{
      if (event.target.className !== "addTocart") return;
      // console.log("add");
      // console.log(event.target.className);
      event.preventDefault();
      const id = event.target.parentNode.getAttribute("todo-id");
      const content = event.target.parentNode.getAttribute("todo-content");

      // console.log(id);
      const curValue = Number(document.getElementById(id).innerHTML);
      // console.log(curValue);

      
      
      let value = 0;
      // console.log(state.cart);
      for(let i=0;i<state.cart.length;i++){
        // console.log(typeof state.cart[i]["amount"]);
        // console.log(content===state.cart[i].content);
        if(state.cart[i].content === content){
          value = state.cart[i]["amount"];
        } 
      }
      const todoObj = { amount: curValue+value};

      if(value==0){
        console.log("hi1");
        const obj = {content:content, amount:curValue};
        model.postToDo(obj).then((data) => {
          state.cart = [data, ...state.cart];
          
      });

      }else{
        console.log("hi2");
        model.updateCart(id,todoObj).then((data) => {
          console.log(data);
        });
      }
      document.getElementById(id).innerHTML = curValue;
       

    })
  };

  const handleDelete = () => {
    view.cartEl.addEventListener("click", (event) => {
      if (event.target.className !== "deletecartbtn") return;
      console.log("delete!");
      const id = event.target.parentNode.getAttribute("todos-id");
      model.deleteFromCart(id).then((data) => {
          state.cart = state.cart.filter((item) => item.id !== +id);
      });
  });


  };

  const handleCheckout = () => {
      view.checkoutEL.addEventListener("click",()=>{
        model.checkout();
      })
  };

  const bootstrap = () => {
    init();
    increaseAmount();
    handleAddToCart();
    handleDelete();
    handleCheckout();
    state.subscribe(() => {
      view.renderInventory(state.inventory);
      view.renderCart(state.cart);
  });
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
