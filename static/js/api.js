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

// finds the module event this user is enrolled in
async function fetchModuleEventId() {
  const userResult = await runQuery("{ user { id } }");
  const myId = userResult.data.user[0].id;
  const eventResult = await runQuery(
    `{ event(where: { path: { _eq: "/bahrain/bh-module" }, users: { id: { _eq: ${myId} } } }) { id } }`,
  );
  return eventResult.data.event[0].id;
}

// gets all xp-type transactions for the user, scoped to their module event
async function fetchXP() {
  const eventId = await fetchModuleEventId();
  return runQuery(
    `{ transaction(where: { type: { _eq: "xp" }, eventId: { _eq: ${eventId} } }, order_by: { createdAt: asc }) { amount createdAt objectId } }`,
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

// keeps only the latest xp transaction per project (later resubmissions override earlier ones)
function cleanXP(data) {
  const transactions = data.data.transaction;
  const latestByObject = {};
  transactions.forEach((tx) => {
    latestByObject[tx.objectId] = tx;
  });
  const cleaned = Object.values(latestByObject)
    .filter((tx) => tx.amount > 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
