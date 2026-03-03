=========================================================
  HOW TO FIX FIREBASE "PERMISSION DENIED" ERRORS
=========================================================

If your registration form gets stuck on "Saving to database..." 
or your Admin Dashboard shows "0" records and says "Permission Denied",
it means your **Cloud Firestore Security Rules** are blocking access.

Firebase automatically locks new databases by default to prevent 
unauthorized access. You must update your rules to allow the 
website to read and save data.

---------------------------------------------------------
STEP 1: GO TO FIREBASE CONSOLE
---------------------------------------------------------
1. Go to https://console.firebase.google.com/
2. Click on your project ("elexsiya-26-2b815" or similar).

---------------------------------------------------------
STEP 2: OPEN CLOUD FIRESTORE
---------------------------------------------------------
1. In the left menu, click on "Build" to expand it.
2. Click on "Firestore Database".
3. Click on the "Rules" tab at the top.

---------------------------------------------------------
STEP 3: UPDATE THE RULES
---------------------------------------------------------
You will see some code that looks like this:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Replace ALL of it with this exactly:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Click the blue "Publish" button. Wait successfully.

---------------------------------------------------------
STEP 4: TRY AGAIN
---------------------------------------------------------
Go back to your website, refresh the page, and try to register 
again. The "Saving to database..." should be instant now, and 
the Admin Dashboard will successfully load the data.

---
**Why did this happen?**
When you copy a Firebase Config to `firebase-config.js`, the code 
knows *where* to send the data, but if Cloud Firestore says "No, writes 
are turned off", the database rejects the save. Updating the rules 
turns writes on.
