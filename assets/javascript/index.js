class ApiCall {
  constructor () {
    this.baseUrl = 'https://api.github.com/users'
    this.username = ""
  }
  getRepoList(username){
    console.log("requested repo list for: " + username)
    var url = this.baseUrl
    return new Promise(function(resolve, reject) {
      $.getJSON(`${url}/${username}/repos`)
        .done((data) => {
          resolve(data);
          localStorage.setItem('reposlist', JSON.stringify(data));
          console.log("repo list:", data)
        })
        .fail( () => {
          alert("Username not found");
        })
    })
  }
  getProfileInfo(username){
    console.log("requested user info for:" + username)
    const database = JSON.parse(localStorage.getItem('users')) || [];
    const users = database.filter(function (user) {
      return user.login == username;
    });
    if (users.length) {
      return users[0];
    } else{
      fetch(`${this.baseUrl}/${username}`)
        .then(resp => resp.json())
        .then((data) => {
          var users = JSON.parse(localStorage.getItem('users')) || []
          users.push(data);
          localStorage.setItem('users', JSON.stringify( users ));
          return data;
        })
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
    }
    this.repoEventListener()
    this.profileInfoEventListener()
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
  repoEventListener(){
    var InstanceOfAPiCall = new ApiCall();
    var updateView = this.showRepoList
    var username = this.elements.username

    this.elements.repo.addEventListener("click", function(e){
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
      e.preventDefault();
      //validation for the input value
      var letterNumber = /^[0-9a-zA-Z]+$/;
      if (letterNumber.test(username.value)){
        show(InstanceOfAPiCall.getProfileInfo(username.value))
      } else {
        username.classList.add("is-invalid");
      }
    });
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
