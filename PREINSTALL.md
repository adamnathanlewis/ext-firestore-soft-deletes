## Firestore Soft Deletes Extension

Restore previously deleted Firestore documents with ease.

## What does it do?

Imagine a Recycle Bin (Windows) or Bin (Mac) for your firestore documents. When you delete a firestore document (or an entire collection/subcollection of documents), the deleted document(s) will all safely be stored in a separate collection called `DeletedRecords` where you can see and most importantly, **restore** the document back into its original location.

### View deleted documents:

To view deleted documents, head to the `DeletedRecords/DeletedRecords` document. Deleted documents will all be stored in subcollections with the same path as the original document. 

**Note**: To avoid conflicts on `.collectionGroup()` queries, the extension appends `_archived` to the end of all collection & subcollection names.

### Restore documents:

In order to restore a document back to its original location, simply find the document and set the `softDeletes.restored` value from `false` to `true`. The document will then be inserted at its original location.

## Billing

This extension uses other Firebase or Google Cloud services which may have  
 associated charges:

\*   Cloud Firestore  
\*   Cloud Functions  
\*   Cloud PubSub 

When you use Firebase Extensions, you're only charged for the underlying  
resources that you use. A paid-tier billing plan is only required if the  
extension uses a service that requires a paid-tier plan, for example calling to  
a Google Cloud API or making outbound network requests to non-Google services.  
All Firebase services offer a no-cost tier of usage.  
\[Learn more about Firebase billing.\](https://firebase.google.com/pricing)