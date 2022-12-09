
let orderData=[];
const orderList=document.querySelector(".js-orderList")

function init(){
    getOrderList();
}
init();

function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers:{
        authorization:token,
    }
    })
    .then(function (response) {
        orderData=response.data.orders;
        //組訂單字串
        let str="";
        orderData.forEach(function(item){
            //四、組日期字串
            const timeStamp= new Date(item.createdAt*1000);
            const orderTime= ` ${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

            //二、組產品細項字串
            let productStr="";
            item.products.forEach(function(productItem){
                productStr+=`<p>${productItem.title}×${productItem.quantity}</p>`
            })

            //三、訂單處理狀態判斷
            let orderStatus="";
            if (item.paid==true) {
                orderStatus="已處理"
            } else{
                orderStatus="未處理"
            }

            //一、組產品字串
            str+=`                    <tr>
            <td>${item.user.name}</td>
            <td>
                <p>${item.user.address}</p>
                <p>0912345678</p>
            </td>
            <td>${item.user.email}</td>
            <td>${productStr}</td>
            <td>
                <p>${orderTime}</p>
            </td>
            <td>${item.id}</td>
            <td class="orderStatus">
                <a href="#" class="orderStatus" data-id="${item.id}" data-status="${item.paid}">${orderStatus}</a>
            </td>
            <td>
                <input type="button" class="js-orderDelete" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
            </td>
        </tr>`

        })
        orderList.innerHTML=str;
        renderC3_lv2();

    })
}

//c3圖表
// function renderC3(){
//     //物件資料蒐集
//     let total=[];
//     orderData.forEach(function(item){
//         item.products.forEach(function(productItem){
//             if(total[productItem.category]==undefined){
//                 total[productItem.category]=productItem.price*productItem.quantity;
//             } else{
//                 total[productItem.category]+=productItem.price*productItem.quantity;
//             }
//         })
//     })
//     console.log(total);

//     //做出資料關聯
//     let categoryArry=Object.keys(total)
//     console.log(categoryArry);
//     let newData=[];
//     categoryArry.forEach(function (item) {
//         let ary=[];
//         ary.push(item);
//         ary.push(total[item]);
//         newData.push(ary)
//       })
    

//     let chart = c3.generate({
//         bindto: '#chart', // HTML 元素綁定
//         data: {
//             type: "pie",
//             columns: newData,


// },


// });
// }



//c3-lv2
function renderC3_lv2(){
    //資料蒐集
    let obj={};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(obj[productItem.title]==undefined){
                obj[productItem.title]=productItem.price*productItem.quantity;
            } else{
                obj[productItem.title]+=productItem.price*productItem.quantity;
            }
        })
    })
    console.log(obj);

    //資料關聯
    let originArray=Object.keys(obj);
    console.log(originArray);
    let rankData=[];
    originArray.forEach(function(item){
        let ary=[]
        ary.push(item);
        ary.push(obj[item]);
        rankData.push(ary)
    })



    //sort
    rankData.sort(function(a,b){
        return b[1]- a[1];
    })

    console.log(rankData);

    //判斷是否超過4筆
     if(rankData.length>3){
        let otherTotal=0;
        rankData.forEach(function(item,index){
            if(index>2){
                otherTotal+=rankData[index][1];
            }
        })
        console.log(otherTotal);
        rankData.splice(3,rankData.length-1);
        rankData.push(["其他",otherTotal])
    }

    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankData,


},


});

    



}

//訂單狀態&刪除按鈕監聽

orderList.addEventListener("click",function(e){
    e.preventDefault();
    const targetClass=e.target.getAttribute("class");
    let id=e.target.getAttribute("data-id");
    if (targetClass=="js-orderDelete"){
        deleteOrderItem(id);
        return;
    }
    if(targetClass=="orderStatus"){
        let status=e.target.getAttribute("data-status");
        changeOrderItem (status,id);
        return;
    }

})

//修改訂單狀態
function changeOrderItem (status,id) { 
    console.log(status,id);
    let newStatus;
    if (status==true){
        newStatus=false;
    } else{
        newStatus=true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
        "data": {
          "id": id,
          "paid": newStatus,
        }
      }
    
    ,{
        headers:{
            authorization:token,
        }
        })
    .then(function (response) {
        alert(`訂單狀態修改成功`)
        getOrderList();
      })
 }

 //刪除單筆訂單

 function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            authorization:token,
        }
        })
        .then(function (response){
            alert(`刪除該筆資料成功`)
            getOrderList();
        })
 }


 //刪除所有訂單
const discardAllBtn=document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            authorization:token,
        }
        })
        .then(function (response){
            alert(`已刪除所有資料`);
            getOrderList();
        })

})

