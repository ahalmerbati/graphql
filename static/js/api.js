// sends a graphql to the api with the stored jwt and returns the parsed repsonse
async function runQuery(query) {
  const url = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";
  const token = localStorage.getItem("jwt");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }
}

// gets the logged-in user's id and login
function fetchUser() {
  return runQuery("{user { id login } }");
}

// gets all xp-type transactions for the user
function fetchXP() {
  return runQuery(
    '{ transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: asc }) { amount createdAt objectId } }',
  );
}

// adds up the amount field from an array of xp transactions
function sumXP(data) {
  const transactions = data.data.transaction;
  return transactions.reduce((accumulator, currentItem) => {
    accumulator = accumulator + currentItem.amount;
    return accumulator;
  }, 0);
}

// turns a list of xp transactions into a running total over time for the graph
function cumulativeXP(data) {
  const transactions = data.data.transaction;
  let runningTotal = 0;
  return transactions.map((tx) => {
    runningTotal += tx.amount;
    return {
      date: tx.createdAt,
      total: runningTotal,
    };
  });
}

// removes negative and duplicate xp transactions, keeping only genuine earned xp
function cleanXP(data) {
  const transactions = data.data.transaction;
  const seen = {};
  const cleaned = transactions.filter((tx) => {
    if (tx.amount <= 0) {
      return false;
    }
    if (seen[tx.objectId]) {
      return false;
    }
    seen[tx.objectId] = true;
    return true;
  });
  return { data: { transaction: cleaned } };
}

// gets the user's audit ratio and total up/down audit numbers
function fetchAuditRatio() {
  return runQuery("{ user { auditRatio totalUp totalDown } }");
}

// gets pass/fail grades for all project results
function fetchResults() {
  return runQuery(
    '{ result(where: { object: { type: { _eq: "project" } } }) { grade object { name } } }',
  );
}

// counts how many results passed vs failed
function passFailCounts(data) {
  const results = data.data.result;
  return results.reduce(
    (counts, item) => {
      if (item.grade > 0) {
        counts.pass = counts.pass + 1;
      } else {
        counts.fail = counts.fail + 1;
      }
      return counts;
    },
    { pass: 0, fail: 0 },
  );
}
