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

function fetchUser() {
  return runQuery("{user { id login } }");
}

function fetchXP() {
  return runQuery('{transaction(where: {type: { _eq: "xp" } }) { amount} }');
}

function sumXP(data) {
  const transactions = data.data.transaction;
  return transactions.reduce((accumulator, currentItem) => {
    accumulator = accumulator + currentItem.amount;
    return accumulator;
  }, 0);
}

function fetchAuditRatio() {
  return runQuery("{ user { auditRatio totalUp totalDown } }");
}
