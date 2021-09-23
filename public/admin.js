$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);

  var password = params.get("password");
  if (password != "345235") {
    alert("Wrong Password!!");
    location.assign(location.origin);
  }

  const socket = io();
  var domain = location.origin; //"http://localhost:3000";

  var playersList = $("#playersList");

  loadData();

  socket.on("updatePlayerData", (eventObject) => {
    console.log(eventObject.message);
    $("#playersList").empty();
    loadData();
  });

  function loadData() {
    $.get(`${domain}/getAll`, function (resTeam) {
      console.log(resTeam);
      for (var i = 0; i < resTeam.length; i++) {
        playersList.append(
          `<h1>${resTeam[i].teamName}</h1>
          <div class="teamDiv">
          ${resTeam[i].players.map(
            (item) =>
              `<div class="playerDetails">
              <p class="playerName">
                > Name - <span>${item.playerName}</span>
              </p>
              <p class="from">
                > Team - <span>${item.from}</span>
              </p>
              <p class="price">
                > Price - <span>${item.price}</span>
              </p>
              <p class="isPlaying">
                > Playing - <span>${item.isPlaying ? "Yes" : "No"}</span>
              </p>
              <p class="description">
                > Description - <span>${item.description}</span>
              </p>
            </div>`
          )}
          </div>`
        );
      }
    });
  }
});
