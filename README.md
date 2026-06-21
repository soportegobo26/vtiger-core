# vtiger-core

Imagen base Docker para vtiger CRM 8.4.0.

## Estructura

```
vtiger-core/
├── .github/workflows/
│   └── build-core.yml        # CI/CD: build y push a GHCR
├── apache/
│   └── vtiger.conf           # VirtualHost con AllowOverride All
├── config/
│   └── php.ini               # PHP optimizado para vtiger
├── vtiger-source/            # Codigo oficial vtiger 8.4.0 (SIN MODIFICAR)
│   └── .htaccess             # Rewrite rules
└── Dockerfile                # Imagen base con ONBUILD
```

## Uso

Esta imagen NUNCA se despliega directamente. Es la base para los repos cliente.

Cada repo cliente hace:

```dockerfile
FROM ghcr.io/soportegobo26/vtiger-core:latest
# El ONBUILD del core inyecta automaticamente:
# - custom-code/ → /var/www/html/
# - migrations/  → /var/www/html/migrations/
```

## Actualizar el core

Solo hacer push a `main`. El workflow build-core.yml publica la nueva imagen.
Los repos cliente deben hacer rebuild para heredar los cambios.

## Politica

- NO modificar `vtiger-source/` sin proceso de release aprobado
- NO agregar credenciales o `.env` al repo
- Toda personalizacion por cliente va en su propio repo `vtiger-client`