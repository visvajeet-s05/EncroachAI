export const VALID_ROUTES = [
  '/',
  '/about',
  '/tool'
] as const;

export type AppRoute = typeof VALID_ROUTES[number];

export function isValidRoute(route: string): route is AppRoute {
  return VALID_ROUTES.includes(route as AppRoute);
}
