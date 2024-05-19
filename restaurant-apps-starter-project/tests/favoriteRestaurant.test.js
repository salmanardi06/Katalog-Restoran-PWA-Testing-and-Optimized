import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import 'regenerator-runtime';
import 'fake-indexeddb/auto';
import detailHtml from 'raw-loader!../src/templates/detail.html';

describe('Favorite Restaurant Feature', () => {
  let restaurant;

  beforeEach(() => {
    document.body.innerHTML = detailHtml;

    restaurant = {
      id: 'rqdv5juczeskfw1e867',
      name: 'Melting Pot',
      description: 'Test description',
      pictureId: '14',
      city: 'Medan',
      address: 'Jalan Belum Jadi',
      menus: {
        foods: [{ name: 'Kepiting Rebus' }, { name: 'Ayam Bakar' }],
        drinks: [{ name: 'Es Teh' }, { name: 'Es Jeruk' }]
      },
      customerReviews: [
        {
          name: 'Ahmad',
          review: 'Enak sekali!',
          date: '13 November 2019'
        }
      ]
    };

    // Call the script that renders the restaurant details
    detailScript();
  });

  it('should show the add to favorites button', async () => {
    await screen.findByText(restaurant.name); // Ensure restaurant detail has been rendered
    const favoriteButton = screen.getByText('Add to Favorites');
    expect(favoriteButton).toBeInTheDocument();
  });

  it('should be able to add a restaurant to the favorites', async () => {
    await screen.findByText(restaurant.name); // Ensure restaurant detail has been rendered

    const favoriteButton = screen.getByText('Add to Favorites');
    fireEvent.click(favoriteButton);

    // Check if the restaurant is added to the favorites
    const dbRequest = window.indexedDB.open('restaurants', 1);
    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(['favorites'], 'readonly');
      const objectStore = transaction.objectStore('favorites');
      const getRequest = objectStore.get(restaurant.id);

      getRequest.onsuccess = function () {
        expect(getRequest.result).toEqual(restaurant);
      };
    };
  });

  it('should be able to remove a restaurant from the favorites', async () => {
    await screen.findByText(restaurant.name); // Ensure restaurant detail has been rendered

    const favoriteButton = screen.getByText('Add to Favorites');
    fireEvent.click(favoriteButton);

    // Add some delay to ensure IndexedDB operations are complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    fireEvent.click(favoriteButton); // Remove from favorites

    // Check if the restaurant is removed from the favorites
    const dbRequest = window.indexedDB.open('restaurants', 1);
    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(['favorites'], 'readonly');
      const objectStore = transaction.objectStore('favorites');
      const getRequest = objectStore.get(restaurant.id);

      getRequest.onsuccess = function () {
        expect(getRequest.result).toBeUndefined();
      };
    };
  });
});
