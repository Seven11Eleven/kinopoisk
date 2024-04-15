function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}
async function fetchUserInfo(userId) {
    try {
        const response = await fetch(`http://localhost:8080/api/getUserInfo/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// Получаем JWT токен из localStorage
const jwtToken = localStorage.getItem('jwtToken');

// Если токен есть, парсим его и отправляем запрос на получение информации о пользователе
if (jwtToken) {
    const { userid } = parseJwt(jwtToken); // Предположим, что поле с userid называется userid
    if (userid) {
        fetchUserInfo(userid)
            .then(userInfo => {
                // Выводим информацию о пользователе в консоль для проверки
                console.log('User info:', userInfo);
            })
            .catch(error => console.error('Error fetching user info:', error));
    } else {
        console.error('User ID not found in JWT token');
    }
} else {
    console.error('JWT token not found in localStorage');
}

// Функция для получения информации о фильме по его ID
function fetchMovieInfo(movieId) {
    return fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${movieId}`, {
        method: 'GET',
        headers: {
            'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch movie data');
        }
        return response.json();
    });
}

// Функция для отображения информации о фильме на странице
function displayMovieInfo(movieInfo) {
    const movieContainer = document.getElementById('movieInfo');

    if (movieInfo) {
        const {
            nameRu,
            slogan,
            description,
            ratingKinopoisk,
            year,
            endYear,
            webUrl,
            countries,
            genres,
            posterUrlPreview
        } = movieInfo;

        // Создаем HTML-разметку для отображения информации о фильме
        let htmlContent = `
            <h2>${nameRu}</h2>
        `;

        if (slogan) {
            htmlContent += `<p>${slogan}</p>`;
        }

        if (description) {
            htmlContent += `<div class="movie_desc">${description}</div>`;
        }

        htmlContent += `<div class ="movie_year">Год выпуска: ${year}</div>`;

        if (endYear) {
            htmlContent += `<p>Год завершения: ${endYear}</p>`;
        }

        if (webUrl) {
            htmlContent += `<a href="${webUrl}">Официальный сайт</a>`;
        }

        if (countries && countries.length > 0) {
            const countriesList = countries.map(country => country.country).join(', ');
            htmlContent += `<p>Страны: ${countriesList}</p>`;
        }

        if (genres && genres.length > 0) {
            const genresList = genres.map(genre => genre.genre).join(', ');
            htmlContent += `<p>Жанры: ${genresList}</p>`;
        }

        if (ratingKinopoisk) {
            htmlContent += `<div class ="movie_rating"> ${ratingKinopoisk}</div>`;
        }
        htmlContent += `
            <div class="moviePhoto">
                <img src="${posterUrlPreview || '/static/KinoNotFound.png'}" alt="${nameRu}" class="realPhoto" width="200" height="300">
            </div>
        `;

        // Вставляем HTML-разметку в контейнер
        movieContainer.innerHTML = htmlContent;
    } else {
        movieContainer.textContent = 'Информация о фильме не найдена';
    }
}

async function fetchMovieReviews(movieId) {
    try {
        const response = await fetch(`http://localhost:8080/api/getReviewsMovie/${movieId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch movie reviews');
        }
        const reviews = await response.json();
        // Для каждой рецензии загружаем информацию о пользователе
        const reviewsWithUserInfo = await Promise.all(reviews.map(async review => {
            const userInfoResponse = await fetchUserInfo(review.user_id);
            if (!userInfoResponse) return null; // Если не удалось получить информацию о пользователе, пропускаем эту рецензию
            const userInfo = await userInfoResponse.json();
            return { ...review, user_name: userInfo.user_name }; // Добавляем имя пользователя к рецензии
        }));
        // Фильтруем от null значений (если не удалось получить информацию о пользователе)
        return reviewsWithUserInfo.filter(review => review !== null);
    } catch (error) {
        console.error('Error fetching movie reviews:', error);
        return [];
    }
}

async function fetchUserInfo(userId) {
    try {
        const response = await fetch(`http://localhost:8080/api/getUserInfo/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        return response;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// Запрашиваем рецензии по ID фильма и отображаем на странице
async function displayMovieReviews(movieId) {
    try {
        const reviews = await fetchMovieReviews(movieId);
        const reviewsContainer = document.getElementById('reviewsContainer');
        reviewsContainer.innerHTML = ''; // Очищаем контейнер перед добавлением новых рецензий
        if (reviews.length === 0) {
            reviewsContainer.textContent = 'Рецензий еще нет';
            return;
        }
        const reviewsList = document.createElement('ul');
        reviewsList.classList.add('reviews-list');
        reviews.forEach(review => {
            const listItem = document.createElement('li');
            listItem.classList.add('review-item');
            listItem.innerHTML = `
                <div class="review-header">
                    <span class="review-rating">Рейтинг: ${review.rating}</span>
                    <span class="review-date">Дата: ${new Date(review.CreatedAt).toLocaleDateString()}</span>
                    <span class="review-author" data-user-id="${review.user_id}">${review.user_name}</span> <!-- Вот тут использовано поле user_name -->
                </div>
                <div class="review-text">${review.text}</div>
            `;
            reviewsList.appendChild(listItem);
        });
        reviewsContainer.appendChild(reviewsList);
    } catch (error) {
        console.error('Error displaying movie reviews:', error);
    }
}

const movieId = window.location.pathname.split('/').pop();

// Запрашиваем информацию о фильме по его ID и отображаем на странице
fetchMovieInfo(movieId)
    .then(displayMovieInfo)
    .catch(error => console.error('Error fetching movie info:', error));

// Отображаем рецензии на странице
displayMovieReviews(movieId);

document.getElementById('createReview').addEventListener('click', () => {
    document.getElementById('createReview').style.display = 'none';
    document.getElementById('updateForm').style.display = 'block';
});

document.getElementById('submitUpdate').addEventListener('click', async () => {
    const movieId = window.location.pathname.split('/').pop();
    const rateInput = document.getElementById('rateInput');
    const rate = parseInt(rateInput.value);

    if (isNaN(rate) || rate < 1 || rate > 10) {
        alert('Пожалуйста, введите число от 1 до 10 в поле оценки.');
        rateInput.focus(); // Переводим фокус обратно на поле ввода оценки
        return;
    }

    const text = document.getElementById('reviewText').value;

    const jwtToken = localStorage.getItem('jwtToken');

    if (!jwtToken) {
        console.error('JWT token not found in localStorage');
        return;
    }

    const reviewData = {
        rating: rate,
        text: text
    };

    try {
        const response = await fetch(`http://localhost:8080/api/addreview/${movieId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwtToken // Используем токен напрямую без "Bearer"
            },
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            throw new Error('Failed to add review');
        }

        alert('Рецензия успешно добавлена');
        document.getElementById('reviewForm').reset();
        // Обновляем список рецензий после добавления новой
        displayMovieReviews(movieId);
    } catch (error) {
        console.error('Error adding review:', error);
        alert('Произошла ошибка при добавлении рецензии');
    }
});
