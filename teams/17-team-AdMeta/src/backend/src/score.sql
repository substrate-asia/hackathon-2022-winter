CREATE TABLE IF NOT EXISTS `soul`(
   `id` INT UNSIGNED AUTO_INCREMENT,
   `address` VARCHAR(100) NOT NULL,
   `DeFi` INT NOT NULL,
   `GameFi` INT NOT NULL,
   `NFT` INT NOT NULL,
   `Metaverse` INT NOT NULL,
   `OnChainData` INT NOT NULL,
   `total` INT NOT NULL,
   `uncliam` INT NOT NULL,
   `cliamed` INT NOT NULL,
   PRIMARY KEY ( `id` )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;