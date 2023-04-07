## You're all set!

You can test it out by creating a test document in firestore and deleting it. Then head to the `DeletedRecords/DeletedRecords` document to see the safely stored document.

### View deleted documents:

To view deleted documents, head to the `DeletedRecords/DeletedRecords` document. Deleted documents will all be stored in subcollections with the same path as the original document. 

**Note**: To avoid conflicts on `.collectionGroup()` queries, the extension appends `_archived` to the end of all collection & subcollection names.

### Restore documents:

In order to restore a document back to its original location, simply find the document and set the `softDeletes.restored` value from `false` to `true`. The document will then be inserted at its original location.

## Important Notes

Restoring a document will insert a deleted document back into its original location. If a document with the same ID has been added since the first one was deleted, the extension will merge the two documents - overwriting any values if the keys exist in the deleted document.

Though this extension is there to help restore deleted documents, it is not intended to be used as a database backup tool - you should implement a proper Firestore backup solution.

