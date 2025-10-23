-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: easyfit
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `meeting_registrations`
--

DROP TABLE IF EXISTS `meeting_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meeting_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('active','waiting','cancelled','pending','checked_in') NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `check_in_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `meeting_registrations_ibfk_1` (`meeting_id`),
  KEY `meeting_registrations_ibfk_2` (`user_id`),
  CONSTRAINT `meeting_registrations_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`),
  CONSTRAINT `meeting_registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting_registrations`
--

LOCK TABLES `meeting_registrations` WRITE;
/*!40000 ALTER TABLE `meeting_registrations` DISABLE KEYS */;
INSERT INTO `meeting_registrations` VALUES (8,2,4,'active','2025-04-02 22:53:09',NULL),(11,2,5,'active','2025-05-03 21:30:09',NULL),(14,1,3,'active','2025-09-08 19:06:46',NULL),(15,1,2,'active','2025-09-08 19:06:46',NULL),(16,1,4,'active','2025-09-08 19:06:46',NULL),(17,1,1,'active','2025-09-08 19:06:46',NULL),(18,5,3,'active','2025-09-08 19:52:59',NULL),(19,5,1,'active','2025-09-08 19:52:59',NULL),(20,4,3,'active','2025-09-08 19:53:57',NULL),(31,9,8,'active','2025-09-21 08:49:57',NULL),(32,9,1,'cancelled','2025-09-21 08:49:57',NULL),(33,9,3,'active','2025-09-21 08:50:42',NULL),(38,10,3,'active','2025-09-25 14:21:46',NULL),(45,11,1,'active','2025-09-25 15:34:58',NULL),(46,11,8,'active','2025-09-25 15:34:58',NULL),(47,11,3,'active','2025-09-25 15:34:58',NULL),(49,26,1,'cancelled','2025-09-27 18:06:12',NULL),(50,26,3,'active','2025-09-27 18:06:12',NULL),(51,27,1,'cancelled','2025-09-27 18:09:44',NULL),(52,27,3,'active','2025-09-27 18:09:44',NULL),(54,28,1,'active','2025-09-27 18:20:16',NULL),(60,29,3,'checked_in','2025-09-28 12:52:11','2025-09-28 15:54:44'),(63,30,3,'active','2025-09-28 15:03:41',NULL),(64,12,3,'active','2025-10-03 12:50:33',NULL);
/*!40000 ALTER TABLE `meeting_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetings`
--

DROP TABLE IF EXISTS `meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meetings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `studio_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `trainer_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `room_id` int(11) NOT NULL,
  `participant_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `trainer_arrival_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trainer_id` (`trainer_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `meetings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings`
--

LOCK TABLES `meetings` WRITE;
/*!40000 ALTER TABLE `meetings` DISABLE KEYS */;
INSERT INTO `meetings` VALUES (1,1,'פילאטיס למתחילים',2,'2025-08-17','10:00:00','11:00:00',1,4,'2025-01-07 19:21:02',NULL),(2,1,'יוגה מתקדמים',3,'2025-08-15','12:00:00','13:30:00',2,12,'2025-01-07 19:21:02',NULL),(3,1,'פילאטיס מתקדמים',3,NULL,'15:00:00','16:00:00',1,5,'2025-01-07 19:21:02',NULL),(4,1,'אימון+',3,'2025-08-21','21:01:00','22:01:00',1,1,'2025-08-18 20:05:19','2025-08-19 20:00:50'),(5,1,'בית',3,'2025-08-17','10:00:00','11:00:00',2,2,'2025-09-08 19:08:34',NULL),(6,1,'כככ',2,'2025-08-17','18:00:00','19:00:00',1,0,'2025-09-08 19:10:39',NULL),(7,1,'גגג',3,'2025-08-17','14:00:00','15:00:00',2,0,'2025-09-08 19:11:00',NULL),(8,1,'עעע',2,'2025-09-08','19:30:00','20:30:00',1,0,'2025-09-08 19:59:18',NULL),(9,1,'ססס',2,'2025-09-22','10:30:00','11:30:00',2,2,'2025-09-21 07:09:49',NULL),(10,1,'yyyy',10,'2025-09-26','09:00:00','10:00:00',2,1,'2025-09-25 06:47:28',NULL),(11,1,'pppp',2,'2025-09-26','09:00:00','10:00:00',1,3,'2025-09-25 06:48:01',NULL),(12,1,'אימון+',2,'2025-10-26','13:00:00','14:00:00',1,1,'2025-09-25 07:33:12',NULL),(22,1,'ללל',2,'2025-09-26','11:30:00','12:30:00',1,0,'2025-09-25 15:30:05',NULL),(23,1,'מממ',10,'2025-09-26','13:00:00','14:00:00',3,0,'2025-09-25 15:32:00',NULL),(26,1,'אימון+',10,'2025-09-28','13:30:00','14:30:00',1,1,'2025-09-27 18:06:12',NULL),(27,1,'אימון+',10,'2025-09-28','13:30:00','14:30:00',2,1,'2025-09-27 18:09:44',NULL),(28,1,'אימון+',2,'2025-09-28','15:30:00','16:30:00',1,1,'2025-09-27 18:20:10',NULL),(29,1,'עעע',3,'2025-09-28','15:54:00','16:54:00',2,1,'2025-09-27 18:21:42','2025-09-28 14:57:32'),(30,1,'עעע',2,'2025-09-29','14:00:00','15:00:00',2,1,'2025-09-28 15:02:34',NULL);
/*!40000 ALTER TABLE `meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'admin'),(1,'member'),(4,'owner'),(2,'trainer');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `studio_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `has_equipment` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'Studio A',10,1,1,'2025-01-07 19:20:36'),(2,1,'Studio B',2,1,1,'2025-01-07 19:20:36'),(3,1,'Studio C',8,1,0,'2025-01-07 19:20:36'),(4,4,'kkk',5,1,1,'2025-10-12 17:47:43');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studio_operating_hours`
--

DROP TABLE IF EXISTS `studio_operating_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `studio_operating_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `studio_id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `studio_id` (`studio_id`),
  CONSTRAINT `studio_operating_hours_ibfk_1` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studio_operating_hours`
--

LOCK TABLES `studio_operating_hours` WRITE;
/*!40000 ALTER TABLE `studio_operating_hours` DISABLE KEYS */;
INSERT INTO `studio_operating_hours` VALUES (14,1,1,'06:00:00','23:00:00'),(15,1,2,'06:00:00','22:00:00'),(16,1,3,'06:00:00','23:00:00'),(17,1,4,'06:00:00','23:00:00'),(18,1,5,'06:00:00','23:00:00'),(19,1,6,'07:00:00','16:00:00'),(20,1,0,'00:00:00','00:00:00'),(28,4,1,'07:00:00','23:00:00'),(29,4,2,'08:00:00','22:00:00'),(30,4,3,'09:00:00','23:00:00'),(31,4,4,'00:00:00','00:00:00'),(32,4,5,'00:00:00','00:00:00'),(33,4,6,'00:00:00','00:00:00'),(34,4,0,'00:00:00','00:00:00');
/*!40000 ALTER TABLE `studio_operating_hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studios`
--

DROP TABLE IF EXISTS `studios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `studios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `subscription_status` varchar(50) NOT NULL DEFAULT 'trialing',
  `trial_ends_at` datetime DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studios`
--

LOCK TABLES `studios` WRITE;
/*!40000 ALTER TABLE `studios` DISABLE KEYS */;
INSERT INTO `studios` VALUES (1,'EasyFit Central TLV','דיזנגוף 123, תל אביב','03-555-1233','/images/studios/main.jpg','הלב הפועם של הכושר בעיר','2025-08-19 21:32:53','trialing',NULL,NULL),(2,'הסטודיו שלי',NULL,NULL,NULL,NULL,'2025-10-03 11:29:27','trialing','2025-10-17 14:29:27',NULL),(4,'שלי','Pika','0549774827',NULL,'הסטודיו הכי חזק בעיר','2025-10-08 06:54:36','trialing',NULL,NULL),(5,'פילאטיס','דיזינגוף','031234567',NULL,NULL,'2025-10-08 07:41:47','trialing','2025-10-22 10:41:47',NULL);
/*!40000 ALTER TABLE `studios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `studio_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`studio_id`,`role_id`),
  KEY `studio_id` (`studio_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`studio_id`) REFERENCES `studios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,1),(2,1,2),(3,1,1),(3,1,2),(4,5,3),(5,1,4),(6,4,3),(8,1,1),(10,1,2),(10,1,3),(11,2,3),(14,4,2);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(254) NOT NULL,
  `email` varchar(254) NOT NULL,
  `userName` varchar(100) NOT NULL,
  `phone` varchar(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `profile_picture_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `userName` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'יוסי כהן','yossi@example.com','user_1','0501234567','09ae0bc54b66c7892169d06c30778cdb','2025-01-07 19:19:56',NULL),(2,'שרה לוי','sara@example.com','user_2','0509876543','09ae0bc54b66c7892169d06c30778cdb','2025-01-07 19:19:56',NULL),(3,'מיכאל ברק','michael@example.com','user_3','0549774827','09ae0bc54b66c7892169d06c30778cdb','2025-01-07 19:19:56','/avatars/avatar-3-1759089363040.png'),(4,'דוד לוי','david@example.com','user_4','0549774827','hashed_password_4','2025-01-07 19:19:56',NULL),(5,'ציון עמר','zion0549774827@gmail.com','zion','0549674437','09ae0bc54b66c7892169d06c30778cdb','2025-04-15 21:45:21','/avatars/avatar-5-1759009254451.png'),(6,'נתי','n@n','nati','0501234567','8572cb4d3df58209ecb52bade81541c3','2025-06-11 17:10:16',NULL),(7,'z','z@z','z','1','3879186336b2b4a1ad89cadf910a5b19','2025-08-03 14:59:25',NULL),(8,'ברוך','b@b','b','1','8572cb4d3df58209ecb52bade81541c3','2025-09-19 14:10:54',NULL),(10,'דוד','d@d','dudu','1','8572cb4d3df58209ecb52bade81541c3','2025-09-25 07:43:22',NULL),(11,'אבי','a@a','avi',NULL,'8572cb4d3df58209ecb52bade81541c3','2025-10-03 11:29:27',NULL),(12,'zz','zz@z','zz',NULL,'8572cb4d3df58209ecb52bade81541c3','2025-10-05 23:15:18',NULL),(13,'יוסי קדוש','y@y','yosi',NULL,'8572cb4d3df58209ecb52bade81541c3','2025-10-08 06:54:36',NULL),(14,'lll','l@l','lll','0549774827','8572cb4d3df58209ecb52bade81541c3','2025-10-12 17:46:29',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-23 16:16:56
