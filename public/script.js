let socket;

// 5 minutes
const delayValue = 1000 * 60 * 5;

const allUsers = ["David", "Francisco", "Felipe", "Paulo"];
const userData = [
    { name: "David", avatar: "https://avatars.githubusercontent.com/u/73745306?v=4" },
    { name: "Francisco", avatar: "https://avatars.githubusercontent.com/u/113376218?v=4" },
    { name: "Felipe", avatar: "https://avatars.githubusercontent.com/u/172610599?v=4" },
    { name: "Paulo", avatar: "https://avatars.githubusercontent.com/u/137209259?v=4" },
];

let lastMessage = { username: "", msg: "" };
let username = "";
let data;
let chatRooms = [];
let currentRoom = "";

function init() {
    const $input = $("#input");
    const $messages = $("#msg");
    const $form = $("#form");

    function addChatRoom(_name) {
        let item = { id: Date.now(), name: _name, img: `https://dummyjson.com/image/64` }
        chatRooms.push(item);
        socket.emit("create chat", username, item);
        $(".sidebar-container nav ul").append(/*html*/`
            <li data-room="${item.name}">
                <figure>
                    <img src="${item.img}" alt="img">
                    <figcaption>${item.name}</figcaption>
                </figure>

                <span></span>
            </li>
        `);
    }

    function renderChatRooms() {
        $(".sidebar-container nav ul").html(chatRooms.map(room => /*html*/`
            <li data-room="${room.name}" class="${room.name === currentRoom ? "selected" : ""}">
                <figure>
                    <img src="${room.img}" alt="img">
                    <figcaption>${room.name}</figcaption>
                </figure>

                <span></span>
            </li>
        `).join(""));
    }

    function chatMessages(data, _currentRoom) {
        if (_currentRoom !== currentRoom) return;

        const message = data;
        if (message.username === lastMessage.username && message.time - lastMessage.time < delayValue && $messages.find(`.msg-item`).first().length > 0) {
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
    }

    function socketTriggers() {
        socket.on("chatrooms data", (_data) => {
            chatRooms = _data;

            renderChatRooms();
        })

        socket.on("get users", (users) => {
            users.forEach(element => {
                $("#select-name option[value='" + element + "']").remove();
            });
        });

        socket.on("get data", (_data) => {
            console.log(currentRoom);
            data = _data;

            $messages.html("");

            data?.forEach((item, index) => {
                if (index > 0 && item.username === lastMessage.username && item.time - lastMessage.time < delayValue && $messages.find(`.msg-item`).first().length > 0) {
                    $messages.find(`.msg-item`).first().find(".msg-content").append(/*html*/`
                        <span>${item.msg}</span>
                    `);
                } else {
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
                }

                lastMessage = item;
            });

            $(window).scrollTop($(document).height());
        })

        socket.on("get users", (users) => {
            users.forEach(element => {
                $("#select-name option[value='" + element + "']").remove();
            });
        });

        socket.on("chat message", (data, _currentRoom) => {
            chatMessages(data, _currentRoom);
        });
    }

    function elementTriggers() {
        $("#select-name").on("change", function () {
            if ($(this).val() === "invalid") {
                return;
            }

            $("#user-info-modal").removeClass("show");
            username = $(this).val();
            socket.emit("new username", username);
        });

        $form.submit(function (e) {
            e.preventDefault();
            if ($input.val()) {
                socket.emit("chat message", username, $input.val());
                $input.val("");
            }
        });

        $(document).on("click", ".sidebar-container nav ul li", function () {
            if ($(this).hasClass("selected")) return;
            $(".sidebar-container nav ul li").removeClass("selected");
            $(this).addClass("selected");

            const roomName = $(this).attr("data-room");
            socket.emit("join room", roomName);

            currentRoom = roomName;

            $("#msg").html("");
            $(".main-content").addClass("active");
        });

        $("#show-create-chat-modal").on("click", function () {
            $("#create-chat-modal").addClass("show");
        });

        $("#create-chat-modal .close-btn").on("click", function () {
            $("#create-chat-modal").removeClass("show");
        });

        $("#create-chat-modal form").submit(function (e) {
            e.preventDefault();

            const chatName = $("#create-chat-modal input").val();
            $("#create-chat-modal input").val("");

            if (chatName) {
                addChatRoom(chatName);
                $("#create-chat-modal").removeClass("show");
            }
        });
    }

    $("#select-name").append(allUsers.map(user => `<option value="${user}">${user}</option>`).join(""));
    $("#user-info-modal").addClass("show");

    socket = io();
    socketTriggers();
    socket.emit("get users");
    socket.emit("get chatrooms");

    elementTriggers();
}

$(document).ready(init());