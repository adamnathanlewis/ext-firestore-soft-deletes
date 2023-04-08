const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Set default values for extension params
let collectionPath = "{rootCollectionName}/{allPaths=**}";
let deletedCollectionName = "DeletedRecords";

// If the extension params have been set, use them
if (process.env.COLLECTION_PATH) {
  collectionPath = process.env.COLLECTION_PATH + "/{documentId}";
}
if (process.env.DELETED_COLLECTION_NAME) {
  deletedCollectionName = process.env.DELETED_COLLECTION_NAME;
}


exports.firestoreSoftDeletes = functions.runWith({failurePolicy: true}).firestore
    // Set trigger to all paths
    .document(collectionPath)
    // Set trigger to when a firestore document is deleted
    .onDelete(async (snap, context) => {
      // DeletedRecord = a copy of the originally deleted firestore document
      const deletedRecord = snap.data();

      // If the deleted document already has a deletedAt timestamp,
      // We don't need to do anything else
      // This is to to allow hard deletes to be performed
      // by deleting the document once it has been soft deleted
      if (deletedRecord.softDeletes?.deletedAt) {
        return false;
      }

      // path = the firestore path of the deleted document
      let path = context.resource.name.split("/(default)/documents/")[1];

      // split the path into an array so we can get collection and document ids
      const splitPath = path.split("/");

      // Firestore paths always follow the pattern:
      // ColletionName/DocumentId/CollectionName/DocumentId/...
      // So we can get all the collection names by getting all the odd indexes
      // Then we can append _archived to the end of each collection name...
      // ready to insert into the DeletedRecords collection
      for (let i = 0; i < splitPath.length; i += 2) {
        splitPath[i] = splitPath[i] + "_archived";  
      }

      // Create a path to the DeletedRecords collection and
      // append the original path to the end of it, maintaining the
      // original structure of the deleted document
      path = `${deletedCollectionName}/${deletedCollectionName}/` + splitPath.join("/");

      // Set the deletedAt timestamp on the new record
      deletedRecord.softDeletes = {
        deletedAt: new Date(),
        restored: false,
        restoredAt: null,
      };

      // Finally, insert the document into the DeletedRecords collection
      await db.doc(path).set(deletedRecord);

    });


exports.firestoreSoftDeletesRestore = functions.runWith({failurePolicy: true}).firestore
    // set trigger to path within the deleted records collection
    .document(`${deletedCollectionName}/${deletedCollectionName}/{rootCollectionName}/{allPaths=**}`)
    // set trigger to when a firestore document is updated
    .onUpdate(async (change, context) => {
      // get the newly edited document data
      const deletedRecord = change.after.data();
      
      // get the document data from before it was edited
      const previousData = change.before.data();

      // if the document's restored property was false and is now true
      if (previousData.softDeletes?.restored === false && deletedRecord.softDeletes?.restored === true) {
        // let's put the document back where it was before it was deleted!
        // get the path of the document, removing the DeletedRecords collection/document
        const path = context.resource.name.split(`${deletedCollectionName}/${deletedCollectionName}`)[1];

        // restore the original collection names by removing _archived from the end
        const restorePath = path.replaceAll("_archived", "");
        
        // set the restoredAt timestamp
        deletedRecord.softDeletes.restoredAt = new Date();

        // set the deletedAt timestamp to null
        deletedRecord.softDeletes.deletedAt = null;

        // finally, insert the document back into the original collection
        await db.doc(restorePath).set(deletedRecord);

      }
    });
