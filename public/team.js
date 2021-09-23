$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  var team = params.get("team");
  var domain = location.origin; //"http://localhost:3000";
  const socket = io();

  var playersList = $("#playersList");
  var teamName = $("#teamName");
  var addPlayerButton = $("#addPlayer");

  var playersInTeam = 0;

  addPlayerButton.click(function (e) {
    var namePlayer = $("#namePlayer")[0].value;
    var pricePlayer = $("#pricePlayer")[0].value;
    var isPlayingPlayer = $("#isPlayingPlayer")[0].checked;
    var descriptionPlayer = $("#descriptionPlayer")[0].value;
    var password = $("#password")[0].value;

    if (
      namePlayer != "" &&
      pricePlayer != "" &&
      descriptionPlayer != "" &&
      password != ""
    ) {
      var player = {
        id: ++playersInTeam,
        playerName: namePlayer,
        from: team.toUpperCase(),
        price: pricePlayer,
        isPlaying: isPlayingPlayer,
        description: descriptionPlayer,
      };

      $.post(
        `${domain}/addPlayer`,
        { code: password, player },
        function (data, status, jqXHR) {
          console.log("status: " + status + ", data: " + data);
        }
      );

      $("#namePlayer")[0].value = "";
      $("#pricePlayer")[0].value = "";
      $("#isPlayingPlayer")[0].checked = false;
      $("#descriptionPlayer")[0].value = "";
      $("#password")[0].value = "";
      if (password == "345235") {
        alert("Player added Successfully!!");
        socket.emit("newPlayerAdded", {
          nextEvent: "updatePlayerData",
          playerId: playersInTeam,
        });
      } else {
        alert("Player not added! Wrong Password!!");
        --playersInTeam;
      }
    } else {
      alert("Fields can't be empty!");
    }
  });

  ///////////////////////////////////////////////////////////

  loadData();

  function loadData() {
    $.get(`${domain}/getTeam?team=${team}`, function (resTeam) {
      if (resTeam.length === 0) {
        alert(
          "No such team found! Make sure you are entering short version of team name!"
        );
        location.assign(location.origin);
      } else {
        document.getElementById("teamDetail").style.visibility = "visible";
        teamName.append(resTeam.teamName);
        playersInTeam = resTeam.players.length - 1;
        getCommentData(resTeam);
      }
    });
  }

  ///////////////////////////////////////////////////////////

  socket.on("updateCommentData", (eventObject) => {
    console.log(eventObject.message);
    updateComment(eventObject.playerId);
  });

  socket.on("updatePlayerData", (eventObject) => {
    console.log(eventObject.message);
    updatePlayer(eventObject.playerId);
  });

  ///////////////////////////////////////////////////////////

  function addEventListener() {
    var buttonsList = document.getElementsByTagName("button");
    for (var i = 1; i < buttonsList.length; i++) {
      buttonsList[i].addEventListener("click", (e) => {
        var id = e.target.id.split("-")[1];
        var commentorName = document.getElementById(`name-${id}`).value;
        var commentorComment = document.getElementById(`comment-${id}`).value;

        var comment = {
          playerId: id,
          team: team,
          personName: commentorName == "" ? "Anonymous" : commentorName,
          comment:
            commentorComment == "" ? "_BLANK-COMMENT_" : commentorComment,
        };
        $.post(
          `${domain}/postComment`,
          comment,
          function (data, status, jqXHR) {
            console.log("status: " + status + ", data: " + data);
            document.getElementById(`name-${id}`).value = "";
            document.getElementById(`comment-${id}`).value = "";
            socket.emit("newCommentAdded", {
              nextEvent: "updateCommentData",
              playerId: id,
            });
          }
        );
      });
    }
  }

  function addEventListenerNewPlayer(id) {
    var button = document.getElementById(`postButton-${id}`);
    button.addEventListener("click", (e) => {
      var id = e.target.id.split("-")[1];
      var commentorName = document.getElementById(`name-${id}`).value;
      var commentorComment = document.getElementById(`comment-${id}`).value;

      var comment = {
        playerId: id,
        team: team,
        personName: commentorName == "" ? "Anonymous" : commentorName,
        comment: commentorComment == "" ? "_BLANK-COMMENT_" : commentorComment,
      };
      $.post(`${domain}/postComment`, comment, function (data, status, jqXHR) {
        console.log("status: " + status + ", data: " + data);
        document.getElementById(`name-${id}`).value = "";
        document.getElementById(`comment-${id}`).value = "";
        socket.emit("newCommentAdded", {
          nextEvent: "updateCommentData",
          playerId: id,
        });
      });
    });
  }

  ///////////////////////////////////////////////////////////

  function createPlayerCards(resTeam, resComment) {
    for (var i = 0; i < resTeam.players.length; i++) {
      playersList.append(
        `<div class="playerCard" id=${resTeam.players[i].id}>
          <div class="playerDetails">
            <p class="playerName">
              > Name - <span>${resTeam.players[i].playerName}</span>
            </p>
            <p class="from">
              > Team - <span>${resTeam.players[i].from}</span>
            </p>
            <p class="price">
              > Price - <span>${resTeam.players[i].price}</span>
            </p>
            <p class="isPlaying">
              > Playing - <span>${
                resTeam.players[i].isPlaying === "true" ? "Yes" : "No"
              }</span>
            </p>
            <p class="description">
              > Description - <span>${resTeam.players[i].description}</span>
            </p>
          </div>
          <div class="commentSection">
            <div class="oldComments" id="commentCard-${i}">
            ${resComment.players[i].comments.map(
              (item) =>
                `<div class="commentCard"><p class="commenterName">${item.personName}</p><p class="comments">${item.comment}</p></div>`
            )}
            </div>
            <div class="addComment">
              <div>
                <input
                  type="text"
                  name="name"
                  id=${"name-" + resTeam.players[i].id}
                  placeholder="Commenter Name"
                />
                <input
                  type="text"
                  name="comment"
                  id=${"comment-" + +resTeam.players[i].id}
                  placeholder="Comment"
                />
              </div>
              <button id=${"postButton-" + resTeam.players[i].id}>Post</button>
            </div>
          </div>
        </div>`
      );
    }
    addEventListener();
  }

  function updatePlayer(id) {
    $.get(`${domain}/getTeam?team=${team}`, function (resTeam) {
      newPlayerData = resTeam.players[id];
      $("#playersList").append(
        `<div class="playerCard" id=${newPlayerData.id}>
          <div class="playerDetails">
            <p class="playerName">
              > Name - <span>${newPlayerData.playerName}</span>
            </p>
            <p class="from">
              > Team - <span>${newPlayerData.from}</span>
            </p>
            <p class="price">
              > Price - <span>${newPlayerData.price}</span>
            </p>
            <p class="isPlaying">
              > Playing - <span>${
                newPlayerData.isPlaying === "true" ? "Yes" : "No"
              }</span>
            </p>
            <p class="description">
              > Description - <span>${newPlayerData.description}</span>
            </p>
          </div>
          <div class="commentSection">
            <div class="oldComments" id="commentCard-${newPlayerData.id}">
            </div>
            <div class="addComment">
              <div>
                <input
                  type="text"
                  name="name"
                  id=${"name-" + newPlayerData.id}
                  placeholder="Commenter Name"
                />
                <input
                  type="text"
                  name="comment"
                  id=${"comment-" + newPlayerData.id}
                  placeholder="Comment"
                />
              </div>
              <button id=${"postButton-" + newPlayerData.id}>Post</button>
            </div>
          </div>
        </div>`
      );
      addEventListenerNewPlayer(id);
    });
  }
  ///////////////////////////////////////////////////////////

  function updateComment(id) {
    var commentSection = $(`#commentCard-${id}`);
    $(`#commentCard-${id}`).empty();
    $.get(`${domain}/getComments?team=${team}`, function (resComment) {
      commentSection.append(
        `${resComment.players[id].comments.map(
          (item) =>
            `<div class="commentCard"><p class="commenterName">${item.personName}</p><p class="comments">${item.comment}</p></div>`
        )}`
      );
    });
  }

  function getCommentData(resTeam) {
    $.get(`${domain}/getComments?team=${team}`, function (resComment) {
      createPlayerCards(resTeam, resComment);
    });
  }

  ///////////////////////////////////////////////////////////
});
