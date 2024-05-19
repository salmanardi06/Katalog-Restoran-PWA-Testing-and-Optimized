import { Workbox } from 'workbox-window';

const favoriteList = document.querySelector('.favorite-list');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

if (!menuToggle.listenerAdded) {
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
      const db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = function handleUpgrade(event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore('favorites', { keyPath: 'id' });
      objectStore.createIndex('id', 'id', { unique: true });
    };
  });
}

async function closeDatabase(db) {
  db.close();
}

async function removeFavoriteRestaurant(restaurantId) {
  const db = await openDatabase();
  const transaction = db.transaction(['favorites'], 'readwrite');
  const objectStore = transaction.objectStore('favorites');
  objectStore.delete(restaurantId);
  await closeDatabase(db);
}

async function fetchDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('restaurants', 1);

    request.onerror = function handleOpenError() {
      reject(request.error);
    };

    request.onsuccess = function handleSuccess() {
      const db = request.result;
      const transaction = db.transaction('favorites', 'readonly');
      const store = transaction.objectStore('favorites');
      const getAllRequest = store.getAll();

      getAllRequest.onerror = function handleGetAllError() {
        reject(getAllRequest.error);
      };

      getAllRequest.onsuccess = function handleGetAllSuccess() {
        resolve(getAllRequest.result);
      };
    };
  });
}

async function createFavoriteRestaurantCard(restaurant) {
  const card = document.createElement('div');
  card.classList.add('restaurant-card');
  card.setAttribute('tabindex', 0);

  const image = document.createElement('img');
  image.src = restaurant.pictureId;
  image.alt = restaurant.name;

  const name = document.createElement('h3');
  name.textContent = restaurant.name;

  const city = document.createElement('p');
  city.textContent = `City: ${restaurant.city}`;

  const rating = document.createElement('p');
  rating.textContent = `Rating: ${restaurant.rating}`;

  const description = document.createElement('p');
  description.textContent = restaurant.description;

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove from Favorite';
  removeButton.addEventListener('click', () => {
    removeFavoriteRestaurant(restaurant.id);
    card.remove();
  });

  const detailLink = document.createElement('a');
  detailLink.textContent = 'View Details';
  detailLink.href = `detail.html?id=${restaurant.id}`;
  detailLink.classList.add('detail-link');

  card.appendChild(image);
  card.appendChild(name);
  card.appendChild(city);
  card.appendChild(rating);
  card.appendChild(description);
  card.appendChild(removeButton);
  card.appendChild(detailLink);

  return card;
}

async function renderFavoriteRestaurantList() {
  try {
    const favoriteRestaurants = await fetchDataFromIndexedDB();
    favoriteList.innerHTML = '';
    favoriteRestaurants.forEach(async (restaurant) => {
      const updatedRestaurant = {
        ...restaurant,
        pictureId: `https://restaurant-api.dicoding.dev/images/small/${restaurant.pictureId}`,
      };

      try {
        const card = await createFavoriteRestaurantCard(updatedRestaurant);
        favoriteList.appendChild(card);
      } catch (error) {
        // Menonaktifkan aturan no-console untuk baris ini
        // eslint-disable-next-line no-console
        console.error('Gagal membuat kartu restoran favorit:', error);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Gagal merender daftar restoran favorit:', error);
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

window.addEventListener('DOMContentLoaded', () => {
  renderFavoriteRestaurantList().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Gagal merender daftar restoran favorit:', error);
  });
});
