const saved_username = localStorage.getItem("username");
const saved_chatroom = localStorage.getItem("chatroom");

if (saved_username != undefined){
    document.getElementById("user_name").value = saved_username;
}

if (saved_chatroom != undefined) {
    document.getElementById("room_name").value = saved_chatroom;
}

document.addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
        submit_login();
    }
});

function submit_login() {
    const username = document.getElementById("user_name").value;
    const chatroom = document.getElementById("room_name").value;
    if (username != "" && chatroom != "") {
        localStorage.setItem("username", username);
        localStorage.setItem("chatroom", chatroom);
        window.location.href = "chat.html";
    }
}

function closeBanner() {
    document.getElementById("error-banner").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("error-banner").style.display = "none";
    }, 750); // Fade out smoothly
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("error")) {
    const errorMessage = urlParams.get("error") || "An error occurred!";
    const errorBanner = document.getElementById("error-banner");
    document.getElementById("error-message").textContent = errorMessage;
    
    errorBanner.style.display = "block";
    errorBanner.style.opacity = "1";

    setTimeout(() => {
        closeBanner();
    }, 5000); // Auto-hide after 10 seconds

    // Remove the error parameter from the URL without reloading the page
    urlParams.delete("error");
    const newUrl = window.location.pathname + "?" + urlParams.toString();
    window.history.replaceState({}, document.title, newUrl);
}