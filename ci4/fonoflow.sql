/*
 Navicat MySQL Data Transfer

 Source Server         : Alex
 Source Server Type    : MySQL
 Source Server Version : 100411
 Source Host           : localhost:3306
 Source Schema         : fonoflow

 Target Server Type    : MySQL
 Target Server Version : 100411
 File Encoding         : 65001

 Date: 10/03/2026 18:20:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cita_materiales
-- ----------------------------
DROP TABLE IF EXISTS `cita_materiales`;
CREATE TABLE `cita_materiales`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `cita_id` int UNSIGNED NOT NULL,
  `material` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cita_materiales_cita_id_foreign`(`cita_id`) USING BTREE,
  CONSTRAINT `cita_materiales_cita_id_foreign` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cita_materiales
-- ----------------------------

-- ----------------------------
-- Table structure for cita_objetivos
-- ----------------------------
DROP TABLE IF EXISTS `cita_objetivos`;
CREATE TABLE `cita_objetivos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `cita_id` int UNSIGNED NOT NULL,
  `objetivo` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `orden` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cita_objetivos_cita_id_foreign`(`cita_id`) USING BTREE,
  CONSTRAINT `cita_objetivos_cita_id_foreign` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cita_objetivos
-- ----------------------------

-- ----------------------------
-- Table structure for citas
-- ----------------------------
DROP TABLE IF EXISTS `citas`;
CREATE TABLE `citas`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` int UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `duracion` int NOT NULL DEFAULT 30,
  `precio` decimal(8, 2) NOT NULL DEFAULT 12.00,
  `estado` enum('programada','completada','cancelada','no_asistio') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'programada',
  `motivo_ausencia` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `reprogramar` tinyint(1) NULL DEFAULT NULL,
  `notas` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `citas_paciente_id_foreign`(`paciente_id`) USING BTREE,
  CONSTRAINT `citas_paciente_id_foreign` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of citas
-- ----------------------------

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `version` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `class` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `group` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `namespace` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `time` int NOT NULL,
  `batch` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES (1, '2024-01-01-000001', 'App\\Database\\Migrations\\CreatePacientesTable', 'default', 'App', 1772280348, 1);
INSERT INTO `migrations` VALUES (2, '2024-01-01-000002', 'App\\Database\\Migrations\\CreateCitasTable', 'default', 'App', 1772280348, 1);
INSERT INTO `migrations` VALUES (3, '2024-01-01-000003', 'App\\Database\\Migrations\\CreateSesionesTable', 'default', 'App', 1772280349, 1);

-- ----------------------------
-- Table structure for paciente_objetivos
-- ----------------------------
DROP TABLE IF EXISTS `paciente_objetivos`;
CREATE TABLE `paciente_objetivos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` int UNSIGNED NOT NULL,
  `objetivo` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `orden` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `paciente_objetivos_paciente_id_foreign`(`paciente_id`) USING BTREE,
  CONSTRAINT `paciente_objetivos_paciente_id_foreign` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of paciente_objetivos
-- ----------------------------
INSERT INTO `paciente_objetivos` VALUES (1, 1, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (2, 1, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (3, 2, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (4, 2, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (5, 3, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (6, 3, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (7, 4, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (8, 4, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (9, 5, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (10, 5, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (11, 6, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (12, 6, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (13, 7, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (14, 7, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (15, 8, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (16, 8, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (17, 9, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (18, 9, 'Aumentar vocabulario', 1);
INSERT INTO `paciente_objetivos` VALUES (19, 10, 'Mejorar pronunciación', 0);
INSERT INTO `paciente_objetivos` VALUES (20, 10, 'Aumentar vocabulario', 1);

-- ----------------------------
-- Table structure for paciente_patologias
-- ----------------------------
DROP TABLE IF EXISTS `paciente_patologias`;
CREATE TABLE `paciente_patologias`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` int UNSIGNED NOT NULL,
  `patologia` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `paciente_patologias_paciente_id_foreign`(`paciente_id`) USING BTREE,
  CONSTRAINT `paciente_patologias_paciente_id_foreign` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of paciente_patologias
-- ----------------------------
INSERT INTO `paciente_patologias` VALUES (1, 1, 'Deglución atípica');
INSERT INTO `paciente_patologias` VALUES (2, 1, 'Trastorno del espectro autista (TEA)');
INSERT INTO `paciente_patologias` VALUES (3, 2, 'Disfemia');
INSERT INTO `paciente_patologias` VALUES (4, 2, 'Tartamudez');
INSERT INTO `paciente_patologias` VALUES (5, 3, 'Trastorno del espectro autista (TEA)');
INSERT INTO `paciente_patologias` VALUES (6, 3, 'Disfonía');
INSERT INTO `paciente_patologias` VALUES (7, 4, 'Disfasia');
INSERT INTO `paciente_patologias` VALUES (8, 4, 'Patología prueba 3');
INSERT INTO `paciente_patologias` VALUES (9, 5, 'Disfasia');
INSERT INTO `paciente_patologias` VALUES (10, 5, 'Tartamudez');
INSERT INTO `paciente_patologias` VALUES (11, 6, 'Disfonía');
INSERT INTO `paciente_patologias` VALUES (12, 6, 'Patología prueba 2');
INSERT INTO `paciente_patologias` VALUES (13, 7, 'Disfonía');
INSERT INTO `paciente_patologias` VALUES (14, 7, 'Trastorno del espectro autista (TEA)');
INSERT INTO `paciente_patologias` VALUES (15, 8, 'Deglución atípica');
INSERT INTO `paciente_patologias` VALUES (16, 9, 'Dislalia');
INSERT INTO `paciente_patologias` VALUES (17, 10, 'Retraso del lenguaje');
INSERT INTO `paciente_patologias` VALUES (18, 10, 'Dislalia');
INSERT INTO `paciente_patologias` VALUES (19, 10, 'Trastorno del espectro autista (TEA)');

-- ----------------------------
-- Table structure for pacientes
-- ----------------------------
DROP TABLE IF EXISTS `pacientes`;
CREATE TABLE `pacientes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `tutor` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `telefono` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `fecha_nacimiento` date NULL DEFAULT NULL,
  `foto` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `notas` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_alta` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pacientes
-- ----------------------------
INSERT INTO `pacientes` VALUES (1, 'Lucas Pérez', 'Responsable Lucas', '600000001', 'lucas.p??rez@mail.com', '2016-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (2, 'María Rodríguez', 'Responsable María', '600000005', 'mar??a.rodr??guez@mail.com', '2013-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (3, 'Sofía García', 'Responsable Sofía', '600000006', 'sof??a.garc??a@mail.com', '2011-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (4, 'Mateo López', 'Responsable Mateo', '600000008', 'mateo.l??pez@mail.com', '2015-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (5, 'Emma Martínez', 'Responsable Emma', '600000009', 'emma.mart??nez@mail.com', '2011-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (6, 'Liam Sánchez', 'Responsable Liam', '600000002', 'liam.s??nchez@mail.com', '2015-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (7, 'Olivia Fernández', 'Responsable Olivia', '600000008', 'olivia.fern??ndez@mail.com', '2021-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (8, 'Noah Gómez', 'Responsable Noah', '600000003', 'noah.g??mez@mail.com', '2012-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:48', '2026-02-28 13:16:48', '2026-02-28 13:16:48', NULL);
INSERT INTO `pacientes` VALUES (9, 'Ava Díaz', 'Responsable Ava', '600000009', 'ava.d??az@mail.com', '2015-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:49', '2026-02-28 13:16:49', '2026-02-28 13:16:49', NULL);
INSERT INTO `pacientes` VALUES (10, 'Ethan Ruiz', 'Responsable Ethan', '600000003', 'ethan.ruiz@mail.com', '2012-02-28', NULL, 'Paciente de ejemplo.', 1, '2026-02-28 13:16:49', '2026-02-28 13:16:49', '2026-02-28 13:16:49', NULL);

-- ----------------------------
-- Table structure for sesion_actividades
-- ----------------------------
DROP TABLE IF EXISTS `sesion_actividades`;
CREATE TABLE `sesion_actividades`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sesion_id` int UNSIGNED NOT NULL,
  `actividad` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sesion_actividades_sesion_id_foreign`(`sesion_id`) USING BTREE,
  CONSTRAINT `sesion_actividades_sesion_id_foreign` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sesion_actividades
-- ----------------------------
INSERT INTO `sesion_actividades` VALUES (1, 1, 'Libro de la R');
INSERT INTO `sesion_actividades` VALUES (6, 2, 'Leer Libro');
INSERT INTO `sesion_actividades` VALUES (7, 2, 'Escribir Frases');

-- ----------------------------
-- Table structure for sesion_materiales
-- ----------------------------
DROP TABLE IF EXISTS `sesion_materiales`;
CREATE TABLE `sesion_materiales`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sesion_id` int UNSIGNED NOT NULL,
  `material` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sesion_materiales_sesion_id_foreign`(`sesion_id`) USING BTREE,
  CONSTRAINT `sesion_materiales_sesion_id_foreign` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sesion_materiales
-- ----------------------------
INSERT INTO `sesion_materiales` VALUES (1, 1, 'Libros Teo');
INSERT INTO `sesion_materiales` VALUES (2, 1, 'Arena');
INSERT INTO `sesion_materiales` VALUES (5, 2, 'Libro de la R');

-- ----------------------------
-- Table structure for sesion_objetivos
-- ----------------------------
DROP TABLE IF EXISTS `sesion_objetivos`;
CREATE TABLE `sesion_objetivos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sesion_id` int UNSIGNED NOT NULL,
  `objetivo` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `cumplido` tinyint(1) NOT NULL DEFAULT 0,
  `orden` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sesion_objetivos_sesion_id_foreign`(`sesion_id`) USING BTREE,
  CONSTRAINT `sesion_objetivos_sesion_id_foreign` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sesion_objetivos
-- ----------------------------
INSERT INTO `sesion_objetivos` VALUES (2, 1, 'Trabajar la R', 1, 0);
INSERT INTO `sesion_objetivos` VALUES (7, 2, 'Trabajar la R', 0, 0);
INSERT INTO `sesion_objetivos` VALUES (8, 2, 'Mejorar habla', 0, 1);

-- ----------------------------
-- Table structure for sesiones
-- ----------------------------
DROP TABLE IF EXISTS `sesiones`;
CREATE TABLE `sesiones`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` int UNSIGNED NOT NULL,
  `cita_id` int UNSIGNED NULL DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NULL DEFAULT NULL,
  `duracion` int NOT NULL DEFAULT 30,
  `precio` decimal(8, 2) NOT NULL DEFAULT 12.00,
  `evolutivo` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `observaciones` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sesiones_paciente_id_foreign`(`paciente_id`) USING BTREE,
  INDEX `sesiones_cita_id_foreign`(`cita_id`) USING BTREE,
  CONSTRAINT `sesiones_cita_id_foreign` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sesiones_paciente_id_foreign` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sesiones
-- ----------------------------
INSERT INTO `sesiones` VALUES (1, 9, NULL, '2026-02-28', NULL, 30, 12.00, NULL, NULL, '2026-02-28 13:18:23', '2026-02-28 13:19:02', NULL);
INSERT INTO `sesiones` VALUES (2, 9, NULL, '2026-03-04', '15:00:00', 30, 12.00, NULL, NULL, '2026-03-04 08:40:28', '2026-03-04 09:15:44', NULL);

SET FOREIGN_KEY_CHECKS = 1;
