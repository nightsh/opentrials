'use strict';
const server = require('../../server');

describe('flag handler', () => {
  describe('GET /flag', () => {
    let response;
    const sourceURL = 'http://explorer.opentrials.net/about';

    before(() => {
      server.inject(`/flag?url=${sourceURL}`)
        .then((_response) => {
          response = _response;
        });
    });

    it('is successful', () => {
      response.statusCode.should.equal(302);
    });

    it('redirects to the Google form', () => {
      response.statusCode.should.equal(302);
      response.headers.location.should.equal(`https://docs.google.com/forms/d/e/1FAIpQLSc49nJx0Ie8q8b24yYNX2DrqIWN44P9DsF9k4Y_VkU7y81rFg/viewform?entry.783048384=${sourceURL}`);
      // response.request.response.source.template.should.equal('about')
    });

  });
});
