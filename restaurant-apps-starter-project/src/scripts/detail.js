import { Workbox } from 'workbox-window';

const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('id');
const restaurantDetailsContainer = document.querySelector(
  '.restaurant-details',
);
let db;
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

if (!menuToggle?.listenerAdded && menuToggle) {
  menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });
  menuToggle.listenerAdded = true;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('restaurants', 1);

    request.onerror = function handleError(event) {
      reject(event.target.error);
    };

    request.onsuccess = function handleSuccess(event) {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = function handleUpgrade(event) {
      db = event.target.result;
      const objectStore = db.createObjectStore('favorites', { keyPath: 'id' });
      objectStore.createIndex('id', 'id', { unique: true });
    };
  });
}

async function addFavoriteRestaurant(restaurant, db) {
  if (!db) {
    throw new Error('Database instance is not available');
  }
  const transaction = db.transaction(['favorites'], 'readwrite');
  const store = transaction.objectStore('favorites');
  await store.add(restaurant);
  await transaction.complete;
}

async function removeFavoriteRestaurant(restaurantId, db) {
  const transaction = db.transaction(['favorites'], 'readwrite');
  const store = transaction.objectStore('favorites');
  await store.delete(restaurantId);
  await transaction.complete;
}

async function getRestaurantDetail(id) {
  try {
    const response = await fetch(
      `https://restaurant-api.dicoding.dev/detail/${id}`,
      {
        method: 'GET',
      },
    );
    const data = await response.json();
    return data.restaurant;
  } catch (error) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = 'Error fetching restaurant details. Please try again later.';
    return null;
  }
}

async function getMediumImageUrl(pictureId) {
  try {
    const response = await fetch(
      `https://restaurant-api.dicoding.dev/images/medium/${pictureId}`,
    );
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = 'Error fetching medium image. Please try again later.';
    return null;
  }
}

function toggleFavorite(restaurant) {
  const favoriteButton = document.querySelector(
    '.restaurant-detail-card button',
  );
  if (favoriteButton.textContent === 'Add to Favorites') {
    console.log('Adding to favorites...');
    addFavoriteRestaurant(restaurant, db)
      .then(() => {
        favoriteButton.textContent = '';
        window.location.href = 'favorites.html';
      })
      .catch(() => {});
  } else {
    removeFavoriteRestaurant(restaurant.id, db)
      .then(() => {
        favoriteButton.textContent = 'Add to Favorites';
        window.location.href = 'favorites.html';
      })
      .catch(() => {});
  }
}

function createRestaurantDetailCard(restaurant) {
  const card = document.createElement('div');
  card.classList.add('restaurant-detail-card');

  const favoriteButton = document.createElement('button');
  favoriteButton.textContent = 'Add to Favorites';
  favoriteButton.addEventListener('click', () => {
    toggleFavorite(restaurant);
  });

  const image = document.createElement('img');
  getMediumImageUrl(restaurant.pictureId)
    .then((url) => {
      if (url) {
        image.src = url;
        image.alt = restaurant.name;
      } else {
        image.src = '';
        image.alt = 'Restaurant Image';
      }
    })
    .catch(() => {
      image.src = '';
      image.alt = 'Restaurant Image';
    });

  const name = document.createElement('h3');
  name.textContent = restaurant.name;

  const address = document.createElement('p');
  address.textContent = `Address: ${restaurant.address}`;

  const city = document.createElement('p');
  city.textContent = `City: ${restaurant.city}`;

  const description = document.createElement('p');
  description.textContent = restaurant.description;

  const foodMenu = document.createElement('p');
  foodMenu.textContent = `Food Menu: ${restaurant.menus.foods
    .map((food) => food.name)
    .join(', ')}`;

  const drinkMenu = document.createElement('p');
  drinkMenu.textContent = `Drink Menu: ${restaurant.menus.drinks
    .map((drink) => drink.name)
    .join(', ')}`;

  const reviews = document.createElement('div');
  reviews.classList.add('reviews');
  reviews.innerHTML = '<h4>Customer Reviews</h4>';
  restaurant.customerReviews.forEach((review) => {
    const reviewItem = document.createElement('div');
    reviewItem.classList.add('review-item');
    reviewItem.innerHTML = `
        <p><strong>${review.name}</strong> - ${review.date}</p>
        <p>${review.review}</p>
      `;
    reviews.appendChild(reviewItem);
  });

  card.appendChild(favoriteButton);
  card.appendChild(image);
  card.appendChild(name);
  card.appendChild(address);
  card.appendChild(city);
  card.appendChild(description);
  card.appendChild(foodMenu);
  card.appendChild(drinkMenu);
  card.appendChild(reviews);

  return card;
}

let hasRendered = false;

async function renderRestaurantDetails() {
  if (hasRendered) return;
  hasRendered = true;

  await openDatabase();

  const restaurant = await getRestaurantDetail(restaurantId);
  restaurantDetailsContainer.innerHTML = '';

  if (restaurant) {
    const detailCard = createRestaurantDetailCard(restaurant);
    restaurantDetailsContainer.appendChild(detailCard);
  } else {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Failed to load restaurant details. Please try again later.';
    restaurantDetailsContainer.appendChild(errorMessage);
  }
}

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.bundle.js');
  wb.register().then((registration) => {
    console.log('Service worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.log('Service worker registration failed:', error);
  });
}

window.addEventListener('DOMContentLoaded', renderRestaurantDetails);

// export functions for testing
export { addFavoriteRestaurant, removeFavoriteRestaurant, toggleFavorite };
