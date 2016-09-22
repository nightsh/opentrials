'use strict';

function flag(request, reply) {
  //const flagForm = `https://docs.google.com/forms/d/e/1FAIpQLSc49nJx0Ie8q8b24yYNX2DrqIWN44P9DsF9k4Y_VkU7y81rFg/viewform`;
  //const url = request.query.url;
  //reply.redirect(`${flagForm}?entry.783048384=${url}`);

  reply.view('flag', {
    title: 'Flag an error',
    flagURL: request.query.url,
  });
}


module.exports = {
  handler: flag,
};
