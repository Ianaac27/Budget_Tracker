let db;
const request = indexedDB.open("budget", 1);
​
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
​
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};
​
request.onerror = function (event) {
    console.log("Error! " + event.target.errorCode);
};
​
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  pendingStore.add(record);
  console.log(record);
}
​
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const pendingStore = transaction.objectStore("pending");
  const getPendingStore = pendingStore.getAll();
​
  getPendingStore.onsuccess = function () {
    if (getPendingStore.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const pendingStore = transaction.objectStore("pending");
          pendingStore.clear("pending");
        });
    }
  };
}
​
window.addEventListener("online", checkDatabase);







