-- ---------------------------------------------------------------------------
-- Ambito nuevo: el Memorandum de Inversion
--
-- Es el escalon anterior al Documento Maestro. Un prospecto deja su correo
-- despues del sales pitch y recibe `memorandum`; tras la reunion se le añade
-- `document` a la misma fila, sin que tenga que volver a registrarse.
--
-- Son dos ambitos y no un nivel de acceso numerico a proposito: no siempre
-- van a ser escalones de la misma escalera, y `camila` ya demuestra que un
-- ambito puede no tener nada que ver con los otros.
-- ---------------------------------------------------------------------------

alter type altec_scope add value if not exists 'memorandum';
