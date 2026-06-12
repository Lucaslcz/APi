-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: calabreso
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avisos`
--

DROP TABLE IF EXISTS `avisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `texto` text NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avisos`
--

LOCK TABLES `avisos` WRITE;
/*!40000 ALTER TABLE `avisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cardapio`
--

DROP TABLE IF EXISTS `cardapio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cardapio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `tempo_preparo` int NOT NULL,
  `descricao` text,
  `categoria` varchar(50) DEFAULT NULL,
  `disponivel` enum('Sim','Nao') NOT NULL DEFAULT 'Sim',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cardapio`
--

LOCK TABLES `cardapio` WRITE;
/*!40000 ALTER TABLE `cardapio` DISABLE KEYS */;
INSERT INTO `cardapio` VALUES (1,'Classic Burger',25.90,90,'Pão brioche, blend 160g, queijo cheddar, alface e tomate','Hamburguer','Sim'),(2,'Bacon Burger',29.90,96,'Pão brioche, blend 160g, bacon crocante, queijo cheddar e maionese defumada','Hamburguer','Sim'),(3,'Double Smash',39.90,102,'Pão brioche, dois blends smash 80g, queijo americano duplo e molho especial','Hamburguer','Sim'),(4,'BBQ Burger',32.90,90,'Pão australiano, blend 160g, cebola caramelizada, bacon e molho barbecue','Hamburguer','Sim'),(5,'Frango Crispy',27.90,84,'Pão brioche, frango empanado crocante, queijo prato, alface e maionese de ervas','Hamburguer','Sim'),(6,'Mushroom Swiss',31.90,96,'Pão brioche, blend 160g, cogumelos salteados, queijo suíço e mostarda dijon','Hamburguer','Sim'),(7,'Veggie Burger',26.90,78,'Pão integral, hamburguer de grão-de-bico, rúcula, tomate seco e homus','Hamburguer','Sim'),(8,'Spicy Burger',30.90,90,'Pão brioche, blend 160g, jalapeño, queijo pepper jack e molho sriracha','Hamburguer','Sim'),(9,'Truffle Burger',44.90,108,'Pão brioche, blend 180g, queijo brie, rúcula e maionese trufada','Hamburguer','Sim'),(10,'Pulled Pork Burger',35.90,102,'Pão australiano, blend 160g, pulled pork, coleslaw e molho barbecue defumado','Hamburguer','Sim'),(11,'Egg Burger',28.90,90,'Pão brioche, blend 160g, ovo frito, queijo cheddar e molho tártaro','Hamburguer','Sim'),(12,'Monster Burger',54.90,120,'Pão brioche, três blends 160g, queijo triplo, bacon, ovo e molho especial da casa','Hamburguer','Sim'),(13,'Combo Brabo Supremo',39.90,120,'Hambúrguer artesanal duplo de costela, porção de batata rústica crocante e refrigerante lata trincando de gelado','Hamburguer','Sim'),(14,'Cheddar Flood Duplo',32.90,102,'Dois blends smash de 100g cobertos com uma quantidade absurda de cheddar cremoso e farofa de bacon crocante','Hamburguer','Sim'),(15,'Double Smash Classic',29.90,96,'Dois hambúrgueres estilo smash, queijo cheddar derretido, alface fresca, tomate fatiado e maionese especial da casa','Hamburguer','Sim'),(16,'Frango Crocante Clássico',24.90,84,'Filé de frango empanado crocante, alface americana, tomate e maionese no pão brioche','Frango','Sim'),(17,'Nashville Hot Chicken',29.90,90,'Frango frito apimentado no estilo Nashville, coleslaw, picles e molho mel mostarda','Frango','Sim'),(18,'Frango Bacon Cheddar',31.90,96,'Filé empanado, bacon crocante, queijo cheddar derretido e maionese defumada no pão australiano','Frango','Sim'),(19,'Chicken Smash',27.90,84,'Dois filés smash de frango empanado, queijo americano duplo e molho especial da casa','Frango','Sim'),(20,'Frango Buffalo',30.90,90,'Frango frito empanado coberto com molho buffalo, queijo gorgonzola e aipo crocante','Frango','Sim'),(21,'Crispy Chicken Truffle',38.90,102,'Filé empanado crocante, rúcula, queijo brie e maionese trufada no pão brioche','Frango','Sim'),(22,'Frango Teriyaki',28.90,90,'Frango frito empanado com molho teriyaki, abacaxi grelhado e gergelim no pão de leite','Frango','Sim'),(23,'Double Crispy Chicken',35.90,102,'Dois filés de frango empanado, queijo prato duplo, bacon e molho ranch','Frango','Sim'),(24,'Frango Parmegiana Burger',32.90,108,'Filé empanado frito, molho de tomate caseiro, queijo mussarela gratinado no pão ciabatta','Frango','Sim'),(25,'Monster Chicken',44.90,120,'Três filés de frango empanado, queijo triplo, bacon, ovo frito e molho especial da casa','Frango','Sim'),(26,'Smash de Grão-de-Bico',26.90,78,'Blend smash de grão-de-bico, alface, tomate, cebola roxa e maionese vegana no pão integral','Vegano','Sim'),(27,'Black Bean Burger',25.90,72,'Hambúrguer de feijão preto, rúcula, tomate seco, homus e pesto de manjericão no pão australiano','Vegano','Sim'),(28,'Portobello Burger',29.90,84,'Cogumelo portobello grelhado, pasta de abacate, rúcula, tomate e cebola caramelizada no pão brioche vegano','Vegano','Sim'),(29,'Lentilha Smash Crispy',27.90,78,'Blend crocante de lentilha e quinoa, alface americana, picles, mostarda dijon e maionese de castanha','Vegano','Sim'),(30,'The Green Monster',32.90,90,'Dois blends de grão-de-bico e ervas, guacamole, rúcula, tomate, pepino e molho de tahine no pão integral','Vegano','Sim'),(41,'Coca-Cola Lata',7.90,6,'Coca-Cola gelada lata 350ml','Bebida','Sim'),(42,'Coca-Cola Zero Lata',7.90,6,'Coca-Cola Zero gelada lata 350ml','Bebida','Sim'),(43,'Guaraná Antarctica Lata',6.90,6,'Guaraná Antarctica gelado lata 350ml','Bebida','Sim'),(44,'Sprite Lata',6.90,6,'Sprite gelado lata 350ml','Bebida','Sim'),(45,'Fanta Laranja Lata',6.90,6,'Fanta Laranja gelada lata 350ml','Bebida','Sim'),(46,'Água Mineral',4.90,3,'Água mineral sem gás 500ml','Bebida','Sim'),(47,'Água com Gás',5.90,3,'Água mineral com gás 500ml','Bebida','Sim'),(48,'Suco de Laranja Natural',12.90,18,'Suco de laranja espremido na hora 400ml','Bebida','Sim'),(49,'Suco de Morango',13.90,18,'Suco de morango natural com morango fresco 400ml','Bebida','Sim'),(50,'Suco de Maracujá',12.90,18,'Suco de maracujá natural adoçado 400ml','Bebida','Sim'),(51,'Vitamina de Banana',14.90,24,'Vitamina cremosa de banana com leite e mel 400ml','Bebida','Sim'),(52,'Milkshake de Chocolate',19.90,30,'Milkshake cremoso de chocolate com chantilly e calda 400ml','Bebida','Sim'),(53,'Milkshake de Morango',19.90,30,'Milkshake cremoso de morango com chantilly e frutas frescas 400ml','Bebida','Sim'),(54,'Milkshake de Baunilha',18.90,30,'Milkshake clássico de baunilha com chantilly 400ml','Bebida','Sim'),(55,'Limonada Suíça',14.90,24,'Limonada cremosa com leite condensado e limão siciliano 400ml','Bebida','Sim'),(56,'Limonada Tradicional',11.90,18,'Limonada refrescante com limão taiti e hortelã 400ml','Bebida','Sim'),(57,'Chá Gelado de Pêssego',10.90,12,'Chá gelado sabor pêssego levemente adoçado 400ml','Bebida','Sim'),(58,'Cerveja Heineken Long Neck',14.90,6,'Cerveja Heineken long neck 330ml bem gelada','Bebida','Sim'),(59,'Cerveja Stella Artois',14.90,6,'Cerveja Stella Artois long neck 330ml bem gelada','Bebida','Sim'),(60,'Red Bull',18.90,3,'Energético Red Bull lata 250ml','Bebida','Sim'),(61,'Brownie com Sorvete',18.90,60,'Brownie quente de chocolate meio amargo com sorvete de creme e calda de chocolate','Sobremesa','Sim'),(62,'Petit Gateau',22.90,72,'Bolinho de chocolate quente com interior cremoso servido com sorvete de creme','Sobremesa','Sim'),(63,'Cheesecake de Morango',19.90,30,'Fatia de cheesecake cremoso com cobertura de geleia de morango fresco','Sobremesa','Sim'),(64,'Pudim de Leite',14.90,30,'Pudim de leite condensado caseiro com calda de caramelo','Sobremesa','Sim'),(65,'Açaí 400ml',19.90,18,'Açaí cremoso com granola, banana, morango e leite condensado','Sobremesa','Sim'),(66,'Sorvete 3 Bolas',16.90,12,'Três bolas de sorvete à escolha com cobertura e granulado','Sobremesa','Sim'),(67,'Waffle com Nutella',21.90,48,'Waffle crocante com Nutella, morango fatiado e chantilly','Sobremesa','Sim'),(68,'Crepe de Doce de Leite',18.90,42,'Crepe fino recheado com doce de leite argentino e banana caramelizada','Sobremesa','Sim'),(69,'Torta de Limão',16.90,30,'Fatia de torta de limão com merengue tostado e base crocante','Sobremesa','Sim'),(70,'Cookie Recheado',12.90,30,'Cookie grande de chocolate com recheio cremoso de Nutella servido quente','Sobremesa','Sim'),(71,'Mousse de Maracujá',15.90,18,'Mousse aerado de maracujá com calda da fruta e raspas de limão','Sobremesa','Sim'),(72,'Banana Split',24.90,24,'Banana fatiada com três bolas de sorvete, calda de chocolate, chantilly e cereja','Sobremesa','Sim'),(73,'Churros com Doce de Leite',17.90,48,'Churros crocante recheado com doce de leite e polvilhado com canela e açúcar','Sobremesa','Sim'),(74,'Romeu e Julieta',13.90,12,'Fatia generosa de queijo minas com goiabada cascão','Sobremesa','Sim'),(75,'Volcano de Chocolate',26.90,78,'Bolo vulcão de chocolate belga com recheio líquido de ganache e sorvete de creme','Sobremesa','Sim'),(76,'Combo Classic',34.90,102,'Classic Burger + Coca-Cola Lata','Combo','Sim'),(77,'Combo Bacon Supremo',44.90,108,'Bacon Burger + Batata Frita + Guaraná Antarctica Lata','Combo','Sim'),(78,'Combo Double Smash',52.90,114,'Double Smash + Milkshake de Chocolate','Combo','Sim'),(79,'Combo BBQ Completo',47.90,108,'BBQ Burger + Coca-Cola Lata + Brownie com Sorvete','Combo','Sim'),(80,'Combo Frango Crocante',36.90,96,'Frango Crocante Clássico + Suco de Laranja Natural','Combo','Sim'),(81,'Combo Nashville',44.90,102,'Nashville Hot Chicken + Sprite Lata + Cookie Recheado','Combo','Sim'),(82,'Combo Frango Bacon',45.90,108,'Frango Bacon Cheddar + Coca-Cola Lata + Sorvete 3 Bolas','Combo','Sim'),(83,'Combo Vegano Leve',38.90,96,'Smash de Grão-de-Bico + Suco de Maracujá','Combo','Sim'),(84,'Combo Green Monster',46.90,102,'The Green Monster + Limonada Tradicional + Mousse de Maracujá','Combo','Sim'),(85,'Combo Monster Burger',67.90,132,'Monster Burger + Red Bull + Brownie com Sorvete','Combo','Sim'),(86,'Combo Truffle Experience',67.90,120,'Truffle Burger + Limonada Suíça + Petit Gateau','Combo','Sim'),(87,'Combo Família',89.90,132,'Double Smash Classic + Cheddar Flood Duplo + 2 Coca-Cola Lata + Batata Frita','Combo','Sim'),(88,'Combo Doce e Salgado',46.90,108,'Chicken Smash + Milkshake de Morango + Churros com Doce de Leite','Combo','Sim'),(89,'Combo Volcano',54.90,120,'Pulled Pork Burger + Coca-Cola Lata + Volcano de Chocolate','Combo','Sim'),(90,'Combo Date Night',79.90,126,'Truffle Burger + Portobello Burger + 2 Limonadas Suíças + Banana Split','Combo','Sim');
/*!40000 ALTER TABLE `cardapio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargos`
--

DROP TABLE IF EXISTS `cargos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `cargo` enum('chefe','funcionario','cliente') NOT NULL DEFAULT 'cliente',
  `atribuido_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `cargos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargos`
--

LOCK TABLES `cargos` WRITE;
/*!40000 ALTER TABLE `cargos` DISABLE KEYS */;
INSERT INTO `cargos` VALUES (1,4,'chefe','2026-06-09 20:48:22'),(2,5,'cliente','2026-06-09 20:48:22'),(3,6,'cliente','2026-06-09 20:48:22'),(4,7,'cliente','2026-06-09 20:48:22'),(5,8,'funcionario','2026-06-09 20:48:22'),(6,9,'cliente','2026-06-10 14:26:24'),(7,10,'cliente','2026-06-10 15:19:56');
/*!40000 ALTER TABLE `cargos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracoes`
--

DROP TABLE IF EXISTS `configuracoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chave` varchar(50) NOT NULL,
  `valor` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chave` (`chave`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracoes`
--

LOCK TABLES `configuracoes` WRITE;
/*!40000 ALTER TABLE `configuracoes` DISABLE KEYS */;
INSERT INTO `configuracoes` VALUES (1,'status_estabelecimento','aberto');
/*!40000 ALTER TABLE `configuracoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id` int NOT NULL DEFAULT '1',
  `nome` varchar(120) DEFAULT '',
  `cnpj` varchar(20) DEFAULT '',
  `telefone` varchar(20) DEFAULT '',
  `endereco` varchar(200) DEFAULT '',
  `horario` varchar(80) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
INSERT INTO `empresa` VALUES (1,'','','','','');
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico`
--

DROP TABLE IF EXISTS `historico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `codigo_pedido` varchar(10) NOT NULL,
  `descricao` text NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `forma_pagamento` varchar(20) NOT NULL DEFAULT 'pix',
  `valor` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historico_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico`
--

LOCK TABLES `historico` WRITE;
/*!40000 ALTER TABLE `historico` DISABLE KEYS */;
INSERT INTO `historico` VALUES (1,4,'95934','1x Classic Burger, 1x Coca-Cola Lata','Jacinto Pinto, 678','2026-06-08 21:15:47','pix',0.00),(2,4,'75317','1x Combo Brabo Supremo','Jacinto Pinto, 678','2026-06-08 21:39:15','pix',0.00),(3,4,'82848','1x Coca-Cola Lata','Jacinto Pinto, 678','2026-06-08 21:48:07','pix',0.00),(4,4,'73349','1x Bacon Burger','Alecrim Dourado, 876','2026-06-09 13:48:53','boleto',0.00),(5,4,'32587','2x Classic Burger','Alecrim Dourado, 876','2026-06-09 21:28:55','pix',0.00),(6,4,'21386','1x Coca-Cola Lata','Jorgedouro, 123','2026-06-09 21:43:31','pix',7.90),(7,6,'66659','1x Churros com Doce de Leite, 1x Frango Bacon Cheddar, 1x Double Smash Classic, 3x Coca-Cola Lata','rua calabresa, 56','2026-06-09 23:42:25','pix',103.40),(8,6,'27908','1x Coca-Cola Lata','123, 123','2026-06-09 23:43:43','pix',7.90);
/*!40000 ALTER TABLE `historico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (4,'Lucas Cruz','lucasbkr53@gmail.com','scrypt:32768:8:1$0uMJBchLU8vMoUBb$6c29a002ced33fc629b0a19d7485572a9adb4674ad17cec99fdec16a7c412ab7708cc5af8af47236a13da4aa83b2667655b52c98021459e3dc730460c6a5c64d','2026-06-06 15:38:01'),(5,'Roberto Silva','robertosilvacaminhao@gmail.com','scrypt:32768:8:1$DC25j1HpcubHycg3$0441894c44154053927761ef7fbfad6998617b611a53dfd16f1dfaaebaee3bab85a13c412c58a15416461fa0ac6d50d5147bd8bfba06d9e1e57213440030f718','2026-06-06 16:02:42'),(6,'Luciano Barbosa Dias','lucianobarbosabh@gmail.com','scrypt:32768:8:1$pJLrBKKvAT1FkRNF$82657d2ce8bc2f918d8fad7b296b1d3b16381954a8d492486ea2818129a145d47ff0301d88c36a1cc6fbb11fc2f955c1ba4497010c8f298682d5bd564031582c','2026-06-06 16:55:27'),(7,'viviana dias','vivianaaparecida24.va@gmail.com','scrypt:32768:8:1$KiwGObH8q2V7ORsc$d91a3379559d677871823ab28c9e2b9ed5108fde8a54d9e0e6790efc56e8177af3fa32c2013dccc95fbc893f3a672787c991040a995614f6ba2b272a1e739825','2026-06-06 20:30:03'),(8,'Jaime Antunes','funcionario@gmail.com','scrypt:32768:8:1$czq8HUHVZPTVJEqT$0ff7075b7ffcc292dd8d8346f5c1c1bfa6d8546b347cf7df0229deeeda5eec15a29720a01e15c3fa0296f2cd4642fe37c8424226487c7454b40d51c0601ca178','2026-06-09 20:46:28'),(9,'Maria Antunes','cliente@gmail.com','scrypt:32768:8:1$HwCkrS2pDnbD2Nbj$f601b2bf7f6acac425b30d989df71fff2e5cfee0bc4885e65123634ef372aa1a6f0e26bd301f0b3c77697bf2da6a446e62005c43bf2d30bb3256e9ebbfba88b9','2026-06-10 14:23:06'),(10,'Pablo Escobar','pabloescobar@gmail.com','scrypt:32768:8:1$FzFwYyJb7perjeWU$3522bfe756e44a9bf5b277eaec3e3be849a7e2cbf7fd121add4c3336cbdd970296e2734f48c5b29361327fe451499cbfdb31ddce64fb4d0e528b6fa65ebafca6','2026-06-10 15:19:56');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `atribuir_cargo_cliente` AFTER INSERT ON `usuarios` FOR EACH ROW INSERT INTO cargos (id_usuario, cargo) VALUES (NEW.id, 'cliente') */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'calabreso'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 13:53:12
