const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";
const API_URL_POPULAR =
  "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1";
const API_URL_SEARCH =
  "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
const API_URL_MOVIE_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/"

getMovies(API_URL_POPULAR);

async function getMovies(url, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  const resp = await fetch(`${url}&offset=${offset}&limit=${limit}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const respData = await resp.json();
  showMovies(respData);

  const pagesCount = respData.pagesCount;
  createPaginationButtons(pagesCount);

  return respData.pagesCount;
}





//last change 21:18

function getClassByRate(vote) {
    if (typeof vote === 'string' && vote.includes('%')) {
      const percent = parseInt(vote.replace('%', ''));
      if (percent < 33) {
        return "red";
      } else if (percent >= 33 && percent < 66) {
        return "orange";
      } else {
        return "green";
      }
    } else {
      if (vote >= 7) {
        return "green";
      } else if (vote > 5) {
        return "orange";
      } else {
        return "red";
      }
    }
  }

  function formatRating(rating) {
    if (typeof rating === 'string' && rating.endsWith('%')) {
      return rating.replace('.0%', '%');
    } else {
      return rating;
    }
  }
  

  
  
  
  
  function showMovies(data) {
    const moviesEl = document.querySelector(".movies");
  
    // Очищаем предыдущие фильмы
    moviesEl.innerHTML = "";
  
    // Проверяем, есть ли фильмы в данных
    if (data.films && data.films.length > 0) {
      // Если фильмы есть, отображаем их
      data.films.forEach((movie) => {
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
          <div class="movie__cover-inner">
            <img
              src="${movie.posterUrlPreview}"
              class="movie__cover"
              alt="${movie.nameRu}"
            />
            <div class="movie__cover--darkened"></div>
          </div>
          <div class="movie__info">
            <div class="movie__title">${movie.nameRu}</div>
            <div class="movie__category">${movie.genres.map(
              (genre) => ` ${genre.genre}`
            )}</div>
            ${movie.rating !== "null" && movie.rating !== null ? 
    `<div class="movie__average movie__average--${getClassByRate(movie.rating)}">${formatRating(movie.rating)}</div>` 
    : ''
}

          </div>
        `;
        movieEl.addEventListener("click", () => openModal(movie.filmId));
        document.addEventListener('DOMContentLoaded', function(){
          let sr = ScrollReveal({
            distance: '65 px',
            duration: 2600,
            delay: 450,
            reset: false
          });
          
          sr.reveal('.movie__cover-inner', { delay: 200, origin: 'top'});
        });
        moviesEl.appendChild(movieEl);
      });
    } else {
      
      moviesEl.innerHTML = "<div class='no-results'> <img src='static/KINONotFound.PNG'></div>";
    }
  }
  
const form = document.querySelector("form");
const search = document.querySelector(".header__search");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const apiSearchUrl = `${API_URL_SEARCH}${search.value}`;
  
  if (search.value.trim() === "") {

    getMovies(API_URL_POPULAR);
  } else {
    getMovies(apiSearchUrl);
  }


  search.value = "";
});



// Modal
const modalEl = document.querySelector(".modal");

async function openModal(id) {
  const resp = await fetch(API_URL_MOVIE_DETAILS + id, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
  });
  const respData = await resp.json();
  
  modalEl.classList.add("modal--show");
  document.body.classList.add("stop-scrolling");

  modalEl.innerHTML = `
  <div class="modal__card">
    <img class="modal__movie-backdrop" src="${respData.posterUrl}" alt="">
    <h2>
      <span class="modal__movie-title">${respData.nameRu}</span>
      <span class="modal__movie-release-year"> - ${respData.year}</span>
    </h2>
    <ul class="modal__movie-info">
      <div class="loader"></div>
      <li class="modal__movie-genre">Жанр - ${respData.genres.map((el) => `<span> ${el.genre}</span>`)}</li>
      ${respData.filmLength ? `<li class="modal__movie-runtime">Время - ${respData.filmLength} минут</li>` : ''}
      <li >Сайт: <a class="modal__movie-site" href="${respData.webUrl}">${respData.webUrl}</a></li>
      <li class="modal__movie-overview">Описание - ${respData.description}</li>
      <li> <a href="http://localhost:8080/movie/${respData.kinopoiskId}">Перейти к фильму</a></li>
    </ul>
    <button type="button" class="modal__button-close">Закрыть</button>
  </div>
`


  const btnlogin = document.querySelector(".styles_loginButton");
  window.addEventListener("click", (e) =>{
    window.hostname = "http://localhost:8080/login.html"
    
  })
  const btnClose = document.querySelector(".modal__button-close");
  btnClose.addEventListener("click", () => closeModal());
}

function closeModal() {
  modalEl.classList.remove("modal--show");
  document.body.classList.remove("stop-scrolling");
}

window.addEventListener("click", (e) => {
  if (e.target === modalEl) {
    closeModal();
  }
})

window.addEventListener("keydown", (e) => {
  if (e.keyCode === 27) {
    closeModal();
  }
})
window.addEventListener("load", async () => {
  const pagesCount = await getMovies(API_URL_POPULAR, currentPage, pageSize);
  updatePageNumber();
});

function changePage(pageNumber) {
  const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=${pageNumber}`;
  getMovies(url);
  renderPagination(pageNumber);
}

function createPageButton(pageNumber) {
  const button = document.createElement('button');
  button.textContent = pageNumber;
  button.classList.add('pagination');
  button.addEventListener('click', () => changePage(pageNumber));
  return button;
}



function renderPagination(pageNumber) {
  const paginationTop = document.querySelector('.pagination.top');
  const paginationBottom = document.querySelector('.pagination.bottom');


  paginationTop.innerHTML = '';
  paginationBottom.innerHTML = '';


  const totalPages = 35;
  const buttonsPerPage = 7;
  const startPage = Math.max(1, pageNumber - Math.floor(buttonsPerPage / 2));
  const endPage = Math.min(totalPages, startPage + buttonsPerPage - 1);

  // Кнопка "Первая страница", которая отправляет в начало пагинации короче
//   const firstPageButtonTop = createPageButton(1);
// const firstPageButtonBottom = firstPageButtonTop.cloneNode(true);
// paginationTop.appendChild(firstPageButtonTop);
// paginationBottom.appendChild(firstPageButtonBottom);

  // Кнопки с номерами страниц
  for (let i = startPage; i <= endPage; i++) {
      const pageButtonTop = createPageButton(i);
      const pageButtonBottom = pageButtonTop.cloneNode(true);
      paginationTop.appendChild(pageButtonTop);
      paginationBottom.appendChild(pageButtonBottom);
  }

  // Кнопка "последняя страница" которая отправляет в конец(35) 
//   const lastPageButtonTop = createPageButton(35);
// const lastPageButtonBottom = lastPageButtonTop.cloneNode(true);
// paginationTop.appendChild(lastPageButtonTop);
// paginationBottom.appendChild(lastPageButtonBottom);
}



// Инициализация пагинации при загрузке страницы
renderPagination(1);

