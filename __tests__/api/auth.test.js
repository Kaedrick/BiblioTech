const request = require('supertest');
const app = require('../../server/app'); 

describe('POST /connexion', () => {
  it('Should authenticate user with right credentials', async () => {
    const response = await request(app)
      .post('/connexion')
      .send({
        email: 'adelkaed@gmail.com',
        password: 'Dedere22!!'
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Utilisateur authentifié avec succès');
  });

  it('Shouldnt log user : wrong password', async () => {
    const response = await request(app)
      .post('/connexion')
      .send({
        email: 'adelkaed@gmail.com',
        password: 'wrongpaszsword'
      });

    expect(response.status).toBe(402); 
    expect(response.text).toBe('Mot de passe incorrect.');
  });

  it('Should not authenticate : account doesnt exist', async () => {
    const response = await request(app)
      .post('/connexion')
      .send({
        email: 'adelbg1okd12@gmail.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401); 
    expect(response.text).toBe('Adresse e-mail incorrecte.');
  });
});
