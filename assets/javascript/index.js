/* eslint-disable */

class ApiCall {
  constructor () {
    this.baseUrl = 'https://api.github.com/users'
    this.username = ""
  }
  getRepoList(username){
    console.log("requested repo list for: " + username)
    var url = this.baseUrl
    var username = username
    return new Promise(function(resolve, reject) {
      const database = JSON.parse(localStorage.getItem('reposlist')) || [];
      const repos = database[0].filter(function (repo) {
        return repo.full_name.indexOf(username) !== -1;
      });
      console.log(repos)
      if (repos.length) {
        return new Promise(function(resolve, reject) {
          resolve(repos);
          console.log("REPO found in database: ",repos)
        })
      } else{
        console.log("REPO NOT found in database, get from API")

        $.getJSON(`${url}/${username}/repos`)
          .done((data) => {
            var repos = JSON.parse(localStorage.getItem('repos')) || []
            repos.push(data);
            console.log("REPO fetched from API, return it")
            localStorage.setItem('reposlist', JSON.stringify(repos));
            console.log("repo list:", repos)
            resolve(data);
          })
          .fail( () => {
            alert("Repo not found");
          })

      }
    })

  }
  getProfileInfo(username){
    console.log("requested user info for:" + username)
    const database = JSON.parse(localStorage.getItem('users')) || [];
    const users = database.filter(function (user) {
      return user.login == username;
    });
    if (users.length) {
      console.log("user found in the database, returning it", users[0])
      return new Promise(function(resolve, reject) {
        resolve(users[0]);
      })
    } else{
      return fetch(`${this.baseUrl}/${username}`)
        .then(resp => resp.json())
        .then((data) => {
          console.log("user fetched from API, returning it", data)
          var users = JSON.parse(localStorage.getItem('users')) || []
          users.push(data);
          localStorage.setItem('users', JSON.stringify( users ));
          return data;
        })
    }
  }
  getSavedUsers(){
    if (localStorage.getItem('users') !== null) {
      // pass local storage to showSavedUsers in order to display them
      instance_of_view.showSavedUsers(JSON.parse(localStorage.getItem('users')));
    } else {
      // throw error if no local storage was found
      console.log("no storage found");
    }
  }
}
class ViewLayer {
  constructor() {
    this.elements = {
      'form': document.getElementById('github-form'),
      'username': document.getElementById('username'),
      'repo': document.getElementById('button-repo'),
      'info': document.getElementById('button-info'),
      'repo_list': document.getElementById('repo-list'),
      'image': document.getElementById('avatar'),
      'website': document.getElementById('website'),
      'created_at': document.getElementById('created_at'),
      'clearButton' : document.getElementById('clearHistory'),
    }
    this.repoEventListener()
    this.profileInfoEventListener()
    this.onLoadListener()
    this.clearHistory()
  }
  showRepoList(data){
    console.log("repo list got updated")
    data.forEach(function(entry) {
      var element = document.createElement('li');
      element.classList.add('list-group-item')
      element.innerHTML = entry.name
      document.getElementById('repo-list').appendChild(element)
    });
  }
  // method to display saved github-userlist in browser
  showSavedUsers(userList = []){
    const list = document.querySelector(".saved_users");
    list.style.listStyle = "none";
    userList.forEach((user) => {
      const li = document.createElement("li");
      li.classList = "badge badge-pill badge-primary m-1 px-2 py-1";
      li.innerHTML = user.login;
      list.appendChild(li);
    })

  }
  // listens to pageload event
  onLoadListener(){
    var InstanceOfAPiCall = new ApiCall();
    window.addEventListener("load", () => InstanceOfAPiCall.getSavedUsers());
  }
  repoEventListener(){
    var InstanceOfAPiCall = new ApiCall();
    var updateView = this.showRepoList
    var username = this.elements.username

    this.elements.repo.addEventListener("click", function(e){
      console.log("repo button clicked")
      e.preventDefault();
      InstanceOfAPiCall.getRepoList(username.value)
        .then(function(v) { // `delay` returns a promise
          updateView(v)
        });
    });
  }
  profileInfoEventListener(){
    var InstanceOfAPiCall = new ApiCall();

    var show = this.render
    const username = this.elements.username
    this.elements.info.addEventListener("click", function(e){
      console.log("user button clicked")
      e.preventDefault();
      //validation for the input value
      var letterNumber = /^[0-9a-zA-Z]+$/;
      if (letterNumber.test(username.value)){
        console.log("username valid, carry on")
        InstanceOfAPiCall.getProfileInfo(username.value)
          .then((data) => {
            show(data)
          })
      }
      else {
        console.log("username invalid - stop")
        username.classList.add("is-invalid");
      }
    });
  }

  //clearStorage

  clearHistory() {
    this.elements.clearButton.addEventListener("click",  (e) => {
      localStorage.setItem("reposlist", JSON.stringify([]));
      instance_of_view.elements["repo_list"].innerHTML = ""; })
  }

  render(data){
    console.log("userprofile got updated")
    instance_of_view.elements.image.src = data.avatar_url
    instance_of_view.elements.website.href = data.blog
    instance_of_view.elements.website.innerHTML = data.blog
    instance_of_view.elements.created_at.innerHTML = data.created_at
  }
}
const instance_of_view = new ViewLayer();
