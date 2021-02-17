let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Error " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const pendingStore = transaction.objectStore("pending");
  pendingStore.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const pendingStore = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getPendingStore = pendingStore.getAll();

  getPendingStore.onsuccess = function() {
    if (getPendingStore.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getPendingStore.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");

        // access your pending object store
        const pendingStore = transaction.objectStore("pending");

        // clear all items in your store
        pendingStore.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
