-- phpMyAdmin SQL Dump
-- version 4.2.11
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 11-Jun-2016 às 00:27
-- Versão do servidor: 5.6.21
-- PHP Version: 5.6.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `dxp`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `accounts`
--

CREATE TABLE IF NOT EXISTS `accounts` (
`id` int(11) NOT NULL,
  `name` varchar(32) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL,
  `premdays` int(11) NOT NULL DEFAULT '0',
  `lastday` int(10) unsigned NOT NULL DEFAULT '0',
  `email` varchar(255) NOT NULL DEFAULT '',
  `key` varchar(128) NOT NULL DEFAULT '',
  `blocked` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'internal usage',
  `warnings` int(11) NOT NULL DEFAULT '0',
  `group_id` int(11) NOT NULL DEFAULT '1',
  `viptime` int(11) NOT NULL DEFAULT '0',
  `page_access` int(11) DEFAULT NULL,
  `page_lastday` int(11) DEFAULT NULL,
  `email_new` varchar(255) DEFAULT NULL,
  `email_new_time` int(15) DEFAULT NULL,
  `rlname` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created` int(16) DEFAULT NULL,
  `email_code` varchar(255) DEFAULT NULL,
  `next_email` int(11) DEFAULT NULL,
  `premium_points` int(11) DEFAULT NULL,
  `nickname` char(48) DEFAULT NULL,
  `avatar` char(48) DEFAULT NULL,
  `about_me` text
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `accounts`
--

INSERT INTO `accounts` (`id`, `name`, `password`, `premdays`, `lastday`, `email`, `key`, `blocked`, `warnings`, `group_id`, `viptime`, `page_access`, `page_lastday`, `email_new`, `email_new_time`, `rlname`, `location`, `created`, `email_code`, `next_email`, `premium_points`, `nickname`, `avatar`, `about_me`) VALUES
(2, 'kkkkk32515', '4d9012b4a77a9524d675dad27c3276ab5705e5e8', 0, 1465518031, '', '', 0, 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--
-- Acionadores `accounts`
--
DELIMITER //
CREATE TRIGGER `ondelete_accounts` BEFORE DELETE ON `accounts`
 FOR EACH ROW BEGIN
	DELETE FROM `bans` WHERE `type` IN (3, 4) AND `value` = OLD.`id`;
END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `account_viplist`
--

CREATE TABLE IF NOT EXISTS `account_viplist` (
  `account_id` int(11) NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `player_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `bans`
--

CREATE TABLE IF NOT EXISTS `bans` (
`id` int(10) unsigned NOT NULL,
  `type` tinyint(1) NOT NULL COMMENT '1 - ip banishment, 2 - namelock, 3 - account banishment, 4 - notation, 5 - deletion',
  `value` int(10) unsigned NOT NULL COMMENT 'ip address (integer), player guid or account number',
  `param` int(10) unsigned NOT NULL DEFAULT '4294967295' COMMENT 'used only for ip banishment mask (integer)',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `expires` int(11) NOT NULL,
  `added` int(10) unsigned NOT NULL,
  `admin_id` int(10) unsigned NOT NULL DEFAULT '0',
  `comment` text NOT NULL,
  `reason` int(10) unsigned NOT NULL DEFAULT '0',
  `action` int(10) unsigned NOT NULL DEFAULT '0',
  `statement` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `bans`
--

INSERT INTO `bans` (`id`, `type`, `value`, `param`, `active`, `expires`, `added`, `admin_id`, `comment`, `reason`, `action`, `statement`) VALUES
(15, 2, 1989, 2, 1, -1, 1406746896, 11, 'Ofensa Staff e Mal Uso do Help', 1, 3, ''),
(17, 2, 1929, 2, 1, -1, 1406746947, 11, 'Ofensa Staff E mal Uso do Help', 1, 3, '');

-- --------------------------------------------------------

--
-- Estrutura da tabela `bugtracker`
--

CREATE TABLE IF NOT EXISTS `bugtracker` (
`id` int(11) NOT NULL,
  `category` int(3) NOT NULL,
  `time` int(11) DEFAULT NULL,
  `author` int(11) NOT NULL,
  `text` text,
  `title` varchar(120) DEFAULT NULL,
  `done` tinyint(3) DEFAULT NULL,
  `priority` tinyint(3) DEFAULT NULL,
  `closed` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `comments`
--

CREATE TABLE IF NOT EXISTS `comments` (
`id` int(11) NOT NULL,
  `news_id` int(11) DEFAULT NULL,
  `body` text,
  `time` int(11) DEFAULT '0',
  `author` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `environment_killers`
--

CREATE TABLE IF NOT EXISTS `environment_killers` (
  `kill_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `forums`
--

CREATE TABLE IF NOT EXISTS `forums` (
`id` int(11) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `description` tinytext,
  `access` smallint(5) DEFAULT '1' COMMENT 'Min. access to see the board',
  `closed` tinyint(1) DEFAULT NULL,
  `moderators` tinytext,
  `order` int(6) DEFAULT NULL,
  `requireLogin` tinyint(1) DEFAULT NULL,
  `guild` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `friends`
--

CREATE TABLE IF NOT EXISTS `friends` (
`id` int(11) NOT NULL,
  `with` int(11) DEFAULT NULL,
  `friend` int(11) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `global_storage`
--

CREATE TABLE IF NOT EXISTS `global_storage` (
  `key` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `value` varchar(255) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `guilds`
--

CREATE TABLE IF NOT EXISTS `guilds` (
`id` int(11) NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `ownerid` int(11) NOT NULL,
  `creationdata` int(11) NOT NULL,
  `motd` varchar(255) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `guilds`
--

INSERT INTO `guilds` (`id`, `world_id`, `name`, `ownerid`, `creationdata`, `motd`) VALUES
(2, 0, 'Shiny Slayer', 135, 1405878577, 'Your guild has been successfully created, to view all available commands type: !commands. If you would like to remove this message use !cleanmotd and to set new motd use !setmotd text.'),
(3, 0, 'Alto Mando', 1631, 1406179596, 'Your guild has been successfully created, to view all available commands type: !commands. If you would like to remove this message use !cleanmotd and to set new motd use !setmotd text.'),
(4, 0, 'Hispanosparlantes', 1620, 1406179690, 'Your guild has been successfully created, to view all available commands type: !commands. If you would like to remove this message use !cleanmotd and to set new motd use !setmotd text.'),
(5, 0, 'Fe em deus', 2190, 1407000267, 'Your guild has been successfully created, to view all available commands type: !commands. If you would like to remove this message use !cleanmotd and to set new motd use !setmotd text.'),
(6, 0, 'Los Mejores', 2149, 1407001142, 'Chat Aberto 24H >.< ~');

--
-- Acionadores `guilds`
--
DELIMITER //
CREATE TRIGGER `oncreate_guilds` AFTER INSERT ON `guilds`
 FOR EACH ROW BEGIN
	INSERT INTO `guild_ranks` (`name`, `level`, `guild_id`) VALUES ('Leader', 3, NEW.`id`);
	INSERT INTO `guild_ranks` (`name`, `level`, `guild_id`) VALUES ('Vice-Leader', 2, NEW.`id`);
	INSERT INTO `guild_ranks` (`name`, `level`, `guild_id`) VALUES ('Member', 1, NEW.`id`);
END
//
DELIMITER ;
DELIMITER //
CREATE TRIGGER `ondelete_guilds` BEFORE DELETE ON `guilds`
 FOR EACH ROW BEGIN
	UPDATE `players` SET `guildnick` = '', `rank_id` = 0 WHERE `rank_id` IN (SELECT `id` FROM `guild_ranks` WHERE `guild_id` = OLD.`id`);
END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `guild_invites`
--

CREATE TABLE IF NOT EXISTS `guild_invites` (
  `player_id` int(11) NOT NULL DEFAULT '0',
  `guild_id` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `guild_ranks`
--

CREATE TABLE IF NOT EXISTS `guild_ranks` (
`id` int(11) NOT NULL,
  `guild_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level` int(11) NOT NULL COMMENT '1 - leader, 2 - vice leader, 3 - member'
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `guild_ranks`
--

INSERT INTO `guild_ranks` (`id`, `guild_id`, `name`, `level`) VALUES
(4, 2, 'Leader', 3),
(5, 2, 'Vice-Leader', 2),
(6, 2, 'Member', 1),
(7, 3, 'Leader', 3),
(8, 3, 'Vice-Leader', 2),
(9, 3, 'Member', 1),
(10, 4, 'Leader', 3),
(11, 4, 'Vice-Leader', 2),
(12, 4, 'Member', 1),
(13, 5, 'Leader', 3),
(14, 5, 'Vice-Leader', 2),
(15, 5, 'Member', 1),
(16, 6, 'Leader', 3),
(17, 6, 'Vice-Leader', 2),
(18, 6, 'Member', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `houses`
--

CREATE TABLE IF NOT EXISTS `houses` (
  `id` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `owner` int(11) NOT NULL,
  `paid` int(10) unsigned NOT NULL DEFAULT '0',
  `warnings` int(11) NOT NULL DEFAULT '0',
  `lastwarning` int(10) unsigned NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `town` int(10) unsigned NOT NULL DEFAULT '0',
  `size` int(10) unsigned NOT NULL DEFAULT '0',
  `price` int(10) unsigned NOT NULL DEFAULT '0',
  `rent` int(10) unsigned NOT NULL DEFAULT '0',
  `doors` int(10) unsigned NOT NULL DEFAULT '0',
  `beds` int(10) unsigned NOT NULL DEFAULT '0',
  `tiles` int(10) unsigned NOT NULL DEFAULT '0',
  `guild` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `clear` tinyint(1) unsigned NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `houses`
--

INSERT INTO `houses` (`id`, `world_id`, `owner`, `paid`, `warnings`, `lastwarning`, `name`, `town`, `size`, `price`, `rent`, `doors`, `beds`, `tiles`, `guild`, `clear`) VALUES
(127, 0, 0, 0, 0, 1405643820, 'Viridian House #127', 6, 134, 562275, 0, 5, 0, 189, 0, 0),
(128, 0, 0, 0, 0, 1405872027, 'Viridian House #128', 6, 134, 538475, 0, 4, 0, 181, 0, 0),
(129, 0, 0, 0, 0, 1406224693, 'Viridian House #129', 6, 150, 711025, 0, 5, 0, 239, 0, 0),
(130, 0, 0, 0, 0, 1405775205, 'Viridian House #130', 6, 78, 339150, 0, 2, 0, 114, 0, 0),
(131, 0, 0, 0, 0, 1406939907, 'Viridian House #131', 6, 65, 297500, 0, 2, 0, 100, 0, 0),
(132, 0, 0, 0, 0, 1406297374, 'Viridian House #132', 6, 56, 297500, 0, 2, 0, 100, 0, 0),
(133, 0, 0, 0, 0, 1407502063, 'Viridian House #133', 6, 40, 211225, 0, 1, 0, 71, 0, 0),
(134, 0, 0, 0, 0, 1405771850, 'Viridian House #134', 6, 78, 413525, 0, 3, 0, 139, 0, 0),
(135, 0, 0, 0, 0, 1406874789, 'Viridian House #135', 6, 20, 121975, 0, 2, 0, 41, 0, 0),
(136, 0, 0, 0, 0, 0, 'Viridian House #136', 6, 20, 74375, 0, 0, 0, 25, 0, 0),
(137, 0, 0, 0, 0, 1406828907, 'Viridian House #137', 6, 54, 220150, 0, 1, 0, 74, 0, 0),
(138, 0, 0, 0, 0, 1407346440, 'Viridian House #138', 6, 56, 309400, 0, 1, 0, 104, 0, 0),
(139, 0, 0, 0, 0, 1406818943, 'Viridian House #139', 6, 70, 315350, 0, 1, 0, 106, 0, 0),
(140, 0, 0, 0, 0, 1406505040, 'Viridian House #140', 6, 54, 249900, 0, 3, 0, 84, 0, 0),
(141, 0, 0, 0, 0, 1405698094, 'Viridian House #141', 6, 54, 252875, 0, 3, 0, 85, 0, 0),
(143, 0, 0, 0, 0, 0, 'Pewter House #143', 8, 50, 240975, 0, 0, 0, 81, 0, 0),
(144, 0, 0, 0, 0, 0, 'Pewter House #144', 8, 65, 306425, 0, 0, 0, 103, 0, 0),
(145, 0, 0, 0, 0, 0, 'Pewter House #145', 8, 78, 419475, 0, 0, 0, 141, 0, 0),
(146, 0, 0, 0, 0, 0, 'Pewter House #146', 8, 67, 336175, 0, 0, 0, 113, 0, 0),
(147, 0, 0, 0, 0, 0, 'Pewter House #147', 8, 66, 339150, 0, 0, 0, 114, 0, 0),
(148, 0, 0, 0, 0, 0, 'Pewter House #148', 8, 38, 166600, 0, 0, 0, 56, 0, 0),
(149, 0, 0, 0, 0, 0, 'Pewter House #149', 8, 28, 124950, 0, 0, 0, 42, 0, 0),
(150, 0, 0, 0, 0, 0, 'Pewter House #150', 8, 24, 139825, 0, 0, 0, 47, 0, 0),
(151, 0, 0, 0, 0, 0, 'Pewter House #151', 8, 49, 238000, 0, 0, 0, 80, 0, 0),
(152, 0, 0, 0, 0, 0, 'Pewter House #152', 8, 98, 478975, 0, 0, 0, 161, 0, 0),
(153, 0, 0, 0, 0, 0, 'Pewter House #153', 8, 98, 481950, 0, 0, 0, 162, 0, 0),
(154, 0, 0, 0, 0, 1407086673, 'Pewter House #154', 8, 110, 499800, 0, 0, 0, 168, 0, 0),
(155, 0, 0, 0, 0, 0, 'Pewter House #155', 8, 48, 229075, 0, 0, 0, 77, 0, 0),
(156, 0, 0, 0, 0, 0, 'Pewter House #156', 8, 48, 232050, 0, 0, 0, 78, 0, 0),
(157, 0, 0, 0, 0, 0, 'Pewter House #157', 8, 36, 181475, 0, 0, 0, 61, 0, 0),
(158, 0, 0, 0, 0, 0, 'Pewter House #158', 8, 0, 196350, 0, 0, 0, 66, 0, 0),
(160, 0, 0, 0, 0, 0, 'Cerulean House #160', 2, 51, 285600, 0, 0, 0, 96, 0, 0),
(161, 0, 0, 0, 0, 0, 'Cerulean House #161', 2, 25, 119000, 0, 0, 0, 40, 0, 0),
(162, 0, 0, 0, 0, 0, 'Cerulean House #162', 2, 25, 145775, 0, 0, 0, 49, 0, 0),
(163, 0, 0, 0, 0, 1406547451, 'Cerulean House #163', 2, 38, 246925, 0, 0, 0, 83, 0, 0),
(164, 0, 0, 0, 0, 0, 'Cerulean House #164', 2, 25, 166600, 0, 0, 0, 56, 0, 0),
(165, 0, 0, 0, 0, 0, 'Cerulean House #165', 2, 52, 303450, 0, 0, 0, 102, 0, 0),
(166, 0, 0, 0, 0, 0, 'Cerulean House #166', 2, 40, 199325, 0, 0, 0, 67, 0, 0),
(167, 0, 0, 0, 0, 1405704859, 'Cerulean House #167', 2, 95, 511700, 0, 0, 0, 172, 0, 0),
(168, 0, 0, 0, 0, 1406837175, 'Cerulean House #168', 2, 78, 476000, 0, 0, 0, 160, 0, 0),
(169, 0, 0, 0, 0, 0, 'Cerulean House #169', 2, 75, 416500, 0, 0, 0, 140, 0, 0),
(171, 0, 0, 0, 0, 0, 'Cerulean House #171', 2, 22, 110075, 0, 0, 0, 37, 0, 0),
(172, 0, 0, 0, 0, 1405811077, 'Cerulean House #172', 2, 123, 645575, 0, 0, 0, 217, 0, 0),
(173, 0, 0, 0, 0, 0, 'Cerulean House #173', 2, 50, 291550, 0, 0, 0, 98, 0, 0),
(174, 0, 0, 0, 0, 0, 'Cerulean House #174', 2, 10, 83300, 0, 0, 0, 28, 0, 0),
(176, 0, 0, 0, 0, 0, 'Cerulean House #176', 2, 21, 133875, 0, 0, 0, 45, 0, 0),
(177, 0, 0, 0, 0, 0, 'Cerulean House #177', 2, 21, 148750, 0, 0, 0, 50, 0, 0),
(178, 0, 0, 0, 0, 0, 'Cerulean House #178', 2, 21, 145775, 0, 0, 0, 49, 0, 0),
(179, 0, 0, 0, 0, 0, 'Cerulean House #179', 2, 24, 148750, 0, 0, 0, 50, 0, 0),
(180, 0, 0, 0, 0, 0, 'Cerulean House #180', 2, 20, 142800, 0, 0, 0, 48, 0, 0),
(181, 0, 0, 0, 0, 0, 'Cerulean House #181', 2, 20, 121975, 0, 0, 0, 41, 0, 0),
(182, 0, 0, 0, 0, 1405719707, 'Cerulean House #182', 2, 65, 357000, 0, 1, 0, 120, 0, 0),
(183, 0, 0, 0, 0, 0, 'Celadon House #183', 5, 72, 386750, 0, 0, 0, 130, 0, 0),
(184, 0, 0, 0, 0, 0, 'Celadon House #184', 5, 70, 357000, 0, 0, 0, 120, 0, 0),
(185, 0, 0, 0, 0, 0, 'Celadon House #185', 5, 69, 345100, 0, 0, 0, 116, 0, 0),
(186, 0, 0, 0, 0, 0, 'Celadon House #186', 5, 70, 345100, 0, 0, 0, 116, 0, 0),
(187, 0, 0, 0, 0, 0, 'Celadon House #187', 5, 80, 357000, 0, 0, 0, 120, 0, 0),
(188, 0, 0, 0, 0, 0, 'Celadon House #188', 5, 80, 357000, 0, 0, 0, 120, 0, 0),
(189, 0, 0, 0, 0, 0, 'Celadon House #189', 5, 80, 336175, 0, 0, 0, 113, 0, 0),
(190, 0, 0, 0, 0, 0, 'Celadon House #190', 5, 81, 312375, 0, 0, 0, 105, 0, 0),
(191, 0, 0, 0, 0, 0, 'Celadon House #191', 5, 122, 541450, 0, 0, 0, 182, 0, 0),
(192, 0, 0, 0, 0, 0, 'Celadon House #192', 5, 133, 592025, 0, 0, 0, 199, 0, 0),
(193, 0, 0, 0, 0, 0, 'Celadon House #193', 5, 128, 597975, 0, 0, 0, 201, 0, 0),
(194, 0, 0, 0, 0, 0, 'Celadon House #194', 5, 130, 559300, 0, 0, 0, 188, 0, 0),
(195, 0, 0, 0, 0, 0, 'Celadon House #195', 5, 44, 190400, 0, 0, 0, 64, 0, 0),
(196, 0, 0, 0, 0, 0, 'Celadon House #196', 5, 152, 618800, 0, 0, 0, 208, 0, 0),
(197, 0, 0, 0, 0, 0, 'Celadon House #197', 5, 122, 690200, 0, 0, 0, 232, 0, 0),
(198, 0, 0, 0, 0, 0, 'Celadon House #198', 5, 98, 398650, 0, 0, 0, 134, 0, 0),
(199, 0, 0, 0, 0, 0, 'Celadon House #199', 5, 124, 532525, 0, 0, 0, 179, 0, 0),
(200, 0, 0, 0, 0, 0, 'Celadon House #200', 5, 49, 220150, 0, 0, 0, 74, 0, 0),
(201, 0, 0, 0, 0, 0, 'Celadon House #201', 5, 85, 398650, 0, 0, 0, 134, 0, 0),
(202, 0, 0, 0, 0, 0, 'Celadon House #202', 5, 110, 461125, 0, 0, 0, 155, 0, 0),
(203, 0, 0, 0, 0, 0, 'Celadon House #203', 5, 105, 440300, 0, 0, 0, 148, 0, 0),
(204, 0, 0, 0, 0, 0, 'Celadon House #204', 5, 84, 428400, 0, 0, 0, 144, 0, 0),
(205, 0, 0, 0, 0, 0, 'Celadon House #205', 5, 66, 297500, 0, 0, 0, 100, 0, 0),
(206, 0, 0, 0, 0, 0, 'Celadon House #206', 5, 110, 496825, 0, 0, 0, 167, 0, 0),
(207, 0, 0, 0, 0, 0, 'Celadon House #207', 5, 63, 291550, 0, 0, 0, 98, 0, 0),
(208, 0, 0, 0, 0, 1405699013, 'Celadon House #208', 5, 261, 1219750, 0, 0, 0, 410, 0, 0),
(209, 0, 0, 0, 0, 0, 'Celadon House #209', 5, 138, 693175, 0, 0, 0, 233, 0, 0),
(210, 0, 0, 0, 0, 0, 'Celadon House #210', 5, 137, 642600, 0, 0, 0, 216, 0, 0),
(211, 0, 0, 0, 0, 0, 'Celadon House #211', 5, 126, 690200, 0, 0, 0, 232, 0, 0),
(212, 0, 0, 0, 0, 0, 'Celadon House #212', 5, 83, 368900, 0, 0, 0, 124, 0, 0),
(213, 0, 66, 0, 0, 1405854980, 'Saffron House #213', 1, 28, 157675, 0, 0, 0, 53, 0, 0),
(216, 0, 0, 0, 0, 1405812148, 'Saffron House #216', 1, 42, 211225, 0, 0, 0, 71, 0, 0),
(217, 0, 0, 0, 0, 1406547610, 'Saffron House #217', 1, 49, 238000, 0, 0, 0, 80, 0, 0),
(218, 0, 0, 0, 0, 1405699104, 'Saffron House #218', 1, 49, 211225, 0, 0, 0, 71, 0, 0),
(219, 0, 0, 0, 0, 1405811422, 'Saffron House #219', 1, 56, 276675, 0, 0, 0, 93, 0, 0),
(220, 0, 0, 0, 0, 1406667832, 'Saffron House #220', 1, 20, 121975, 0, 0, 0, 41, 0, 0),
(221, 0, 0, 0, 0, 1405704890, 'Saffron House #221', 1, 35, 157675, 0, 0, 0, 53, 0, 0),
(222, 0, 0, 0, 0, 1406436178, 'Saffron House #222', 1, 36, 178500, 0, 0, 0, 60, 0, 0),
(223, 0, 0, 0, 0, 1405811887, 'Saffron House #223', 1, 40, 178500, 0, 0, 0, 60, 0, 0),
(224, 0, 0, 0, 0, 0, 'Saffron House #224', 1, 24, 142800, 0, 0, 0, 48, 0, 0),
(225, 0, 0, 0, 0, 1407012697, 'Saffron House #225', 1, 55, 333200, 0, 0, 2, 112, 0, 0),
(226, 0, 0, 0, 0, 1404481899, 'Saffron House #226', 1, 66, 324275, 0, 0, 4, 109, 0, 0),
(227, 0, 0, 0, 0, 1404411554, 'Saffron House #227', 1, 35, 169575, 0, 0, 0, 57, 0, 0),
(228, 0, 0, 0, 0, 0, 'Saffron House #228', 1, 35, 202300, 0, 0, 0, 68, 0, 0),
(229, 0, 0, 0, 0, 0, 'Saffron House #229', 1, 35, 160650, 0, 0, 0, 54, 0, 0),
(230, 0, 0, 0, 0, 0, 'Saffron House #230', 1, 35, 181475, 0, 0, 0, 61, 0, 0),
(231, 0, 0, 0, 0, 1404411450, 'Saffron House #231', 1, 70, 300475, 0, 0, 0, 101, 0, 0),
(232, 0, 0, 0, 0, 1405810875, 'Saffron House #232', 1, 35, 163625, 0, 0, 0, 55, 0, 0),
(233, 0, 0, 0, 0, 1405812733, 'Saffron House #233', 1, 55, 240975, 0, 0, 0, 81, 0, 0),
(234, 0, 0, 0, 0, 1405811043, 'Saffron House #234', 1, 80, 357000, 0, 0, 0, 120, 0, 0),
(235, 0, 0, 0, 0, 0, 'Saffron House #235', 1, 45, 166600, 0, 0, 0, 56, 0, 0),
(236, 0, 0, 0, 0, 1406547382, 'Saffron House #236', 1, 54, 252875, 0, 0, 0, 85, 0, 0),
(237, 0, 0, 0, 0, 1406738981, 'Saffron House #237', 1, 178, 856800, 0, 0, 2, 288, 0, 0),
(238, 0, 0, 0, 0, 1406547132, 'Saffron House #238', 1, 76, 288575, 0, 0, 2, 97, 0, 0),
(239, 0, 0, 0, 0, 1405699137, 'Saffron House #239', 1, 202, 996625, 0, 0, 2, 335, 0, 0),
(240, 0, 0, 0, 0, 1405699312, 'Saffron House #240', 1, 98, 458150, 0, 0, 0, 154, 0, 0),
(241, 0, 0, 0, 0, 1406668729, 'Saffron House #241', 1, 98, 422450, 0, 0, 0, 142, 0, 0),
(242, 0, 0, 0, 0, 1405625858, 'Saffron House #242', 1, 72, 359975, 0, 3, 0, 121, 0, 0),
(243, 0, 0, 0, 0, 1406487792, 'Saffron House #243', 1, 98, 470050, 0, 0, 0, 158, 0, 0),
(245, 0, 0, 0, 0, 1404595697, 'Saffron House #245', 1, 66, 342125, 0, 1, 2, 115, 0, 0),
(248, 0, 0, 0, 0, 0, 'Saffron House #248', 1, 0, 56525, 0, 0, 0, 19, 0, 0),
(250, 0, 0, 0, 0, 0, 'Saffron House #250', 1, 94, 371875, 0, 0, 4, 125, 0, 0),
(251, 0, 0, 0, 0, 0, 'Saffron House #251', 1, 16, 83300, 0, 1, 2, 28, 0, 0),
(252, 0, 0, 0, 0, 0, 'Saffron House #252', 1, 23, 124950, 0, 0, 2, 42, 0, 0),
(253, 0, 0, 0, 0, 1406915610, 'Saffron House #253', 1, 18, 121975, 0, 0, 2, 41, 0, 0),
(254, 0, 0, 0, 0, 1406915591, 'Saffron House #254', 1, 45, 211225, 0, 0, 2, 71, 0, 0),
(255, 0, 0, 0, 0, 0, 'Saffron House #255', 1, 54, 238000, 0, 0, 2, 80, 0, 0),
(256, 0, 0, 0, 0, 0, 'Saffron House #256', 1, 16, 83300, 0, 0, 0, 28, 0, 0),
(257, 0, 0, 0, 0, 0, 'Saffron House #257', 1, 18, 89250, 0, 0, 2, 30, 0, 0),
(258, 0, 0, 0, 0, 0, 'Saffron House #258', 1, 14, 104125, 0, 0, 2, 35, 0, 0),
(259, 0, 0, 0, 0, 1406547190, 'Saffron House #259', 1, 56, 300475, 0, 0, 2, 101, 0, 0),
(260, 0, 0, 0, 0, 1406915418, 'Saffron House #260', 1, 26, 124950, 0, 0, 2, 42, 0, 0),
(261, 0, 0, 0, 0, 0, 'Saffron House #261', 1, 36, 193375, 0, 0, 4, 65, 0, 0),
(262, 0, 0, 0, 0, 0, 'Saffron House #262', 1, 30, 163625, 0, 0, 2, 55, 0, 0),
(263, 0, 0, 0, 0, 0, 'Saffron House #263', 1, 19, 101150, 0, 0, 2, 34, 0, 0),
(264, 0, 0, 0, 0, 1406837085, 'Saffron House #264', 1, 56, 297500, 0, 0, 2, 100, 0, 0),
(265, 0, 0, 0, 0, 1404406873, 'Saffron House #265', 1, 158, 746725, 0, 1, 0, 251, 0, 0),
(266, 0, 11, 0, 0, 1404354452, 'Saffron House #266', 1, 27, 148750, 0, 1, 0, 50, 0, 0),
(267, 0, 0, 0, 0, 0, 'Saffron House #267', 1, 27, 154700, 0, 0, 0, 52, 0, 0),
(268, 0, 0, 0, 0, 0, 'Saffron House #268', 1, 133, 618800, 0, 0, 2, 208, 0, 0),
(269, 0, 0, 0, 0, 1405698850, 'Saffron House #269', 1, 134, 627725, 0, 0, 2, 211, 0, 0),
(270, 0, 0, 0, 0, 0, 'Vermilion House #270', 7, 147, 523600, 0, 0, 0, 176, 0, 0),
(271, 0, 0, 0, 0, 0, 'Vermilion House #271', 7, 156, 651525, 0, 0, 0, 219, 0, 0),
(272, 0, 0, 0, 0, 0, 'Vermilion House #272', 7, 104, 395675, 0, 0, 0, 133, 0, 0),
(273, 0, 0, 0, 0, 0, 'Vermilion House #273', 7, 72, 300475, 0, 0, 0, 101, 0, 0),
(274, 0, 0, 0, 0, 0, 'Vermilion House #274', 7, 70, 309400, 0, 0, 0, 104, 0, 0),
(275, 0, 0, 0, 0, 0, 'Vermilion House #275', 7, 70, 336175, 0, 0, 0, 113, 0, 0),
(276, 0, 0, 0, 0, 0, 'Vermilion House #276', 7, 96, 359975, 0, 0, 0, 121, 0, 0),
(277, 0, 0, 0, 0, 0, 'Vermilion House #277', 7, 78, 297500, 0, 0, 0, 100, 0, 0),
(278, 0, 0, 0, 0, 0, 'Vermilion House #278', 7, 76, 297500, 0, 0, 0, 100, 0, 0),
(279, 0, 0, 0, 0, 0, 'Vermilion House #279', 7, 102, 392700, 0, 0, 0, 132, 0, 0),
(280, 0, 0, 0, 0, 0, 'Fuchsia House #280', 4, 98, 470050, 0, 0, 0, 158, 0, 0),
(281, 0, 0, 0, 0, 0, 'Fuchsia House #281', 4, 133, 883575, 0, 0, 0, 297, 0, 0),
(282, 0, 0, 0, 0, 0, 'Fuchsia House #282', 4, 43, 226100, 0, 0, 0, 76, 0, 0),
(283, 0, 0, 0, 0, 0, 'Fuchsia House #283', 4, 49, 235025, 0, 0, 0, 79, 0, 0),
(284, 0, 0, 0, 0, 0, 'Fuchsia House #284', 4, 49, 240975, 0, 0, 0, 81, 0, 0),
(285, 0, 0, 0, 0, 0, 'Fuchsia House #285', 4, 42, 211225, 0, 0, 0, 71, 0, 0),
(286, 0, 0, 0, 0, 1405811617, 'Fuchsia House #286', 4, 374, 1805825, 0, 0, 0, 607, 0, 0),
(287, 0, 0, 0, 0, 0, 'Fuchsia House #287', 4, 110, 612850, 0, 0, 0, 206, 0, 0),
(288, 0, 0, 0, 0, 0, 'Fuchsia House #288', 4, 186, 996625, 0, 0, 0, 335, 0, 0),
(289, 0, 0, 0, 0, 0, 'Fuchsia House #289', 4, 156, 797300, 0, 0, 0, 268, 0, 0),
(290, 0, 0, 0, 0, 0, 'Fuchsia House #290', 4, 20, 124950, 0, 0, 0, 42, 0, 0),
(291, 0, 0, 0, 0, 1405811486, 'Fuchsia House #291', 4, 336, 1713600, 0, 0, 0, 576, 0, 0),
(292, 0, 0, 0, 0, 0, 'Fuchsia House #292', 4, 111, 630700, 0, 0, 0, 212, 0, 0),
(293, 0, 0, 0, 0, 0, 'Fuchsia House #293', 4, 63, 413525, 0, 0, 0, 139, 0, 0),
(294, 0, 0, 0, 0, 0, 'Fuchsia House #294', 4, 44, 270725, 0, 0, 0, 91, 0, 0),
(295, 0, 0, 0, 0, 0, 'Fuchsia House #295', 4, 148, 708050, 0, 0, 0, 238, 0, 0),
(296, 0, 0, 0, 0, 1405812363, 'Fuchsia House #296', 4, 139, 666400, 0, 0, 0, 224, 0, 0),
(297, 0, 0, 0, 0, 0, 'Fuchsia House #297', 4, 194, 1017450, 0, 0, 0, 342, 0, 0),
(307, 0, 0, 0, 0, 1406598768, 'Unnamed House #307', 6, 48, 273700, 0, 2, 0, 92, 0, 0),
(308, 0, 0, 0, 0, 1406403381, 'Unnamed House #308', 3, 45, 181475, 0, 2, 0, 61, 0, 0),
(309, 0, 0, 0, 0, 0, 'Unnamed House #309', 3, 40, 163625, 0, 2, 0, 55, 0, 0),
(310, 0, 0, 0, 0, 0, 'Unnamed House #310', 3, 42, 169575, 0, 0, 0, 57, 0, 0),
(311, 0, 0, 0, 0, 0, 'Unnamed House #311', 3, 42, 196350, 0, 0, 0, 66, 0, 0),
(312, 0, 0, 0, 0, 0, 'House #312', 11, 57, 235025, 0, 0, 2, 79, 0, 0),
(313, 0, 0, 0, 0, 0, 'House #313', 11, 163, 731850, 0, 0, 4, 246, 0, 0),
(314, 0, 0, 0, 0, 0, 'House #314', 11, 83, 368900, 0, 0, 2, 124, 0, 0),
(315, 0, 0, 0, 0, 0, 'House #315', 11, 63, 267750, 0, 0, 2, 90, 0, 0),
(316, 0, 0, 0, 0, 0, 'House #316', 11, 65, 288575, 0, 0, 4, 97, 0, 0),
(317, 0, 0, 0, 0, 0, 'House #317', 11, 85, 446250, 0, 0, 4, 150, 0, 0),
(318, 0, 0, 0, 0, 0, 'House #318', 11, 201, 714000, 0, 0, 4, 240, 0, 0),
(319, 0, 0, 0, 0, 0, 'House #319', 11, 15, 119000, 0, 0, 0, 40, 0, 0),
(320, 0, 0, 0, 0, 0, 'House #320', 11, 93, 496825, 0, 0, 2, 167, 0, 0),
(321, 0, 0, 0, 0, 0, 'House #321', 11, 47, 223125, 0, 0, 2, 75, 0, 0),
(322, 0, 0, 0, 0, 0, 'House #322', 11, 33, 154700, 0, 0, 2, 52, 0, 0),
(323, 0, 0, 0, 0, 0, 'House #323', 11, 33, 142800, 0, 0, 2, 48, 0, 0),
(324, 0, 0, 0, 0, 0, 'House #324', 11, 39, 163625, 0, 0, 2, 55, 0, 0),
(325, 0, 0, 0, 0, 0, 'House #325', 11, 55, 214200, 0, 0, 2, 72, 0, 0),
(326, 0, 0, 0, 0, 0, 'House #326', 11, 65, 252875, 0, 0, 2, 85, 0, 0),
(327, 0, 0, 0, 0, 1405704561, 'Saffron House #327', 1, 264, 957950, 0, 2, 2, 322, 0, 0),
(328, 0, 0, 0, 0, 1405812246, 'Fuchsia House #298', 4, 178, 714000, 0, 0, 0, 240, 0, 0),
(329, 0, 0, 0, 0, 1406315070, 'Fuchsia House #299', 4, 73, 276675, 0, 3, 0, 93, 0, 0),
(330, 0, 66, 0, 0, 1405851887, 'Fuchsia House #300', 4, 83, 315350, 0, 4, 0, 106, 0, 0),
(331, 0, 0, 0, 0, 1405661212, 'Fuchsia House #301', 4, 103, 404600, 0, 8, 0, 136, 0, 0),
(332, 0, 0, 0, 0, 1405660975, 'Fuchsia House #302', 4, 81, 309400, 0, 3, 0, 104, 0, 0),
(457, 0, 0, 0, 0, 1406681392, 'Pokemopolis House #457', 20, 16, 107100, 0, 3, 0, 36, 0, 0),
(458, 0, 0, 0, 0, 1406340424, 'Pokemopolis House #458', 20, 104, 446250, 0, 6, 0, 150, 0, 0),
(459, 0, 0, 0, 0, 1406498145, 'Pokemopolis House #459', 20, 57, 270725, 0, 4, 0, 91, 0, 0),
(460, 0, 0, 0, 0, 1406667031, 'Pokemopolis House #460', 20, 77, 348075, 0, 4, 0, 117, 0, 0),
(461, 0, 0, 0, 0, 1406840725, 'Pokemopolis House #461', 20, 30, 178500, 0, 4, 0, 60, 0, 0),
(462, 0, 0, 0, 0, 1406905459, 'Pokemopolis House #462', 20, 24, 148750, 0, 3, 0, 50, 0, 0),
(463, 0, 0, 0, 0, 1407446258, 'Pokemopolis House #463', 20, 6, 59500, 0, 3, 0, 20, 0, 0),
(464, 0, 0, 0, 0, 1406416549, 'Pokemopolis House #464', 20, 171, 687225, 0, 7, 0, 231, 0, 0),
(465, 0, 0, 0, 0, 0, 'Pokemopolis House #465', 20, 6, 59500, 0, 2, 0, 20, 0, 0),
(466, 0, 0, 0, 0, 1406587777, 'Pokemopolis House #466', 20, 24, 148750, 0, 3, 0, 50, 0, 0),
(467, 0, 0, 0, 0, 1407273909, 'Pokemopolis House #467', 20, 12, 89250, 0, 2, 0, 30, 0, 0),
(468, 0, 0, 0, 0, 1406666908, 'Pokemopolis House #468', 20, 21, 133875, 0, 3, 0, 45, 0, 0),
(469, 0, 0, 0, 0, 1406327388, 'Pokemopolis House #469', 20, 106, 449225, 0, 3, 0, 151, 0, 0),
(470, 0, 0, 0, 0, 1403800789, 'Pokemopolis House #470', 20, 57, 276675, 0, 3, 0, 93, 0, 0),
(471, 0, 0, 0, 0, 0, 'Pokemopolis House #471', 20, 57, 276675, 0, 4, 0, 93, 0, 0),
(472, 0, 0, 0, 0, 1406681442, 'Pokemopolis House #472', 20, 18, 119000, 0, 4, 0, 40, 0, 0),
(473, 0, 0, 0, 0, 1406869970, 'Pokemopolis House #473', 20, 6, 59500, 0, 2, 0, 20, 0, 0),
(474, 0, 0, 0, 0, 1406411567, 'Pokemopolis House #474', 20, 24, 148750, 0, 4, 0, 50, 0, 0),
(475, 0, 0, 0, 0, 1407260787, 'Pokemopolis House #475', 20, 12, 89250, 0, 2, 0, 30, 0, 0),
(477, 0, 0, 0, 0, 0, 'Cinnabar House #477', 10, 60, 318325, 0, 9, 0, 107, 0, 0),
(478, 0, 0, 0, 0, 0, 'Cinnabar House #478', 10, 48, 249900, 0, 3, 2, 84, 0, 0),
(479, 0, 0, 0, 0, 1407177766, 'Cinnabar House #479', 10, 48, 214200, 0, 7, 2, 72, 0, 0),
(480, 0, 0, 0, 0, 1407029031, 'Cinnabar House #480', 10, 54, 240975, 0, 4, 2, 81, 0, 0),
(481, 0, 0, 0, 0, 1405805162, 'Cinnabar House #481', 10, 123, 597975, 0, 6, 2, 201, 0, 0),
(482, 0, 0, 0, 0, 1406848863, 'Cinnabar House #482', 10, 104, 428400, 0, 6, 2, 144, 0, 0),
(483, 0, 0, 0, 0, 1405648138, 'Cinnabar House #483', 10, 231, 1094800, 0, 32, 6, 368, 0, 0),
(484, 0, 0, 0, 0, 1406731468, 'Cinnabar House #484', 10, 47, 214200, 0, 7, 2, 72, 0, 0),
(485, 0, 0, 0, 0, 0, 'Cinnabar House #485', 10, 48, 229075, 0, 4, 2, 77, 0, 0),
(486, 0, 0, 0, 0, 1405633138, 'Cinnabar House #486', 10, 44, 249900, 0, 9, 2, 84, 0, 0),
(487, 0, 0, 0, 0, 0, 'Cinnabar House #487', 10, 18, 124950, 0, 5, 2, 42, 0, 0),
(488, 0, 0, 0, 0, 1406580428, 'Cinnabar House #488', 10, 47, 214200, 0, 6, 2, 72, 0, 0),
(489, 0, 0, 0, 0, 0, 'Cinnabar House #489', 10, 39, 211225, 0, 3, 2, 71, 0, 0),
(490, 0, 0, 0, 0, 1407149541, 'Cinnabar House #490', 10, 47, 190400, 0, 4, 2, 64, 0, 0),
(491, 0, 0, 0, 0, 1407100417, 'Cinnabar House #491', 10, 91, 380800, 0, 4, 2, 128, 0, 0),
(492, 0, 0, 0, 0, 0, 'Cinnabar House #492', 10, 40, 240975, 0, 5, 2, 81, 0, 0),
(493, 0, 0, 0, 0, 1406581053, 'Cinnabar House #493', 10, 39, 172550, 0, 2, 2, 58, 0, 0),
(494, 0, 0, 0, 0, 1406746209, 'Cinnabar House #494', 10, 124, 669375, 0, 9, 2, 225, 0, 0),
(495, 0, 0, 0, 0, 1406932690, 'Cinnabar House #495', 10, 124, 612850, 0, 8, 2, 206, 0, 0),
(496, 0, 0, 0, 0, 0, 'Cinnabar House #496', 10, 47, 214200, 0, 4, 2, 72, 0, 0),
(497, 0, 0, 0, 0, 1405945156, 'Cinnabar House #497', 10, 109, 496825, 0, 5, 4, 167, 0, 0),
(498, 0, 0, 0, 0, 0, 'Cinnabar House #498', 10, 28, 187425, 0, 5, 2, 63, 0, 0),
(499, 0, 0, 0, 0, 1406994535, 'Cinnabar House #499', 10, 132, 621775, 0, 3, 2, 209, 0, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `house_auctions`
--

CREATE TABLE IF NOT EXISTS `house_auctions` (
  `house_id` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `player_id` int(11) NOT NULL,
  `bid` int(10) unsigned NOT NULL DEFAULT '0',
  `limit` int(10) unsigned NOT NULL DEFAULT '0',
  `endtime` bigint(20) unsigned NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `house_data`
--

CREATE TABLE IF NOT EXISTS `house_data` (
  `house_id` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `data` longblob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `house_lists`
--

CREATE TABLE IF NOT EXISTS `house_lists` (
  `house_id` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `listid` int(11) NOT NULL,
  `list` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `killers`
--

CREATE TABLE IF NOT EXISTS `killers` (
`id` int(11) NOT NULL,
  `death_id` int(11) NOT NULL,
  `final_hit` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `unjustified` tinyint(1) unsigned NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `messages`
--

CREATE TABLE IF NOT EXISTS `messages` (
`id` int(11) NOT NULL,
  `from` int(11) DEFAULT NULL,
  `to` int(11) DEFAULT NULL,
  `title` varchar(120) DEFAULT NULL,
  `text` tinytext,
  `time` int(11) DEFAULT NULL,
  `delete_from` tinyint(1) DEFAULT NULL,
  `delete_to` tinyint(1) DEFAULT NULL,
  `unread` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `news`
--

CREATE TABLE IF NOT EXISTS `news` (
`id` int(11) NOT NULL,
  `title` varchar(150) DEFAULT '',
  `body` text,
  `time` int(11) DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `news`
--

INSERT INTO `news` (`id`, `title`, `body`, `time`) VALUES
(2, 'Pequena Atualizacao do PokexMostyer', '<p>* Novos Pokemons<br />* Novas Quests&nbsp;<br />* Novas Hunts<br />* Novo Client<br />* acesse:&nbsp;<a href="https://www.facebook.com/Pokexmostyer">https://www.facebook.com/Pokexmostyer</a></p>', 1404336929),
(3, 'Doar Para o servidor', '<p>Boa Tarde galerinha! Shop do Site esta demorando muito? Mais voc&ecirc;s sabiam que dar para comprar sem ser no shop? ! Al&eacute;m disso, preparamos essa promo&ccedil;&atilde;o especial para voc&ecirc;s ! Confiram!</p>\n<p><br />*Doando a partir de 10$ Reais, voc&ecirc; ganha mais os seguintes bonus: 10 Diamonds + 100 TD + 2 candy up + 50 revive + 1 shiny box</p>\n<p><br />*Doando a partir de 20$ Reais, voc&ecirc; ganha mais os seguintes bonus: 20 Diamonds + 150 TD + 5 candy up + 100 revive + 1 shiny box</p>\n<p><br />*Doando a partir de 30$ Reais, voc&ecirc; ganha mais os seguintes bonus: 30 Diamonds + 200 TD + 5 candy up + 150 revive + 2 shiny Box + addon Charizard</p>\n<p><br />*Doando a partir de 40$ Reais, voc&ecirc; ganha mais os seguintes bonus: 40 Diamonds + 1 super stone + 250 TD + 200 revive + 1 bike + addon shiny golem</p>\n<p><br />*Doando a partir de 50$ Reais, voc&ecirc; ganha mais os seguintes bonus: 50 Diamonds + 2 super stone + 300 TD + 1 lendaria box</p>\n<p><br />Para Doar o Dinheiro mande Mensagem Private para a pagina <a href="https://www.facebook.com/Pokexmostyer">https://www.facebook.com/Pokexmostyer</a>&nbsp;que conversaremos :D</p>\n<p>att: Equipe Pok&eacute;xMostyer.</p>', 1406489480);

-- --------------------------------------------------------

--
-- Estrutura da tabela `players`
--

CREATE TABLE IF NOT EXISTS `players` (
`id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `group_id` int(11) NOT NULL DEFAULT '1',
  `account_id` int(11) NOT NULL DEFAULT '0',
  `level` int(11) NOT NULL DEFAULT '1',
  `vocation` int(11) NOT NULL DEFAULT '0',
  `health` int(11) NOT NULL DEFAULT '150',
  `healthmax` int(11) NOT NULL DEFAULT '150',
  `experience` bigint(20) NOT NULL DEFAULT '0',
  `lookbody` int(11) NOT NULL DEFAULT '0',
  `lookfeet` int(11) NOT NULL DEFAULT '0',
  `lookhead` int(11) NOT NULL DEFAULT '0',
  `looklegs` int(11) NOT NULL DEFAULT '0',
  `looktype` int(11) NOT NULL DEFAULT '136',
  `lookaddons` int(11) NOT NULL DEFAULT '0',
  `maglevel` int(11) NOT NULL DEFAULT '0',
  `mana` int(11) NOT NULL DEFAULT '0',
  `manamax` int(11) NOT NULL DEFAULT '0',
  `manaspent` int(11) NOT NULL DEFAULT '0',
  `soul` int(10) unsigned NOT NULL DEFAULT '0',
  `town_id` int(11) NOT NULL DEFAULT '0',
  `posx` int(11) NOT NULL DEFAULT '0',
  `posy` int(11) NOT NULL DEFAULT '0',
  `posz` int(11) NOT NULL DEFAULT '0',
  `conditions` blob NOT NULL,
  `cap` int(11) NOT NULL DEFAULT '0',
  `sex` int(11) NOT NULL DEFAULT '0',
  `lastlogin` bigint(20) unsigned NOT NULL DEFAULT '0',
  `lastip` int(10) unsigned NOT NULL DEFAULT '0',
  `save` tinyint(1) NOT NULL DEFAULT '1',
  `skull` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `skulltime` int(11) NOT NULL DEFAULT '0',
  `rank_id` int(11) NOT NULL DEFAULT '0',
  `guildnick` varchar(255) NOT NULL DEFAULT '',
  `lastlogout` bigint(20) unsigned NOT NULL DEFAULT '0',
  `blessings` tinyint(2) NOT NULL DEFAULT '0',
  `balance` bigint(20) NOT NULL DEFAULT '0',
  `stamina` bigint(20) NOT NULL DEFAULT '151200000' COMMENT 'stored in miliseconds',
  `direction` int(11) NOT NULL DEFAULT '2',
  `loss_experience` int(11) NOT NULL DEFAULT '100',
  `loss_mana` int(11) NOT NULL DEFAULT '100',
  `loss_skills` int(11) NOT NULL DEFAULT '100',
  `loss_containers` int(11) NOT NULL DEFAULT '100',
  `loss_items` int(11) NOT NULL DEFAULT '100',
  `premend` int(11) NOT NULL DEFAULT '0' COMMENT 'NOT IN USE BY THE SERVER',
  `online` tinyint(1) NOT NULL DEFAULT '0',
  `marriage` int(10) unsigned NOT NULL DEFAULT '0',
  `promotion` int(11) NOT NULL DEFAULT '0',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `description` varchar(255) NOT NULL DEFAULT '',
  `old_name` varchar(255) DEFAULT NULL,
  `hide_char` int(11) DEFAULT NULL,
  `worldtransfer` int(11) DEFAULT NULL,
  `created` int(16) DEFAULT NULL,
  `nick_verify` int(11) DEFAULT NULL,
  `comment` text
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `players`
--

INSERT INTO `players` (`id`, `name`, `world_id`, `group_id`, `account_id`, `level`, `vocation`, `health`, `healthmax`, `experience`, `lookbody`, `lookfeet`, `lookhead`, `looklegs`, `looktype`, `lookaddons`, `maglevel`, `mana`, `manamax`, `manaspent`, `soul`, `town_id`, `posx`, `posy`, `posz`, `conditions`, `cap`, `sex`, `lastlogin`, `lastip`, `save`, `skull`, `skulltime`, `rank_id`, `guildnick`, `lastlogout`, `blessings`, `balance`, `stamina`, `direction`, `loss_experience`, `loss_mana`, `loss_skills`, `loss_containers`, `loss_items`, `premend`, `online`, `marriage`, `promotion`, `deleted`, `description`, `old_name`, `hide_char`, `worldtransfer`, `created`, `nick_verify`, `comment`) VALUES
(67, 'Pokemon Trainer Sample', 0, 1, 2, 10, 1, 150, 150, 9300, 0, 0, 0, 0, 510, 0, 0, 0, 6, 0, 0, 1, 998, 1000, 7, '', 0, 1, 1465433933, 16777343, 1, 0, 0, 0, '', 1465433949, 0, 0, 201600000, 0, 0, 100, 100, 100, 100, 0, 0, 0, 0, 0, '', NULL, NULL, NULL, 1465431335, NULL, NULL);

--
-- Acionadores `players`
--
DELIMITER //
CREATE TRIGGER `oncreate_players` AFTER INSERT ON `players`
 FOR EACH ROW BEGIN
	INSERT INTO `player_skills` (`player_id`, `skillid`, `value`) VALUES (NEW.`id`, 0, 10);
	INSERT INTO `player_skills` (`player_id`, `skillid`, `value`) VALUES (NEW.`id`, 1, 10);
	INSERT INTO `player_skills` (`player_id`, `skillid`, `value`) VALUES (NEW.`id`, 2, 10);
	INSERT INTO `player_skills` (`player_id`, `skillid`, `value`) VALUES (NEW.`id`, 3, 10);
	INSERT INTO `player_skills` (`player_id`, `skillid`, `value`) VALUES (NEW.`id`, 4, 10);
	INSERT INTO `player_skills` (`player_id`, `skillid`, `value`) VALUES (NEW.`id`, 5, 10);
	INSERT INTO `player_skills` (`player_id`, `skillid`, `value`) VALUES (NEW.`id`, 6, 10);
END
//
DELIMITER ;
DELIMITER //
CREATE TRIGGER `ondelete_players` BEFORE DELETE ON `players`
 FOR EACH ROW BEGIN
	DELETE FROM `bans` WHERE `type` IN (2, 5) AND `value` = OLD.`id`;
	UPDATE `houses` SET `owner` = 0 WHERE `owner` = OLD.`id`;
END
//
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_deaths`
--

CREATE TABLE IF NOT EXISTS `player_deaths` (
`id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `date` bigint(20) unsigned NOT NULL,
  `level` int(10) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_depotitems`
--

CREATE TABLE IF NOT EXISTS `player_depotitems` (
  `player_id` int(11) NOT NULL,
  `sid` int(11) NOT NULL COMMENT 'any given range, eg. 0-100 is reserved for depot lockers and all above 100 will be normal items inside depots',
  `pid` int(11) NOT NULL DEFAULT '0',
  `itemtype` int(11) NOT NULL,
  `count` int(11) NOT NULL DEFAULT '0',
  `attributes` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_items`
--

CREATE TABLE IF NOT EXISTS `player_items` (
  `player_id` int(11) NOT NULL DEFAULT '0',
  `pid` int(11) NOT NULL DEFAULT '0',
  `sid` int(11) NOT NULL DEFAULT '0',
  `itemtype` int(11) NOT NULL DEFAULT '0',
  `count` int(11) NOT NULL DEFAULT '0',
  `attributes` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `player_items`
--

INSERT INTO `player_items` (`player_id`, `pid`, `sid`, `itemtype`, `count`, `attributes`) VALUES
(67, 1, 101, 2120, 1, ''),
(67, 2, 102, 2580, 1, ''),
(67, 3, 103, 1987, 1, ''),
(67, 4, 104, 2550, 1, ''),
(67, 5, 105, 1988, 1, ''),
(67, 6, 106, 2382, 1, ''),
(67, 7, 107, 2395, 1, ''),
(67, 9, 108, 7385, 1, ''),
(67, 103, 109, 13371, 1, 0x800d00040049636f6e010700000072617474617461040062616c6c0104000000706f6b65080062616c6c456666650104000000706f6b650b006465736372697074696f6e0113000000436f6e7461696e73206120526174746174612e080066616b65646573630113000000436f6e7461696e73206120526174746174612e0500686170707902ff000000050068704d617802b4000000050068704e6f7702b400000008006870546f4472617702000000000a00696e697469616c4b697404010400706f6b650107000000526174746174610900706f6b65446561746804000b007265766572736549636f6e0104000000706f6b65),
(67, 103, 110, 12912, 1, 0x800d00040049636f6e01080000006361746572706965040062616c6c0104000000706f6b65080062616c6c456666650104000000706f6b650b006465736372697074696f6e0114000000436f6e7461696e7320612043617465727069652e080066616b65646573630114000000436f6e7461696e7320612043617465727069652e0500686170707902ff000000050068704d617802a8020000050068704e6f7702a802000008006870546f4472617702000000000a00696e697469616c4b697404010400706f6b65010800000043617465727069650900706f6b65446561746804000b007265766572736549636f6e0104000000706f6b65),
(67, 103, 111, 13758, 1, 0x800e00040049636f6e0106000000776565646c65040062616c6c0104000000706f6b65080062616c6c456666650104000000706f6b650b006465736372697074696f6e0112000000436f6e7461696e73206120576565646c652e080066616b65646573630112000000436f6e7461696e73206120576565646c652e0500686170707902ff000000050068704d61780212020000050068704e6f77021202000008006870546f447261770200000000060068756e67657202050000000a00696e697469616c4b697404010400706f6b650106000000576565646c650900706f6b65446561746804000b007265766572736549636f6e0104000000706f6b65),
(67, 103, 112, 2394, 100, 0x0f64),
(67, 103, 113, 12344, 20, 0x0f14),
(67, 103, 114, 12347, 50, 0x0f32),
(67, 103, 115, 12349, 30, 0x0f1e),
(67, 103, 116, 2160, 1, 0x0f01),
(67, 105, 117, 12260, 1, ''),
(67, 105, 118, 12261, 1, ''),
(67, 105, 119, 12262, 1, ''),
(67, 105, 120, 12263, 1, ''),
(67, 105, 121, 12265, 1, ''),
(67, 105, 122, 12264, 1, ''),
(67, 105, 123, 12266, 1, ''),
(67, 105, 124, 12267, 1, '');

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_killers`
--

CREATE TABLE IF NOT EXISTS `player_killers` (
  `kill_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_namelocks`
--

CREATE TABLE IF NOT EXISTS `player_namelocks` (
  `player_id` int(11) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `new_name` varchar(255) NOT NULL,
  `date` bigint(20) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_skills`
--

CREATE TABLE IF NOT EXISTS `player_skills` (
  `player_id` int(11) NOT NULL DEFAULT '0',
  `skillid` tinyint(2) NOT NULL DEFAULT '0',
  `value` int(10) unsigned NOT NULL DEFAULT '0',
  `count` int(10) unsigned NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `player_skills`
--

INSERT INTO `player_skills` (`player_id`, `skillid`, `value`, `count`) VALUES
(67, 0, 10, 0),
(67, 1, 10, 0),
(67, 2, 10, 0),
(67, 3, 10, 0),
(67, 4, 10, 0),
(67, 5, 10, 0),
(67, 6, 10, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_spells`
--

CREATE TABLE IF NOT EXISTS `player_spells` (
  `player_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_storage`
--

CREATE TABLE IF NOT EXISTS `player_storage` (
  `player_id` int(11) NOT NULL DEFAULT '0',
  `key` int(10) unsigned NOT NULL DEFAULT '0',
  `value` varchar(255) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `player_storage`
--

INSERT INTO `player_storage` (`player_id`, `key`, `value`) VALUES
(67, 0, '0'),
(67, 104, 'Giant Magikarp:'),
(67, 1001, 'Bulbasaur:'),
(67, 1002, 'Ivysaur:'),
(67, 1003, 'Venusaur:'),
(67, 1004, 'Charmander:'),
(67, 1005, 'Charmeleon:'),
(67, 1006, 'Charizard:'),
(67, 1007, 'Squirtle:'),
(67, 1008, 'Wartortle:'),
(67, 1009, 'Blastoise:'),
(67, 1010, 'Caterpie:'),
(67, 1011, 'Metapod:'),
(67, 1012, 'Butterfree:'),
(67, 1013, 'Weedle:'),
(67, 1014, 'Kakuna:'),
(67, 1015, 'Beedrill:'),
(67, 1016, 'Pidgey:'),
(67, 1017, 'Pidgeotto:'),
(67, 1018, 'Pidgeot:'),
(67, 1019, 'Rattata:'),
(67, 1020, 'Raticate:'),
(67, 1021, 'Spearow:'),
(67, 1022, 'Fearow:'),
(67, 1023, 'Ekans:'),
(67, 1024, 'Arbok:'),
(67, 1025, 'Pikachu:'),
(67, 1026, 'Raichu:'),
(67, 1027, 'Sandshrew:'),
(67, 1028, 'Sandslash:'),
(67, 1029, 'Nidoran Female:'),
(67, 1030, 'Nidorina:'),
(67, 1031, 'Nidoqueen:'),
(67, 1032, 'Nidoran Male:'),
(67, 1033, 'Nidorino:'),
(67, 1034, 'Nidoking:'),
(67, 1035, 'Clefairy:'),
(67, 1036, 'Clefable:'),
(67, 1037, 'Vulpix:'),
(67, 1038, 'Ninetales:'),
(67, 1039, 'Jigglypuff:'),
(67, 1040, 'Wigglytuff:'),
(67, 1041, 'Zubat:'),
(67, 1042, 'Golbat:'),
(67, 1043, 'Oddish:'),
(67, 1044, 'Gloom:'),
(67, 1045, 'Vileplume:'),
(67, 1046, 'Paras:'),
(67, 1047, 'Parasect:'),
(67, 1048, 'Venonat:'),
(67, 1049, 'Venomoth:'),
(67, 1050, 'Diglett:'),
(67, 1051, 'Dugtrio:'),
(67, 1052, 'Meowth:'),
(67, 1053, 'Persian:'),
(67, 1054, 'Psyduck:'),
(67, 1055, 'Golduck:'),
(67, 1056, 'Mankey:'),
(67, 1057, 'Primeape:'),
(67, 1058, 'Growlithe:'),
(67, 1059, 'Arcanine:'),
(67, 1060, 'Poliwag:'),
(67, 1061, 'Poliwhirl:'),
(67, 1062, 'Poliwrath:'),
(67, 1063, 'Abra:'),
(67, 1064, 'Kadabra:'),
(67, 1065, 'Alakazam:'),
(67, 1066, 'Machop:'),
(67, 1067, 'Machoke:'),
(67, 1068, 'Machamp:'),
(67, 1069, 'Bellsprout:'),
(67, 1070, 'Weepinbell:'),
(67, 1071, 'Victreebel:'),
(67, 1072, 'Tentacool:'),
(67, 1073, 'Tentacruel:'),
(67, 1074, 'Geodude:'),
(67, 1075, 'Graveler:'),
(67, 1076, 'Golem:'),
(67, 1077, 'Ponyta:'),
(67, 1078, 'Rapidash:'),
(67, 1079, 'Slowpoke:'),
(67, 1080, 'Slowbro:'),
(67, 1081, 'Magnemite:'),
(67, 1082, 'Magneton:'),
(67, 1083, 'Farfetch''d:'),
(67, 1084, 'Doduo:'),
(67, 1085, 'Dodrio:'),
(67, 1086, 'Seel:'),
(67, 1087, 'Dewgong:'),
(67, 1088, 'Grimer:'),
(67, 1089, 'Muk:'),
(67, 1090, 'Shellder:'),
(67, 1091, 'Cloyster:'),
(67, 1092, 'Gastly:'),
(67, 1093, 'Haunter:'),
(67, 1094, 'Gengar:'),
(67, 1095, 'Onix:'),
(67, 1096, 'Drowzee:'),
(67, 1097, 'Hypno:'),
(67, 1098, 'Krabby:'),
(67, 1099, 'Kingler:'),
(67, 1100, 'Voltorb:'),
(67, 1101, 'Electrode:'),
(67, 1102, 'Exeggcute:'),
(67, 1103, 'Exeggutor:'),
(67, 1104, 'Cubone:'),
(67, 1105, 'Marowak:'),
(67, 1106, 'Hitmonlee:'),
(67, 1107, 'Hitmonchan:'),
(67, 1108, 'Lickitung:'),
(67, 1109, 'Koffing:'),
(67, 1110, 'Weezing:'),
(67, 1111, 'Rhyhorn:'),
(67, 1112, 'Rhydon:'),
(67, 1113, 'Chansey:'),
(67, 1114, 'Tangela:'),
(67, 1115, 'Kangaskhan:'),
(67, 1116, 'Horsea:'),
(67, 1117, 'Seadra:'),
(67, 1118, 'Goldeen:'),
(67, 1119, 'Seaking:'),
(67, 1120, 'Staryu:'),
(67, 1121, 'Starmie:'),
(67, 1122, 'Mr. Mime:'),
(67, 1123, 'Scyther:'),
(67, 1124, 'Jynx:'),
(67, 1125, 'Electabuzz:'),
(67, 1126, 'Magmar:'),
(67, 1127, 'Pinsir:'),
(67, 1128, 'Tauros:'),
(67, 1129, 'Magikarp:'),
(67, 1130, 'Gyarados:'),
(67, 1131, 'Lapras:'),
(67, 1132, 'Ditto:'),
(67, 1133, 'Eevee:'),
(67, 1134, 'Vaporeon:'),
(67, 1135, 'Jolteon:'),
(67, 1136, 'Flareon:'),
(67, 1137, 'Porygon:'),
(67, 1138, 'Omanyte:'),
(67, 1139, 'Omastar:'),
(67, 1140, 'Kabuto:'),
(67, 1141, 'Kabutops:'),
(67, 1142, 'Aerodactyl:'),
(67, 1143, 'Snorlax:'),
(67, 1144, 'Articuno:'),
(67, 1145, 'Zapdos:'),
(67, 1146, 'Moltres:'),
(67, 1147, 'Dratini:'),
(67, 1148, 'Dragonair:'),
(67, 1149, 'Dragonite:'),
(67, 1150, 'Mewtwo:'),
(67, 1151, 'Mew:'),
(67, 1152, 'Chikorita:'),
(67, 1153, 'Bayleef:'),
(67, 1154, 'Meganium:'),
(67, 1155, 'Cyndaquil:'),
(67, 1156, 'Quilava:'),
(67, 1157, 'Typhlosion:'),
(67, 1158, 'Totodile:'),
(67, 1159, 'Croconaw:'),
(67, 1160, 'Feraligatr:'),
(67, 1161, 'Sentret:'),
(67, 1162, 'Furret:'),
(67, 1163, 'Hoothoot:'),
(67, 1164, 'Noctowl:'),
(67, 1165, 'Ledyba:'),
(67, 1166, 'Ledian:'),
(67, 1167, 'Spinarak:'),
(67, 1168, 'Ariados:'),
(67, 1169, 'Crobat:'),
(67, 1170, 'Chinchou:'),
(67, 1171, 'Lanturn:'),
(67, 1172, 'Pichu:'),
(67, 1173, 'Cleffa:'),
(67, 1174, 'Igglybuff:'),
(67, 1175, 'Togepi:'),
(67, 1176, 'Togetic:'),
(67, 1177, 'Natu:'),
(67, 1178, 'Xatu:'),
(67, 1179, 'Mareep:'),
(67, 1180, 'Flaaffy:'),
(67, 1181, 'Ampharos:'),
(67, 1182, 'Bellossom:'),
(67, 1183, 'Marill:'),
(67, 1184, 'Azumarill:'),
(67, 1185, 'Sudowoodo:'),
(67, 1186, 'Politoed:'),
(67, 1187, 'Hoppip:'),
(67, 1188, 'Skiploom:'),
(67, 1189, 'Jumpluff:'),
(67, 1190, 'Aipom:'),
(67, 1191, 'Sunkern:'),
(67, 1192, 'Sunflora:'),
(67, 1193, 'Yanma:'),
(67, 1194, 'Wooper:'),
(67, 1195, 'Quagsire:'),
(67, 1196, 'Espeon:'),
(67, 1197, 'Umbreon:'),
(67, 1198, 'Murkrow:'),
(67, 1199, 'Slowking:'),
(67, 1200, 'Misdreavus:'),
(67, 1201, 'Unown:'),
(67, 1202, 'Wobbuffet:'),
(67, 1203, 'Girafarig:'),
(67, 1204, 'Pineco:'),
(67, 1205, 'Forretress:'),
(67, 1206, 'Dunsparce:'),
(67, 1207, 'Gligar:'),
(67, 1208, 'Steelix:'),
(67, 1209, 'Snubbull:'),
(67, 1210, 'Granbull:'),
(67, 1211, 'Qwilfish:'),
(67, 1212, 'Scizor:'),
(67, 1213, 'Shuckle:'),
(67, 1214, 'Heracross:'),
(67, 1215, 'Sneasel:'),
(67, 1216, 'Teddiursa:'),
(67, 1217, 'Ursaring:'),
(67, 1218, 'Slugma:'),
(67, 1219, 'Magcargo:'),
(67, 1220, 'Swinub:'),
(67, 1221, 'Piloswine:'),
(67, 1222, 'Corsola:'),
(67, 1223, 'Remoraid:'),
(67, 1224, 'Octillery:'),
(67, 1225, 'Delibird:'),
(67, 1226, 'Mantine:'),
(67, 1227, 'Skarmory:'),
(67, 1228, 'Houndour:'),
(67, 1229, 'Houndoom:'),
(67, 1230, 'Kingdra:'),
(67, 1231, 'Phanpy:'),
(67, 1232, 'Donphan:'),
(67, 1233, 'Porygon2:'),
(67, 1234, 'Stantler:'),
(67, 1235, 'Smeargle:'),
(67, 1236, 'Tyrogue:'),
(67, 1237, 'Hitmontop:'),
(67, 1238, 'Smoochum:'),
(67, 1239, 'Elekid:'),
(67, 1240, 'Magby:'),
(67, 1241, 'Miltank:'),
(67, 1242, 'Blissey:'),
(67, 1243, 'Raikou:'),
(67, 1244, 'Entei:'),
(67, 1245, 'Suicune:'),
(67, 1246, 'Larvitar:'),
(67, 1247, 'Pupitar:'),
(67, 1248, 'Tyranitar:'),
(67, 1249, 'Lugia:'),
(67, 1250, 'Ho-oh:'),
(67, 1251, 'Celebi:'),
(67, 8082, '1'),
(67, 8085, '0'),
(67, 10030, 'Shiny Venusaur:'),
(67, 10060, 'Shiny Charizard:'),
(67, 10090, 'Shiny Blastoise:'),
(67, 10120, 'Shiny Butterfree:'),
(67, 10150, 'Shiny Beedrill:'),
(67, 10180, 'Shiny Pidgeot:'),
(67, 10190, 'Shiny Rattata:'),
(67, 10200, 'Shiny Raticate:'),
(67, 10220, 'Shiny Fearow:'),
(67, 10260, 'Shiny Raichu:'),
(67, 10340, 'Shiny Nidoking:'),
(67, 10410, 'Shiny Zubat:'),
(67, 10420, 'Shiny Golbat:'),
(67, 10430, 'Shiny Oddish:'),
(67, 10450, 'Shiny Vileplume:'),
(67, 10460, 'Shiny Paras:'),
(67, 10470, 'Shiny Parasect:'),
(67, 10480, 'Shiny Venonat:'),
(67, 10490, 'Shiny Venomoth:'),
(67, 10580, 'Shiny Growlithe:'),
(67, 10590, 'Shiny Arcanine:'),
(67, 10630, 'Shiny Abra:'),
(67, 10650, 'Shiny Alakazam:'),
(67, 10720, 'Shiny Tentacool:'),
(67, 10730, 'Shiny Tentacruel:'),
(67, 10760, 'Shiny Golem:'),
(67, 10830, 'Shiny Farfetch''d:'),
(67, 10880, 'Shiny Grimer:'),
(67, 10890, 'Shiny Muk:'),
(67, 10940, 'Shiny Gengar:'),
(67, 10950, 'Shiny Onix:'),
(67, 10970, 'Shiny Hypno:'),
(67, 10980, 'Shiny Krabby:'),
(67, 10990, 'Shiny Kingler:'),
(67, 11000, 'Shiny Voltorb:'),
(67, 11010, 'Shiny Electrode:'),
(67, 11040, 'Shiny Cubone:'),
(67, 11050, 'Shiny Marowak:'),
(67, 11060, 'Shiny Hitmonlee:'),
(67, 11070, 'Shiny Hitmonchan:'),
(67, 11140, 'Shiny Tangela:'),
(67, 11160, 'Shiny Horsea:'),
(67, 11170, 'Shiny Seadra:'),
(67, 11230, 'Shiny Scyther:'),
(67, 11240, 'Shiny Jynx:'),
(67, 11250, 'Shiny Electabuzz:'),
(67, 11270, 'Shiny Pinsir:'),
(67, 11290, 'Shiny Magikarp:'),
(67, 11300, 'Shiny Gyarados:'),
(67, 11340, 'Shiny Vaporeon:'),
(67, 11350, 'Shiny Jolteon:'),
(67, 11360, 'Shiny Flareon:'),
(67, 11430, 'Shiny Snorlax:'),
(67, 11470, 'Shiny Dratini:'),
(67, 11480, 'Shiny Dragonair:'),
(67, 11490, 'Shiny Dragonite:'),
(67, 11520, 'Shiny Hitmontop:'),
(67, 11521, 'Shiny Mr. Mime:'),
(67, 11522, 'Shiny Rhydon:'),
(67, 11523, 'Shiny Ninetales:'),
(67, 11524, 'Shiny Ariados:'),
(67, 11525, 'Shiny Magneton:'),
(67, 11526, 'Shiny Espeon:'),
(67, 11527, 'Shiny Politoed:'),
(67, 11528, 'Shiny Umbreon:'),
(67, 11529, 'Shiny Stantler:'),
(67, 11530, 'Shiny Dodrio:'),
(67, 11531, 'Shiny Ampharos:'),
(67, 11532, 'Shiny Feraligatr:'),
(67, 11533, 'Shiny Larvitar:'),
(67, 11534, 'Shiny Machamp:'),
(67, 11535, 'Shiny Meganium:'),
(67, 11536, 'Shiny Pupitar:'),
(67, 11537, 'Shiny Tauros:'),
(67, 11538, 'Shiny Typhlosion:'),
(67, 11539, 'Shiny Xatu:'),
(67, 11540, 'Shiny Weezing:'),
(67, 11541, 'Shiny Sandslash:'),
(67, 11542, 'Shiny Crobat:'),
(67, 11543, 'Shiny Magmar:'),
(67, 11545, 'Shiny Giant Magikarp:'),
(67, 16000, 'Tropius:'),
(67, 55000, '0'),
(67, 55001, '0'),
(67, 55002, '0'),
(67, 55006, '0'),
(67, 55007, '0');

-- --------------------------------------------------------

--
-- Estrutura da tabela `player_viplist`
--

CREATE TABLE IF NOT EXISTS `player_viplist` (
  `player_id` int(11) NOT NULL,
  `vip_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `poll`
--

CREATE TABLE IF NOT EXISTS `poll` (
`id` int(11) NOT NULL,
  `question` varchar(150) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_start` datetime DEFAULT NULL,
  `date_end` datetime DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `poll_answer`
--

CREATE TABLE IF NOT EXISTS `poll_answer` (
`id` int(11) NOT NULL,
  `poll_id` int(11) NOT NULL,
  `answer` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `poll_votes`
--

CREATE TABLE IF NOT EXISTS `poll_votes` (
`id` int(11) NOT NULL,
  `answer_id` int(11) DEFAULT NULL,
  `poll_id` int(11) DEFAULT NULL,
  `account_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
`id` int(11) NOT NULL,
  `title` varchar(120) DEFAULT NULL,
  `text` text,
  `time` int(11) DEFAULT NULL,
  `author` varchar(64) DEFAULT NULL,
  `board_id` int(11) DEFAULT NULL,
  `thread_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `server_config`
--

CREATE TABLE IF NOT EXISTS `server_config` (
  `config` varchar(35) NOT NULL DEFAULT '',
  `value` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `server_config`
--

INSERT INTO `server_config` (`config`, `value`) VALUES
('db_version', 23),
('encryption', 2);

-- --------------------------------------------------------

--
-- Estrutura da tabela `server_motd`
--

CREATE TABLE IF NOT EXISTS `server_motd` (
  `id` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `server_motd`
--

INSERT INTO `server_motd` (`id`, `world_id`, `text`) VALUES
(1, 0, 'Welcome to The Forgotten Server!'),
(2, 0, 'Bem-vindo, ao PokéxMostyer.'),
(3, 0, 'Bem-vindo, ao PokéxMostyer, nova Era.'),
(4, 0, 'Bem Vindo ao DarkXPoke!');

-- --------------------------------------------------------

--
-- Estrutura da tabela `server_record`
--

CREATE TABLE IF NOT EXISTS `server_record` (
  `record` int(11) NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `timestamp` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `server_record`
--

INSERT INTO `server_record` (`record`, `world_id`, `timestamp`) VALUES
(0, 0, 0),
(1, 0, 1403360971),
(2, 0, 1403543324),
(3, 0, 1403543386),
(4, 0, 1403546243),
(5, 0, 1403546272),
(6, 0, 1403547704),
(7, 0, 1403548056),
(8, 0, 1403548179),
(9, 0, 1403548193),
(10, 0, 1403621286),
(11, 0, 1403624055),
(12, 0, 1403627973),
(13, 0, 1403634362),
(14, 0, 1403634413),
(15, 0, 1403634767),
(16, 0, 1403634943),
(17, 0, 1403634992),
(18, 0, 1403637550),
(19, 0, 1403637801),
(20, 0, 1403638099),
(21, 0, 1403638513),
(22, 0, 1403638584),
(23, 0, 1403640458),
(24, 0, 1403640463),
(25, 0, 1403640683),
(26, 0, 1403735345),
(27, 0, 1403803536),
(28, 0, 1403811634),
(29, 0, 1403813541),
(30, 0, 1403813565),
(31, 0, 1404487638),
(32, 0, 1404487641),
(33, 0, 1404487666),
(34, 0, 1404490282),
(35, 0, 1404672339),
(36, 0, 1405700990),
(37, 0, 1405701211),
(38, 0, 1405701389),
(39, 0, 1405720571),
(40, 0, 1405721631),
(41, 0, 1405721797),
(42, 0, 1405721978),
(43, 0, 1405721998),
(44, 0, 1406323376),
(45, 0, 1406323728),
(46, 0, 1406323758),
(47, 0, 1406323781),
(48, 0, 1406323825),
(49, 0, 1406324394),
(50, 0, 1406568473),
(51, 0, 1406568638),
(52, 0, 1406586879),
(53, 0, 1406586962),
(54, 0, 1406586982),
(55, 0, 1406588517),
(56, 0, 1406588577);

-- --------------------------------------------------------

--
-- Estrutura da tabela `server_reports`
--

CREATE TABLE IF NOT EXISTS `server_reports` (
`id` int(11) NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `player_id` int(11) NOT NULL DEFAULT '1',
  `posx` int(11) NOT NULL DEFAULT '0',
  `posy` int(11) NOT NULL DEFAULT '0',
  `posz` int(11) NOT NULL DEFAULT '0',
  `timestamp` bigint(20) NOT NULL DEFAULT '0',
  `report` text NOT NULL,
  `reads` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `threads`
--

CREATE TABLE IF NOT EXISTS `threads` (
`id` int(11) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `sticked` tinyint(1) DEFAULT NULL,
  `closed` tinyint(1) DEFAULT NULL,
  `author` varchar(64) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `board_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tiles`
--

CREATE TABLE IF NOT EXISTS `tiles` (
  `id` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `house_id` int(10) unsigned NOT NULL,
  `x` int(5) unsigned NOT NULL,
  `y` int(5) unsigned NOT NULL,
  `z` tinyint(2) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tile_items`
--

CREATE TABLE IF NOT EXISTS `tile_items` (
  `tile_id` int(10) unsigned NOT NULL,
  `world_id` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `sid` int(11) NOT NULL,
  `pid` int(11) NOT NULL DEFAULT '0',
  `itemtype` int(11) NOT NULL,
  `count` int(11) NOT NULL DEFAULT '0',
  `attributes` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `videos`
--

CREATE TABLE IF NOT EXISTS `videos` (
`id` int(11) NOT NULL,
  `author` int(11) DEFAULT NULL,
  `title` varchar(120) DEFAULT NULL,
  `description` tinytext,
  `youtube` varchar(45) DEFAULT NULL,
  `views` int(11) DEFAULT NULL,
  `time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estrutura da tabela `video_comments`
--

CREATE TABLE IF NOT EXISTS `video_comments` (
`id` int(10) NOT NULL,
  `author` int(11) DEFAULT NULL,
  `video` int(11) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `text` tinytext
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `account_viplist`
--
ALTER TABLE `account_viplist`
 ADD UNIQUE KEY `account_id_2` (`account_id`,`player_id`), ADD KEY `account_id` (`account_id`), ADD KEY `player_id` (`player_id`), ADD KEY `world_id` (`world_id`);

--
-- Indexes for table `bans`
--
ALTER TABLE `bans`
 ADD PRIMARY KEY (`id`), ADD KEY `type` (`type`,`value`), ADD KEY `active` (`active`);

--
-- Indexes for table `bugtracker`
--
ALTER TABLE `bugtracker`
 ADD PRIMARY KEY (`id`), ADD KEY `author` (`author`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
 ADD PRIMARY KEY (`id`), ADD KEY `news_id` (`news_id`), ADD KEY `author` (`author`);

--
-- Indexes for table `environment_killers`
--
ALTER TABLE `environment_killers`
 ADD KEY `kill_id` (`kill_id`);

--
-- Indexes for table `forums`
--
ALTER TABLE `forums`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
 ADD PRIMARY KEY (`id`), ADD KEY `with` (`with`), ADD KEY `friend` (`friend`);

--
-- Indexes for table `global_storage`
--
ALTER TABLE `global_storage`
 ADD UNIQUE KEY `key` (`key`,`world_id`);

--
-- Indexes for table `guilds`
--
ALTER TABLE `guilds`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`,`world_id`);

--
-- Indexes for table `guild_invites`
--
ALTER TABLE `guild_invites`
 ADD UNIQUE KEY `player_id` (`player_id`,`guild_id`), ADD KEY `guild_id` (`guild_id`);

--
-- Indexes for table `guild_ranks`
--
ALTER TABLE `guild_ranks`
 ADD PRIMARY KEY (`id`), ADD KEY `guild_id` (`guild_id`);

--
-- Indexes for table `houses`
--
ALTER TABLE `houses`
 ADD UNIQUE KEY `id` (`id`,`world_id`);

--
-- Indexes for table `house_auctions`
--
ALTER TABLE `house_auctions`
 ADD UNIQUE KEY `house_id` (`house_id`,`world_id`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `house_data`
--
ALTER TABLE `house_data`
 ADD UNIQUE KEY `house_id` (`house_id`,`world_id`);

--
-- Indexes for table `house_lists`
--
ALTER TABLE `house_lists`
 ADD UNIQUE KEY `house_id` (`house_id`,`world_id`,`listid`);

--
-- Indexes for table `killers`
--
ALTER TABLE `killers`
 ADD PRIMARY KEY (`id`), ADD KEY `death_id` (`death_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
 ADD PRIMARY KEY (`id`), ADD KEY `from` (`from`), ADD KEY `to` (`to`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`,`deleted`), ADD KEY `account_id` (`account_id`), ADD KEY `group_id` (`group_id`), ADD KEY `online` (`online`), ADD KEY `deleted` (`deleted`);

--
-- Indexes for table `player_deaths`
--
ALTER TABLE `player_deaths`
 ADD PRIMARY KEY (`id`), ADD KEY `date` (`date`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_depotitems`
--
ALTER TABLE `player_depotitems`
 ADD UNIQUE KEY `player_id_2` (`player_id`,`sid`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_items`
--
ALTER TABLE `player_items`
 ADD UNIQUE KEY `player_id_2` (`player_id`,`sid`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_killers`
--
ALTER TABLE `player_killers`
 ADD KEY `kill_id` (`kill_id`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_namelocks`
--
ALTER TABLE `player_namelocks`
 ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_skills`
--
ALTER TABLE `player_skills`
 ADD UNIQUE KEY `player_id_2` (`player_id`,`skillid`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_spells`
--
ALTER TABLE `player_spells`
 ADD UNIQUE KEY `player_id_2` (`player_id`,`name`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_storage`
--
ALTER TABLE `player_storage`
 ADD UNIQUE KEY `player_id_2` (`player_id`,`key`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `player_viplist`
--
ALTER TABLE `player_viplist`
 ADD UNIQUE KEY `player_id_2` (`player_id`,`vip_id`), ADD KEY `player_id` (`player_id`), ADD KEY `vip_id` (`vip_id`);

--
-- Indexes for table `poll`
--
ALTER TABLE `poll`
 ADD PRIMARY KEY (`id`), ADD KEY `question` (`question`);

--
-- Indexes for table `poll_answer`
--
ALTER TABLE `poll_answer`
 ADD PRIMARY KEY (`id`), ADD KEY `poll_id` (`poll_id`);

--
-- Indexes for table `poll_votes`
--
ALTER TABLE `poll_votes`
 ADD PRIMARY KEY (`id`), ADD KEY `answer_id` (`answer_id`), ADD KEY `poll_id` (`poll_id`), ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
 ADD PRIMARY KEY (`id`), ADD KEY `board_id` (`board_id`), ADD KEY `thread_id` (`thread_id`);

--
-- Indexes for table `server_config`
--
ALTER TABLE `server_config`
 ADD UNIQUE KEY `config` (`config`);

--
-- Indexes for table `server_motd`
--
ALTER TABLE `server_motd`
 ADD UNIQUE KEY `id` (`id`,`world_id`);

--
-- Indexes for table `server_record`
--
ALTER TABLE `server_record`
 ADD UNIQUE KEY `record` (`record`,`world_id`,`timestamp`);

--
-- Indexes for table `server_reports`
--
ALTER TABLE `server_reports`
 ADD PRIMARY KEY (`id`), ADD KEY `world_id` (`world_id`), ADD KEY `reads` (`reads`), ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `threads`
--
ALTER TABLE `threads`
 ADD PRIMARY KEY (`id`), ADD KEY `board_id` (`board_id`);

--
-- Indexes for table `tiles`
--
ALTER TABLE `tiles`
 ADD UNIQUE KEY `id` (`id`,`world_id`), ADD KEY `x` (`x`,`y`,`z`), ADD KEY `house_id` (`house_id`,`world_id`);

--
-- Indexes for table `tile_items`
--
ALTER TABLE `tile_items`
 ADD UNIQUE KEY `tile_id` (`tile_id`,`world_id`,`sid`), ADD KEY `sid` (`sid`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
 ADD PRIMARY KEY (`id`), ADD KEY `author` (`author`);

--
-- Indexes for table `video_comments`
--
ALTER TABLE `video_comments`
 ADD PRIMARY KEY (`id`), ADD KEY `video` (`video`), ADD KEY `author` (`author`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `bans`
--
ALTER TABLE `bans`
MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT for table `bugtracker`
--
ALTER TABLE `bugtracker`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `forums`
--
ALTER TABLE `forums`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `guilds`
--
ALTER TABLE `guilds`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `guild_ranks`
--
ALTER TABLE `guild_ranks`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT for table `killers`
--
ALTER TABLE `killers`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=76;
--
-- AUTO_INCREMENT for table `player_deaths`
--
ALTER TABLE `player_deaths`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `poll`
--
ALTER TABLE `poll`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `poll_answer`
--
ALTER TABLE `poll_answer`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `poll_votes`
--
ALTER TABLE `poll_votes`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `server_reports`
--
ALTER TABLE `server_reports`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `threads`
--
ALTER TABLE `threads`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `video_comments`
--
ALTER TABLE `video_comments`
MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Limitadores para a tabela `account_viplist`
--
ALTER TABLE `account_viplist`
ADD CONSTRAINT `account_viplist_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `account_viplist_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `bugtracker`
--
ALTER TABLE `bugtracker`
ADD CONSTRAINT `bugtracker_ibfk_1` FOREIGN KEY (`author`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `comments`
--
ALTER TABLE `comments`
ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`author`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `environment_killers`
--
ALTER TABLE `environment_killers`
ADD CONSTRAINT `environment_killers_ibfk_1` FOREIGN KEY (`kill_id`) REFERENCES `killers` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `friends`
--
ALTER TABLE `friends`
ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`with`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend`) REFERENCES `accounts` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `guild_invites`
--
ALTER TABLE `guild_invites`
ADD CONSTRAINT `guild_invites_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `guild_invites_ibfk_2` FOREIGN KEY (`guild_id`) REFERENCES `guilds` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `guild_ranks`
--
ALTER TABLE `guild_ranks`
ADD CONSTRAINT `guild_ranks_ibfk_1` FOREIGN KEY (`guild_id`) REFERENCES `guilds` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `house_auctions`
--
ALTER TABLE `house_auctions`
ADD CONSTRAINT `house_auctions_ibfk_1` FOREIGN KEY (`house_id`, `world_id`) REFERENCES `houses` (`id`, `world_id`) ON DELETE CASCADE,
ADD CONSTRAINT `house_auctions_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `house_data`
--
ALTER TABLE `house_data`
ADD CONSTRAINT `house_data_ibfk_1` FOREIGN KEY (`house_id`, `world_id`) REFERENCES `houses` (`id`, `world_id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `house_lists`
--
ALTER TABLE `house_lists`
ADD CONSTRAINT `house_lists_ibfk_1` FOREIGN KEY (`house_id`, `world_id`) REFERENCES `houses` (`id`, `world_id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `killers`
--
ALTER TABLE `killers`
ADD CONSTRAINT `killers_ibfk_1` FOREIGN KEY (`death_id`) REFERENCES `player_deaths` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `messages`
--
ALTER TABLE `messages`
ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`from`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`to`) REFERENCES `accounts` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `players`
--
ALTER TABLE `players`
ADD CONSTRAINT `players_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_deaths`
--
ALTER TABLE `player_deaths`
ADD CONSTRAINT `player_deaths_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_depotitems`
--
ALTER TABLE `player_depotitems`
ADD CONSTRAINT `player_depotitems_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_items`
--
ALTER TABLE `player_items`
ADD CONSTRAINT `player_items_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_killers`
--
ALTER TABLE `player_killers`
ADD CONSTRAINT `player_killers_ibfk_1` FOREIGN KEY (`kill_id`) REFERENCES `killers` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `player_killers_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_namelocks`
--
ALTER TABLE `player_namelocks`
ADD CONSTRAINT `player_namelocks_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_skills`
--
ALTER TABLE `player_skills`
ADD CONSTRAINT `player_skills_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_spells`
--
ALTER TABLE `player_spells`
ADD CONSTRAINT `player_spells_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_storage`
--
ALTER TABLE `player_storage`
ADD CONSTRAINT `player_storage_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `player_viplist`
--
ALTER TABLE `player_viplist`
ADD CONSTRAINT `player_viplist_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `player_viplist_ibfk_2` FOREIGN KEY (`vip_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `poll_answer`
--
ALTER TABLE `poll_answer`
ADD CONSTRAINT `poll_answer_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `poll` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `poll_votes`
--
ALTER TABLE `poll_votes`
ADD CONSTRAINT `poll_votes_ibfk_1` FOREIGN KEY (`answer_id`) REFERENCES `poll_answer` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `poll_votes_ibfk_2` FOREIGN KEY (`poll_id`) REFERENCES `poll` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `poll_votes_ibfk_3` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `posts`
--
ALTER TABLE `posts`
ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `forums` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`thread_id`) REFERENCES `threads` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `server_reports`
--
ALTER TABLE `server_reports`
ADD CONSTRAINT `server_reports_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `threads`
--
ALTER TABLE `threads`
ADD CONSTRAINT `threads_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `forums` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tiles`
--
ALTER TABLE `tiles`
ADD CONSTRAINT `tiles_ibfk_1` FOREIGN KEY (`house_id`, `world_id`) REFERENCES `houses` (`id`, `world_id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tile_items`
--
ALTER TABLE `tile_items`
ADD CONSTRAINT `tile_items_ibfk_1` FOREIGN KEY (`tile_id`) REFERENCES `tiles` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `videos`
--
ALTER TABLE `videos`
ADD CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`author`) REFERENCES `players` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `video_comments`
--
ALTER TABLE `video_comments`
ADD CONSTRAINT `video_comments_ibfk_1` FOREIGN KEY (`video`) REFERENCES `videos` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `video_comments_ibfk_2` FOREIGN KEY (`author`) REFERENCES `players` (`id`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
