### Vulnerabilidades conocidas (aceptadas)
- **GHSA-qwww-vcr4-c8h2** (react-router, CSRF en modo RSC): no aplica a este proyecto.
  El frontend usa React Router en modo SPA tradicional (`BrowserRouter`/`Routes`),
  sin RSC ni Framework Mode. Se evaluará el upgrade a v8 cuando se revisen los
  breaking changes con más tiempo.