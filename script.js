// const inputSearch = document.querySelector("input");
// const inputList = document.querySelector(".dropdown__list");
// const users = document.querySelector(".dropdown__users");
//
// //удаление фиолетового блока при нажатии на крестик
// users.addEventListener("click", function (event) {
//     let target = event.target;
//     if (!target.classList.contains("btn-close")) {
//         return; //если нет кнопки закрытия (красный крестик на фиолетовом блоке) выход из функции (???)
//     }
//
//     target.parentElement.remove(); //удаляет фиолетовый блок из DOM-дерева (???)
// });
//
// //при клике на элемент из выпадающего списка создает фиолетовый блок (addChosen)
// inputList.addEventListener("click", function (event) {
//     let target = event.target;
//     if (!target.classList.contains("dropdown-content")) {
//         return; //если нет класса "dropdown-content" выход из функции (???)
//     }
//
//     addChosen(target);
//     inputSearch.value = ""; ///???
//     removePredictions(); //убирает выпадающий список после клика на элемент из выпадающего списка
// });
//
// //функция убирает выпадающий список после клика на один из его элементов
// function removePredictions() {
//     inputList.innerHTML = "";
// }
//
// //функция показывает всплывающий список
// function showPredictions(repositories) {
//     //let dropdownPredictions = document.querySelectorAll(".dropdown-content");
//
//     for (let repositoriesIndex = 0; repositoriesIndex < 5; repositoriesIndex++) {
//         //позволяет показать только 5 элементов в списке
//         let name = repositories.items[repositoriesIndex].name; //берем данные из API
//         let owner = repositories.items[repositoriesIndex].owner.login; //берем данные из API
//         let stars = repositories.items[repositoriesIndex].stargazers_count; //берем данные из API
//
//         let dropdownContent = `<div class="dropdown-content" data-owner="${owner}" data-stars="${stars}">${name}</div>`;
//         inputList.innerHTML += dropdownContent; //создаем переменную, туда кладем созданный класс и добавляем его как список всплывающего меню
//     }
// }
//
// //функция создает фиолетовый блок с данными из API
// function addChosen(target) {
//     let name = target.textContent;
//     let owner = target.dataset.owner;
//     let stars = target.dataset.stars;
//
//     users.innerHTML += `<div class="chosen">Name: ${name}<br>Owner: ${owner}<br>Stars: ${stars}<button class="btn-close"></button></div>`;
//     //внутрь класса "dropdown__users" создаем класс(ы) chosen с полученными данными
// }
//
// //??
// async function getPredictions() {
//     const urlSearchRepo = new URL("https://api.github.com/search/repositories");
//     let repoPart = inputSearch.value; //что за value? не могу понять
//     if (repoPart == "") {
//         removePredictions();
//         return;
//     }
//
//     urlSearchRepo.searchParams.append("q", repoPart); //почему здесь стоит q?
//     try {
//         let response = await fetch(urlSearchRepo);
//         if (response.ok) {
//             let repo = await response.json();
//             showPredictions(repo);
//         } else {
//             return null
//         };
//     } catch (error) {
//         console.log(error);
//     }
// }
//
// //??
// function debounce(fn, timeout) {
//     let timer = null;
//
//     return (...args) => {
//         clearTimeout(timer);
//         return new Promise((resolve) => {
//             timer = setTimeout(() => resolve(fn(...args)), timeout);
//         });
//     };
// }
//
// //??
// const getPredictionsDebounce = debounce(getPredictions, 500);
// inputSearch.addEventListener("input", getPredictionsDebounce);
//
// console.log("works!");

// const buttonClose = document.querySelector('.btn-close')
// buttonClose.addEventListener('click', function () {
//     document.querySelector('.repository__link').innerHTML = ''
//     console.log('click')
// })
class View{
    constructor(api) {
        this.api = api;
        this.touch = document.querySelector('.touch')
        this.search = document.querySelector('.search')
        this.searchInput = this.createElement('input', 'search__input');
        this.repositoryList = this.createElement('ul','repository__list');
        this.searchList = this.createElement('ul', 'search__list')
        this.touch.append(this.search)
        this.search.append(this.searchInput)
        this.search.append(this.searchList)
    }

    createElement(elementTag, elementClass){
        const element = document.createElement(elementTag)
        if(elementClass){
            element.classList.add(elementClass)
        }
        return element
    }

    createRepository(repositoryData){
        const repositoryElement = this.createElement('li','search__link');
        repositoryElement.addEventListener('click', () => {
            let name = repositoryData.name;
            let owner = repositoryData.owner.login;
            let stars = repositoryData.stargazers_count;
            this.searchList.innerHTML = ''
            this.searchInput.value = ''
            this.repositoryList.insertAdjacentHTML('beforeend', `<li class="repository__link">Name: ${name}<br>Owner: ${owner}<br>Stars: ${stars}<button class="btn-close"></button></li>`)

        })
        this.touch.append(this.repositoryList)

        repositoryElement.innerHTML = `<div class="search__item" data-owner="${repositoryData.owner.login}" data-stars="${repositoryData.stargazers_count}">${repositoryData.name}</div>`
        this.searchList.append(repositoryElement)

        this.repositoryList.addEventListener("click", function (event) {
            let target = event.target;
            if (!target.classList.contains("btn-close")) {
                return;
            }
            target.parentElement.remove();
        });
    }
}

class Search{
    constructor(view, api) {
        this.view = view;
        this.api = api;
        this.view.searchInput.addEventListener('keyup', this.debounce(this.searchRepository.bind(this), 500))
    }

    searchRepository(){
        const searchValue = this.view.searchInput.value;
        if(searchValue) {
            this.clearRepositories()
            this.repositoriesRequest(searchValue)
        } else{
            this.clearRepositories()
        }
    }

    async repositoriesRequest(searchValue){
        try {
            await this.api.loadRepositories(searchValue).then((res)=> {
                if (res.ok){
                    res.json().then(res =>{
                        res.items.forEach(repository => this.view.createRepository(repository))
                    })
                }
            })
        } catch (e) {
            console.log('Error: ' + e)
        }
    }

    clearRepositories(){
        this.view.searchList.innerHTML = '';
    }

    debounce(func, wait, immediate){
        let timeout;
        return function (){
            const context = this, args = arguments;
            const later = function (){
                timeout = null;
                if(!immediate){
                    func.apply(context, args)
                }
            }
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if(callNow){
                func.apply(context, args)
            }
        }
    }
}

const URL = 'https://api.github.com/';
const REPOSITORY_PER_PAGE = 5;
class Api{
    async loadRepositories(value){
         return await fetch(`${URL}search/repositories?q=${value}&per_page=${REPOSITORY_PER_PAGE}`)
    }
}

const api = new Api()
new Search(new View(api), api)