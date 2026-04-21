# FrogMarket Demo

Tienda mínima para probar FrogPay de extremo a extremo.

## Qué prueba
- Creación de pagos contra el backend de FrogPay.
- Envío de `x-api-key` por tenant.
- Flujos con `card`, `paypal` y `mock`.
- Guardado opcional de settings en el navegador.

## Cómo usar
1. Levanta el backend de FrogPay.
2. Ejecuta esta tienda con:

```bash
node server.js
```

3. Abre `http://localhost:4173`.
4. Pega la API key real del tenant obtenida al registrarte o iniciar sesión.
5. Agrega productos y paga.

## Notas
- Para pagos con tarjeta, el campo `card_token` usa por defecto `4242424242424242`.
- Para PayPal, el backend debe tener credenciales configuradas.
- Si quieres probar fallos, cambia el proveedor o usa el backend con un tenant sin plan suficiente.
