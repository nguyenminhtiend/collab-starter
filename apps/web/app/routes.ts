import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/documents.tsx'),
  route('documents/:docId', 'routes/documents.$docId.tsx'),
] satisfies RouteConfig;
