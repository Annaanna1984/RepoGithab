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