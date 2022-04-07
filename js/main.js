import { Octokit } from "https://cdn.skypack.dev/@octokit/core";
import config from "./config.js"; // file not included in git
const octokit = new Octokit({auth: `${config.oAuthApiToken}`});

const MAX_SUGGESTIONS = 15;
let userInput;
let typingFlag;
let userSuggestions;

// User input elements
const textInput = document.querySelector('input[placeholder="Enter user name"]');
const suggestionLiEls = document.querySelectorAll('.suggestion-list li');
const suggestionList = document.querySelector('.suggestion-list');

// Display elements
const userIcon = document.querySelector('.display-user-content img');
const userLogin = document.querySelector('.login');
const userScore = document.querySelector('.score')
const userRepoUrl = document.querySelector('.repo-url')

const displayUser = function() {
  // user.innerText= userSuggestions[0].login;
  // img.src = userSuggestions[0].avatar_url;
  // url.innerText = userSuggestions[0].html_url;
  // score.innerText = userSuggestion[0].score;

  userIcon.src = userSuggestions[0].avatar_url;
  userLogin.innerText = userSuggestions[0].login;
  userScore.innerText = userSuggestions[0].score;
  userRepoUrl.innerText = userSuggestions[0].html_url;
}

suggestionList.addEventListener('click', (e) => { // when click on suggestion
  textInput.value = userSuggestions[e.target.getAttribute('name')].login;
  suggestionList.classList.add('collapsed');
  displayUser();
});

textInput.addEventListener('input', (e) => { 
  userInput = e.target.value;
  console.log(userInput);
  if (!userInput) {
    suggestionList.classList.add('collapsed');
    return;
  }
  
  if (!typingFlag) {
    setTimeout(() => {
      typingFlag = false;
      if (!userInput) {
        return;
      }

      octokit.request('GET /search/users', { q: userInput})
        .then(rawData => {
          userSuggestions = rawData.data.items;
          if (userSuggestions.length > MAX_SUGGESTIONS) {
            userSuggestions = userSuggestions.splice(0, MAX_SUGGESTIONS);
          }

          for (let i = 0; i < MAX_SUGGESTIONS; i++) {
            const liDisplayType = window.getComputedStyle(suggestionLiEls[i]).display;
            if (userSuggestions[i]) { // there is a suggestion
              suggestionLiEls[i].innerText = userSuggestions[i].login;
              if (liDisplayType === 'none') { // li is not displayed, show li
                suggestionLiEls[i].style.display = 'list-item';
              }
            } 
            else { // no suggestion
              if (liDisplayType === 'list-item') { // li is displayed, hide li
                suggestionLiEls[i].style.display = 'none';
              }
            }
          }

          if (suggestionList.classList.contains('collapsed')) {
            suggestionList.classList.remove('collapsed');
          }
        }) 
        .catch(err => console.log(err));
    }, 500);
  }

  typingFlag = true;
});

textInput.addEventListener("focusout", () => { // when clicking out of input
  // if click is not in the suggestion list then collapse
  // suggestionList.classList.add('collapsed');
});

textInput.addEventListener('change', () => { // on submit (enter)
  suggestionList.classList.add('collapsed');
});

// octokit.request('GET /search/users', { q: 'rohit'})
//   .then(data => console.log(data))
//   .catch(err => console.log(err));