

CREATE TABLE `Magmasoft`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user` VARCHAR(45) NOT NULL,
  `rol` VARCHAR(45) NOT NULL,
  `document` varchar(20) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `celular` Varchar(20) NOT NULL,
  `pass` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_UNIQUE` (`user` ASC) VISIBLE,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `celular_UNIQUE` (`celular` ASC) VISIBLE,
  UNIQUE INDEX `pass_UNIQUE` (`pass` ASC) VISIBLE);



CREATE TABLE archivos_trabajo (
    id INT AUTO_INCREMENT PRIMARY KEY,

    trabajo_id INT NOT NULL,

    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,

    tipo_archivo VARCHAR(50),
    tamano_kb INT,

    usuario_subida_id INT,

    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (trabajo_id) REFERENCES trabajos(id),
    FOREIGN KEY (usuario_subida_id) REFERENCES users(id)
);

CREATE TABLE trabajos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    codigo VARCHAR(20) UNIQUE NOT NULL,

    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20),

    optica_id INT NOT NULL,

    tipo_lente VARCHAR(50) NOT NULL,
    tratamiento VARCHAR(50),
    color VARCHAR(50),
    material VARCHAR(50),

    esfera_od DECIMAL(5,2),
    esfera_oi DECIMAL(5,2),

    cilindro_od DECIMAL(5,2),
    cilindro_oi DECIMAL(5,2),

    eje_od INT,
    eje_oi INT,

    adicion_val DECIMAL(5,2),

    dp VARCHAR(20),

    observaciones TEXT,

    etapa_actual_id INT DEFAULT 1,

    estado ENUM(
        'Pendiente',
        'En proceso',
        'Retrasado',
        'Finalizado',
        'Entregado'
    ) DEFAULT 'Pendiente',

    operario_actual_id INT NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_estimada_entrega DATETIME,
    fecha_entrega DATETIME NULL,

    FOREIGN KEY (optica_id) REFERENCES users(id),
    FOREIGN KEY (operario_actual_id) REFERENCES users(id)
);

CREATE TABLE etapas_proceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    orden_etapa INT NOT NULL,
    tiempo_estandar_minutos INT,
    color VARCHAR(20)
);


INSERT INTO etapas_proceso (nombre, orden_etapa, tiempo_estandar_minutos, color)
VALUES
('Recepción',1,15,'#22C55E'),
('Tallado',2,60,'#2563EB'),
('Tratamiento',3,120,'#8B5CF6'),
('Pulido',4,45,'#F59E0B'),
('Ensamble',5,30,'#14B8A6'),
('Validación',6,20,'#EC4899'),
('Entregado',7,10,'#16A34A');

CREATE TABLE historial_etapas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    trabajo_id INT NOT NULL,
    etapa_id INT NOT NULL,

    usuario_id INT NOT NULL,

    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,

    observacion TEXT,

    FOREIGN KEY (trabajo_id) REFERENCES trabajos(id),
    FOREIGN KEY (etapa_id) REFERENCES etapas_proceso(id),
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);

CREATE TABLE comentarios_trabajo (
    id INT AUTO_INCREMENT PRIMARY KEY,

    trabajo_id INT NOT NULL,
    usuario_id INT NOT NULL,

    etapa_id INT NULL,

    comentario TEXT NOT NULL,

    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (trabajo_id) REFERENCES trabajos(id),
    FOREIGN KEY (usuario_id) REFERENCES users(id),
    FOREIGN KEY (etapa_id) REFERENCES etapas_proceso(id)
);

ALTER TABLE trabajos
ADD CONSTRAINT fk_etapa_actual
FOREIGN KEY (etapa_actual_id) REFERENCES etapas_proceso(id);

INSERT INTO trabajos (
    codigo,
    cliente_nombre,
    optica_id,
    tipo_lente,
    etapa_actual_id
)
VALUES (
    'TR-001',
    'Juan Perez',
    1,
    'Monofocal',
    999
);

INSERT INTO trabajos (
    codigo,
    cliente_nombre,
    optica_id,
    tipo_lente,
    etapa_actual_id
)
VALUES (
    'TR-001',
    'Juan Perez',
    1,
    'Monofocal',
    1
);

INSERT INTO trabajos (
    codigo,
    cliente_nombre,
    cliente_telefono,
    optica_id,

    tipo_lente,
    tratamiento,
    color,
    material,

    esfera_od,
    esfera_oi,

    cilindro_od,
    cilindro_oi,

    eje_od,
    eje_oi,

    adicion_val,

    dp,

    observaciones,

    etapa_actual_id,
    estado,

    operario_actual_id,

    fecha_estimada_entrega
)
VALUES (
    'TR-002',
    'Carlos Mendoza',
    '3001234567',
    1,

    'Progresivo',
    'Antirreflejo',
    'Fotocromático',
    'Policarbonato',

    -2.50,
    -2.25,

    -0.75,
    -1.00,

    90,
    85,

    1.50,

    '62',

    'Cliente solicita entrega urgente y revisión especial.',

    1,
    'Pendiente',

    1,

    '2026-04-20 17:00:00'
);


-- Me deja ver nombre del operario 
SELECT 
    t.id,
    t.codigo,
    t.cliente_nombre,
    t.tipo_lente,
    t.estado,

    u.user AS operario_nombre,

    e.nombre AS etapa_actual

FROM trabajos t

LEFT JOIN users u 
    ON t.operario_actual_id = u.id

LEFT JOIN etapas_proceso e
    ON t.etapa_actual_id = e.id;
    
    
-- CRear vista 

CREATE VIEW vista_trabajos_completa AS
SELECT 
    t.id,
    t.codigo,
    t.cliente_nombre,
    t.cliente_telefono,
    t.tipo_lente,
    t.estado,
    u.user AS operario_nombre,
    e.nombre AS etapa_actual
FROM trabajos t
LEFT JOIN users u ON t.operario_actual_id = u.id
LEFT JOIN etapas_proceso e ON t.etapa_actual_id = e.id;

-- vista
SELECT * FROM vista_trabajos_completa;