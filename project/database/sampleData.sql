-- -----------------------------------------------------
-- Sample Data for MallMAP
-- -----------------------------------------------------

USE `MallMAP`;

-- ปิดการเช็ค Foreign Key ชั่วคราว เพื่อล้างข้อมูลเก่าได้ง่ายๆ
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `FavoriteProduct`;
TRUNCATE TABLE `FavoriteStore`;
TRUNCATE TABLE `Product`;
TRUNCATE TABLE `Store`;
TRUNCATE TABLE `Floor`;
TRUNCATE TABLE `Mall`;
TRUNCATE TABLE `User`;
TRUNCATE TABLE `Role`;
TRUNCATE TABLE `StoreCategory`;
TRUNCATE TABLE `Category`;

-- เปิดการเช็ค Foreign Key กลับมาเหมือนเดิม
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- 1. Insert Roles
-- -----------------------------------------------------
INSERT INTO MallMAP.Role (RoleName)
VALUES ('admin'), ('seller'), ('user');

-- -----------------------------------------------------
-- 2. Insert Users (Password: 123456)
-- -----------------------------------------------------
INSERT INTO `User` (`UserName`, `Email`, `PasswordHash`, `RoleID`, `CreatedAt`, `UpdatedAt`, `StoreID`) VALUES
('admin1', 'admin1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 1, NOW(), NOW(), NULL),
('storeOwner1', 'owner1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 2, NOW(), NOW(), 1),
('customer1', 'customer1@mail.com', '$2b$12$KIXbVfP1z/9rGZ.b.L7MueqU0uV.gK0h5O7fIu.Wv7h0.G.C7.z8.', 3, NOW(), NOW(), NULL);

-- -----------------------------------------------------
-- 3. Insert Store Categories
-- -----------------------------------------------------
INSERT INTO `StoreCategory` (`StoreCategoryName`) VALUES
('Food'),
('Fashion'),
('Electronics');

-- -----------------------------------------------------
-- 4. Insert Mall
-- -----------------------------------------------------
INSERT INTO `Mall` (`MallName`, `Location`, `IsPopular`, `MallImageURL`) 
VALUES 
('Central Mall', 'Bangkok', 1, 'https://example.com/mall.jpg');

INSERT INTO MallMAP.Floor (FloorName, MallID, FloorCode, FloorOrder)
VALUES
('Lower Ground', 1, 'LG', 0),
('Ground Floor', 1, 'G', 1),
('Floor 1', 1, '1', 2);

INSERT INTO MallMAP.StoreCategory (StoreCategoryName)
VALUES ('Sports'), ('Food'), ('Electronics'), ('Clothing');
-- -----------------------------------------------------
-- 2. Insert Users (Password: 123456)
-- -----------------------------------------------------

INSERT INTO `Store` (
  `StoreID`, 
  `UserID`, 
  `StoreName`, 
  `StoreCategoryName`, 
  `StoreCategoryIcon`, 
  `StoreCategoryID`, 
  `Description`, 
  `Phone`, 
  `OpeningHours`, 
  `LogoURL`, 
  `MallID`, 
  `FloorName`, 
  `FloorID`, 
  `PosX`, 
  `PosY`
) VALUES
(1, 2, 'Store 1', 'Food', 'food-icon.png', 1, 'Description 1', '02-111-1111', '10:00 - 22:00', 'logo1.png', 1, 'Floor 1', 1, 100.0, 200.0),
(2, 2, 'Store 2', 'Fashion', 'fashion-icon.png', 2, 'Description 2', '02-222-2222', '10:00 - 22:00', 'logo2.png', 1, 'Floor 1', 1, 150.0, 250.0),
(3, 2, 'Store 3', 'Electronics', 'elec-icon.png', 3, 'Description 3', '02-333-3333', '10:00 - 22:00', 'logo3.png', 1, 'Floor 1', 1, 200.0, 300.0);