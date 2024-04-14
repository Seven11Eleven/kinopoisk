window.addEventListener('load', function() {
    const userIdFromURL = window.location.pathname.split('/').pop();
    const token = localStorage.getItem('jwtToken');

    if (token) {
        const payload = parseJwt(token);
        const userIdFromToken = payload ? payload.user_id : null;

        if (userIdFromToken && userIdFromToken != userIdFromURL) {
            hideAccountActions();
        } else {
            showAccountActions();
        }
    } else {
        hideAccountButtons();
    }
});
function hideAccountActions() {
    var profileActions = document.querySelector('.profile-actions');
    
    if (profileActions) {
        profileActions.style.display = 'none';
    }
}
function showAccountActions() {
    var profileActions = document.querySelector('.profile-actions');
    
    if (profileActions) {
        profileActions.style.display = 'block';
    }
}

async function showMovies(data) {
    const moviesEl = document.querySelector(".movies");

    moviesEl.innerHTML = "";

    if (data.films && data.films.length > 0) {
        for (const movie of data.films) {
            try {
                const movieInfoResponse = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${movie.filmId}`, {
                    method: 'GET',
                    headers: {
                        'X-API-KEY': '8c8e1a50-6322-4135-8875-5d40a5420d86'
                    }
                });

                if (!movieInfoResponse.ok) {
                    throw new Error('Failed to fetch movie info');
                }

                const movieInfo = await movieInfoResponse.json();

                const movieEl = document.createElement("div");
                movieEl.classList.add("movie");
                movieEl.innerHTML = `
                    <div class="movie__cover-inner">
                        <img
                            src="${movieInfo.data.posterUrl}"
                            class="movie__cover"
                            alt="${movieInfo.data.nameRu}"
                        />
                        <div class="movie__cover--darkened"></div>
                    </div>
                    <div class="movie__info">
                        <div class="movie__title">${movieInfo.data.nameRu}</div>
                    </div>
                `;

                moviesEl.appendChild(movieEl);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    } else {
        moviesEl.innerHTML = "<div class='no-results'> <img src='static/KINONotFound.PNG'></div>";
    }
}




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




    const userId = window.location.pathname.split('/').pop();

    fetch(`http://localhost:8080/api/getUserInfo/${userId}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        return response.json();
    })
    .then(data => {
    
        document.getElementById('userProfile__id').innerText = `Профиль пользователя ${data.user_name}`;
        
            
        document.getElementById('username').innerText = `Никнейм: ${data.user_name}`;
        document.getElementById('email').innerText = `Электронная почта: ${data.email}`;
        document.getElementById('reviews').innerText = `Количество рецензий: ${data.reviews_count}`;
    })
    .catch(error => console.error('Error:', error));

    fetch(`http://localhost:8080/api/getUserReviews/${userId}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user reviews');
        }
        return response.json();
    })
    .then(data => {
        const reviewsList = document.getElementById('userReviews');
        reviewsList.innerHTML = '';
        data.reviews.forEach(review => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="${review.link}">${review.title}</a>`;
            reviewsList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error:', error));

    document.addEventListener('DOMContentLoaded', function () {
        var deleteAccountButton = document.getElementById('deleteAccount');
        var updateAccountButton = document.getElementById('updateAccount');
        var logoutButton = document.getElementById('logout');
    
        deleteAccountButton.addEventListener('click', function () {
            if (confirm('Вы уверены, что хотите удалить аккаунт?')) {
                var token = localStorage.getItem('jwtToken');
                if (token) {
                    fetch('http://localhost:8080/api/deleteaccount/', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': token
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            localStorage.removeItem('jwtToken');
                            window.location.href = 'http://localhost:8080/auth/login';
                        } else {
                            alert('Произошла ошибка при удалении аккаунта.');
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            }
        });
    
        
updateAccountButton.addEventListener('click', function () {
    document.getElementById('updateForm').style.display = 'block';
});


document.getElementById('submitUpdate').addEventListener('click', function () {
    var newUsername = document.getElementById('newUsername').value;
    var newEmail = document.getElementById('newEmail').value;
    
    if (newUsername && newEmail) {
        var token = localStorage.getItem('jwtToken');
        if (token) {
            fetch('http://localhost:8080/api/updateaccount/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    username: newUsername,
                    email: newEmail
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    document.getElementById('username').innerText = 'Никнейм: ' + newUsername;
                    document.getElementById('email').innerText = 'Электронная почта: ' + newEmail;
                    alert('Данные успешно обновлены!');
                    document.getElementById('updateForm').style.display = 'none';
                }
            })
            .catch(error => console.error('Error:', error));
        }
    } else {
        alert('Никнейм и почта не могут быть пустыми.');
    }
});

    
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('jwtToken');
            window.location.href = 'http://localhost:8080/';
        });
    });
    
    window.addEventListener('load', function() {
        const userIdFromURL = window.location.pathname.split('/').pop();
        const token = localStorage.getItem('jwtToken');
    
        if (token) {
            fetch(`http://localhost:8080/api/getUserReviews/${userIdFromURL}`, {
                    method: 'GET',
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch user reviews');
                    }
                    return response.json();
                })
                .then(data => {
                    const reviewsList = document.getElementById('userReviews');
    
                    reviewsList.innerHTML = '';
    
                    if (data && data.length > 0) {
                        data.forEach(review => {
                            const reviewItem = document.createElement('div');
                            reviewItem.classList.add('review');
    
                            fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${review.movie_id}`, {
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
                                })
                                .then(movieData => {
                                    reviewItem.innerHTML = `
                                        <div class="photoFilm">
                                            <img src="${movieData.posterUrlPreview}" alt="${movieData.nameRu}">
                                        </div>
                                        <button class="deleteReviewButton" data-movie-id="${review.movie_id}">Удалить</button>
                                        <div class="movie_info">
                                            <div class="movie_title">Название фильма: ${movieData.nameRu}</div>
                                            <div class="movie_review">${review.text}</div>
                                            <div class="movie_date">Дата публикации: ${new Date(review.CreatedAt).toLocaleDateString()}</div>
                                            <div class="movie_rating">${review.rating}</div>
                                            
                                        </div>
                                    `;
                                    reviewsList.appendChild(reviewItem);
                                })
                                .catch(error => console.error('Error:', error));
                        });
    
                        // Назначаем обработчик события click на контейнер с рецензиями
                        reviewsList.addEventListener('click', async (event) => {
                            if (event.target.classList.contains('deleteReviewButton')) {
                                const movieId = event.target.dataset.movieId;
                                const token = localStorage.getItem('jwtToken');
    
                                if (!token) {
                                    console.error('JWT token not found');
                                    return;
                                }
    
                                try {
                                    const response = await fetch(`http://localhost:8080/api/deletereview/${movieId}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': token
                                        }
                                    });
    
                                    if (!response.ok) {
                                        throw new Error('Failed to delete review');
                                    }
    
                                    // Удаляем рецензию из интерфейса после успешного удаления
                                    event.target.closest('.review').remove();
    
                                    alert('Рецензия успешно удалена');
                                } catch (error) {
                                    console.error('Error deleting review:', error);
                                    alert('Ошибка при удалении рецензии');
                                }
                            }
                        });
                    } else {
                        reviewsList.innerHTML = '<p>Пользователь еще не оставил рецензий.</p>';
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            window.location.href = 'http://localhost:8080/auth/login';
        }
    });
    