const URL = 'https://api.github.com/';
const REPOSITORY_PER_PAGE = 5;

class Api {
    async loadRepositories(value) {
        return await fetch(`${URL}search/repositories?q=${value}&per_page=${REPOSITORY_PER_PAGE}`)
    }
}

class View {
    constructor() {
        this.touch = document.querySelector('.touch')
        this.search = document.querySelector('.search')

        this.searchInput = this.createElement('input', 'search__input');
        this.repositoryList = this.createElement('ul', 'repository__list');
        this.searchList = this.createElement('ul', 'search__list')

        this.touch.append(this.search, this.searchInput, this.searchList, this.repositoryList)
    }

    createElement(elementTag, ...elementClass) {
        const element = document.createElement(elementTag)
        elementClass.forEach(el => element.classList.add(el))
        return element
    }

    createListElement(name, owner, stars) {
        const element = this.createElement('li', 'repository__link')
        element.textContent = `Name: ${name}\r\nOwner: ${owner}\r\nStars: ${stars}`

        const closeButton = this.createElement('button', 'btn-close');
        closeButton.addEventListener('click', function () {
            this.parentElement.remove()
        })

        element.append(closeButton)
        return element
    }

    createSearchElement(name) {
        const element = this.createElement('div', 'search__item', 'search__link');
        element.textContent = name
        return element
    }

    createRepository(repositoryData) {
        const repositoryElement = this.createSearchElement(repositoryData.name)
        repositoryElement.addEventListener('click', () => {
            let name = repositoryData.name;
            let owner = repositoryData.owner.login;
            let stars = repositoryData.stargazers_count;
            this.searchList.textContent = ''
            this.searchInput.value = ''
            this.repositoryList.append(this.createListElement(name, owner, stars))
        })
        this.searchList.append(repositoryElement)
    }
}

class Search {
    constructor(view, api) {
        this.view = view;
        this.api = api;
        this.view.searchInput.addEventListener(
            'input',
            this.debounce(this.searchRepository.bind(this), 500)
        )
    }

    async searchRepository(event) {
        this.clearRepositories()
        const searchValue = event.target.value;
        if (searchValue) {
            await this.repositoriesRequest(searchValue)
        }
    }

    async repositoriesRequest(searchValue) {
        try {
            const repos = await this.api.loadRepositories(searchValue)
            const json = await repos.json()
            json.items.forEach(el => this.view.createRepository(el))
        } catch (e) {
            console.log('Error: ' + e)
        }
    }

    clearRepositories() {
        this.view.searchList.textContent = ''
    }

    debounce(func, wait, immediate) {
        let timeout
        return function () {
            const context = this
            const args = arguments

            const later = function () {
                timeout = null
                if (!immediate) {
                    func.apply(context, args)
                }
            }
            const callNow = immediate && !timeout
            clearTimeout(timeout)

            timeout = setTimeout(later, wait)
            if (callNow) {
                func.apply(context, args)
            }
        }
    }
}

const api = new Api()
new Search(new View(), api)