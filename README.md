# Sistema de Cifrado y Descifrado Automático (Al-Kindi)

## Descripción
Este sistema permite cifrar y descifrar mensajes utilizando los algoritmos clásicos César y Atbash. Incorpora un motor de descifrado automático basado en el análisis de frecuencias Chi-Cuadrado ($\chi^2$), desarrollado originalmente por el matemático **Al-Kindi** (أبو يوسف يعقوب بن إسحاق الكندي), eliminando la necesidad de intervención humana para determinar la clave o el algoritmo utilizado.

## Características
- **Alfabeto dinámico:** Soporta caracteres ASCII y personalizados.
- **Cifrado César y Atbash:** Desplazamiento configurable por grupos (letras, números y símbolos).
- **Descifrado automatizado:** Análisis estadístico para determinar la mejor coincidencia lingüística.

## Seguridad y Buenas Prácticas
- Publicado mediante el protocolo seguro **HTTPS**.
- Código limpio de claves privadas o credenciales sensibles.
- Sin dependencias de librerías externas para evitar vulnerabilidades de cadena de suministro.
