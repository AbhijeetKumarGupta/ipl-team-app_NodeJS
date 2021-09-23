$(document).ready(function () {
  var searchButton = $("#searchIco");
  var searchBox = $("#search-box");
  var loginButton = $("#login");

  searchButton.click(function () {
    var team = searchBox.val().toLowerCase();
    if (team !== "") {
      $(location).attr("href", `./team.html?team=${team}`);
    } else {
      alert("Name field cant be empty!");
    }
  });

  loginButton.click(function () {
    var password = $("#password")[0].value;
    if (password == "345235") {
      $(location).attr("href", `./admin.html?password=${password}`);
    } else {
      $("#password")[0].value = "";
      alert("Wrong Password!!");
    }
  });
});
