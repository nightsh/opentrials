'use strict';
const server = require('../../server');

describe('takedown handler', () => {
  describe('GET /takedown', () => {
    let response;
    const sourceURL = 'http://explorer.opentrials.net/about';

    before(() => {
      server.inject(`/takedown?url=${sourceURL}`)
        .then((_response) => {
          response = _response;
        });
    });

    it('is successful', () => {
      response.statusCode.should.equal(302);
    });

    it('redirects to the Google form', () => {
      response.statusCode.should.equal(302);
      response.headers.location.should.equal(`https://docs.google.com/forms/d/e/1FAIpQLSew2Rsu5EY-SYODFzZCh2wMWKcbcJe5CQlMFoyH8shmIE1jfQ/viewform?entry.579116872=${sourceURL}`);
      // response.request.response.source.template.should.equal('about')
    });

  });
});
