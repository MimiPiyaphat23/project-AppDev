-- -----------------------------------------------------
-- Sample Data
-- -----------------------------------------------------

INSERT INTO MallMAP.Role (RoleName) VALUES
('SuperAdmin'),
('StoreOwner'),
('Customer');


INSERT INTO MallMAP.User
(UserName, Email, PasswordHash, RoleID, CreatedAt, UpdatedAt)
VALUES
('admin1', 'admin1@mail.com', 'hash_admin1', 1, NOW(), NOW()),
('storeOwner1', 'owner1@mail.com', 'hash_storeOwner1', 2, NOW(), NOW()),
('customer1', 'customer1@mail.com', 'hash_customer1', 3, NOW(), NOW());


INSERT INTO MallMAP.StoreCategory (StoreCategoryName) VALUES
('Food'),
('Fashion'),
('Electronics');

INSERT INTO mallmap.mall (MallName, Location)
VALUES ('Central Mall', 'Bangkok');

INSERT INTO mallmap.floor (FloorName, MallID, MapImageURL)
VALUES ('Floor 1', 1, 'map1.png');

INSERT INTO MallMAP.Store
(UserID, StoreName, StoreCategoryID, Phone, LogoURL, FloorID, PosX, PosY)
VALUES
(2, 'Yamazaki', 1, '0912345678', 'http://example.com/logoA.png', 1, 10.5, 20.5),
(2, 'ElectroWorld', 3, '0987654321', 'http://example.com/logoB.png', 1, 15.0, 25.0);