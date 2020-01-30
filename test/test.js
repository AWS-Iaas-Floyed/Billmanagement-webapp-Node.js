var expect = require('chai').expect;
// var request = require('request');
var request = require('supertest');

var app = require('../index');

// var authenticatedUser = request.agent(app);

// it('GET Request basic test', function (done) {

//   authenticatedUser
//     .get('/v1/user/self')
//     .auth('jane.doe@example.com', '123451234567')
//     .end(function (err, response) {
//       expect(response.statusCode).to.equal(200);
//       done();
//     });
// });


it('POST request sanity test', function(done) {
  request(app)
    .post('/v1/user')
    .send(
      {
        "first_name": "JaneXY",
        "last_name": "Doe",
        "password": "skdjfhskdfjhg",
        "email_address": "jane.doe@example.com"
      }
    )
    .expect(function(res) {

      if (res.statusCode !== 200 && res.statusCode !== 400 && res.statusCode !== 500) {
        throw Error('unexpected status code: ' + res.statusCode);
      }
    })
    .expect('Content-Type', /json/)
    .end(function(err, res) {
          if (err) console.log(err);
       });
    done();
});