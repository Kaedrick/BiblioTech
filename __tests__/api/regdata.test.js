describe('POST /inscription', () => {
    it('Should create a new user', async () => {
      const csrfResponse = await request(app).get('/get-csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
  
      const response = await request(app)
        .post('/inscription')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-TOKEN', csrfToken)
        .send({
          email: 'adelkaedrock@gmail.com',
          password: 'Dedere214!!',
          firstname: 'Uzeur',
          lastname: 'Nouvo'
        });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Utilisateur créé. Veuillez vérifier votre email pour compléter l\'inscription.');
    });
  
    it('Should not create user with existing email', async () => {
      const csrfResponse = await request(app).get('/get-csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
  
      const response = await request(app)
        .post('/inscription')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-TOKEN', csrfToken)
        .send({
          email: 'adelkaed@gmail.com',
          password: 'Dedere22!!',
          firstname: 'Adel',
          lastname: 'Kaed'
        });
  
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Adresse mail déjà inscrite.');
    });
  });
  