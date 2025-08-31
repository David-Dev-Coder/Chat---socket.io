let socket;

// 5 minutes
const delayValue = 1000 * 60 * 5;

const allUsers = ["David", "Francisco", "Felipe"];
const userData = [
    { name: "David", avatar: "https://avatars.githubusercontent.com/u/73745306?v=4" },
    { name: "Francisco", avatar: "https://avatars.githubusercontent.com/u/113376218?v=4" },
    { name: "Felipe", avatar: "https://avatars.githubusercontent.com/u/172610599?v=4" },
];

let lastMessage = { username: "", msg: "" };
let username = "";
let data;

function init() {
    $("#select-name").append(allUsers.map(user => `<option value="${user}">${user}</option>`).join(""));

    socket = io();
    socketTriggers();
    socket.emit("get users");
    socket.emit("get data");

    $("#select-name").on("change", function () {
        if ($(this).val() === "invalid") {
            return;
        }

        $("#user-info-modal").addClass("hide");
        username = $(this).val();
        socket.emit("new username", username);
    });

    const $input = $("#input");
    const $messages = $("#msg");
    const $form = $("#form");

    $form.submit(function (e) {
        e.preventDefault();
        if ($input.val()) {
            socket.emit("chat message", username, $input.val());
            $input.val("");
        }
    });

    function socketTriggers() {
        socket.on("get data", (_data) => {
            data = _data;

            data?.forEach((item, index) => {
                $messages.prepend(/*html*/`
                    <div class="msg-item">
                        <div class="left-content">
                            <figure class="user-icon">
                                <span style="background-image: url('${userData.find(user => user.name === item.username).avatar}')"></span>
                            </figure>
                        </div>
                        <div class="right-content">
                            <div class="msg-info">
                                ${item.username}
                                <small>${(item.localeTime).substring(0, 5)}</small>
                            </div>
                            <div class="msg-content">
                                <span>${item.msg}</span>
                            </div>
                        </div>
                    </div>
                `);
            });
        })

        socket.on("get users", (users) => {
            users.forEach(element => {
                $("#select-name option[value='"+ element +"']").remove();
            });
        });

        socket.on("chat message", (data) => {
            const message = data;
            if (message.username === lastMessage.username && message.time - lastMessage.time < delayValue) {
                $messages.find(`.msg-item`).first().find(".msg-content").append(/*html*/`
                    <span>${message.msg}</span>
                `);
            } else {
                $messages.prepend(/*html*/`
                    <div class="msg-item">
                        <div class="left-content">
                            <figure class="user-icon">
                                <span style="background-image: url('${userData.find(user => user.name === message.username).avatar}')"></span>
                            </figure>
                        </div>
                        <div class="right-content">
                            <div class="msg-info">
                                ${message.username}
                                <small>${(message.localeTime).substring(0, 5)}</small>
                            </div>
                            <div class="msg-content">
                                <span>${message.msg}</span>
                            </div>
                        </div>
                    </div>
                `);
            }
    
            $(window).scrollTop($(document).height());
    
            lastMessage = message;
        });
    }
}

$(document).ready(init());