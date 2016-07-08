'use strict';

const _ = require('lodash');

function decorateDocuments(documents) {
  const defaultDocuments = {
    // paperwork
    blank_consent_form: {
      category: 'Paperwork',
      name: 'Blank consent form',
    },
    patient_information_sheet: {
      category: 'Paperwork',
      name: 'Patient information sheet',
    },
    blank_case_report_form: {
      category: 'Paperwork',
      name: 'Blank case report form',
    },
    // regulatory
    csr: {
      category: 'Regulatory',
      name: 'Clinical Study Report (CSR)',
    },
    epar_segment: {
      category: 'Regulatory',
      name: 'EPAR Segment',
    },
  };

  const documentTypesToAdd = Object.assign({}, defaultDocuments);
  documents.map((doc) => delete documentTypesToAdd[doc.type]);

  const unknownDocuments = Object.keys(documentTypesToAdd).map((type) => (
    {
      type,
      name: defaultDocuments[type].name,
    }
  ));
  const allDocuments = unknownDocuments.concat(documents);
  const documentsByCategory = _.groupBy(allDocuments,
                                        (doc) => defaultDocuments[doc.type].category);

  Object.keys(documentsByCategory).forEach((category) => {
    documentsByCategory[category] = _.sortBy(documentsByCategory[category], 'type');
  });

  return documentsByCategory;
}

function decorate(trial) {
  return Object.assign(
    {},
    trial,
    {
      documents: decorateDocuments(trial.documents || []),
    }
  );
}

module.exports = decorate;
