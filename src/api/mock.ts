export async function mockResponse<T>(value: T) {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return JSON.parse(JSON.stringify(value)) as T;
}
