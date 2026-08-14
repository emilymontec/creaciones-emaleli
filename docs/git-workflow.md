# Flujo de trabajo Git

## Convención de commits (Conventional Commits)

Formato:

```
<type>(<scope>): <descripción>
```

| Type      | Uso                                  |
|-----------|--------------------------------------|
| `feat`    | Nueva funcionalidad                  |
| `fix`     | Corrección de errores                |
| `docs`    | Documentación                        |
| `refactor`| Cambio que no agrega funcionalidad   |
| `chore`   | Tareas de mantenimiento              |
| `test`    | Pruebas                              |
| `style`   | Formato, sin cambios de lógica       |
| `perf`    | Optimizaciones de rendimiento        |
| `build`   | Build y dependencias                 |
| `ci`      | Configuración de CI                  |

Ejemplos:

```
feat(categorias): CRUD de categorías
fix(categorias): validar slug duplicado
docs: documentar arquitectura en docs/
chore: instalar tsx como dependencia de seed
```

## Estrategia de ramas

```txt
main          → producción (desplegable)
  └ develop   → integración (work-in-progress)
      └ feature/<nombre> → trabajo por funcionalidad
```

- `main`: solo a través de PRs de `develop` (o hotfix). Siempre estable.
- `develop`: rama de integración; aquí converge el trabajo de las features.
- `feature/<nombre>`: una por funcionalidad/bug, con scope claro (`feature/catalogo-productos`).
- `hotfix/<nombre>`: correcciones urgentes sobre `main`.

## Flujo de trabajo

1. Crear rama desde `develop`: `git checkout develop && git pull && git checkout -b feature/<nombre>`.
2. Commits atómicos con mensajes Conventional Commits.
3. Push y PR hacia `develop`.
4. Revisión y merge (squash) cuando pasa CI y revisión manual.
5. Cuando una fase se cierra, `develop` → `main` con un commit de release (`chore: release fase X`).

## Notas

- No commitear secretos: `.env*` está en `.gitignore`.
- Commits pequeños y atómicos; un commit = un cambio lógico.
- Mensajes en español para descripciones, tipo en inglés (estándar Conventional Commits).
