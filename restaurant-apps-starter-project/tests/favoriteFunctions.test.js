import { jest } from '@jest/globals';
import { openDB } from 'idb';
import {
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
} from '../src/scripts/detail';

// Function to simulate initializing the DB connection
async function initializeDB() {
  return openDB('test-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      }
    },
  });
}

// Helper to create mock restaurant data
const mockRestaurant = { id: 1, name: 'Test Restaurant' };

// Mocking DOM elements
document.body.innerHTML = `
  <div class="restaurant-detail-card">
    <button>Add to Favorites</button>
  </div>
`;

// Integration test setup using Jest
describe('Favorite restaurant functionality', () => {
  let db;

  beforeEach(async () => {
    jest.clearAllMocks();
    db = await initializeDB();
  });

  afterEach(async () => {
    await db.close();
    await indexedDB.deleteDatabase('test-db');
  });

  test('adds a restaurant to favorites', async () => {
    const favoriteButton = document.querySelector(
      '.restaurant-detail-card button',
    );
    await addFavoriteRestaurant(mockRestaurant, db);

    const tx = db.transaction('favorites', 'readonly');
    const store = tx.objectStore('favorites');
    const result = await store.get(mockRestaurant.id);
    await tx.done;

    expect(result).not.toBeNull();
    expect(result.id).toBe(mockRestaurant.id);
  });

  test('removes a restaurant from favorites', async () => {
    await addFavoriteRestaurant(mockRestaurant, db);

    const favoriteButton = document.querySelector(
      '.restaurant-detail-card button',
    );
    favoriteButton.textContent = 'Remove from Favorites';

    await removeFavoriteRestaurant(mockRestaurant.id, db);

    const tx = db.transaction('favorites', 'readonly');
    const store = tx.objectStore('favorites');
    const result = await store.get(mockRestaurant.id);
    await tx.done;

    expect(result).toBeUndefined();
  });
});
