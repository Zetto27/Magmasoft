DROP VIEW vista_trabajos_completa;


CREATE VIEW vista_trabajos_completa AS

SELECT

    t.id,
    t.codigo,
    t.cliente_nombre,
    t.cliente_telefono,

    o.nombre AS optica_nombre,

    t.tipo_lente,
    t.tratamiento,
    t.color,
    t.material,

    t.estado,

    e.nombre AS etapa_actual,

    u.user AS operario_nombre,

    t.fecha_creacion,
    t.fecha_estimada_entrega,
    t.fecha_entrega,

    t.observaciones

FROM trabajos t

LEFT JOIN opticas o
    ON t.optica_id = o.id

LEFT JOIN users u
    ON t.operario_actual_id = u.id

LEFT JOIN etapas_proceso e
    ON t.etapa_actual_id = e.id;
    
    SELECT * FROM vista_trabajos_completa;