-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: soccer-mysql-theco627-78b7.b.aivencloud.com    Database: soccer_platform
-- ------------------------------------------------------
-- Server version	8.0.45

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '59845afb-3747-11f1-be91-ea8b099d81bd:1-15,
9e8fdd0c-34f6-11f1-815e-828d53f62529:1-27,
d69273e7-3747-11f1-a4a3-7ea079325f3e:1-2170,
dc63b65d-3640-11f1-8d06-ee2d137ab99b:1-90';

--
-- Table structure for table `match_events`
--

DROP TABLE IF EXISTS `match_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_events` (
                                `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                                `match_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                `team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                `team_member_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                `event_type` enum('GOAL','ASSIST','YELLOW_CARD','RED_CARD','SUB_IN','SUB_OUT','MATCH_STARTED','MATCH_ENDED','MATCH_CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL,
                                `minute` int NOT NULL DEFAULT '0',
                                `extra_data` json DEFAULT NULL,
                                `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                PRIMARY KEY (`id`),
                                KEY `idx_me_match` (`match_id`),
                                KEY `idx_me_team` (`team_id`),
                                KEY `idx_me_member` (`team_member_id`),
                                KEY `idx_me_type` (`event_type`),
                                CONSTRAINT `fk_me_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
                                CONSTRAINT `fk_me_member` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE,
                                CONSTRAINT `fk_me_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `match_lineups`
--

DROP TABLE IF EXISTS `match_lineups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_lineups` (
                                 `match_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `team_member_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `is_starting` tinyint(1) NOT NULL DEFAULT '1',
                                 `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (`match_id`,`team_member_id`),
                                 KEY `idx_ml_team` (`team_id`),
                                 KEY `idx_ml_member` (`team_member_id`),
                                 CONSTRAINT `fk_ml_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
                                 CONSTRAINT `fk_ml_member` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE,
                                 CONSTRAINT `fk_ml_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `match_team_stats`
--

DROP TABLE IF EXISTS `match_team_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_team_stats` (
                                    `match_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                    `team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                    `ball_possession_percent` int NOT NULL DEFAULT '0',
                                    `shots` int NOT NULL DEFAULT '0',
                                    `shots_on_target` int NOT NULL DEFAULT '0',
                                    `corners` int NOT NULL DEFAULT '0',
                                    `fouls` int NOT NULL DEFAULT '0',
                                    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    PRIMARY KEY (`match_id`,`team_id`),
                                    KEY `idx_mts_team` (`team_id`),
                                    CONSTRAINT `fk_mts_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
                                    CONSTRAINT `fk_mts_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
                           `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                           `tournament_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                           `home_team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                           `away_team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                           `stadium` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                           `start_time` datetime NOT NULL,
                           `is_active` tinyint(1) NOT NULL DEFAULT '1',
                           `is_cancelled` tinyint(1) NOT NULL DEFAULT '0',
                           `home_score` int NOT NULL DEFAULT '0',
                           `away_score` int NOT NULL DEFAULT '0',
                           `match_round` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                           `ended_at` datetime DEFAULT NULL,
                           `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           PRIMARY KEY (`id`),
                           KEY `idx_m_tour` (`tournament_id`),
                           KEY `idx_m_home` (`home_team_id`),
                           KEY `idx_m_away` (`away_team_id`),
                           KEY `idx_m_active` (`is_active`,`is_cancelled`),
                           CONSTRAINT `fk_m_away` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
                           CONSTRAINT `fk_m_home` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
                           CONSTRAINT `fk_m_tour` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
                                 `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                                 `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                 `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                                 `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                                 `message` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                                 `is_read` tinyint(1) NOT NULL DEFAULT '0',
                                 `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 PRIMARY KEY (`id`),
                                 KEY `idx_noti_user` (`user_id`),
                                 CONSTRAINT `fk_noti_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
                                   `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                                   `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                   `token` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
                                   `expires_at` datetime NOT NULL,
                                   `is_used` tinyint(1) NOT NULL DEFAULT '0',
                                   `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   PRIMARY KEY (`id`),
                                   UNIQUE KEY `uq_password_reset_token` (`token`),
                                   KEY `idx_pr_user` (`user_id`),
                                   CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `player_stats`
--

DROP TABLE IF EXISTS `player_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_stats` (
                                `match_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                `team_member_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                `minutes_played` int NOT NULL DEFAULT '0',
                                `goals` int NOT NULL DEFAULT '0',
                                `assists` int NOT NULL DEFAULT '0',
                                `yellow_cards` int NOT NULL DEFAULT '0',
                                `red_cards` int NOT NULL DEFAULT '0',
                                `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                PRIMARY KEY (`match_id`,`team_member_id`),
                                KEY `idx_ps_member` (`team_member_id`),
                                CONSTRAINT `fk_ps_match` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
                                CONSTRAINT `fk_ps_member` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
                         `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                         `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `uq_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
                                `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                                `team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                                `image_url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                                `age` int NOT NULL DEFAULT '0',
                                `height_cm` int NOT NULL DEFAULT '0',
                                `weight_kg` decimal(5,2) NOT NULL DEFAULT '0.00',
                                `preferred_foot` enum('LEFT','RIGHT','BOTH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RIGHT',
                                `main_position` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                                `jersey_number` int NOT NULL DEFAULT '0',
                                `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                PRIMARY KEY (`id`),
                                KEY `idx_tm_team` (`team_id`),
                                KEY `idx_tm_name` (`full_name`),
                                CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
                         `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                         `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `logo_url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `kit_url` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `manager_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         KEY `idx_team_manager` (`manager_id`),
                         CONSTRAINT `fk_team_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tournament_ranking_cache`
--

DROP TABLE IF EXISTS `tournament_ranking_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournament_ranking_cache` (
                                            `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                                            `tournament_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                            `algorithm_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
                                            `standings_json` json NOT NULL,
                                            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                            PRIMARY KEY (`id`),
                                            KEY `idx_trc_tournament_created` (`tournament_id`,`created_at`),
                                            CONSTRAINT `fk_trc_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tournament_teams`
--

DROP TABLE IF EXISTS `tournament_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournament_teams` (
                                    `tournament_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                    `team_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                    `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
                                    `group_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                                    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                    PRIMARY KEY (`tournament_id`,`team_id`),
                                    KEY `idx_tt_team` (`team_id`),
                                    CONSTRAINT `fk_tt_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
                                    CONSTRAINT `fk_tt_tour` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tournaments`
--

DROP TABLE IF EXISTS `tournaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournaments` (
                               `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                               `organizer_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                               `logo_url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                               `description` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                               `format` enum('LEAGUE','KNOCKOUT','GROUP_STAGE') COLLATE utf8mb4_unicode_ci NOT NULL,
                               `start_date` date NOT NULL,
                               `end_date` date NOT NULL,
                               `status` enum('UPCOMING','ONGOING','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPCOMING',
                               `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                               PRIMARY KEY (`id`),
                               KEY `idx_tournament_organizer` (`organizer_id`),
                               CONSTRAINT `fk_tournament_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
                              `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                              `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                              `role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                              `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              PRIMARY KEY (`id`),
                              UNIQUE KEY `uq_user_role` (`user_id`,`role_id`),
                              KEY `fk_user_roles_role` (`role_id`),
                              CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
                              CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
                         `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
                         `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                         `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `avatar_url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
                         `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

--
-- Seed data for roles
--

INSERT INTO `roles` (`id`, `code`, `name`, `description`) VALUES
                                                              ('role-organizer-001', 'ORGANIZER', 'Organizer', 'Tournament organizer'),
                                                              ('role-admin-001', 'ADMIN', 'Admin', 'System administrator'),
                                                              ('role-player-001', 'PLAYER', 'Player', 'Football player');

-- Dump completed on 2026-04-20 21:20:20