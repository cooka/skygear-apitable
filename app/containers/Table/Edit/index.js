import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import AddFieldDialog from 'components/Table/Edit/AddFieldDialog';
import RemoveFieldDialog from 'components/Table/Edit/RemoveFieldDialog';
import GetEndPointDialog from 'components/Table/Edit/GetEndPointDialog';
import EndPointDetailDialog from 'components/Table/Edit/EndPointDetailDialog';
import RenameTableDialog from 'components/Table/Edit/RenameTableDialog';
import PreviewDialog from 'components/Table/Edit/PreviewDialog';
import ExportDialog from 'components/Table/Edit/ExportDialog';
import TableEdit from 'components/Table/Edit';
import { APP_NAME } from '../../../configs';
import {
  showDialog as showDialogAction,
  hideDialog as hideDialogAction,
  loadMoreTableRecords as loadMoreTableRecordsAction,
  saveTableRecords as saveTableRecordsAction,
  addTableField as addTableFieldAction,
  removeTableField as removeTableFieldAction,
  setFieldPendingRemove as setFieldPendingRemoveAction,
  issueToken as issueTokenAction,
  revokeToken as revokeTokenAction,
  setTokenWritability as setTokenWritabilityAction,
  renameTable as renameTableAction,
  updateCache as updateCacheAction,
  setTokenForDetail as setTokenForDetailAction,
  exportCSV as exportCSVAction,
} from '../actions';
import { showNotification as showNotificationAction } from '../../Notification/actions';

type TableEditContainerProps = {
  dialog: any,
  table: any,
  loading: boolean,
  saving: boolean,
  pendingRemoveField: mixed,
  params: any,
  cache: mixed,
  showDialog: Function,
  hideDialog: Function,
  showNotification: Function,
  loadMoreTableRecords: Function,
  saveTableRecords: Function,
  addTableField: Function,
  setFieldPendingRemove: Function,
  removeTableField: Function,
  issueToken: Function,
  revokeToken: Function,
  setTokenWritability: Function,
  renameTable: Function,
  resetForm: Function,
  updateCache: Function,
  setTokenForDetail: Function,
  tokenForDetail: any,
  exportCSV: Function,
  exportData: any
}

class TableEditContainer extends Component {
  props: TableEditContainerProps

  handleAddTableField = (values) => {
    const { params: { id }, table, hideDialog, addTableField, showNotification, resetForm } = this.props;
    const name = values.get('name');
    const type = values.get('type');
    const allowEmpty = !!values.get('allowEmpty');
    const data = values.get('data');

    const fieldExists = !!(table.get('fields').filter((field) => field.get('data') === data).size);

    if (!fieldExists) {
      return new Promise((resolve, reject) => {
        addTableField(id, name, type, allowEmpty, data, resolve, reject);
      })
      .then(() => {
        hideDialog('addField');
        resetForm('addField');
      });
    }

    return showNotification(`Columns with data name '${data}' already exists!`);
  };

  handleRemoveFields = () => {
    const { params: { id }, hideDialog, removeTableField, pendingRemoveField, showNotification } = this.props;
    hideDialog('removeField');
    return new Promise((resolve, reject) => {
      removeTableField(id, pendingRemoveField, resolve, reject);
    })
    .then(() => showNotification('Columns have been removed successfully!'));
  }

  handleSaveChanges = (changes, createdRecords, deletedRecords, resetChanges) => {
    const { params: { id }, saveTableRecords, loadMoreTableRecords, showNotification } = this.props;
    const hasChanges = !!(Object.keys(changes).length + Object.keys(createdRecords).length + deletedRecords.length);

    if (hasChanges) {
      return new Promise((resolve, reject) => {
        saveTableRecords(id, changes, createdRecords, deletedRecords, resolve, reject);
      })
      .then(() => {
        resetChanges();
        loadMoreTableRecords(id, 1);
        showNotification('Changes have been saved successfully!');
      })
      .catch(() => showNotification('Oops! Failed to save changes!'));
    }

    return showNotification('There are no unsaved changes.');
  }

  handleIssueToken = () => {
    const { params: { id }, issueToken, showNotification } = this.props;

    return new Promise((resolve, reject) => {
      issueToken(id, resolve, reject);
    })
    .then(() => showNotification('Token has been issued successfully!'))
    .catch(() => showNotification('Oops! Failed to issue token!'));
  }

  handleRevokeToken = (token) => () => {
    const { revokeToken, showNotification } = this.props;

    return new Promise((resolve, reject) => {
      revokeToken(token, resolve, reject);
    })
    .then(() => showNotification('Token has been revoked successfully!'))
    .catch(() => showNotification('Oops! Failed to revoke token!'));
  }

  handleRenameTable = (values) => {
    const { params: { id }, hideDialog, renameTable, showNotification, resetForm } = this.props;
    const name = values.get('name');

    return new Promise((resolve, reject) => {
      renameTable(id, name, resolve, reject);
    })
    .then(() => {
      showNotification('Table has been renamed successfully!');
      hideDialog('renameTable');
      resetForm('renameTable');
    })
    .catch(() => showNotification('Oops! Failed to revoke token!'));
  }

  handleTokenWritability = (token) => (e, writable) => {
    const { setTokenWritability, showNotification } = this.props;

    return new Promise((resolve, reject) => {
      setTokenWritability(token, writable, resolve, reject);
    })
    .then(() => showNotification('Token\'s writability is set successfully!'))
    .catch(() => showNotification('Oops! There is an error!'));
  }

  viewTokenDetail = (token, writable) => () => {
    const { setTokenForDetail, showDialog } = this.props;

    setTokenForDetail(token, writable);
    showDialog('endPointDetail');
  }

  handleExportCSV = () => {
    const { params: { id }, exportCSV, showDialog, showNotification } = this.props;

    return new Promise((resolve, reject) => {
      exportCSV(id, resolve, reject);
    })
    .then((recordCount) => {
      if (recordCount === 0) {
        showNotification('There is no record in this table.');
      } else {
        showDialog('export');
      }
    })
    .catch(() => showNotification('Oops! Failed to export!'));
  }

  showDialog = (name) => () => this.props.showDialog(name);
  hideDialog = (name) => () => this.props.hideDialog(name);

  render() {
    const { params: { id }, dialog, table, cache, loading, saving, setFieldPendingRemove, pendingRemoveField, showNotification, loadMoreTableRecords, updateCache, tokenForDetail, exportData } = this.props;

    return (
      <div>
        <AddFieldDialog
          show={dialog.get('addField')}
          handleClose={this.hideDialog('addField')}
          onSubmit={this.handleAddTableField}
        />

        <RemoveFieldDialog
          show={dialog.get('removeField')}
          fields={pendingRemoveField}
          handleClose={this.hideDialog('removeField')}
          handleRemoveFields={this.handleRemoveFields}
        />

        {!loading && <GetEndPointDialog
          appName={APP_NAME}
          id={id}
          tokens={table.get('tokens')}
          show={dialog.get('getEndPoint')}
          handleClose={this.hideDialog('getEndPoint')}
          handleTokenWritability={this.handleTokenWritability}
          handleIssueToken={this.handleIssueToken}
          handleRevokeToken={this.handleRevokeToken}
          viewTokenDetail={this.viewTokenDetail}
        />}

        {!loading && <EndPointDetailDialog
          appName={APP_NAME}
          id={id}
          token={tokenForDetail}
          show={dialog.get('endPointDetail')}
          handleClose={this.hideDialog('endPointDetail')}
        />}

        {!loading && <ExportDialog
          exportData={exportData.toJS()}
          show={dialog.get('export')}
          handleClose={this.hideDialog('export')}
        />}

        {!loading && <PreviewDialog
          table={table}
          cache={cache}
          show={dialog.get('preview')}
          saveBtn={this.saveBtn}
          handleClose={this.hideDialog('preview')}
        />}

        <RenameTableDialog
          show={dialog.get('renameTable')}
          handleClose={this.hideDialog('renameTable')}
          onSubmit={this.handleRenameTable}
        />

        <TableEdit
          saveBtnRef={(saveBtn) => { this.saveBtn = saveBtn; }}
          loading={loading}
          table={table}
          showDialog={this.showDialog}
          handleSaveChanges={this.handleSaveChanges}
          handleExportCSV={this.handleExportCSV}
          setFieldPendingRemove={setFieldPendingRemove}
          showNotification={showNotification}
          loadMoreTableRecords={loadMoreTableRecords}
          updateCache={updateCache}
          saving={saving}
        />
      </div>
    );
  }
}

export default connect(
  (state) => ({
    dialog: state.get('table').get('dialog'),
    table: state.get('table').get('data'),
    cache: state.get('table').get('cache'),
    loading: state.get('table').get('loading'),
    saving: state.get('table').get('saving'),
    pendingRemoveField: state.get('table').get('pendingRemoveField'),
    tokenForDetail: state.get('table').get('tokenForDetail'),
    exportData: state.get('table').get('exportData'),
  }),
  {
    showDialog: showDialogAction,
    hideDialog: hideDialogAction,
    showNotification: showNotificationAction,
    loadMoreTableRecords: loadMoreTableRecordsAction,
    saveTableRecords: saveTableRecordsAction,
    addTableField: addTableFieldAction,
    setFieldPendingRemove: setFieldPendingRemoveAction,
    removeTableField: removeTableFieldAction,
    issueToken: issueTokenAction,
    revokeToken: revokeTokenAction,
    setTokenWritability: setTokenWritabilityAction,
    renameTable: renameTableAction,
    resetForm: reset,
    updateCache: updateCacheAction,
    setTokenForDetail: setTokenForDetailAction,
    exportCSV: exportCSVAction,
  }
)(TableEditContainer);
