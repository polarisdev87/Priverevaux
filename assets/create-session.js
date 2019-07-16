$(document).ready(function(){
    $.ajax({
        type: "POST",
        url: 'https://dev.priverevaux.com/opternative/create-session.php',
        data: {
            sendToSession:sessionStorage.getItem("createSessionData")
        },
        dataType: 'json',
        success: function (data) {
            console.log(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            alert("Error: " + (errorThrown ? errorThrown : xhr.status));
        }
    });
});