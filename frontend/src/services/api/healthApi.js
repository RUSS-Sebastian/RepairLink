export async function checkBackendHealth() {
  const response = await fetch("http://localhost:8080/api/health");

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  return response.text();
}
