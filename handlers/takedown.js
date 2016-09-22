'use strict';

function takedown(request, reply) {
  const takedownForm = 'https://docs.google.com/forms/d/e/1FAIpQLSew2Rsu5EY-SYODFzZCh2wMWKcbcJe5CQlMFoyH8shmIE1jfQ/viewform';
  const url = request.query.url;
  reply.redirect(`${takedownForm}?entry.579116872=${url}`);
}


module.exports = {
  handler: takedown,
};
