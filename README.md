# 🏆 Torneo de Integrales — Banco Colaborativo de Ejercicios
### Organizado por Club MatEs, AEFIEC e IEEE-HKN Nu Zeta (ESPOL)

Plataforma web para la **recolección, curación, categorización y administración de integrales matemáticas** para el Concurso de Integrales estilo *MIT Integration Bee*.

---

## 🎯 Propósito del Proyecto

Esta herramienta está diseñada para el **equipo organizador y colaboradores académicos**. Permite:
1. **Subir y curar ejercicios de integrales** en formato texto estándar con renderizado matemático **KaTeX** ultrarrápido en tiempo real.
2. **Control de Acceso Jerárquico por Nivel de Dificultad**:
   - **Nivel Básico (Fase 1 - Clasificación):** Acceso restringido exclusivamente a integrales de dificultad baja.
   - **Nivel Medio (Fase 2 - Eliminatorias de 16 y 8):** Acceso a integrales de dificultad básica y media.
   - **Nivel Difícil (Fase 3 - Semifinales y Gran Final):** Acceso completo a dificultad difícil, media y básica.
   - **Administrador Académico:** Auditoría y gestión completa del banco.
3. **Registro de Criterios del Jurado:** Solución oficial, formas algebraicamente equivalentes aceptadas, fuente bibliográfica (Spivak, Dimidovich, MIT Bee) y notas técnicas.
4. **Modo Proyector para Duelos (Escalable para el día del evento):** Vista limpia en pantalla completa con cronómetro configurable (10 minutos para Fase 2, 5 minutos para Fase 3) y revelación de solución bajo demanda.

---

## 🚀 Despliegue en GitHub Pages

La plataforma está configurada para compilarse y desplegarse automáticamente en GitHub Pages mediante GitHub Actions en cada actualización a la rama `main`:

* **URL en vivo:** [https://edukn17.github.io/torneo-integrales/](https://edukn17.github.io/torneo-integrales/)

---

## ⚙️ Conexión con Supabase (Opción A)

La plataforma funciona inmediatamente tanto en **Modo Local / Demostración** como conectada a una base de datos PostgreSQL en tiempo real con **Supabase** y políticas de seguridad por fila (**Row Level Security - RLS**):

### Pasos para conectar Supabase:
1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto gratuito.
2. Abre la pestaña **SQL Editor** en tu panel de Supabase.
3. Copia y pega el contenido del archivo [`supabase/schema.sql`](supabase/schema.sql) y haz clic en **Run**.
4. En **Project Settings > API**, copia el **Project URL** y la **Anon Key**.
5. Pégalos en el modal de configuración de la plataforma web (icono de base de datos en la barra superior) o en un archivo `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 👥 Créditos y Organización
* **Club MatEs** — Escuela Superior Politécnica del Litoral (ESPOL).
* **AEFIEC** — Asociación de Estudiantes de la FIEC.
* **IEEE-HKN Nu Zeta Chapter**.
