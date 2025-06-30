-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_energy
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `admin_audit_logs`
--

DROP TABLE IF EXISTS `admin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_logs` (
  `id` char(36) NOT NULL,
  `admin_id` char(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `previous_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_audit_logs_admin_id` (`admin_id`),
  CONSTRAINT `admin_audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_logs`
--

LOCK TABLES `admin_audit_logs` WRITE;
/*!40000 ALTER TABLE `admin_audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anomalies`
--

DROP TABLE IF EXISTS `anomalies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anomalies` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `device_id` char(36) DEFAULT NULL,
  `anomaly_type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `detected_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_resolved` tinyint(1) DEFAULT '0',
  `resolution_notes` text,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `device_id` (`device_id`),
  KEY `idx_anomalies_user_id` (`user_id`),
  CONSTRAINT `anomalies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `anomalies_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anomalies`
--

LOCK TABLES `anomalies` WRITE;
/*!40000 ALTER TABLE `anomalies` DISABLE KEYS */;
/*!40000 ALTER TABLE `anomalies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_types`
--

DROP TABLE IF EXISTS `device_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_types` (
  `type` varchar(50) NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_types`
--

LOCK TABLES `device_types` WRITE;
/*!40000 ALTER TABLE `device_types` DISABLE KEYS */;
INSERT INTO `device_types` VALUES ('air_conditioner'),('computer'),('dishwasher'),('lighting'),('other'),('oven'),('refrigerator'),('television'),('washing_machine'),('water_heater');
/*!40000 ALTER TABLE `device_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `device_type` varchar(50) NOT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `energy_efficiency_class` varchar(10) DEFAULT NULL,
  `power_consumption_watts` int DEFAULT NULL,
  `usage_frequency_hours_per_day` decimal(5,2) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usage_days_per_week` int DEFAULT '7',
  `location` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `device_type` (`device_type`),
  KEY `energy_efficiency_class` (`energy_efficiency_class`),
  KEY `idx_devices_user_id` (`user_id`),
  CONSTRAINT `devices_ibfk_2` FOREIGN KEY (`device_type`) REFERENCES `device_types` (`type`),
  CONSTRAINT `devices_ibfk_3` FOREIGN KEY (`energy_efficiency_class`) REFERENCES `energy_efficiency_classes` (`class`),
  CONSTRAINT `devices_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES ('18e74002-5801-4b8b-9ad7-84276da9d267','8772391f-9882-4e57-9a16-20eb10d7b6d6','Arçelik Çamaşır Makinesi','washing_machine','Arçelik','10140','A',1000,2.00,NULL,'2025-04-28 12:16:22','2025-04-28 12:16:22',2,NULL),('2f967624-8eeb-4d19-b462-523cb2c9fbff','8772391f-9882-4e57-9a16-20eb10d7b6d6','arçelik fırın','oven','Arçelik','508','A+',2500,1.00,NULL,'2025-04-29 10:53:30','2025-04-29 10:53:30',1,NULL),('356c1ac2-7164-4eeb-9173-cab91d3c5cfe','8772391f-9882-4e57-9a16-20eb10d7b6d6','siemens fırın','oven','siemens','508','A+++',2500,1.00,NULL,'2025-04-29 11:01:39','2025-04-29 11:01:39',2,NULL),('a1a04270-dee8-4151-8dad-e1c643de4089','8772391f-9882-4e57-9a16-20eb10d7b6d6','siemens bulaşık makinesi','dishwasher','siemens','49','A',1300,3.00,NULL,'2025-04-26 15:46:11','2025-04-26 15:46:11',2,NULL),('cf70acae-cf2b-48b1-84e8-9d00cf0e66cb','80287e10-16a2-4046-8227-14f83a4d5b85','arçelik fırın','oven','Arçelik','123','C',2500,3.00,NULL,'2025-05-13 11:14:33','2025-05-13 11:14:33',4,'kitchen'),('dafe6ec6-2411-435a-87e2-11f79c23cc1d','8772391f-9882-4e57-9a16-20eb10d7b6d6','samsung tv','television','samsung','q57','A',150,6.00,NULL,'2025-04-26 16:53:49','2025-04-26 16:53:49',7,NULL);
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `energy_consumption`
--

DROP TABLE IF EXISTS `energy_consumption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `energy_consumption` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `device_id` char(36) DEFAULT NULL,
  `consumption_kwh` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `reading_date` date NOT NULL,
  `reading_time` time DEFAULT NULL,
  `is_manual_entry` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_energy_consumption_user_id` (`user_id`),
  KEY `idx_energy_consumption_device_id` (`device_id`),
  KEY `idx_energy_consumption_reading_date` (`reading_date`),
  CONSTRAINT `energy_consumption_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `energy_consumption_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `energy_consumption`
--

LOCK TABLES `energy_consumption` WRITE;
/*!40000 ALTER TABLE `energy_consumption` DISABLE KEYS */;
INSERT INTO `energy_consumption` VALUES ('046c3663-2b77-493b-99e7-13f7c18c08e4','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.75,NULL,'2025-04-22','04:30:00',0,'2025-04-22 10:30:24'),('04a38ec9-d635-46f8-83d5-637bee61cb27','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-12','12:00:00',0,'2025-04-20 13:09:19'),('0767e872-16df-4466-a28b-7dbc350575cf','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.75,NULL,'2025-04-23','14:00:00',0,'2025-04-22 09:05:01'),('24d893dc-313b-48e9-b54d-6f056cfc8ef4','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.45,NULL,'2025-04-22','11:00:00',0,'2025-04-20 12:55:12'),('2d654903-852d-4587-a1b7-fd1ac1dd9005','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-07','12:00:00',0,'2025-04-20 13:09:19'),('2e6f1ba7-4389-4a10-a532-c2b18033ccd2','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.36,NULL,'2025-04-21','03:00:00',0,'2025-04-21 16:08:44'),('32fc2f75-d51b-45e4-9365-a1c54ba4c8ba','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-15','12:00:00',0,'2025-04-20 13:09:19'),('348b698f-dca5-4fee-abee-08cac7d24389','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-01','12:00:00',0,'2025-04-20 13:09:19'),('372127dd-26bb-4747-ac46-d87ae2e00cbd','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.45,NULL,'2025-04-21','11:00:00',0,'2025-04-20 12:55:12'),('46d45e9f-7f5a-4401-8b14-e127efd167aa','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-11','12:00:00',0,'2025-04-20 13:09:19'),('50ff48d3-5ac5-40c0-ad82-fa04d926f646','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-24','12:00:00',0,'2025-04-20 13:09:19'),('54da59e9-23c5-44b3-801e-3d3883883a65','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-25','12:00:00',0,'2025-04-20 13:09:19'),('5e088503-0a6a-4b3d-8060-5ab3b76a536c','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-09','12:00:00',0,'2025-04-20 13:09:19'),('639432e3-5fe3-431f-8a8d-cc6528174810','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-19','12:00:00',0,'2025-04-20 13:09:19'),('645509dc-8909-47b4-88ab-ba182158ba3f','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-20','12:00:00',0,'2025-04-20 13:09:19'),('6644a9d6-c88e-445d-9a96-59e732cb0346','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.75,NULL,'2025-04-23','04:30:00',0,'2025-04-22 10:30:24'),('6b57069b-9975-4ea6-9207-64a79799ddf7','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-02','12:00:00',0,'2025-04-20 13:09:19'),('74131df3-beb1-4804-837b-a311523eece4','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.45,NULL,'2025-04-20','11:00:00',0,'2025-04-20 12:55:12'),('76d60499-ffe3-4be3-9822-512f1606ee85','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-22','12:00:00',0,'2025-04-20 13:09:19'),('77bf51e7-6506-4577-9f13-6bb7553309bb','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-14','12:00:00',0,'2025-04-20 13:09:19'),('795ce1b9-88a1-48b3-bdf9-e315e6944787','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-21','12:00:00',0,'2025-04-20 13:09:19'),('8cf09787-3131-4147-91cf-3e6699a99be7','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-03','12:00:00',0,'2025-04-20 13:09:19'),('93e2c526-1bb8-4358-8091-f639bdb37047','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-10','12:00:00',0,'2025-04-20 13:09:19'),('9a2f2cc4-30ed-45d7-a8f7-4f9f2abfb6be','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-13','12:00:00',0,'2025-04-20 13:09:19'),('aafe7de4-2de9-4fb4-80d9-927adb13102c','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-16','12:00:00',0,'2025-04-20 13:09:19'),('b05be0eb-826f-4f96-89f6-a949a4a489ca','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-05','12:00:00',0,'2025-04-20 13:09:19'),('b7affb17-47c8-4a85-a2de-e6d4055a0769','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-17','12:00:00',0,'2025-04-20 13:09:19'),('bf29f06d-a7f8-4e53-a8d9-123da6e95206','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-30','12:00:00',0,'2025-04-20 13:09:19'),('c6b17594-43e0-4a42-84ac-8a2984907c8b','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-26','12:00:00',0,'2025-04-20 13:09:19'),('c9372608-ec0e-4207-82e6-8d81ff7356bc','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-27','12:00:00',0,'2025-04-20 13:09:19'),('cd384f4a-4166-4c85-aa47-2fd1be242054','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-06','12:00:00',0,'2025-04-20 13:09:19'),('d18310b1-426f-4813-ac47-55cbc5cae8fc','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-28','12:00:00',0,'2025-04-20 13:09:19'),('d4d83902-2728-4979-bc6c-9a4e6fd767d3','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-08','12:00:00',0,'2025-04-20 13:09:19'),('df54414c-6d1c-4a3d-bdbd-009d66d12753','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-23','12:00:00',0,'2025-04-20 13:09:19'),('e8dda4aa-f9e0-4a21-926a-a58b1dd4fdf5','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-04','12:00:00',0,'2025-04-20 13:09:19'),('edd549ba-8241-4cb8-b670-a6b74a6e008b','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-18','12:00:00',0,'2025-04-20 13:09:19'),('f2ecb4d5-bfd0-40f6-96e1-e8af6fd37ee3','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.45,NULL,'2025-04-23','11:00:00',0,'2025-04-20 12:55:12'),('f57a32c8-ca19-42a5-a87c-21dec1dff923','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,1.50,NULL,'2025-04-29','12:00:00',0,'2025-04-20 13:09:19'),('f6306f66-028b-4fe5-a28c-3c0576aeaefc','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,0.75,NULL,'2025-04-22','14:00:00',0,'2025-04-22 09:05:01');
/*!40000 ALTER TABLE `energy_consumption` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `energy_efficiency_classes`
--

DROP TABLE IF EXISTS `energy_efficiency_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `energy_efficiency_classes` (
  `class` varchar(10) NOT NULL,
  PRIMARY KEY (`class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `energy_efficiency_classes`
--

LOCK TABLES `energy_efficiency_classes` WRITE;
/*!40000 ALTER TABLE `energy_efficiency_classes` DISABLE KEYS */;
INSERT INTO `energy_efficiency_classes` VALUES ('A'),('A+'),('A++'),('A+++'),('B'),('C'),('D'),('E'),('F'),('G');
/*!40000 ALTER TABLE `energy_efficiency_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `energy_goals`
--

DROP TABLE IF EXISTS `energy_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `energy_goals` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `target_consumption_kwh` decimal(10,2) NOT NULL,
  `target_cost` decimal(10,2) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_achieved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `energy_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `energy_goals`
--

LOCK TABLES `energy_goals` WRITE;
/*!40000 ALTER TABLE `energy_goals` DISABLE KEYS */;
/*!40000 ALTER TABLE `energy_goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_hours_types`
--

DROP TABLE IF EXISTS `home_hours_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `home_hours_types` (
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_hours_types`
--

LOCK TABLES `home_hours_types` WRITE;
/*!40000 ALTER TABLE `home_hours_types` DISABLE KEYS */;
INSERT INTO `home_hours_types` VALUES ('allDay'),('eveningOnly'),('irregular'),('morningEvening'),('weekendsOnly');
/*!40000 ALTER TABLE `home_hours_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `household_info`
--

DROP TABLE IF EXISTS `household_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `household_info` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `home_size_sqm` int DEFAULT NULL,
  `number_of_residents` int DEFAULT NULL,
  `number_of_working_adults` int DEFAULT NULL,
  `home_type` varchar(50) DEFAULT NULL,
  `heating_type` varchar(50) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `household_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `household_info`
--

LOCK TABLES `household_info` WRITE;
/*!40000 ALTER TABLE `household_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `household_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `total_consumption_kwh` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_due_date` date DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT '0',
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `notes` text,
  `invoice_type` varchar(50) DEFAULT NULL,
  `provider` varchar(100) DEFAULT NULL,
  `period` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'kwh',
  PRIMARY KEY (`id`),
  KEY `idx_invoices_user_id` (`user_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES ('172bdf5b-f359-4728-822c-191f4e42dfe3','8772391f-9882-4e57-9a16-20eb10d7b6d6','321230001','2025-04-14',484.02,208.13,'2025-05-23',0,NULL,'2025-05-17 20:07:21','2025-05-17 20:07:21',NULL,NULL,NULL,'electricity','ENERJISA','Nisan 2025','kwh'),('26a38052-df9a-4112-8f4f-3feae30e543e','8772391f-9882-4e57-9a16-20eb10d7b6d6','2','2025-04-23',1000.00,600.00,'2025-04-30',1,NULL,'2025-04-23 11:57:34','2025-04-23 11:57:34',NULL,NULL,NULL,NULL,NULL,NULL,'kwh'),('9e1b9751-0bfa-4874-8d00-599567cfdc83','8772391f-9882-4e57-9a16-20eb10d7b6d6','123456','2025-04-22',300.00,2000.00,'2025-04-26',1,NULL,'2025-04-22 10:45:16','2025-04-22 10:45:16',NULL,NULL,NULL,NULL,NULL,NULL,'kwh'),('a1e02087-28cf-48a5-9ac8-cf707b5a6b8e','8772391f-9882-4e57-9a16-20eb10d7b6d6','987654321','2024-03-10',310.00,420.70,'2024-03-10',0,NULL,'2025-05-05 11:53:06','2025-05-05 11:53:06',NULL,NULL,'','electricity','XYZ Enerji','Mart 2024','kwh'),('a864cfd1-99ad-4533-a7c8-6ae4a9a1aaee','8772391f-9882-4e57-9a16-20eb10d7b6d6','123456789','2024-04-15',250.00,350.00,'2024-04-30',0,NULL,'2025-04-29 11:07:07','2025-04-29 11:07:07',NULL,NULL,NULL,NULL,NULL,NULL,'kwh'),('e9ff08de-76b2-4d8c-a6ce-3012b09a8edc','8772391f-9882-4e57-9a16-20eb10d7b6d6','123456789','2024-04-15',250.00,350.00,'2024-04-30',1,NULL,'2025-04-23 15:20:14','2025-04-26 17:52:35',NULL,NULL,NULL,NULL,NULL,NULL,'kwh');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_types`
--

DROP TABLE IF EXISTS `notification_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_types` (
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_types`
--

LOCK TABLES `notification_types` WRITE;
/*!40000 ALTER TABLE `notification_types` DISABLE KEYS */;
INSERT INTO `notification_types` VALUES ('email'),('push'),('sms');
/*!40000 ALTER TABLE `notification_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `notification_type` varchar(20) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notification_type` (`notification_type`),
  KEY `idx_notifications_user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`notification_type`) REFERENCES `notification_types` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suggestion_statuses`
--

DROP TABLE IF EXISTS `suggestion_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suggestion_statuses` (
  `status` varchar(20) NOT NULL,
  PRIMARY KEY (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suggestion_statuses`
--

LOCK TABLES `suggestion_statuses` WRITE;
/*!40000 ALTER TABLE `suggestion_statuses` DISABLE KEYS */;
INSERT INTO `suggestion_statuses` VALUES ('applied'),('pending'),('rejected');
/*!40000 ALTER TABLE `suggestion_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suggestions`
--

DROP TABLE IF EXISTS `suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suggestions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `device_id` char(36) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `potential_savings_kwh` decimal(10,2) DEFAULT NULL,
  `potential_savings_cost` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source` enum('system','ai') DEFAULT 'system',
  `difficulty` enum('easy','medium','hard') DEFAULT 'medium',
  `purchase_link` varchar(500) DEFAULT NULL COMMENT 'Cihaz satın alma linki (Cimri vb.)',
  `detected_device_type` varchar(50) DEFAULT NULL COMMENT 'Algılanan cihaz türü',
  PRIMARY KEY (`id`),
  KEY `device_id` (`device_id`),
  KEY `status` (`status`),
  KEY `idx_suggestions_user_id` (`user_id`),
  CONSTRAINT `suggestions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `suggestions_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `suggestions_ibfk_3` FOREIGN KEY (`status`) REFERENCES `suggestion_statuses` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suggestions`
--

LOCK TABLES `suggestions` WRITE;
/*!40000 ALTER TABLE `suggestions` DISABLE KEYS */;
INSERT INTO `suggestions` VALUES ('19bd22a8-9931-410e-afd5-2aff1c953d29','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,'Optimize Washing Machine Usage','Run the washing machine only with full loads. Also, consider using lower temperature settings, as heating water consumes a large portion of the energy.',58.00,87.00,'rejected','2025-04-29 11:07:34','2025-04-29 11:10:48','ai','medium',NULL,NULL),('27edad4f-0b81-4524-bc15-5c5e201104b1','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,'Reduce Dishwasher Runtime & Optimize Loading','Shorten dishwasher cycles when possible and ensure it\'s fully loaded before each use to maximize efficiency. Consider using the eco-mode.',0.00,0.00,'pending','2025-06-18 15:18:28','2025-06-18 15:18:28','ai','easy','https://www.cimri.com/bulasik-makineleri/en-ucuz-enerji-sinifi:a--;a----bulasik-makineleri-fiyatlari','dishwasher'),('38e44924-9137-4cee-afff-91de8b8b8a55','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,'Optimize Oven Usage: Siemens is more efficient','Primarily use the Siemens oven (A+++) over the Arçelik oven (A+) due to its significantly higher energy efficiency. Minimize Arçelik oven usage.',0.00,0.00,'pending','2025-06-18 15:18:28','2025-06-18 15:18:28','ai','easy','https://www.cimri.com/firinlar/en-ucuz-enerji-sinifi:a--firinlar-fiyatlari','oven'),('6708f58b-04d6-4c05-8cc2-b1ff9c294b75','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,'Reduce Samsung TV Viewing Time','Reducing the daily TV viewing time will directly decrease energy consumption. Even cutting it by an hour a day could significantly lower your energy bills.',88.00,132.00,'applied','2025-04-29 11:07:34','2025-04-29 11:10:24','ai','medium',NULL,NULL),('8bb11000-6908-44e8-854b-ae77a611ced3','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,'Limit TV Viewing Time','Reducing Samsung TV viewing by even an hour a day can result in significant savings, as it\'s used daily. Find alternative activities.',0.00,0.00,'pending','2025-06-18 15:18:28','2025-06-18 15:18:28','ai','medium','https://www.cimri.com/televizyonlar/en-ucuz-enerji-sinifi:a-;a---televizyonlar-fiyatlari?q=televizyon','television'),('ecd6adf7-2d1f-480c-8383-bc573ef81834','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,'Shift Appliance Usage to Off-Peak Hours','If your electricity provider offers time-of-use rates, schedule energy-intensive appliance use (washing machine, dishwasher, ovens) during off-peak hours. This can save money and reduce overall energy demand.',0.00,0.00,'pending','2025-06-18 15:18:28','2025-06-18 15:18:28','ai','medium','https://www.cimri.com/camasir-makineleri/en-ucuz-enerji-sinifi:a--;a----camasir-makineleri-fiyatlari','washing_machine'),('f44e9c2f-2b1f-4340-bb20-74b28fc23e2d','8772391f-9882-4e57-9a16-20eb10d7b6d6',NULL,'Wash Clothes Less Frequently','Wash clothes only when necessary and try to accumulate full loads for each washing cycle. Also, consider using cold water washing.',0.00,0.00,'pending','2025-06-18 15:18:28','2025-06-18 15:18:28','ai','easy',NULL,NULL);
/*!40000 ALTER TABLE `suggestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_responses`
--

DROP TABLE IF EXISTS `survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_responses` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `household_size` int NOT NULL,
  `children` int NOT NULL DEFAULT '0',
  `working_adults` int NOT NULL DEFAULT '0',
  `home_hours` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `home_hours` (`home_hours`),
  KEY `idx_survey_responses_user_id` (`user_id`),
  CONSTRAINT `survey_responses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `survey_responses_ibfk_2` FOREIGN KEY (`home_hours`) REFERENCES `home_hours_types` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_responses`
--

LOCK TABLES `survey_responses` WRITE;
/*!40000 ALTER TABLE `survey_responses` DISABLE KEYS */;
INSERT INTO `survey_responses` VALUES ('c53b3f2c-6b4b-4300-b393-d9f632faa82a','8772391f-9882-4e57-9a16-20eb10d7b6d6','Ankara',5,3,2,'eveningOnly','2025-04-19 20:28:03','2025-04-26 18:26:13');
/*!40000 ALTER TABLE `survey_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` char(36) NOT NULL,
  `site_name` varchar(100) NOT NULL DEFAULT 'Smart Energy Assistant',
  `contact_email` varchar(100) NOT NULL,
  `default_language` varchar(5) NOT NULL DEFAULT 'tr',
  `default_currency` varchar(3) NOT NULL DEFAULT 'TRY',
  `maintenance_mode` tinyint(1) DEFAULT '0',
  `registration_enabled` tinyint(1) DEFAULT '1',
  `email_notifications_enabled` tinyint(1) DEFAULT '1',
  `data_retention_days` int DEFAULT '365',
  `api_rate_limit` int DEFAULT '100',
  `default_theme` varchar(10) DEFAULT 'light',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activity_logs`
--

DROP TABLE IF EXISTS `user_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activity_logs` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_activity_logs_user_id` (`user_id`),
  CONSTRAINT `user_activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity_logs`
--

LOCK TABLES `user_activity_logs` WRITE;
/*!40000 ALTER TABLE `user_activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `role` varchar(20) NOT NULL,
  PRIMARY KEY (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('admin'),('energy_consultant'),('standard');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `notification_email` tinyint(1) DEFAULT '1',
  `notification_push` tinyint(1) DEFAULT '1',
  `notification_sms` tinyint(1) DEFAULT '0',
  `energy_unit` varchar(10) DEFAULT 'kWh',
  `currency` varchar(3) DEFAULT 'TRY',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'standard',
  `phone_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `preferred_language` varchar(5) DEFAULT 'tr',
  `theme_preference` varchar(10) DEFAULT 'light',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `email_15` (`email`),
  KEY `role` (`role`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role`) REFERENCES `user_roles` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('7faa0723-1ab9-498f-b0af-788e11cc4f15','test3','test3@gmail.com','$2b$10$kkqDmGzFqpSvYX2VCmTsWurccnPKM3Z8VG2z9ftqu0LHRXbO6Lb8i','test','soyad','standard','05551234567','2025-04-19 16:09:10','2025-04-19 16:15:12','2025-04-19 16:15:04',1,'tr','light'),('80287e10-16a2-4046-8227-14f83a4d5b85','irem','iremnursabirr@gmail.com','$2b$10$bOK1f62g29v24yEHhEJ/mefTM70x5UeyvNg/TSll5PVltpWPo0b5a','irem','nur','standard','5380369365','2025-05-13 11:12:01','2025-05-13 11:12:01','2025-05-13 11:12:01',1,'tr','light'),('8772391f-9882-4e57-9a16-20eb10d7b6d6','test1','test@gmail.com','$2b$10$pk4zY.GbAheSKsDVEcm1YOZ4NQmPcL.uGtrcmuGTzd1WJAzv70Q9S','Kerem','Akkuş','standard','05551234567','2025-04-19 15:32:51','2025-06-18 15:14:29','2025-06-18 15:14:29',1,'tr','light'),('fb62b57c-7697-4de4-99fe-df478630b84e','deneme','deneme@gmail.com','$2b$10$sK.LL6KUfBTYIkvhhlOV3OXk0y0yCjiI6rw1HGpVdN.31bW69YLoO','deneme','deneme','standard','05551234567','2025-04-22 09:12:30','2025-04-22 09:12:30','2025-04-22 09:12:30',1,'tr','light');
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

-- Dump completed on 2025-06-18 23:35:35
