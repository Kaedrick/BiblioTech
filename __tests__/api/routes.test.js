const request = require('supertest');
const app = require('../../server/app_test');

let cookie;

beforeAll(async () => {
  const response = await request(app)
    .post('/connexion')
    .send({
      email: 'adelkaed@gmail.com',
      password: 'Dedere22!!'
    });

  cookie = response.headers['set-cookie'];
});

describe('POST /inscription', () => {
  it('Should create a new user', async () => {
    const response = await request(app)
      .post('/inscription')
      .send({
        email: 'newuser@example.com',
        password: 'NewUser123!',
        firstname: 'New',
        lastname: 'User'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Utilisateur créé. Veuillez vérifier votre email pour compléter l'inscription.");
  });

  it('Should not create a user with an existing email', async () => {
    const response = await request(app)
      .post('/inscription')
      .send({
        email: 'adelkaed@gmail.com',
        password: 'AnotherPassword123!',
        firstname: 'Another',
        lastname: 'User'
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Adresse mail déjà inscrite.');
  });
});

describe('GET /api/user/profile/:userId', () => {
  it('Should retrieve user profile', async () => {
    const userId = 1;
    const response = await request(app)
      .get(`/api/user/profile/${userId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('idUser', userId);
  });

  it('Should return 404 for non-existent user', async () => {
    const userId = 9999;
    const response = await request(app)
      .get(`/api/user/profile/${userId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Utilisateur non trouvé.');
  });
});

describe('POST /api/user/change-password', () => {
  it('Should change user password', async () => {
    const response = await request(app)
      .post('/api/user/change-password')
      .send({
        userId: 1,
        oldPassword: 'Dedere22!!',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!'
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Le mot de passe a été mis à jour avec succès.');
  });

  it('Should not change password with wrong old password', async () => {
    const response = await request(app)
      .post('/api/user/change-password')
      .send({
        userId: 1,
        oldPassword: 'WrongOldPassword',
        newPassword: 'NewPassword123!',
        confirmNewPassword: 'NewPassword123!'
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("L'ancien mot de passe est incorrect.");
  });
});

describe('POST /api/books/reservations', () => {
  it('Should create a book reservation', async () => {
    const response = await request(app)
      .post('/api/books/reservations')
      .send({
        userId: 1,
        idBook: 1,
        reservationStartDate: '2024-06-20'
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Réservation réussie.');
  });

  it('Should not create a reservation if book is fully reserved', async () => {
    const response = await request(app)
      .post('/api/books/reservations')
      .send({
        userId: 1,
        idBook: 1,
        reservationStartDate: '2024-06-20'
      })
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Toutes les copies de ce livre sont déjà réservées pour cette date.");
  });
});
