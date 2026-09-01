export function GET(request: Request) {
  return Response.redirect(new URL("/vision-pen", request.url), 308);
}
