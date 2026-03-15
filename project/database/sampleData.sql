-- -----------------------------------------------------
-- Sample Data
-- -----------------------------------------------------
INSERT INTO `MallMAP`.`Role` (`RoleName`) VALUES
  ('SuperAdmin'),
  ('StoreOwner'),
  ('Customer');

INSERT INTO `MallMAP`.`User` (`UserName`, `PasswordHash`, `RoleID`) VALUES
  ('admin1', 'hash_admin1', 1),
  ('storeOwner1', 'hash_storeOwner1', 2),
  ('customer1', 'hash_customer1', 3);

INSERT INTO `MallMAP`.`StoreCategory` (`StoreCategoryName`) VALUES
  ('Food'),
  ('Fashion'),
  ('Electronics');

INSERT INTO `MallMAP`.`Store` (`UserID`, `StoreName`, `StoreCategoryID`, `Phone`, `LogoURL`) VALUES
  (2, 'Yamazaki', 1, '0912345678', 'http://example.com/logoA.png'),
  (2, 'ElectroWorld', 3, '0987654321', 'http://example.com/logoB.png');