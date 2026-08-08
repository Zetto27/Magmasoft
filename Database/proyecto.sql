USE Magmasoft;

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(45) NOT NULL,
  `document` varchar(20) NOT NULL,
  `email` varchar(45) NOT NULL,
  `celular` varchar(20) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `phone_UNIQUE` (`celular`),
  UNIQUE KEY `user_UNIQUE` (`user`),
  KEY `fk_users_roles` (`rol_id`),
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `opticas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `trabajos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `cliente_nombre` varchar(100) NOT NULL,
  `cliente_telefono` varchar(20) DEFAULT NULL,
  `optica_id` int NOT NULL,
  `tipo_lente` varchar(50) NOT NULL,
  `tratamiento` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `material` varchar(50) DEFAULT NULL,
  `esfera_od` decimal(5,2) DEFAULT NULL,
  `esfera_oi` decimal(5,2) DEFAULT NULL,
  `cilindro_od` decimal(5,2) DEFAULT NULL,
  `cilindro_oi` decimal(5,2) DEFAULT NULL,
  `eje_od` int DEFAULT NULL,
  `eje_oi` int DEFAULT NULL,
  `adicion_val` decimal(5,2) DEFAULT NULL,
  `dp` varchar(20) DEFAULT NULL,
  `observaciones` text,
  `etapa_actual_id` int DEFAULT '1',
  `estado` enum('Pendiente','En proceso','Retrasado','Finalizado','Entregado') DEFAULT 'Pendiente',
  `operario_actual_id` int DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_estimada_entrega` datetime DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `fk_etapa_actual` (`etapa_actual_id`),
  KEY `fk_trabajos_optica` (`optica_id`),
  KEY `fk_trabajos_operario` (`operario_actual_id`),
  CONSTRAINT `fk_etapa_actual` FOREIGN KEY (`etapa_actual_id`) REFERENCES `etapas_proceso` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_trabajos_operario` FOREIGN KEY (`operario_actual_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_trabajos_optica` FOREIGN KEY (`optica_id`) REFERENCES `opticas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_eje_od` CHECK (((`eje_od` is null) or (`eje_od` between 0 and 180))),
  CONSTRAINT `chk_eje_oi` CHECK (((`eje_oi` is null) or (`eje_oi` between 0 and 180)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `historial_etapas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trabajo_id` int NOT NULL,
  `etapa_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha_inicio` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_fin` datetime DEFAULT NULL,
  `observacion` text,
  PRIMARY KEY (`id`),
  KEY `historial_etapas_ibfk_1` (`trabajo_id`),
  KEY `historial_etapas_ibfk_2` (`etapa_id`),
  KEY `historial_etapas_ibfk_3` (`usuario_id`),
  CONSTRAINT `historial_etapas_ibfk_1` FOREIGN KEY (`trabajo_id`) REFERENCES `trabajos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `historial_etapas_ibfk_2` FOREIGN KEY (`etapa_id`) REFERENCES `etapas_proceso` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `historial_etapas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `etapas_proceso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `orden_etapa` int NOT NULL,
  `tiempo_estandar_minutos` int DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_tiempo_estandar` CHECK ((`tiempo_estandar_minutos` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `comentarios_trabajo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trabajo_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `etapa_id` int DEFAULT NULL,
  `comentario` text NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `comentarios_trabajo_ibfk_1` (`trabajo_id`),
  KEY `comentarios_trabajo_ibfk_2` (`usuario_id`),
  KEY `comentarios_trabajo_ibfk_3` (`etapa_id`),
  CONSTRAINT `comentarios_trabajo_ibfk_1` FOREIGN KEY (`trabajo_id`) REFERENCES `trabajos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comentarios_trabajo_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `comentarios_trabajo_ibfk_3` FOREIGN KEY (`etapa_id`) REFERENCES `etapas_proceso` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `archivos_trabajo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trabajo_id` int NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tipo_archivo` varchar(50) DEFAULT NULL,
  `tamano_kb` int DEFAULT NULL,
  `usuario_subida_id` int DEFAULT NULL,
  `fecha_subida` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `archivos_trabajo_ibfk_1` (`trabajo_id`),
  KEY `archivos_trabajo_ibfk_2` (`usuario_subida_id`),
  CONSTRAINT `archivos_trabajo_ibfk_1` FOREIGN KEY (`trabajo_id`) REFERENCES `trabajos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `archivos_trabajo_ibfk_2` FOREIGN KEY (`usuario_subida_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_tamano_archivo` CHECK (((`tamano_kb` is null) or (`tamano_kb` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Control total del sistema'),
('Supervisor', 'Supervisa el proceso de producción'),
('Operario', 'Realiza las etapas del laboratorio');

-- Vistas 
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `magmasoft`.`vista_trabajos_completa` AS select `t`.`id` AS `id`,`t`.`codigo` AS `codigo`,`t`.`cliente_nombre` AS `cliente_nombre`,`t`.`cliente_telefono` AS `cliente_telefono`,`o`.`nombre` AS `optica_nombre`,`t`.`tipo_lente` AS `tipo_lente`,`t`.`tratamiento` AS `tratamiento`,`t`.`color` AS `color`,`t`.`material` AS `material`,`t`.`esfera_od` AS `esfera_od`,`t`.`cilindro_od` AS `cilindro_od`,`t`.`eje_od` AS `eje_od`,`t`.`esfera_oi` AS `esfera_oi`,`t`.`cilindro_oi` AS `cilindro_oi`,`t`.`eje_oi` AS `eje_oi`,`t`.`adicion_val` AS `adicion_val`,`t`.`dp` AS `dp`,`t`.`estado` AS `estado`,`ep`.`nombre` AS `etapa_actual`,`u`.`user` AS `operario_nombre`,`t`.`fecha_creacion` AS `fecha_creacion`,`t`.`fecha_estimada_entrega` AS `fecha_estimada_entrega`,`t`.`fecha_entrega` AS `fecha_entrega`,`t`.`observaciones` AS `observaciones` from (((`magmasoft`.`trabajos` `t` left join `magmasoft`.`opticas` `o` on((`t`.`optica_id` = `o`.`id`))) left join `magmasoft`.`etapas_proceso` `ep` on((`t`.`etapa_actual_id` = `ep`.`id`))) left join `magmasoft`.`users` `u` on((`t`.`operario_actual_id` = `u`.`id`)));
