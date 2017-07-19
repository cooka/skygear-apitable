/* eslint-disable no-underscore-dangle */
/* @flow */

import React from 'react';
import reactStringReplace from 'react-string-replace';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import JSONPreview from './JSONPreview';

const handleRecordId = (records) => records.map((_record) => {
  const record = _record;
  record.id = record._recordId;
  delete record._recordId;
  return record;
});

const formatDiff = (record, { changes, deletedRecords }) => {
  if (deletedRecords.includes(record.id)) {
    return <strong style={{ color: 'red' }}><del>{JSON.stringify(record, null, 2)}</del></strong>;
  }

  if (changes[record.id]) {
    let modifiedRecord = JSON.stringify(record, null, 2);
    const modifiedFields = Object.keys(changes[record.id]);
    modifiedFields.forEach((field) => {
      const oldKeyVal = `"${field}": ${JSON.stringify(record[field])}`;
      const newKeyVal = `"${field}": ${JSON.stringify(changes[record.id][field])}`;
      modifiedRecord = reactStringReplace(modifiedRecord, oldKeyVal, (match) => (
        <span key={`${record.id} ${field}`}><del style={{ color: 'red' }}>{match}</del> <strong style={{ color: 'green' }}>{newKeyVal}</strong></span>
      ));
    });
    return modifiedRecord;
  }

  return JSON.stringify(record, null, 2);
};

const formatCreatedRecords = (record) => <strong style={{ color: 'green' }}>{JSON.stringify(record, null, 2)}</strong>;

const displayDiff = (records, cache) => {
  const formattedDiff = [];
  const createdRecordIds = Object.keys(cache.createdRecords);
  records.forEach((record) => formattedDiff.push(formatDiff(record, cache)));
  createdRecordIds.forEach((id) => formattedDiff.push(formatCreatedRecords(cache.createdRecords[id])));
  return (formattedDiff.length > 0) ? formattedDiff.reduce((prev, curr) => [prev, ', ', curr]) : '';
};

const actions = (handleClose) => [
  <RaisedButton
    label="OK"
    secondary
    onTouchTap={handleClose}
  />,
];

type PreviewDialogProps = {
  show: boolean,
  table: any,
  cache: any,
  handleClose: Function
}

const PreviewDialog = ({ show, table, cache, handleClose }: PreviewDialogProps) => (
  <Dialog
    title="Preview"
    actions={actions(handleClose)}
    modal
    open={show}
  >
    <JSONPreview>
      records: [
        {displayDiff(handleRecordId(table.get('records').toJS()), cache.toJS())}
      ]
    </JSONPreview>
  </Dialog>
);

export default PreviewDialog;