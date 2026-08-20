// logs in with basic auth and returns the jwt
async function login(username, password) {
  const url = "https://learn.reboot01.com/api/auth/signin";
  const credentials = btoa(username + ":" + password);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + credentials,
    },
  });
  if (response.ok) {
    const token = await response.text();
    return JSON.parse(token);
  } else {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }
}
