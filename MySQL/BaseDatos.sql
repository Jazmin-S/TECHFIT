CREATE DATABASE  IF NOT EXISTS `techfit` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `techfit`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: techfit
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ejercicios`
--

DROP TABLE IF EXISTS `ejercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicios` (
  `id_ejercicio` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `categoria` enum('piernas','espalda','rehabilitacion','brazos','adultos_mayores') DEFAULT NULL,
  `ruta_imagen` varchar(255) DEFAULT NULL,
  `dificultad` enum('baja','media','alta') DEFAULT 'media',
  PRIMARY KEY (`id_ejercicio`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ejercicios`
--

LOCK TABLES `ejercicios` WRITE;
/*!40000 ALTER TABLE `ejercicios` DISABLE KEYS */;
INSERT INTO `ejercicios` VALUES (1,'Sentadilla básica','Sentadilla controlando rodillas y espalda.','piernas','img/sentadilla.jpg','media'),(2,'Postura de espalda recta','Ejercicio de alineación de columna.','espalda','img/espalda.jpg','baja'),(3,'Elevación de pierna','Ejercicio de rehabilitación de rodilla.','rehabilitacion','img/rodilla.jpg','baja');
/*!40000 ALTER TABLE `ejercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instrucciones_ejercicio`
--

DROP TABLE IF EXISTS `instrucciones_ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instrucciones_ejercicio` (
  `id_instruccion` int NOT NULL AUTO_INCREMENT,
  `id_ejercicio` int DEFAULT NULL,
  `instruccion` text NOT NULL,
  PRIMARY KEY (`id_instruccion`),
  KEY `id_ejercicio` (`id_ejercicio`),
  CONSTRAINT `instrucciones_ejercicio_ibfk_1` FOREIGN KEY (`id_ejercicio`) REFERENCES `ejercicios` (`id_ejercicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instrucciones_ejercicio`
--

LOCK TABLES `instrucciones_ejercicio` WRITE;
/*!40000 ALTER TABLE `instrucciones_ejercicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `instrucciones_ejercicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_postura`
--

DROP TABLE IF EXISTS `logs_postura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_postura` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_sesion` int DEFAULT NULL,
  `timestamp_segundo` int DEFAULT NULL,
  `postura` enum('correcta','incorrecta') DEFAULT NULL,
  `detalle` text,
  PRIMARY KEY (`id_log`),
  KEY `id_sesion` (`id_sesion`),
  CONSTRAINT `logs_postura_ibfk_1` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones` (`id_sesion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_postura`
--

LOCK TABLES `logs_postura` WRITE;
/*!40000 ALTER TABLE `logs_postura` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs_postura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_postura`
--

DROP TABLE IF EXISTS `mensajes_postura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_postura` (
  `id_mensaje` int NOT NULL AUTO_INCREMENT,
  `id_ejercicio` int DEFAULT NULL,
  `tipo` enum('correcto','incorrecto') DEFAULT NULL,
  `mensaje` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_mensaje`),
  KEY `id_ejercicio` (`id_ejercicio`),
  CONSTRAINT `mensajes_postura_ibfk_1` FOREIGN KEY (`id_ejercicio`) REFERENCES `ejercicios` (`id_ejercicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_postura`
--

LOCK TABLES `mensajes_postura` WRITE;
/*!40000 ALTER TABLE `mensajes_postura` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes_postura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retroalimentacion_sesion`
--

DROP TABLE IF EXISTS `retroalimentacion_sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retroalimentacion_sesion` (
  `id_feedback` int NOT NULL AUTO_INCREMENT,
  `id_sesion` int DEFAULT NULL,
  `repeticiones_correctas` int DEFAULT '0',
  `repeticiones_incorrectas` int DEFAULT '0',
  `postura_promedio` enum('buena','regular','mala') DEFAULT 'regular',
  `observaciones` text,
  PRIMARY KEY (`id_feedback`),
  KEY `id_sesion` (`id_sesion`),
  CONSTRAINT `retroalimentacion_sesion_ibfk_1` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones` (`id_sesion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retroalimentacion_sesion`
--

LOCK TABLES `retroalimentacion_sesion` WRITE;
/*!40000 ALTER TABLE `retroalimentacion_sesion` DISABLE KEYS */;
/*!40000 ALTER TABLE `retroalimentacion_sesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones`
--

DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones` (
  `id_sesion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `id_ejercicio` int DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `duracion_segundos` int DEFAULT NULL,
  `estado` enum('completada','incompleta') DEFAULT 'completada',
  PRIMARY KEY (`id_sesion`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_ejercicio` (`id_ejercicio`),
  CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `sesiones_ibfk_2` FOREIGN KEY (`id_ejercicio`) REFERENCES `ejercicios` (`id_ejercicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `tipo_usuario` enum('general','rehabilitacion','adulto_mayor') NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Jazmin Sarmiento','JAZMINSAR54@GMAIL.COM','Jazmin1234','general','2025-11-23 06:52:20'),(3,'Jazmin Sarmiento','jazminsarmiento25@gmail.com','Jazmin1?','general','2025-11-23 07:12:42');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24 14:39:52
