/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
MEDICAL INVENTORY MANAGEMENT MODULE
=====================================================

Functions:
- Medical supplies management
- Equipment tracking
- Stock monitoring
- Stock movements
- Low stock alerts
- Inventory reports

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeInventory();

});






async function initializeInventory(){

    try{

        await loadInventory();

        await checkLowStock();

        setupInventoryRealtime();

    }

    catch(error){

        console.error(

            "Inventory initialization error",

            error

        );

    }

}






// =====================================
// LOAD INVENTORY
// =====================================

async function loadInventory(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("inventory")

        .select("*")

        .order(

            "item_name",

            {

                ascending:true

            }

        );


        if(error)

        throw error;


        return data;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// ADD INVENTORY ITEM
// =====================================

async function addInventoryItem(data){

    try{

        const itemID =

        generateID("INV");



        const {

            error

        } =
        await supabaseClient

        .from("inventory")

        .insert({

            id:itemID,

            item_name:
            data.item_name,

            category:
            data.category,

            quantity:
            data.quantity,

            minimum_stock:
            data.minimum_stock,

            supplier:
            data.supplier,

            expiry_date:
            data.expiry_date,

            status:"available",

            created_at:
            new Date()

        });


        if(error)

        throw error;



        await createAuditLog(

            "INVENTORY_ITEM_ADDED",

            itemID

        );


        showNotification(

            "Inventory item added",

            "success"

        );


        return itemID;

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// UPDATE STOCK
// =====================================

async function updateStock(

itemID,

quantity

){

    try{

        const {

            data:item,

            error:getError

        } =
        await supabaseClient

        .from("inventory")

        .select("quantity")

        .eq(

            "id",

            itemID

        )

        .single();



        if(getError)

        throw getError;



        const newQuantity =

        item.quantity + quantity;



        const {

            error

        } =
        await supabaseClient

        .from("inventory")

        .update({

            quantity:
            newQuantity,

            updated_at:
            new Date()

        })

        .eq(

            "id",

            itemID

        );


        if(error)

        throw error;



        await recordStockMovement({

            item_id:itemID,

            quantity:quantity,

            movement:

            quantity > 0

            ?

            "stock_in"

            :

            "stock_out"

        });



        await createAuditLog(

            "STOCK_UPDATED",

            itemID

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// RECORD STOCK MOVEMENT
// =====================================

async function recordStockMovement(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("stock_movements")

        .insert({

            item_id:
            data.item_id,

            quantity:
            data.quantity,

            movement:
            data.movement,

            created_at:
            new Date()

        });


        if(error)

        throw error;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// DELETE INVENTORY ITEM
// =====================================

async function deleteInventoryItem(

itemID

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("inventory")

        .delete()

        .eq(

            "id",

            itemID

        );


        if(error)

        throw error;



        await createAuditLog(

            "INVENTORY_ITEM_DELETED",

            itemID

        );


    }

    catch(error){

        handleError(error);

    }

}
/*
=====================================================
ADVANCED INVENTORY MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// CHECK LOW STOCK
// =====================================

async function checkLowStock(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("inventory")

        .select("*");


        if(error)

        throw error;



        const lowStockItems =

        data.filter(

            item =>

            item.quantity <= item.minimum_stock

        );



        if(

            lowStockItems.length > 0

        ){

            lowStockItems.forEach(item=>{


                createNotification({

                    title:

                    "Low Stock Alert",


                    message:

                    `${item.item_name} stock is low`,


                    priority:

                    "high"

                });


            });

        }



        return lowStockItems;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// CHECK EXPIRING ITEMS
// =====================================

async function checkExpiryDates(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("inventory")

        .select("*");


        if(error)

        throw error;



        const today =
        new Date();



        const expiringItems =

        data.filter(item=>{


            if(!item.expiry_date)

            return false;



            const expiry =

            new Date(

                item.expiry_date

            );



            const difference =

            (expiry - today)

            /

            (1000*60*60*24);



            return difference <= 30;


        });



        return expiringItems;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// SEARCH INVENTORY
// =====================================

async function searchInventory(

keyword

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("inventory")

        .select("*")

        .ilike(

            "item_name",

            `%${keyword}%`

        );


        if(error)

        throw error;



        return data;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// INVENTORY STATISTICS
// =====================================

async function getInventoryStatistics(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("inventory")

        .select("*");


        if(error)

        throw error;



        let totalItems =
        data.length;



        let totalQuantity = 0;



        let lowStock = 0;



        data.forEach(item=>{


            totalQuantity +=

            item.quantity;



            if(

                item.quantity <= item.minimum_stock

            ){

                lowStock++;

            }


        });



        return{

            totalItems:

            totalItems,


            totalQuantity:

            totalQuantity,


            lowStock:

            lowStock

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// SUPPLIER MANAGEMENT
// =====================================

async function addSupplier(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("suppliers")

        .insert({

            supplier_name:

            data.supplier_name,


            phone:

            data.phone,


            email:

            data.email,


            address:

            data.address,


            created_at:

            new Date()

        });



        if(error)

        throw error;



        await createAuditLog(

            "SUPPLIER_ADDED",

            data.supplier_name

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// INVENTORY REPORT
// =====================================

async function exportInventoryReport(){

    const {

        data

    } =
    await supabaseClient

    .from("inventory")

    .select("*");



    return JSON.stringify(

        data || [],

        null,

        2

    );

}






// =====================================
// REALTIME INVENTORY
// =====================================

function setupInventoryRealtime(){

    supabaseClient

    .channel("inventory-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"inventory"

        },

        ()=>{

            loadInventory();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadInventory =
loadInventory;

window.addInventoryItem =
addInventoryItem;

window.updateStock =
updateStock;

window.recordStockMovement =
recordStockMovement;

window.deleteInventoryItem =
deleteInventoryItem;

window.checkLowStock =
checkLowStock;

window.checkExpiryDates =
checkExpiryDates;

window.searchInventory =
searchInventory;

window.getInventoryStatistics =
getInventoryStatistics;

window.addSupplier =
addSupplier;

window.exportInventoryReport =
exportInventoryReport;

window.setupInventoryRealtime =
setupInventoryRealtime;