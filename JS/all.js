const productList=document.querySelector(".productWrap");


let productData=[];
let cartData=[];

//一、取得產品清單列表
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
        productData=response.data.products;
        renderProductList();
      })
    .catch(function (error) {
        console.log(error);
      })

} 


//二、渲染網頁畫面-產品清單列表
function renderProductList(){
    let str=``;
    productData.forEach(function(item,index){
        str+=productListContent(item);
    })
    productList.innerHTML=str;
}

//三、網頁初始化

function init(){
    getProductList();
    getCartList();
}
init();


//產品清單組HTML結構字串
function productListContent(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${numberComma(item.origin_price)}</del>
    <p class="nowPrice">NT$${numberComma(item.price)}</p>
    </li>`

}

//搜尋按鈕監聽

const productSelect=document.querySelector(".productSelect");

productSelect.addEventListener("change",function(e){
    const category=e.target.value
    if (category=="全部") {
        renderProductList();
        return;
    }
    let str=``;
    productData.forEach(function(item){
        if(item.category==category){
            str+=productListContent(item);
        }
    })
    productList.innerHTML=str;
})


//加入購物車邏輯

productList.addEventListener("click",function(e){
    e.preventDefault();
    let addCartClass=e.target.getAttribute("class");
    if(addCartClass!=="js-addCart"){
        return;
    }

    let productId =e.target.getAttribute("data-id")
    let checkNum=1; 
    cartData.forEach(function (item) {
        if(item.product.id===productId){
            checkNum=item.quantity+=1;
        }

    })

    //點擊按鈕加入購物車
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": checkNum,
        }
    })
    .then(function (response) {
        getCartList();
        alert(`成功加入購物車`)
    })
    
})


//購物車清單

const cartList=document.querySelector(".shoppingCart-tableList")
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
        document.querySelector(".js-total").textContent=  numberComma(response.data.finalTotal);
        cartData=response.data.carts;
        let str="";
        cartData.forEach(function(item){
            str+=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${numberComma(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$ ${numberComma(item.product.price*item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id=${item.id}>
                    clear
                </a>
            </td>
        </tr>`
        })

        cartList.innerHTML=str;


      })
    .catch(function (error) {
        console.log(error);
      })
}


//刪除購物車單筆資料按鈕
cartList.addEventListener("click",function(e){
    e.preventDefault();
    const cartId=e.target.getAttribute("data-id")
    if (cartId===null) {
        alert(`未點到刪除按鈕`);
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
        alert(`購物車資料刪除成功`)
        getCartList();
    })
})

//刪除購物車所有品項按鈕

const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        
        alert(`購物車所有資料刪除成功`)
        getCartList();
    })
})

//送出預定資料按鈕監聽
const orderInfoBtn=document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e);
    if(cartData.length==0){
        alert(`購物車沒有東西，請點選商品再送出訂單`)
    };
    
    const customerName=document.querySelector("#customerName").value
    const customerPhone=document.querySelector("#customerPhone").value
    const customerEmail=document.querySelector("#customerEmail").value
    const customerAddress=document.querySelector("#customerAddress").value
    const customerTradeWay=document.querySelector("#tradeWay").value

    if(customerName=="" || customerPhone =="" || customerEmail=="" || customerAddress=="" || customerTradeWay ==""){
        alert(`請填入正確資訊`);
        return;
    };
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
          "user": {
            "name": customerName,
            "tel": customerPhone,
            "email": customerEmail,
            "address": customerAddress,
            "payment": customerTradeWay,
          }
        }
      })
    .then(function(response){
        
        alert(`訂單成立`);
        document.querySelector("#customerName").value="";
        document.querySelector("#customerPhone").value="";
        document.querySelector("#customerEmail").value="";
        document.querySelector("#customerAddress").value="";
        document.querySelector("#tradeWay").value="ATM";
        getCartList();
        // console.log(cartData);
    })

})


//千分位函式
function numberComma(num){
    let comma=/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
    return num.toString().replace(comma, ',')
}
