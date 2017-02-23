'use strict';

const Joi = require('joi');
const url = require('url');
const bluebird = require('bluebird');
const parseXml = bluebird.promisify(require('xml2js').parseString);
const config = require('../config');
const s3 = require('../agents/s3');
const emailNotifier = require('../lib/plugins').sendEmail;
const DataContribution = require('../models/data-contribution');
const document_categories = require('../agents/document_categories');

function _getContributeData(request, reply) {
  const additionalConditions = [
    ['starts-with', '$comments', ''],
    ['starts-with', '$url', ''],
    ['starts-with', '$document_category_id', ''],
  ];

  document_categories.list()
    .then((categories) => (
      reply.view('contribute-data', {
        title: 'Contribute data',
        s3: s3.getSignedFormFields(additionalConditions),
        maxUploadSize: s3.MAX_UPLOAD_SIZE,
        redirectTo: request.headers.referer,
        categories: _mangleCategories(categories.items),
      })
    ));
}

function _mangleCategories(categories) {
  // Dodging function param reassign by creating a working copy
  const result = [];
  categories.forEach((category, index) => {
    result[index] = category;
    if (!category.group) {
      result[index].group = category.name;
    }
    if (category.name === 'Other') {
      result[index].name = 'Other (please describe in the comments section)';
    }
  });
  return result;
}

function _getDataUrl(s3Response) {
  if (s3Response === undefined) {
    return undefined;
  }

  if (s3Response.Error) {
    throw s3Response.Error;
  }

  const dataLocation = s3Response.PostResponse.Location[0];
  const key = s3Response.PostResponse.Key[0];
  let dataUrl;

  if (config.s3.customDomain) {
    const parsedDomain = url.parse(config.s3.customDomain);

    dataUrl = `${parsedDomain.protocol}//${parsedDomain.host}/${key}`;
  } else {
    dataUrl = dataLocation;
  }

  return dataUrl;
}

function _postContributeData(request, reply) {
  const payload = request.payload;
  const fileWasUploaded = (payload.response !== undefined);
  let result = Promise.resolve();

  if (fileWasUploaded) {
    result = result.then(() => parseXml(payload.response));
  }

  result
    .then((s3Response) => {
      const dataUrl = _getDataUrl(s3Response);
      const trialId = request.query.trial_id;
      const userId = (request.auth.credentials || {}).id;

      return new DataContribution({
        trial_id: trialId,
        user_id: userId,
        data_url: dataUrl,
        url: payload.url,
        document_category_id: payload.document_category_id,
        comments: payload.comments,
      }).save();
    })
    .then((constructor) =>
      new DataContribution({ id: constructor.id })
        .fetch({ withRelated: DataContribution.relatedModels })
    )
    .then((dataContribution) => {
      const emailNotification = emailNotifier.composeEmail(
        'data-contribution-notification.md',
        dataContribution.toJSON(),
        config.dataContributionEmailFrom,
        config.dataContributionEmailTo,
        'New data contribution on OpenTrials'
      );

      emailNotifier.sendEmail(emailNotification);
    })
    .then(() => {
      const msg = 'Thanks for your contribution!' +
                  ' It will be reviewed by our researchers and should appear' +
                  ' on OpenTrials soon.';
      request.yar.flash('success', msg);
      return reply.redirect(request.query.redirectTo);
    })
    .catch((err) => {
      const isS3Error = (err.Code && err.Message);
      if (!isS3Error) {
        throw err;
      }

      const errorCode = err.Code[0];
      const errorMessage = err.Message[0];

      request.yar.flash('error', `${errorMessage} (${errorCode}`);
      return _getContributeData(request, reply)
        .then((response) => response.code(payload.responseStatus));
    })
    .catch(() => {
      request.yar.flash('error', 'An internal error occurred, please try again later.');
      return _getContributeData(request, reply)
        .then((response) => response.code(payload.responseStatus));
    });
}

module.exports = {
  get: {
    handler: _getContributeData,
  },
  post: {
    handler: _postContributeData,
    validate: {
      query: {
        trial_id: Joi.string().guid(),
        redirectTo: Joi.string().default('/'),
      },
      payload: {
        file: Joi.string().empty(''),
        url: Joi.string().empty(''),
        document_category_id: Joi.number().integer().empty(''),
        response: Joi.string().empty(''),
        responseStatus: Joi.number().integer().default(500),
        comments: Joi.string().empty(''),
        'Content-Type': Joi.string().empty(''),
        key: Joi.string().empty(''),
        acl: Joi.string().empty(''),
        success_action_status: Joi.number().empty(''),
        Policy: Joi.string().empty(''),
        'X-Amz-Algorithm': Joi.string().empty(''),
        'X-Amz-Credential': Joi.string().empty(''),
        'X-Amz-Date': Joi.string().empty(''),
        'X-Amz-Signature': Joi.string().empty(''),
      },
    },
  },
};
