/* eslint-disable */
const debug = true

class ApiCall {
  constructor () {
    this.baseUrl = 'https://api.github.com/users'
    this.username = ""
  }

  // takes a username and fetches repolist from github
  getRepoList(username){
    return fetch(`${this.baseUrl}/${username}/repos`)
      .then(resp => resp.json())
      .then((data) => {
        if (debug) console.log("repo list:", data);
        this.saveRepoList(data);
        return data;
      })
  }

  // save repos in array of arrays in local storage
  saveRepoList(repos){
    const database = JSON.parse(localStorage.getItem('reposlist')) || [];
    let found;
    for (let i = 0; i < database.length; i++) {
      database[i].forEach((item) => {
        found = item.owner.login === repos[0].owner.login;
      })
      if (found) break;
    }
    if (!found) {
      database.push(repos);
      localStorage.setItem('reposlist', JSON.stringify(database));
    }
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
      'loader': document.getElementById('loader')
    }
    this.repoEventListener()
    this.profileInfoEventListener()
    this.onLoadListener()
    this.clearHistory()
    this.savedUsersListener()
    if(debug){console.log("View instancenated") }
  }

  // takes an array of repos and displays the repos in browser
  showRepoList(data = []){
    this.elements.repo_list.innerHTML = "";
    if(debug){console.log("repo list got updated")}
    data.forEach((entry) => {
      const element = document.createElement('li');
      element.classList.add('list-group-item');
      element.innerHTML = entry.name;
      document.getElementById('repo-list').appendChild(element);
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
  // listens to clicks on saved username list
  savedUsersListener(){
    const usersDatabase = JSON.parse(localStorage.getItem('users')) || [];
    const reposDatabase = JSON.parse(localStorage.getItem('reposlist')) || [];
    const list = document.querySelector(".saved_users");
    list.addEventListener('click', (e) =>{
      const username = e.target.innerHTML;
      let userIndex;
      // finding the correct index of the repos
      usersDatabase.forEach((item, index) => {
        if (username === item.login) userIndex = index;
      })
      if (userIndex !== undefined) {
        this.showRepoList(reposDatabase[userIndex])
      }
    })
  }

  // listens to pageload event
  onLoadListener(){
    var InstanceOfAPiCall = new ApiCall();
    window.addEventListener("load", () => InstanceOfAPiCall.getSavedUsers());
  }

  // handles clicks on button "Repo List"
  repoEventListener(){
    const InstanceOfAPiCall = new ApiCall();
    this.elements.repo.addEventListener("click", (e) => {
      if (debug) console.log("Repo button clicked");
      e.preventDefault();
      InstanceOfAPiCall.getRepoList(username.value)
        .then((v) => this.showRepoList(v)); // `delay` returns a promise
    });
  }

  // handles clicks on button "User Info"
  profileInfoEventListener(){
    const InstanceOfAPiCall = new ApiCall();
    const username = this.elements.username
    const loader = this.elements.loader
    this.elements.info.addEventListener("click", (e) => {
      loader.style.opacity = 1
      if (debug) {console.log("User button clicked")};
      e.preventDefault();
      //validation for the input value
      const letterNumber = /^[0-9a-zA-Z]+$/;
      // valid input gets profile info from github
      if (letterNumber.test(username.value)){
        InstanceOfAPiCall.getProfileInfo(username.value)
          .then((data) => {
            if (debug) console.log("Input is valid, returning: ");
            this.render(data)
          })
      }
      // invalid input add red border
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
    instance_of_view.elements.loader.style.opacity = 0
  }
}
const instance_of_view = new ViewLayer();
