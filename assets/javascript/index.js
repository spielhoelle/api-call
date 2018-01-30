/* eslint-disable */
const debug = true

class ApiCall {
  constructor () {
    this.baseUrl = 'https://api.github.com/users'
    this.username = ""
  }
  getRepoList(username){
    var url = this.baseUrl
    return new Promise(function(resolve, reject) {
      $.getJSON(`${url}/${username}/repos`)
        .done((data) => {
          resolve(data);
          localStorage.setItem('reposlist', JSON.stringify(data));
          if(debug){console.log("repo list:", data) }
        })
        .fail( () => {
          alert("Username not found");
        })
    })
  }
  getProfileInfo(username){
    if(debug){console.log("requested user info for:", username) }
    const database = JSON.parse(localStorage.getItem('users')) || [];
    const users = database.filter(function (user) {
      return user.login == username;
    });
    if (users.length) {
    return new Promise(function(resolve, reject) {
      if(debug){console.log("user found in the Database:", users[0]) }
      resolve(users[0]);
    })
    } else{
      return fetch(`${this.baseUrl}/${username}`)
        .then(resp => resp.json())
        .then((data) => {
          var users = JSON.parse(localStorage.getItem('users')) || []
          users.push(data);
          if(debug){console.log("user fetched over the API:", users[0]) }
          localStorage.setItem('users', JSON.stringify( users ));
          return data;
        })
    }
  }
  getSavedUsers(){
    if (localStorage.getItem('users') !== null) {
      // pass local storage to showSavedUsers in order to display them
      if(debug){console.log("Found saved users") }
      instance_of_view.showSavedUsers(JSON.parse(localStorage.getItem('users')));
    } else {
      // throw error if no local storage was found
      if(debug){console.log("no storage found") }
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
    if(debug){console.log("View instancenated") }
  }
  showRepoList(data){
    if(debug){console.log("repo list got updated")}
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
    if(debug){console.log("saved users shown", userList) }
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
      if(debug){console.log("Repo button clicked") }
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
      if(debug){console.log("User button clicked") }
      e.preventDefault();
      //validation for the input value
      var letterNumber = /^[0-9a-zA-Z]+$/;
      if (letterNumber.test(username.value)){
        InstanceOfAPiCall.getProfileInfo(username.value)
          .then((data) => {
            if(debug){console.log("Input is valid, returning: ") }
            show(data)
          })
      }
      else {
        if(debug){console.log("Input is not valid") }
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
    if(debug){console.log("userprofile got updated")}
    instance_of_view.elements.image.src = data.avatar_url
    instance_of_view.elements.website.href = data.blog
    instance_of_view.elements.website.innerHTML = data.blog
    instance_of_view.elements.created_at.innerHTML = data.created_at
  }
}
const instance_of_view = new ViewLayer();
