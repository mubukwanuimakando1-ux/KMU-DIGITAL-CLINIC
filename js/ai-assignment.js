/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
AI HEALTH ASSISTANT MODULE
=====================================================

Functions:
- AI chat interface
- User questions handling
- Health information assistance
- Chat history storage
- Supabase integration
- Registered user protection

=====================================================
*/






// =====================================
// AI ASSISTANT INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    setupAIChat();


});








// =====================================
// OPEN / CLOSE AI CHAT
// =====================================


function setupAIChat(){


    const button =
    document.getElementById(
        "aiChatButton"
    );



    const windowAI =
    document.getElementById(
        "aiChatWindow"
    );



    const close =
    document.getElementById(
        "closeAI"
    );





    if(button){


        button.addEventListener(

            "click",

            ()=>{


                windowAI.classList.toggle(
                    "active"
                );


                loadChatHistory();


            }

        );


    }






    if(close){


        close.addEventListener(

            "click",

            ()=>{


                windowAI.classList.remove(
                    "active"
                );


            }

        );


    }







    const sendButton =
    document.getElementById(
        "sendAI"
    );



    if(sendButton){


        sendButton.addEventListener(

            "click",

            sendAIMessage

        );


    }







    const input =
    document.getElementById(
        "aiQuestion"
    );



    if(input){


        input.addEventListener(

            "keypress",

            event=>{


                if(
                    event.key === "Enter"
                ){


                    sendAIMessage();


                }


            }

        );


    }



}








// =====================================
// SEND USER MESSAGE
// =====================================


async function sendAIMessage(){


    const input =
    document.getElementById(
        "aiQuestion"
    );



    if(!input)
    return;





    const question =
    input.value.trim();





    if(!question)
    return;






    addChatMessage(

        question,

        "user"

    );




    input.value="";






    await saveChatMessage(

        "user",

        question

    );







    const response =
    await generateAIResponse(
        question
    );






    addChatMessage(

        response,

        "bot"

    );





    await saveChatMessage(

        "assistant",

        response

    );





}








// =====================================
// DISPLAY CHAT MESSAGE
// =====================================


function addChatMessage(

message,

sender

){


    const container =
    document.getElementById(
        "aiMessages"
    );



    if(!container)
    return;





    const div =
    document.createElement(
        "div"
    );



    if(sender==="user"){


        div.className =
        "user-message";


    }
    else{


        div.className =
        "bot-message";


    }





    div.innerHTML =
    message;





    container.appendChild(
        div
    );





    container.scrollTop =
    container.scrollHeight;



}








// =====================================
// AI RESPONSE ENGINE
// =====================================


async function generateAIResponse(

question

){


    const text =
    question.toLowerCase();






    if(
        text.includes(
            "appointment"
        )
    ){


        return `

        You can book an appointment
        using the KMU Digital Health Centre
        appointment section.
        Select your department,
        preferred date and provide your
        reason for visiting.

        `;


    }






    if(
        text.includes(
            "medicine"
        )
    ){


        return `

        The pharmacy department manages
        prescriptions and medicine dispensing.
        Please consult a healthcare professional
        before taking medication.

        `;


    }






    if(
        text.includes(
            "laboratory"
        )
        ||
        text.includes(
            "test"
        )
    ){


        return `

        Laboratory services include sample
        collection, medical testing and result
        reporting. Visit the laboratory department
        after receiving a request from a clinician.

        `;


    }






    if(
        text.includes(
            "emergency"
        )
    ){


        return `

        For medical emergencies, contact the
        KMU Health Centre immediately or visit
        the emergency support area.

        `;


    }






    return `

    I am KMU Digital Health Assistant.
    I can help with appointments,
    departments, healthcare services,
    clinic procedures and general health
    information.

    Please provide more details about
    your question.

    `;


}

/*
=====================================================
AI ASSISTANT ADVANCED FEATURES
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================

Functions:
- Save chat history
- Load previous conversations
- User access control
- Clear conversations
- Secure AI usage logging

=====================================================
*/






// =====================================
// SAVE CHAT MESSAGE
// =====================================


async function saveChatMessage(

sender,

message

){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();






        if(!user.user){


            return;


        }







        await supabaseClient
        .from("ai_chat_history")
        .insert({



            user_id:

            user.user.id,



            sender:

            sender,



            message:

            message,



            created_at:

            new Date()



        });








    }
    catch(error){


        console.error(

            "Chat save error",

            error

        );


    }


}







// =====================================
// LOAD CHAT HISTORY
// =====================================


async function loadChatHistory(){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();






        if(!user.user){

            return;

        }







        const {

            data,

            error

        } =
        await supabaseClient
        .from("ai_chat_history")
        .select("*")
        .eq(

            "user_id",

            user.user.id

        )
        .order(

            "created_at",

            {

            ascending:true

            }

        )
        .limit(50);







        if(error){

            throw error;

        }







        const container =
        document.getElementById(
            "aiMessages"
        );




        if(!container)
        return;






        container.innerHTML="";






        data.forEach(

            chat=>{


                addChatMessage(

                    chat.message,

                    chat.sender

                );


            }

        );





    }
    catch(error){


        console.error(

            "Chat history error",

            error

        );


    }


}







// =====================================
// CHECK AI ACCESS
// =====================================


async function checkAIAccess(){


    try{


        const {

            data

        } =
        await supabaseClient
        .auth
        .getUser();






        if(
            !data.user
        ){



            return false;



        }






        return true;



    }
    catch(error){


        return false;


    }


}







// =====================================
// CLEAR CHAT HISTORY
// =====================================


async function clearChatHistory(){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();







        if(!user.user)
        return;








        const {

            error

        } =
        await supabaseClient
        .from("ai_chat_history")
        .delete()
        .eq(

            "user_id",

            user.user.id

        );







        if(error){

            throw error;

        }






        const container =
        document.getElementById(
            "aiMessages"
        );





        if(container){


            container.innerHTML =


            `

            <div class="bot-message">

            Chat history cleared.

            </div>

            `;


        }






        await createAuditLog(

            "AI_CHAT_HISTORY_CLEARED",

            user.user.email

        );





    }
    catch(error){


        handleError(error);


    }


}







// =====================================
// AI SECURITY FILTER
// =====================================


function filterAIRequest(

question

){


    const blockedWords = [


        "password",


        "hack",

        "exploit",

        "malware",

        "steal",

        "bypass",

        "attack"



    ];






    const lower =
    question.toLowerCase();






    for(
        let word of blockedWords
    ){


        if(
            lower.includes(word)
        ){



            return false;



        }


    }






    return true;


}







// =====================================
// SECURE AI RESPONSE WRAPPER
// =====================================


async function secureAIResponse(

question

){



    if(
        !filterAIRequest(question)
    ){


        return `

        I cannot assist with harmful
        activities. I can help with
        healthcare information,
        appointments and safe digital
        health guidance.

        `;


    }







    return await generateAIResponse(

        question

    );



}







// =====================================
// AI USAGE STATISTICS
// =====================================


async function getAIUsageStatistics(){


    try{


        const {

            count

        } =
        await supabaseClient
        .from("ai_chat_history")
        .select(

            "*",

            {

            count:"exact",

            head:true

            }

        );







        return {


            totalMessages:

            count || 0



        };





    }
    catch(error){


        console.error(

            "AI statistics error",

            error

        );


    }


}







// =====================================
// EXPORT FUNCTIONS
// =====================================


window.saveChatMessage =
saveChatMessage;


window.loadChatHistory =
loadChatHistory;


window.checkAIAccess =
checkAIAccess;


window.clearChatHistory =
clearChatHistory;


window.filterAIRequest =
filterAIRequest;


window.secureAIResponse =
secureAIResponse;


window.getAIUsageStatistics =
getAIUsageStatistics;
