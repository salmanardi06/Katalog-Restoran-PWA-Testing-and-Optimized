describe('End to End Test - Like and Unlike Restaurant', () => {
    it('Should be able to like and unlike a restaurant', () => {
        cy.visit('http://127.0.0.1:8888/');
  
      // Klik tombol "View Details" pada salah satu restoran
      cy.get('.detail-link').first().click();
  
      // Simpan nama restoran
      let restaurantName;
      cy.get('.restaurant-detail-card h3').then(($name) => {
        restaurantName = $name.text();
      });
  
      // Klik tombol "Add to Favorites"
      cy.get('.restaurant-detail-card button').click();
      cy.wait(500); // Tunggu sebentar untuk aksi selesai
  
      // Verifikasi bahwa restoran ditambahkan ke favorit
      cy.contains('.message', 'Added to favorites').should('be.visible');
  
      // Kembali ke halaman sebelumnya
      cy.go('back');
  
      // Klik tombol "Favorites"
      cy.contains('Favorites').click();
  
      // Verifikasi bahwa restoran ada di halaman favorit
      cy.contains('.favorite-restaurant-card', restaurantName).should('be.visible');
  
      // Klik tombol "View Details" pada restoran di halaman favorit
      cy.contains('.favorite-restaurant-card', restaurantName).find('.detail-link').click();
  
      // Klik tombol "Add to Favorites" untuk menghapus restoran dari favorit
      cy.get('.restaurant-detail-card button').click();
      cy.wait(500); // Tunggu sebentar untuk aksi selesai
  
      // Verifikasi bahwa restoran dihapus dari favorit
      cy.contains('.message', 'Removed from favorites').should('be.visible');
    });
  });
  