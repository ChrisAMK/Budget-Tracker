let db;
// Here we are creating a new indexedDB database request
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = (event) => {

    let db = event.target.result;
    // Creating an Object store and assigning it the name of pending to represent the pending data that needs to be sent to the database
    // When the connection is back online
    db.createObjectStore("pending", { keypath: "listid", autoIncrement: true })
    
};

// onsucess handles the event of a successful connection
request.onsuccess = (event) => {
    db = event.target.result;
    // if the app is online we trigger the checkdatabase Function
    if (navigator.onLine) {
        checkDatabase();
    }
};

// If there is a connection error we will console log it
request.onerror = () => {
    console.log(`Error!: ${event.target.errorCode}`);
}

// this function creates access to our indexeddb so we can make changes
const saveRecord = (record) => {
    console.log("YOO")
    const dbConnection = request.result;
    const transaction = dbConnection.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    // Here we are passing the recording into the add function that will add the record to the Pending Store
    pendingStore.add(record);
}

const checkDatabase = () => {
    // Setting up read Access to the pending Object Store
    const dbConnection = request.result;
    const transaction = dbConnection.transaction(["pending"], "readonly");
    const pendingStore = transaction.objectStore("pending");
    const getAll = pendingStore.getAll();
    console.log(getAll)

    // Once we can get all the results from the offline IndexedDB, on success we then put in a post request with the data stored
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
            },
          })
            .then((response) => response.json())
            .then(() => {
              // if successful, open a transaction on your pending db and clear everyting
              const transaction = dbConnection.transaction(["pending"], "readwrite")
              const pendingStore = transaction.objectStore("pending");
              const clearStore = pendingStore.clear();
              console.log(clearStore)
            });
        }
      };
}

// Tells the app to checkDatabase when the app comes back to being online
window.addEventListener('online', checkDatabase);
