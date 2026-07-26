/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
PHARMACY MANAGEMENT MODULE
=====================================================

Functions:
- Medicine inventory
- Prescription processing
- Medicine dispensing
- Stock monitoring
- Low stock alerts
- Expiry monitoring

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializePharmacy();

});






async function initializePharmacy(){

    try{

        await loadMedicineInventory();

        await checkLowStock();

        await checkExpiringMedicines();

    }
    catch(error){

        console.error(
            "Pharmacy initialization error",
            error
        );

    }

}






// =====================================
// LOAD INVENTORY
// =====================================

async function loadMedicineInventory(){

    try{

        const {

            data,

            error

        }=
        await supabaseClient
        .from("medicines")
        .select("*")
        .order(

            "medicine_name",

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
// ADD MEDICINE
// =====================================

async function addMedicine(medicine){

    try{

        const medicineID =
        generateID("MED");

        const {

            error

        }=
        await supabaseClient
        .from("medicines")
        .insert({

            id:medicineID,

            medicine_name:
            medicine.medicine_name,

            category:
            medicine.category,

            quantity:
            medicine.quantity,

            unit:
            medicine.unit,

            batch_number:
            medicine.batch_number,

            expiry_date:
            medicine.expiry_date,

            supplier:
            medicine.supplier,

            created_at:
            new Date()

        });

        if(error)
        throw error;

        await createAuditLog(

            "MEDICINE_ADDED",

            medicineID

        );

        showNotification(

            "Medicine added successfully",

            "success"

        );

        return medicineID;

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// UPDATE STOCK
// =====================================

async function updateMedicineStock(

medicineID,

newQuantity

){

    try{

        const {

            error

        }=
        await supabaseClient
        .from("medicines")
        .update({

            quantity:newQuantity,

            updated_at:new Date()

        })
        .eq(

            "id",

            medicineID

        );

        if(error)
        throw error;

        await createAuditLog(

            "STOCK_UPDATED",

            medicineID

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// DISPENSE MEDICINE
// =====================================

async function dispenseMedicine(data){

    try{

        const {

            error

        }=
        await supabaseClient
        .from("dispensed_medicines")
        .insert({

            prescription_id:
            data.prescription_id,

            patient_id:
            data.patient_id,

            medicine_id:
            data.medicine_id,

            quantity:
            data.quantity,

            pharmacist_id:
            data.pharmacist_id,

            dispensed_at:
            new Date()

        });

        if(error)
        throw error;

        await createAuditLog(

            "MEDICINE_DISPENSED",

            data.patient_id

        );

        showNotification(

            "Medicine dispensed",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD PENDING PRESCRIPTIONS
// =====================================

async function loadPendingPrescriptions(){

    try{

        const {

            data,

            error

        }=
        await supabaseClient
        .from("prescriptions")
        .select("*")
        .eq(

            "status",

            "pending"

        )
        .order(

            "created_at",

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
// LOW STOCK CHECK
// =====================================

async function checkLowStock(){

    try{

        const {

            data,

            error

        }=
        await supabaseClient
        .from("medicines")
        .select("*")
        .lte(

            "quantity",

            10

        );

        if(error)
        throw error;

        return data;

    }
    catch(error){

        console.error(error);

    }

}
/*
=====================================================
ADVANCED PHARMACY MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// CHECK EXPIRING MEDICINES
// =====================================

async function checkExpiringMedicines(){

    try{

        const expiryDate = new Date();

        expiryDate.setMonth(
            expiryDate.getMonth()+3
        );

        const {

            data,

            error

        } =
        await supabaseClient
        .from("medicines")
        .select("*")
        .lte(
            "expiry_date",
            expiryDate.toISOString()
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
// COMPLETE PRESCRIPTION
// =====================================

async function completePrescription(

prescriptionID

){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("prescriptions")
        .update({

            status:"completed",

            completed_at:new Date()

        })
        .eq(
            "id",
            prescriptionID
        );

        if(error)
        throw error;

        await createAuditLog(

            "PRESCRIPTION_COMPLETED",

            prescriptionID

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// INVENTORY STATISTICS
// =====================================

async function getInventoryStatistics(){

    try{

        const {

            count

        } =
        await supabaseClient
        .from("medicines")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );

        const lowStock =
        await checkLowStock();

        const expiring =
        await checkExpiringMedicines();

        return{

            totalMedicines:
            count || 0,

            lowStock:
            lowStock ? lowStock.length : 0,

            expiring:
            expiring ? expiring.length : 0

        };

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// SEARCH MEDICINES
// =====================================

async function searchMedicines(keyword){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("medicines")
        .select("*")
        .ilike(
            "medicine_name",
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
// REALTIME INVENTORY
// =====================================

function setupPharmacyRealtime(){

    supabaseClient

    .channel("medicine-stock")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"medicines"

        },

        ()=>{

            loadMedicineInventory();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT INVENTORY
// =====================================

async function exportMedicineInventory(){

    const inventory =
    await loadMedicineInventory();

    return JSON.stringify(

        inventory,

        null,

        2

    );

}






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    setupPharmacyRealtime();

});






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadMedicineInventory =
loadMedicineInventory;

window.addMedicine =
addMedicine;

window.updateMedicineStock =
updateMedicineStock;

window.dispenseMedicine =
dispenseMedicine;

window.loadPendingPrescriptions =
loadPendingPrescriptions;

window.checkLowStock =
checkLowStock;

window.checkExpiringMedicines =
checkExpiringMedicines;

window.completePrescription =
completePrescription;

window.getInventoryStatistics =
getInventoryStatistics;

window.searchMedicines =
searchMedicines;

window.setupPharmacyRealtime =
setupPharmacyRealtime;

window.exportMedicineInventory =
exportMedicineInventory;