export const VALID_ROUTES = [
  '/',
  '/problem',
  '/architecture',
  '/demo',
  '/simulation',
  '/results',
  '/methodology',
  '/about'
] as const;

export type AppRoute = typeof VALID_ROUTES[number];

export function isValidRoute(route: string): route is AppRoute {
  return VALID_ROUTES.includes(route as AppRoute);
}
