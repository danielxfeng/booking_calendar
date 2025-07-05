export function GET(request: Request) {
  const url = new URL(request.url);
  const start = url.searchParams.get('start');
  return new Response(`Hello from Vercel! + ${start}`);
}
